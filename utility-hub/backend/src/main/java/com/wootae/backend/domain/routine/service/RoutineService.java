package com.wootae.backend.domain.routine.service;

import com.wootae.backend.domain.routine.dto.DailyPlanCreateRequest;
import com.wootae.backend.domain.routine.dto.DailyPlanDto;
import com.wootae.backend.domain.routine.dto.ReflectionDto;
import com.wootae.backend.domain.routine.dto.ReflectionRequest;
import com.wootae.backend.domain.routine.dto.TaskCreateRequest;
import com.wootae.backend.domain.routine.dto.TaskDto;
import com.wootae.backend.domain.routine.dto.WeeklyReviewDto;
import com.wootae.backend.domain.routine.dto.WeeklyReviewRequest;
import com.wootae.backend.domain.routine.entity.*;
import com.wootae.backend.domain.routine.repository.*;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoutineService {

      private final DailyPlanRepository dailyPlanRepository;
      private final TaskRepository taskRepository;
      private final ReflectionRepository reflectionRepository;
      private final TimeBlockRepository timeBlockRepository;
      private final WeeklyReviewRepository weeklyReviewRepository;
      private final UserRepository userRepository;

      private Long getCurrentUserId() {
            try {
                  String name = SecurityContextHolder.getContext().getAuthentication().getName();
                  return Long.parseLong(name);
            } catch (NumberFormatException e) {
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }
      }

      private User getCurrentUser() {
            Long userId = getCurrentUserId();
            return userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
      }

      @Transactional
      public DailyPlanDto getOrCreateTodayPlan() {
            User user = getCurrentUser();
            LocalDate today = LocalDate.now();

            return dailyPlanRepository.findByUserIdAndPlanDate(user.getId(), today)
                        .map(DailyPlanDto::from)
                        .orElseGet(() -> createDailyPlan(user, today));
      }

      @Transactional
      public DailyPlanDto createDailyPlan(User user, LocalDate date) {
            DailyPlan plan = DailyPlan.builder()
                        .user(user)
                        .planDate(date)
                        // .keyTasks(new ArrayList<>()) // Initialized in Entity
                        // .timeBlocks(new ArrayList<>())
                        .build();

            plan = dailyPlanRepository.save(plan);

            // TODO: Initialize default time blocks based on user preferences or hardcoded 3
            // blocks
            initTimeBlocks(plan);

            return DailyPlanDto.from(plan);
      }

      private void initTimeBlocks(DailyPlan plan) {
            List<TimeBlock> blocks = new ArrayList<>();
            blocks.add(TimeBlock.builder().dailyPlan(plan).period("morning").label("Morning Routine").startHour(6)
                        .endHour(9).build());
            blocks.add(TimeBlock.builder().dailyPlan(plan).period("midday").label("Deep Work").startHour(10).endHour(14)
                        .build());
            blocks.add(TimeBlock.builder().dailyPlan(plan).period("evening").label("Evening Wind Down").startHour(19)
                        .endHour(22).build());

            timeBlockRepository.saveAll(blocks);
            // We might need to refresh 'plan' or set the list manually to return correct
            // DTO immediately without fetch
            plan.setTimeBlocks(blocks);
      }

      @Transactional
      public DailyPlanDto getPlan(LocalDate date) {
            Long userId = getCurrentUserId();
            DailyPlan plan = dailyPlanRepository.findByUserIdAndPlanDate(userId, date)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));
            return DailyPlanDto.from(plan);
      }

      @Transactional
      public DailyPlanDto confirmPlan(LocalDate date) {
            Long userId = getCurrentUserId();
            DailyPlan plan = dailyPlanRepository.findByUserIdAndPlanDate(userId, date)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            plan.setStatus(PlanStatus.CONFIRMED);
            return DailyPlanDto.from(plan);
      }

      @Transactional
      public DailyPlanDto unconfirmPlan(LocalDate date) {
            Long userId = getCurrentUserId();
            DailyPlan plan = dailyPlanRepository.findByUserIdAndPlanDate(userId, date)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            plan.setStatus(PlanStatus.PLANNING);
            return DailyPlanDto.from(plan);
      }

      @Transactional
      public DailyPlanDto createPlan(DailyPlanCreateRequest request) {
            User user = getCurrentUser();
            // Check if exists
            if (dailyPlanRepository.findByUserIdAndPlanDate(user.getId(), request.getPlanDate()).isPresent()) {
                  throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE); // Already exists
            }
            return createDailyPlan(user, request.getPlanDate());
      }

      @Transactional
      public TaskDto addTask(Long planId, TaskCreateRequest request) {
            DailyPlan plan = dailyPlanRepository.findById(planId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            if (!plan.getUser().getId().equals(getCurrentUserId())) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            Task task = Task.builder()
                        .dailyPlan(plan)
                        .title(request.getTitle())
                        .completed(false)
                        .taskOrder(plan.getKeyTasks().size())
                        .category(request.getCategory())
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .durationMinutes(request.getDurationMinutes())
                        .description(request.getDescription())
                        .priority(request.getPriority())
                        .build();

            task = taskRepository.save(task);
            return TaskDto.from(task);
      }

      @Transactional
      public TaskDto updateTask(Long taskId, TaskCreateRequest request) {
            Task task = taskRepository.findById(taskId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));

            if (!task.getDailyPlan().getUser().getId().equals(getCurrentUserId())) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            java.time.LocalTime startTime = task.getStartTime();
            java.time.LocalTime endTime = task.getEndTime();

            if (Boolean.TRUE.equals(request.getUnassign())) {
                  startTime = null;
                  endTime = null;
            } else {
                  if (request.getStartTime() != null)
                        startTime = request.getStartTime();
                  if (request.getEndTime() != null)
                        endTime = request.getEndTime();
            }

            task.update(
                        request.getTitle() != null ? request.getTitle() : task.getTitle(),
                        task.isCompleted(),
                        request.getCategory() != null ? request.getCategory() : task.getCategory(),
                        startTime,
                        endTime,
                        request.getDurationMinutes() != null ? request.getDurationMinutes() : task.getDurationMinutes(),
                        request.getDescription() != null ? request.getDescription() : task.getDescription(),
                        request.getPriority() != null ? request.getPriority() : task.getPriority());

            return TaskDto.from(task);
      }

      @Transactional
      public TaskDto toggleTask(Long taskId) {
            Task task = taskRepository.findById(taskId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));

            if (!task.getDailyPlan().getUser().getId().equals(getCurrentUserId())) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            task.toggleComplete();
            return TaskDto.from(task);
      }

      @Transactional
      public void deleteTask(Long taskId) {
            Task task = taskRepository.findById(taskId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.TASK_NOT_FOUND));

            if (!task.getDailyPlan().getUser().getId().equals(getCurrentUserId())) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            taskRepository.delete(task);
      }

      @Transactional
      public ReflectionDto saveReflection(ReflectionRequest request) {
            // Find plan
            // If request has planId, use it.
            DailyPlan plan = dailyPlanRepository.findById(request.getPlanId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            if (!plan.getUser().getId().equals(getCurrentUserId())) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            Reflection reflection = reflectionRepository.findByDailyPlanId(plan.getId())
                        .orElse(null);

            if (reflection == null) {
                  reflection = Reflection.builder()
                              .dailyPlan(plan)
                              .rating(request.getRating())
                              .mood(request.getMood())
                              .whatWentWell(request.getWhatWentWell())
                              .whatDidntGoWell(request.getWhatDidntGoWell())
                              .tomorrowFocus(request.getTomorrowFocus())
                              .energyLevel(request.getEnergyLevel())
                              .morningGoal(request.getMorningGoal())
                              .build();
                  reflection = reflectionRepository.save(reflection);
            } else {
                  reflection.update(
                              request.getRating(),
                              request.getMood(),
                              request.getWhatWentWell(),
                              request.getWhatDidntGoWell(),
                              request.getTomorrowFocus(),
                              request.getEnergyLevel(),
                              request.getMorningGoal());
                  // No save needed if transactional, but explicit save is safe
            }
            return ReflectionDto.from(reflection);
      }

      public Page<ReflectionDto> getArchive(Pageable pageable) {
            Long userId = getCurrentUserId();
            return reflectionRepository.findByDailyPlan_UserIdOrderByCreatedAtDesc(userId, pageable)
                        .map(ReflectionDto::from);
      }

      @Transactional(readOnly = true)
      public com.wootae.backend.domain.routine.dto.WeeklyStatsResponse getWeeklyStats(LocalDate date) {
            User user = getCurrentUser();
            LocalDate startOfWeek = date
                        .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
            LocalDate endOfWeek = date
                        .with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

            List<DailyPlan> plans = dailyPlanRepository.findByUserIdAndPlanDateBetween(user.getId(), startOfWeek,
                        endOfWeek);

            // Create a map for easy lookup
            java.util.Map<LocalDate, DailyPlan> planMap = plans.stream()
                        .collect(java.util.stream.Collectors.toMap(DailyPlan::getPlanDate, p -> p));

            java.util.Map<String, Double> dailyCompletion = new java.util.HashMap<>();
            double totalDailyRates = 0.0;
            int pastOrTodayCount = 0; // 과거~오늘까지 일수 (미래 제외)
            LocalDate today = LocalDate.now();

            for (LocalDate d = startOfWeek; !d.isAfter(endOfWeek); d = d.plusDays(1)) {
                  DailyPlan plan = planMap.get(d);
                  String dayKey = d.getDayOfWeek().name().substring(0, 3); // MON, TUE...
                  boolean isPastOrToday = !d.isAfter(today);

                  if (plan == null || plan.getKeyTasks().isEmpty()) {
                        dailyCompletion.put(dayKey, 0.0);
                        // 과거~오늘까지는 0%로 주간 평균에 포함
                        if (isPastOrToday) {
                              pastOrTodayCount++;
                        }
                  } else {
                        long dayTotal = plan.getKeyTasks().size();
                        long dayCompleted = plan.getKeyTasks().stream().filter(Task::isCompleted).count();
                        double rate = (double) dayCompleted / dayTotal * 100.0;
                        dailyCompletion.put(dayKey, Math.round(rate * 10.0) / 10.0); // Round to 1 decimal

                        // 과거~오늘까지만 주간 평균 계산에 포함
                        if (isPastOrToday) {
                              totalDailyRates += rate;
                              pastOrTodayCount++;
                        }
                  }
            }

            // 주간 달성률 = 과거~오늘까지의 일별 달성률 평균 (미래는 제외)
            double weeklyRate = pastOrTodayCount == 0 ? 0.0 : (totalDailyRates / pastOrTodayCount);
            weeklyRate = Math.round(weeklyRate * 10.0) / 10.0;

            return com.wootae.backend.domain.routine.dto.WeeklyStatsResponse.builder()
                        .weeklyRate(weeklyRate)
                        .dailyCompletion(dailyCompletion)
                        .build();
      }

      @Transactional
      public WeeklyReviewDto saveWeeklyReview(WeeklyReviewRequest request) {
            User user = getCurrentUser();
            LocalDate weekStart = LocalDate.parse(request.getWeekStart());

            WeeklyReview review = weeklyReviewRepository.findByUserAndWeekStart(user, weekStart)
                        .orElse(null);

            if (review == null) {
                  review = WeeklyReview.builder()
                              .user(user)
                              .weekStart(weekStart)
                              .achievement(request.getAchievement())
                              .improvement(request.getImprovement())
                              .nextGoal(request.getNextGoal())
                              .build();
                  review = weeklyReviewRepository.save(review);
            } else {
                  review.update(
                              request.getAchievement(),
                              request.getImprovement(),
                              request.getNextGoal());
            }
            return WeeklyReviewDto.from(review);
      }

      @Transactional(readOnly = true)
      public WeeklyReviewDto getWeeklyReview(LocalDate weekStart) {
            User user = getCurrentUser();
            return weeklyReviewRepository.findByUserAndWeekStart(user, weekStart)
                        .map(WeeklyReviewDto::from)
                        .orElse(null);
      }
}
