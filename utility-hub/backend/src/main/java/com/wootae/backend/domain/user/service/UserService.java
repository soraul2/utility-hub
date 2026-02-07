package com.wootae.backend.domain.user.service;

import com.wootae.backend.domain.calendar.repository.GoogleCalendarTokenRepository;
import com.wootae.backend.domain.routine.repository.*;
import com.wootae.backend.domain.shop.repository.ThemePurchaseRepository;
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
      private final DailyPlanRepository dailyPlanRepository;
      private final CalendarEventRepository calendarEventRepository;
      private final MonthlyLogRepository monthlyLogRepository;
      private final RoutineTemplateRepository routineTemplateRepository;
      private final WeeklyReviewRepository weeklyReviewRepository;
      private final ThemePurchaseRepository themePurchaseRepository;
      private final GoogleCalendarTokenRepository googleCalendarTokenRepository;

      /**
       * 회원 탈퇴 처리
       * 연관된 모든 데이터를 삭제한 후 사용자 정보를 삭제합니다.
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

            // 1. Delete DailyPlan children first (JPQL bulk delete - executes immediately)
            dailyPlanRepository.deleteTasksByUserId(userId);
            dailyPlanRepository.deleteTimeBlocksByUserId(userId);
            dailyPlanRepository.deleteReflectionsByUserId(userId);

            // 2. Delete RoutineTemplate children
            routineTemplateRepository.deleteTemplateTasksByUserId(userId);

            // 3. Delete Google Calendar tokens
            googleCalendarTokenRepository.deleteByUserId(userId);

            // 4. Delete parent entities (no children, safe to bulk delete)
            themePurchaseRepository.deleteAllByUserId(userId);
            calendarEventRepository.deleteAllByUserId(userId);
            weeklyReviewRepository.deleteAllByUserId(userId);
            monthlyLogRepository.deleteAllByUserId(userId);
            dailyPlanRepository.deleteAllByUserId(userId);
            routineTemplateRepository.deleteAllByUserId(userId);

            // 4. Delete user
            userRepository.deleteById(userId);
            log.info("회원 탈퇴 완료: userId={}", userId);
      }
}
