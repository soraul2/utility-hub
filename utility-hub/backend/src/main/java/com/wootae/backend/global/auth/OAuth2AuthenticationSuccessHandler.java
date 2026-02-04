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

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

      private final JwtTokenService jwtTokenService;
      
      // [개선] 콜백 URL 외부화 (@Value 사용)
      @Value("${oauth2.frontend-callback-url:http://localhost:3000/auth/callback}")
      private String callbackUrl;

      @Override
      public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                  Authentication authentication) throws IOException, ServletException {
            // Generate Tokens
            String accessToken = jwtTokenService.createAccessToken(authentication);
            String refreshToken = jwtTokenService.createRefreshToken(authentication);

            // [개선] callbackUrl 변수 사용 (외부 설정에서 동적으로 로드)
            // Redirect to Frontend with tokens
            String targetUrl = UriComponentsBuilder.fromUriString(callbackUrl)
                        .queryParam("accessToken", accessToken)
                        .queryParam("refreshToken", refreshToken)
                        .build().toUriString();

            log.info("OAuth2 로그인 성공: callback URL로 리다이렉트={}", callbackUrl);

            if (response.isCommitted()) {
                  log.debug("Response has already been committed. Unable to redirect to " + targetUrl);
                  return;
            }

            getRedirectStrategy().sendRedirect(request, response, targetUrl);
      }
}
