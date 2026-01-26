package com.wootae.backend.global.error;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

      // Common
      INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "C001", "Invalid Input Value"),

      // Domain Specific
      INVALID_TEXT_INPUT(HttpStatus.BAD_REQUEST, "TEXT_001", "변환할 텍스트가 비어 있거나 너무 깁니다."),

      // AI Provider
      AI_PROVIDER_ERROR(HttpStatus.BAD_GATEWAY, "AI_001", "AI 서비스 연동 중 오류가 발생했습니다."),
      AI_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, "AI_002", "AI 서비스 응답 시간이 초과되었습니다.");

      private final HttpStatus status;
      private final String code;
      private final String message;
}
