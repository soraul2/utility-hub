package com.wootae.backend.global.auth;

import com.wootae.backend.domain.user.entity.UserRole;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenService {

      private final SecretKey key;
      // [개선] @Value로 토큰 시간 외부화 (기본값: 1시간, 14일)
      private final long accessTokenValidityInMilliseconds;
      private final long refreshTokenValidityInMilliseconds;

      public JwtTokenService(
                  @Value("${spring.jwt.secret}") String secret,
                  @Value("${spring.jwt.access-token-expiry:3600000}") long accessTokenExpiry,
                  @Value("${spring.jwt.refresh-token-expiry:1209600000}") long refreshTokenExpiry) {
            this.key = io.jsonwebtoken.security.Keys
                        .hmacShaKeyFor(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            this.accessTokenValidityInMilliseconds = accessTokenExpiry;
            this.refreshTokenValidityInMilliseconds = refreshTokenExpiry;
      }

      public long getAccessTokenValidityInMilliseconds() {
            return accessTokenValidityInMilliseconds;
      }

      public long getRefreshTokenValidityInMilliseconds() {
            return refreshTokenValidityInMilliseconds;
      }

      public String createAccessToken(Authentication authentication) {
            String authorities = authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(","));

            long now = (new Date()).getTime();
            Date validity = new Date(now + this.accessTokenValidityInMilliseconds);

            return Jwts.builder()
                        .subject(authentication.getName())
                        .claim("auth", authorities)
                        .expiration(validity)
                        .signWith(key)
                        .compact();
      }

      public String createRefreshToken(Authentication authentication) {
            long now = (new Date()).getTime();
            Date validity = new Date(now + this.refreshTokenValidityInMilliseconds);

            return Jwts.builder()
                        .subject(authentication.getName())
                        .expiration(validity)
                        .signWith(key)
                        .compact();
      }

      public Authentication getAuthentication(String token) {
            Claims claims = parseClaims(token);

            if (claims.get("auth") == null) {
                  throw new BusinessException(ErrorCode.TOKEN_INVALID);
            }

            Collection<? extends GrantedAuthority> authorities = Arrays.stream(claims.get("auth").toString().split(","))
                        .map(SimpleGrantedAuthority::new)
                        .toList();

            UserDetails principal = new User(claims.getSubject(), "", authorities);
            return new UsernamePasswordAuthenticationToken(principal, token, authorities);
      }

      public boolean validateToken(String token) {
            try {
                  parseClaims(token);
                  return true;
            } catch (SecurityException | MalformedJwtException e) {
                  log.info("Invalid JWT Token", e);
            } catch (ExpiredJwtException e) {
                  log.info("Expired JWT Token", e);
            } catch (UnsupportedJwtException e) {
                  log.info("Unsupported JWT Token", e);
            } catch (IllegalArgumentException e) {
                  log.info("JWT claims string is empty.", e);
            }
            return false;
      }

      private Claims parseClaims(String token) {
            return Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
      }
}
