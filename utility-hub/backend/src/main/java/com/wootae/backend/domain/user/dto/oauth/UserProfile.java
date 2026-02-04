package com.wootae.backend.domain.user.dto.oauth;

import com.wootae.backend.domain.user.entity.AuthProvider;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * OAuth2 사용자 프로필 DTO
 * 소셜 로그인 시 OAuth2 제공자로부터 받은 사용자 정보를 매핑하는 클래스
 * 
 * [개선] CustomOAuth2UserService의 내부 클래스에서 독립적인 DTO로 분리
 * - 테스트 작성 용이
 * - 코드 재사용성 향상
 * - 클래스 복잡도 감소
 */
@Getter
@AllArgsConstructor
public class UserProfile {
      private final String providerId;
      private final String nickname;
      private final String email;
      private final AuthProvider provider;

      /**
       * UserProfile을 User 엔티티로 변환
       * @return 새로운 User 엔티티
       */
      public User toEntity() {
            return User.builder()
                        .nickname(nickname)
                        .email(email)
                        .provider(provider)
                        .providerId(providerId)
                        .role(UserRole.ROLE_USER)
                        .build();
      }
}
