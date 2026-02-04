package com.wootae.backend.domain.user.service;

import com.wootae.backend.domain.user.dto.oauth.UserProfile;
import com.wootae.backend.domain.user.entity.AuthProvider;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.domain.user.util.OAuthAttributesExtractor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

      private final UserRepository userRepository;

      @Transactional
      @Override
      public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
            OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
            OAuth2User oAuth2User = delegate.loadUser(userRequest);

            String registrationId = userRequest.getClientRegistration().getRegistrationId();
            String userNameAttributeName = userRequest.getClientRegistration()
                        .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

            Map<String, Object> attributes = oAuth2User.getAttributes();
            
            // [개선] OAuthAttributesExtractor 유틸리티 사용으로 클래스 분리
            UserProfile userProfile = OAuthAttributesExtractor.extract(registrationId, attributes);

            User user = saveOrUpdate(userProfile);

            Map<String, Object> customAttributes = new java.util.HashMap<>(attributes);
            customAttributes.put("userId", user.getId());

            return new DefaultOAuth2User(
                        Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())),
                        customAttributes,
                        "userId");
      }

      private User saveOrUpdate(UserProfile userProfile) {
            // [개선] 사용자 정보 저장/업데이트 로깅
            User user = userRepository
                        .findByProviderAndProviderId(userProfile.getProvider(), userProfile.getProviderId())
                        .map(entity -> {
                              log.info("기존 사용자 업데이트: provider={}, providerId={}", 
                                        userProfile.getProvider(), userProfile.getProviderId());
                              entity.update(userProfile.getNickname(), userProfile.getEmail());
                              return entity;
                        })
                        .orElseGet(() -> {
                              log.info("신규 사용자 생성: provider={}, providerId={}", 
                                        userProfile.getProvider(), userProfile.getProviderId());
                              return userProfile.toEntity();
                        });

            return userRepository.save(user);
      }
}
