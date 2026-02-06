package com.wootae.backend.domain.user.service;

import com.wootae.backend.domain.user.dto.AuthDto;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.global.auth.JwtTokenService;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 관련 서비스
 * 
 * [개선] @Slf4j 추가로 토큰 갱신 로깅 추가
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class AuthService {

      private final JwtTokenService jwtTokenService;
      private final com.wootae.backend.domain.user.repository.RefreshTokenRepository refreshTokenRepository;

      /**
       * Refresh Token을 사용하여 새로운 Access Token 발급 (Rotation 적용)
       * 
       * @param refreshToken 갱신 토큰
       * @return 새로운 Access/Refresh 토큰 정보
       */
      @Transactional
      public AuthDto.TokenResponse refresh(String refreshToken) {
            log.debug("토큰 갱신 요청");

            // 1. 토큰 자체 유효성 검사 (서명, 만료일 등)
            if (!jwtTokenService.validateToken(refreshToken)) {
                  log.warn("유효하지 않은 Refresh Token으로 갱신 시도");
                  throw new BusinessException(ErrorCode.TOKEN_INVALID);
            }

            // 2. DB에 존재하는지 확인 (Whitelist)
            com.wootae.backend.domain.user.entity.RefreshToken tokenEntity = refreshTokenRepository
                        .findByToken(refreshToken)
                        .orElseThrow(() -> {
                              log.warn("DB에 존재하지 않는 Refresh Token (폐기됨/조작됨)");
                              return new BusinessException(ErrorCode.TOKEN_INVALID);
                        });

            // 3. 사용자 정보 추출
            Authentication authentication = jwtTokenService.getAuthentication(refreshToken);

            // 4. 새로운 토큰 생성 (Rotate)
            String newAccessToken = jwtTokenService.createAccessToken(authentication);
            String newRefreshToken = jwtTokenService.createRefreshToken(authentication);

            // 5. DB 업데이트 (Rotation: 기존 토큰 교체 or 새 토큰 저장. 여기선 교체)
            // 주의: 기존 토큰의 만료일과 관계없이 새 토큰의 만료일로 갱신
            java.time.LocalDateTime newExpiry = java.time.LocalDateTime.now().plus(
                        java.time.Duration.ofMillis(jwtTokenService.getRefreshTokenValidityInMilliseconds()));
            tokenEntity.updateToken(newRefreshToken, newExpiry);

            log.info("토큰 갱신 성공 (Rotation): userId={}", authentication.getName());

            return AuthDto.TokenResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .tokenType("Bearer")
                        .expiresIn((int) (jwtTokenService.getAccessTokenValidityInMilliseconds() / 1000))
                        .build();
      }

      /**
       * 로그아웃 처리 (Refresh Token 삭제)
       * 
       * @param refreshToken 삭제할 토큰
       */
      @Transactional
      public void logout(String refreshToken) {
            if (refreshToken == null || refreshToken.isBlank()) {
                  return;
            }
            refreshTokenRepository.findByToken(refreshToken)
                        .ifPresent(token -> {
                              refreshTokenRepository.delete(token);
                              log.info("Refresh Token 삭제 완료 (로그아웃): ID={}", token.getId());
                        });
      }
}
