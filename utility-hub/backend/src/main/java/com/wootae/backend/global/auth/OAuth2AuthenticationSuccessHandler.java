package com.wootae.backend.global.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.user.dto.AuthDto;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

      private final JwtTokenService jwtTokenService;
      private final com.wootae.backend.domain.user.repository.RefreshTokenRepository refreshTokenRepository;

      // [개선] 콜백 URL 외부화 (@Value 사용)
      @Value("${oauth2.frontend-callback-url:http://localhost:3000/auth/callback}")
      private String callbackUrl;

      @Override
      public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                  Authentication authentication) throws IOException, ServletException {
            // Generate Tokens
            String accessToken = jwtTokenService.createAccessToken(authentication);
            String refreshTokenString = jwtTokenService.createRefreshToken(authentication);

            // Save Refresh Token to DB
            saveRefreshToken(authentication, refreshTokenString);

            // Set Refresh Token Cookie
            addRefreshTokenCookie(response, refreshTokenString);

            // [개선] callbackUrl 변수 사용 (외부 설정에서 동적으로 로드)
            // Redirect to Frontend with access token only (refresh token is in cookie)
            String targetUrl = UriComponentsBuilder.fromUriString(callbackUrl)
                        .queryParam("accessToken", accessToken)
                        // Refresh Token is handled via Cookie, not URL
                        .build().toUriString();

            log.info("OAuth2 로그인 성공: callback URL로 리다이렉트={}", callbackUrl);

            if (response.isCommitted()) {
                  log.debug("Response has already been committed. Unable to redirect to " + targetUrl);
                  return;
            }

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
      }

      private void saveRefreshToken(Authentication authentication, String refreshToken) {
            org.springframework.security.oauth2.core.user.OAuth2User oAuth2User = (org.springframework.security.oauth2.core.user.OAuth2User) authentication
                        .getPrincipal();

            // CustomOAuth2UserService put "userId" in attributes
            Long userId = (Long) oAuth2User.getAttributes().get("userId");

            // Delete existing tokens for this user? Or allow multiple?
            // Design choice: Allow one per device usually, or simple overwrite.
            // For now: Simple overwrite/save new.
            // Better: clean up old tokens first or check if exists.

            // Let's use simple save. The Entity allows multiple if we don't constrain.
            // But if we want rotation, we usually track one per user-device.
            // For simplicity in this refactor: Check if exists by userId and update or
            // create.
            // Re-using repository method findByUserId might be good if we want single
            // session.
            // Let's assume single session per user for strict security first.

            refreshTokenRepository.findByUserId(userId).ifPresent(token -> {
                  refreshTokenRepository.delete(token);
            });

            com.wootae.backend.domain.user.entity.RefreshToken tokenEntity = com.wootae.backend.domain.user.entity.RefreshToken
                        .builder()
                        .userId(userId)
                        .token(refreshToken)
                        .expiryDate(java.time.LocalDateTime.now()
                                    .plusNanos(jwtTokenService.getRefreshTokenValidityInMilliseconds() * 1000000)) // millis
                                                                                                                   // to
                                                                                                                   // nanos?
                                                                                                                   // No,
                                                                                                                   // plusMillis
                                                                                                                   // isn't
                                                                                                                   // in
                                                                                                                   // LocalDateTime.
                        // LocalDateTime.now().plus(Duration.ofMillis(...))
                        .build();

            // Correction: LocalDateTime calculation
            java.time.LocalDateTime expiry = java.time.LocalDateTime.now().plus(
                        java.time.Duration.ofMillis(jwtTokenService.getRefreshTokenValidityInMilliseconds()));

            // Re-build since expiryDate was missing in previous builder call
            tokenEntity = com.wootae.backend.domain.user.entity.RefreshToken.builder()
                        .userId(userId)
                        .token(refreshToken)
                        .expiryDate(expiry)
                        .build();

            refreshTokenRepository.save(tokenEntity);
      }

      private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
            org.springframework.http.ResponseCookie cookie = org.springframework.http.ResponseCookie
                        .from("refresh_token", refreshToken)
                        .httpOnly(true)
                        .secure(true) // HTTPS only (beware localhost without SSL, maybe make configurable?)
                        .path("/")
                        .maxAge(jwtTokenService.getRefreshTokenValidityInMilliseconds() / 1000) // seconds
                        .sameSite("Strict") // or Lax
                        .build();

            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
      }
}
