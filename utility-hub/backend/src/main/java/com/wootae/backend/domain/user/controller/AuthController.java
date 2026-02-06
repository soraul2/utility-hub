package com.wootae.backend.domain.user.controller;

import com.wootae.backend.domain.user.dto.AuthDto;
import com.wootae.backend.domain.user.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
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
      private final com.wootae.backend.global.auth.JwtTokenService jwtTokenService; // To get config for cookie max age

      /**
       * Refresh Token을 사용하여 새로운 Access Token 발급
       * 쿠키(우선) 또는 Body에서 토큰을 추출하여 처리
       */
      @PostMapping("/token/refresh")
      public ResponseEntity<AuthDto.TokenResponse> refresh(
                  @CookieValue(name = "refresh_token", required = false) String refreshTokenFromCookie,
                  @RequestBody(required = false) AuthDto.TokenRefreshRequest request,
                  HttpServletResponse response) {

            log.debug("토큰 갱신 요청 수신");
            String refreshToken = refreshTokenFromCookie;
            if (refreshToken == null && request != null) {
                  refreshToken = request.getRefreshToken();
            }

            if (refreshToken == null) {
                  throw new com.wootae.backend.global.error.BusinessException(
                              com.wootae.backend.global.error.ErrorCode.TOKEN_INVALID);
            }

            AuthDto.TokenResponse tokenResponse = authService.refresh(refreshToken);

            // Set New Refresh Token Cookie
            ResponseCookie cookie = ResponseCookie.from("refresh_token", tokenResponse.getRefreshToken())
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(jwtTokenService.getRefreshTokenValidityInMilliseconds() / 1000)
                        .sameSite("Strict")
                        .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());

            log.debug("토큰 갱신 완료");
            return ResponseEntity.ok(tokenResponse);
      }

      /**
       * 로그아웃 (쿠키 삭제 및 DB 토큰 삭제)
       */
      @PostMapping("/logout")
      public ResponseEntity<Void> logout(
                  @CookieValue(name = "refresh_token", required = false) String refreshTokenFromCookie,
                  @RequestBody(required = false) AuthDto.TokenRefreshRequest request,
                  HttpServletResponse response) {

            String refreshToken = refreshTokenFromCookie;
            if (refreshToken == null && request != null) {
                  refreshToken = request.getRefreshToken();
            }

            // DB에서 삭제
            if (refreshToken != null) {
                  authService.logout(refreshToken);
            }

            // 쿠키 삭제
            ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                        .httpOnly(true)
                        .secure(true)
                        .path("/")
                        .maxAge(0) // 즉시 만료
                        .sameSite("Strict")
                        .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok().build();
      }
}
