package com.wootae.backend.domain.user.controller;

import com.wootae.backend.domain.user.dto.AuthDto;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.domain.user.service.UserService;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 사용자 정보 조회 컨트롤러
 * 
 * [개선] 로깅 추가로 액세스 요청 기록 및 모니터링 가능
 */
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/user")
@RestController
public class UserController {

      private final UserRepository userRepository;
      private final UserService userService;

      /**
       * 현재 로그인한 사용자의 정보 조회
       * 
       * @param userDetails JWT 토큰에서 추출한 사용자 정보
       * @return 사용자 정보 (id, email, nickname, provider, role)
       */
      @GetMapping("/me")
      public ResponseEntity<AuthDto.UserResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
            // [개선] 인증 정보 누락 시 명시적 로깅 및 예외 처리
            if (userDetails == null) {
                  log.warn("사용자 정보 조회 요청: 인증 정보 없음");
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }

            // [개선] 사용자 조회 시 userId 로깅
            Long userId = Long.valueOf(userDetails.getUsername());
            log.debug("사용자 정보 조회: userId={}", userId);

            // [개선] Optional 체이닝으로 안전한 조회
            User user = userRepository.findById(userId)
                        .orElseThrow(() -> {
                              log.warn("사용자를 찾을 수 없음: userId={}", userId);
                              return new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
                        });

            // [개선] 조회 성공 로깅
            log.debug("사용자 정보 조회 성공: userId={}, nickname={}", userId, user.getNickname());
            return ResponseEntity.ok(AuthDto.UserResponse.from(user));
      }

      /**
       * 온보딩 완료 처리
       */
      @PostMapping("/onboarding/complete")
      public ResponseEntity<Map<String, Boolean>> completeOnboarding(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }

            Long userId = Long.valueOf(userDetails.getUsername());
            User user = userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.AUTH_UNAUTHORIZED));

            user.completeOnboarding();
            userRepository.save(user);

            log.info("온보딩 완료: userId={}", userId);
            return ResponseEntity.ok(Map.of("success", true));
      }

      /**
       * 회원 탈퇴
       * 
       * @param userDetails JWT 토큰에서 추출한 사용자 정보
       * @return 성공 응답 (204 No Content)
       */
      @DeleteMapping("/me")
      public ResponseEntity<Void> withdraw(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                  log.warn("회원 탈퇴 요청: 인증 정보 없음");
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }

            Long userId = Long.valueOf(userDetails.getUsername());
            log.debug("회원 탈퇴 요청: userId={}", userId);

            userService.withdraw(userId);

            log.info("회원 탈퇴 성공: userId={}", userId);
            return ResponseEntity.noContent().build();
      }
}
