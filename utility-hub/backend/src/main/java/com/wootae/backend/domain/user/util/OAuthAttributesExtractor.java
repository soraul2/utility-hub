package com.wootae.backend.domain.user.util;

import com.wootae.backend.domain.user.dto.oauth.UserProfile;
import com.wootae.backend.domain.user.entity.AuthProvider;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * OAuth2 속성 추출 유틸리티
 * 
 * [개선] CustomOAuth2UserService의 OAuthAttributes 클래스를 독립적인 유틸리티로 분리
 * - OAuth2 제공자별 사용자 정보 추출 로직 통합
 * - 테스트 작성 용이
 * - 재사용성 향상
 */
@Slf4j
public class OAuthAttributesExtractor {

      /**
       * 소셜 로그인 제공자로부터 받은 속성을 UserProfile로 변환
       * 
       * @param registrationId OAuth2 제공자 ID (naver, google 등)
       * @param attributes OAuth2 제공자로부터 받은 사용자 속성
       * @return 변환된 UserProfile
       * @throws IllegalArgumentException 필수 필드가 누락되거나 지원하지 않는 제공자인 경우
       */
      public static UserProfile extract(String registrationId, Map<String, Object> attributes) {
            log.debug("OAuth2 속성 추출 시작: provider={}", registrationId);
            
            if ("naver".equals(registrationId)) {
                  return extractNaverProfile(attributes);
            } else if ("google".equals(registrationId)) {
                  return extractGoogleProfile(attributes);
            }
            
            throw new IllegalArgumentException("Unsupported Provider: " + registrationId);
      }

      /**
       * Naver OAuth2 응답에서 사용자 정보 추출
       * Naver의 경우 "response" 객체 안에 실제 사용자 정보가 포함됨
       * 
       * @param attributes OAuth2 제공자로부터 받은 사용자 속성
       * @return Naver 사용자 프로필
       */
      private static UserProfile extractNaverProfile(Map<String, Object> attributes) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            
            // [개선] Naver 응답 검증
            if (response == null) {
                  throw new IllegalArgumentException("Naver OAuth2 응답이 올바르지 않습니다");
            }
            
            String providerId = (String) response.get("id");
            String nickname = (String) response.get("nickname");
            String email = (String) response.get("email");
            
            // [개선] 필수 필드 검증
            if (providerId == null || providerId.isBlank()) {
                  throw new IllegalArgumentException("Naver providerId가 비어있거나 null입니다");
            }
            if (nickname == null || nickname.isBlank()) {
                  throw new IllegalArgumentException("Naver nickname이 비어있거나 null입니다");
            }
            
            log.debug("Naver 사용자 프로필 추출 완료: providerId={}", providerId);
            return new UserProfile(providerId, nickname, email, AuthProvider.NAVER);
      }

      /**
       * Google OAuth2 응답에서 사용자 정보 추출
       * 
       * @param attributes OAuth2 제공자로부터 받은 사용자 속성
       * @return Google 사용자 프로필
       */
      private static UserProfile extractGoogleProfile(Map<String, Object> attributes) {
            String sub = (String) attributes.get("sub");
            String name = (String) attributes.get("name");
            String email = (String) attributes.get("email");
            
            // [개선] Google 응답 검증
            if (sub == null || sub.isBlank()) {
                  throw new IllegalArgumentException("Google sub(providerId)가 비어있거나 null입니다");
            }
            if (name == null || name.isBlank()) {
                  throw new IllegalArgumentException("Google name이 비어있거나 null입니다");
            }
            
            log.debug("Google 사용자 프로필 추출 완료: providerId={}", sub);
            return new UserProfile(sub, name, email, AuthProvider.GOOGLE);
      }
}
