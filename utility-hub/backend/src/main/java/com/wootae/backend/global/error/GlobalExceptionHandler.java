package com.wootae.backend.global.error;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

      @ExceptionHandler(BusinessException.class)
      protected ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
            log.error("handleBusinessException", e);
            ErrorCode errorCode = e.getErrorCode();
            ErrorResponse response = ErrorResponse.of(errorCode);
            return new ResponseEntity<>(response, errorCode.getStatus());
      }

      @ExceptionHandler(MethodArgumentNotValidException.class)
      protected ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
            log.error("handleMethodArgumentNotValidException", e);
            ErrorResponse response = new ErrorResponse(
                        HttpStatus.BAD_REQUEST.value(), "INVALID_INPUT_VALUE", "잘못된 입력값입니다.", LocalDateTime.now());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
      }

      @ExceptionHandler(Exception.class)
      protected ResponseEntity<ErrorResponse> handleException(Exception e) {
            log.error("handleException", e);
            ErrorResponse response = new ErrorResponse(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(), "INTERNAL_SERVER_ERROR", "알 수 없는 오류가 발생했습니다.", LocalDateTime.now());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      record ErrorResponse(int status, String errorCode, String message, LocalDateTime timestamp) {
            static ErrorResponse of(ErrorCode errorCode) {
                  return new ErrorResponse(
                              errorCode.getStatus().value(), errorCode.getCode(), errorCode.getMessage(), LocalDateTime.now());
            }
      }
}
