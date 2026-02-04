package com.wootae.backend.domain.user.controller;

import com.wootae.backend.domain.user.dto.AuthDto;
import com.wootae.backend.domain.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증 API 컨트롤러
 * 
 * [개선] @Slf4j 추가로 로깅 강화
 */
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/auth")
@RestController
public class AuthController {

      private final AuthService authService;

      /**
       * Refresh Token을 사용하여 새로운 Access Token 발급
       * 
       * @param request Refresh Token 정보
       * @return 새로운 토큰 쌍
       */
      @PostMapping("/token/refresh")
      public ResponseEntity<AuthDto.TokenResponse> refresh(@RequestBody AuthDto.TokenRefreshRequest request) {
            log.debug("토큰 갱신 요청 수신");
            AuthDto.TokenResponse tokenResponse = authService.refresh(request.getRefreshToken());
            log.debug("토큰 갱신 완료");
            return ResponseEntity.ok(tokenResponse);
      }
}
