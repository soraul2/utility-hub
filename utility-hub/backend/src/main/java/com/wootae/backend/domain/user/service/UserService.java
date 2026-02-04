package com.wootae.backend.domain.user.service;

import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 정보 관리를 담당하는 서비스
 */
@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {

      private final UserRepository userRepository;

      /**
       * 회원 탈퇴 처리
       * 현재 로그인한 사용자의 정보를 삭제합니다.
       * 
       * @param userId 탈퇴할 사용자의 ID
       */
      @Transactional
      public void withdraw(Long userId) {
            log.info("회원 탈퇴 처리 시작: userId={}", userId);

            if (!userRepository.existsById(userId)) {
                  log.warn("회원 탈퇴 실패: 존재하지 않는 사용자 ID={}", userId);
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }

            userRepository.deleteById(userId);
            log.info("회원 탈퇴 완료: userId={}", userId);
      }
}
