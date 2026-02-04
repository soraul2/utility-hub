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

      /**
       * Refresh Token을 사용하여 새로운 Access Token 발급
       * 
       * @param refreshToken 갱신 토큰
       * @return 새로운 Access/Refresh 토큰 정보
       */
      @Transactional(readOnly = true)
      public AuthDto.TokenResponse refresh(String refreshToken) {
            log.debug("토큰 갱신 요청");
            
            // [개선] 토큰 검증 실패 시 로깅
            if (!jwtTokenService.validateToken(refreshToken)) {
                  log.warn("유효하지 않은 Refresh Token으로 갱신 시도");
                  throw new BusinessException(ErrorCode.TOKEN_INVALID);
            }

            Authentication authentication = jwtTokenService.getAuthentication(refreshToken);
            String newAccessToken = jwtTokenService.createAccessToken(authentication);
            String newRefreshToken = jwtTokenService.createRefreshToken(authentication);
            
            log.info("토큰 갱신 성공: userId={}", authentication.getName());

            return AuthDto.TokenResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .tokenType("Bearer")
                        .expiresIn(3600) // 1 Hour (Should match JwtTokenService config)
                        .build();
      }
}
