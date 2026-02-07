package com.wootae.backend.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

      // Common
      INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "Invalid Input Value"),
      RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "C002", "리소스를 찾을 수 없습니다."),

      // Domain Specific
      INVALID_TEXT_INPUT(HttpStatus.BAD_REQUEST, "TEXT_001", "변환할 텍스트가 비어 있거나 너무 깁니다."),

      // AI Provider
      AI_PROVIDER_ERROR(HttpStatus.BAD_GATEWAY, "AI_001", "AI 서비스 연동 중 오류가 발생했습니다."),
      AI_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, "AI_002", "AI 서비스 응답 시간이 초과되었습니다."),

      // Auth
      AUTH_UNSUPPORTED_PROVIDER(HttpStatus.BAD_REQUEST, "AUTH_001", "지원하지 않는 인증 공급자입니다."),
      AUTH_USER_CREATE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AUTH_002", "사용자 생성 중 오류가 발생했습니다."),
      AUTH_UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "AUTH_003", "인증이 필요합니다."),

      // User
      USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_001", "사용자를 찾을 수 없습니다."),

      // Routine
      PLAN_NOT_FOUND(HttpStatus.NOT_FOUND, "ROUTINE_001", "루틴 계획을 찾을 수 없습니다."),
      TASK_NOT_FOUND(HttpStatus.NOT_FOUND, "ROUTINE_002", "태스크를 찾을 수 없습니다."),
      REFLECTION_ALREADY_EXISTS(HttpStatus.CONFLICT, "ROUTINE_003", "이미 회고가 존재합니다."),
      UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "ROUTINE_004", "해당 리소스에 대한 접근 권한이 없습니다."),
      TEMPLATE_NOT_FOUND(HttpStatus.NOT_FOUND, "ROUTINE_005", "템플릿을 찾을 수 없습니다."),
      EVENT_NOT_FOUND(HttpStatus.NOT_FOUND, "ROUTINE_006", "캘린더 이벤트를 찾을 수 없습니다."),

      // Shop
      THEME_NOT_FOUND(HttpStatus.NOT_FOUND, "SHOP_001", "테마를 찾을 수 없습니다."),
      THEME_ALREADY_OWNED(HttpStatus.CONFLICT, "SHOP_002", "이미 보유한 테마입니다."),
      INSUFFICIENT_POINTS(HttpStatus.BAD_REQUEST, "SHOP_003", "포인트가 부족합니다."),
      THEME_NOT_OWNED(HttpStatus.FORBIDDEN, "SHOP_004", "보유하지 않은 테마입니다."),

      // Google Calendar
      GCAL_NOT_CONNECTED(HttpStatus.BAD_REQUEST, "GCAL_001", "Google Calendar이 연동되지 않았습니다."),
      GCAL_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "GCAL_002", "Google Calendar 토큰이 만료되었습니다. 재연동이 필요합니다."),
      GCAL_SYNC_FAILED(HttpStatus.BAD_GATEWAY, "GCAL_003", "Google Calendar 동기화 중 오류가 발생했습니다."),

      // OAuth2
      OAUTH2_FAILED(HttpStatus.BAD_REQUEST, "OAUTH2_001", "소셜 로그인 중 오류가 발생했습니다."),

      // Token
      TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "TOKEN_001", "유효하지 않은 토큰입니다."),
      TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "TOKEN_002", "만료된 토큰입니다."),

      // System
      INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_500", "서버 내부 오류가 발생했습니다.");

      private final HttpStatus status;
      private final String code;
      private final String message;
}
