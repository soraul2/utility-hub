package com.wootae.backend.domain.user.entity;

/**
 * OAuth2 인증 제공자 열거형
 * 
 * [개선] 열거형 주석 추가로 지원되는 제공자 명확화
 * 현재 지원되는 OAuth2 소셜 로그인 제공자를 정의
 */
public enum AuthProvider {
      /**
       * 네이버 OAuth2 제공자
       */
      NAVER,
      
      /**
       * 구글 OAuth2 제공자
       */
      GOOGLE
}
