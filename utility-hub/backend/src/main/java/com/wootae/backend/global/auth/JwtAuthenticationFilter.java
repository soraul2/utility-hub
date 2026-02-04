package com.wootae.backend.global.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

      private final JwtTokenService jwtTokenService;

      @Override
      protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                  throws ServletException, IOException {
            String token = resolveToken(request);

            try {
                  if (token != null) {
                        if (jwtTokenService.validateToken(token)) {
                              Authentication authentication = jwtTokenService.getAuthentication(token);
                              SecurityContextHolder.getContext().setAuthentication(authentication);
                              log.debug("JWT 검증 성공: userId={}", authentication.getName());
                        } else {
                              log.warn("유효하지 않은 JWT 토큰 수신");
                        }
                  } else {
                        log.debug("Authorization 헤더에서 JWT 토큰을 찾을 수 없음");
                  }
            } catch (Exception e) {
                  log.warn("JWT 토큰 검증 중 예외 발생: {}", e.getMessage());
            }

            filterChain.doFilter(request, response);
      }

      private String resolveToken(HttpServletRequest request) {
            String bearerToken = request.getHeader("Authorization");
            if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
                  return bearerToken.substring(7);
            }
            return null;
      }
}
