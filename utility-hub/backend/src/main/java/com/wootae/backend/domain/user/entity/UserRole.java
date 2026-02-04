package com.wootae.backend.domain.user.entity;

/**
 * 사용자 권한 열거형
 * 
 * [개선] 열거형 주석 추가로 사용 가능한 권한 정의 명확화
 * Spring Security의 권한 체계를 따르는 사용자 역할 정의
 */
public enum UserRole {
      /**
       * 일반 사용자 권한
       * 일반적인 서비스 이용 권한만 가능
       */
      ROLE_USER,
      
      /**
       * 관리자 권한
       * 시스템 관리 및 모든 기능 접근 권한 보유
       */
      ROLE_ADMIN
}
