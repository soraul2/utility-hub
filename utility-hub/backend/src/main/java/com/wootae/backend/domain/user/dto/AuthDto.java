package com.wootae.backend.domain.user.dto;

import com.wootae.backend.domain.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 인증 관련 DTO 모음
 * 
 * [개선] 클래스 주석 추가로 역할 명확화
 * 토큰 새로고침, 토큰 응답, 사용자 정보 응답을 위한 DTO 정의
 */
public class AuthDto {

      /**
       * 토큰 새로고침 요청 DTO
       * 만료된 액세스 토큰을 갱신하기 위해 리프레시 토큰을 제공
       */
      @Getter
      @NoArgsConstructor
      public static class TokenRefreshRequest {
            /** 리프레시 토큰 값 */
            private String refreshToken;
      }

      /**
       * 토큰 응답 DTO
       * 로그인 또는 토큰 새로고침 후 클라이언트에게 반환되는 토큰 정보
       */
      @Getter
      @Builder
      @AllArgsConstructor
      @NoArgsConstructor
      public static class TokenResponse {
            /** JWT 액세스 토큰 */
            private String accessToken;
            
            /** JWT 리프레시 토큰 */
            private String refreshToken;
            
            /** 토큰 타입 (기본값: Bearer) */
            private String tokenType;
            
            /** 액세스 토큰 만료 시간 (초 단위) */
            private long expiresIn;
      }

      /**
       * 사용자 정보 응답 DTO
       * 사용자 조회 요청에 대한 응답으로 사용자 기본 정보 제공
       */
      @Getter
      @Builder
      @AllArgsConstructor
      @NoArgsConstructor
      public static class UserResponse {
            /** 사용자 ID */
            private Long id;
            
            /** 사용자 이메일 */
            private String email;
            
            /** 사용자 닉네임 */
            private String nickname;
            
            /** OAuth2 제공자 (NAVER, GOOGLE) */
            private String provider;
            
            /** 사용자 권한 (ROLE_USER, ROLE_ADMIN) */
            private String role;

            /**
             * User 엔티티에서 UserResponse DTO로 변환
             * 
             * @param user 사용자 엔티티
             * @return 변환된 사용자 정보 응답
             */
            public static UserResponse from(User user) {
                  return UserResponse.builder()
                              .id(user.getId())
                              .email(user.getEmail())
                              .nickname(user.getNickname())
                              .provider(user.getProvider().name())
                              .role(user.getRole().name())
                              .build();
            }
      }
}
