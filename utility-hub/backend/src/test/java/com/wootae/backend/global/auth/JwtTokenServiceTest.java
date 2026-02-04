package com.wootae.backend.global.auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenServiceTest {

      private JwtTokenService jwtTokenService;
      private final String secret = "thisisaverylongsecretkeyforjwttokengenerationverification123456";
      private final long accessTokenExpiry = 3600000L;  // 1시간
      private final long refreshTokenExpiry = 1209600000L;  // 14일
      private SecretKey key;

      @BeforeEach
      void setUp() {
            jwtTokenService = new JwtTokenService(secret, accessTokenExpiry, refreshTokenExpiry);
            key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
      }

      @Test
      @DisplayName("Access Token 생성 및 검증 성공")
      void createAndValidateAccessToken() {
            // given
            Authentication auth = new UsernamePasswordAuthenticationToken(
                        "user1", "", Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

            // when
            String token = jwtTokenService.createAccessToken(auth);

            // then
            assertThat(token).isNotNull();
            assertThat(jwtTokenService.validateToken(token)).isTrue();
      }

      @Test
      @DisplayName("Refresh Token 생성 및 검증 성공")
      void createAndValidateRefreshToken() {
            // given
            Authentication auth = new UsernamePasswordAuthenticationToken(
                        "user1", "", Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

            // when
            String token = jwtTokenService.createRefreshToken(auth);

            // then
            assertThat(token).isNotNull();
            assertThat(jwtTokenService.validateToken(token)).isTrue();
      }

      @Test
      @DisplayName("만료된 토큰 검증 실패")
      void validateExpiredToken() {
            // given
            // Manually create expired token
            String token = Jwts.builder()
                        .subject("user1")
                        .expiration(new Date(System.currentTimeMillis() - 1000)) // Past
                        .signWith(key)
                        .compact();

            // when
            boolean isValid = jwtTokenService.validateToken(token);

            // then
            assertThat(isValid).isFalse();
      }

      @Test
      @DisplayName("토큰에서 Authentication 추출")
      void getAuthentication() {
            // given
            Authentication auth = new UsernamePasswordAuthenticationToken(
                        "user1", "", Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
            String token = jwtTokenService.createAccessToken(auth);

            // when
            Authentication resultAuth = jwtTokenService.getAuthentication(token);

            // then
            assertThat(resultAuth.getName()).isEqualTo("user1");
            assertThat(resultAuth.getAuthorities()).hasSize(1);
      }
}
