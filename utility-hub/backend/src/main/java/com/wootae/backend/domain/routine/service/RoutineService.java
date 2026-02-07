package com.wootae.backend.domain.routine.service;

import com.wootae.backend.domain.routine.dto.AiArrangeRequest;
import com.wootae.backend.domain.routine.dto.AiArrangeResult;
import com.wootae.backend.domain.routine.dto.AiTaskArrangement;
import com.wootae.backend.domain.routine.dto.DailyPlanCreateRequest;
import com.wootae.backend.domain.routine.dto.DailyPlanDto;
import com.wootae.backend.domain.routine.dto.ReflectionDto;
import com.wootae.backend.domain.routine.dto.ReflectionRequest;
import com.wootae.backend.domain.routine.dto.RoutineTemplateCreateRequest;
import com.wootae.backend.domain.routine.dto.RoutineTemplateDto;
import com.wootae.backend.domain.routine.dto.TaskCreateRequest;
import com.wootae.backend.domain.routine.dto.TaskDto;
import com.wootae.backend.domain.routine.dto.TemplateTaskRequest;
import com.wootae.backend.domain.routine.dto.MonthlyGoalRequest;
import com.wootae.backend.domain.routine.dto.MonthlyMemoRequest;
import com.wootae.backend.domain.routine.dto.MonthlyStatusResponse;
import com.wootae.backend.domain.routine.dto.WeeklyReviewDto;
import com.wootae.backend.domain.routine.dto.WeeklyReviewRequest;
import com.wootae.backend.domain.routine.dto.CalendarEventDto;
import com.wootae.backend.domain.routine.dto.CalendarEventCreateRequest;
import com.wootae.backend.domain.calendar.service.GoogleCalendarService;
import com.wootae.backend.domain.routine.entity.*;
import com.wootae.backend.domain.routine.repository.*;
import com.wootae.backend.domain.routine.util.XpCalculator;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoutineService {

      private final DailyPlanRepository dailyPlanRepository;
      private final TaskRepository taskRepository;
      private final ReflectionRepository reflectionRepository;
      private final TimeBlockRepository timeBlockRepository;
      private final WeeklyReviewRepository weeklyReviewRepository;
      private final RoutineTemplateRepository routineTemplateRepository;
      private final UserRepository userRepository;
      private final MonthlyLogRepository monthlyLogRepository;
      private final CalendarEventRepository calendarEventRepository;
      private final GoogleCalendarService googleCalendarService;
      private final RoutineAiService routineAiService;

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

            return dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(user.getId(), today)
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
            DailyPlan plan = dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, date)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));
            return DailyPlanDto.from(plan);
      }

      @Transactional
      public DailyPlanDto confirmPlan(LocalDate date) {
            Long userId = getCurrentUserId();
            DailyPlan plan = dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, date)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            plan.setStatus(PlanStatus.CONFIRMED);
            recalculateMonthlyXp(userId, date);

            // Best-effort Google Calendar sync
            try {
                  if (googleCalendarService.isConnected(userId)) {
                        List<Task> scheduledTasks = plan.getKeyTasks().stream()
                                    .filter(t -> t.getStartTime() != null)
                                    .collect(Collectors.toList());
                        if (!scheduledTasks.isEmpty()) {
                              googleCalendarService.createEvents(userId, scheduledTasks, date);
                        }
                  }
            } catch (Exception e) {
                  log.warn("Google Calendar sync failed for userId={}: {}", userId, e.getMessage());
            }

            return DailyPlanDto.from(plan);
      }

      @Transactional
      public DailyPlanDto unconfirmPlan(LocalDate date) {
            Long userId = getCurrentUserId();
            DailyPlan plan = dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, date)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            plan.setStatus(PlanStatus.PLANNING);
            return DailyPlanDto.from(plan);
      }

      @Transactional
      public DailyPlanDto createPlan(DailyPlanCreateRequest request) {
            User user = getCurrentUser();
            // Return existing plan if already exists (idempotent)
            return dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(user.getId(), request.getPlanDate())
                  .map(DailyPlanDto::from)
                  .orElseGet(() -> createDailyPlan(user, request.getPlanDate()));
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

            Long userId = getCurrentUserId();
            if (!task.getDailyPlan().getUser().getId().equals(userId)) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            task.toggleComplete();
            recalculateMonthlyXp(userId, task.getDailyPlan().getPlanDate());
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
                  recalculateMonthlyXp(plan.getUser().getId(), plan.getPlanDate());
            } else {
                  reflection.update(
                              request.getRating(),
                              request.getMood(),
                              request.getWhatWentWell(),
                              request.getWhatDidntGoWell(),
                              request.getTomorrowFocus(),
                              request.getEnergyLevel(),
                              request.getMorningGoal());
            }
            return ReflectionDto.from(reflection);
      }

      @Transactional(readOnly = true)
      public Page<ReflectionDto> getArchive(Pageable pageable) {
            Long userId = getCurrentUserId();
            return reflectionRepository.findArchiveWithTasks(userId, pageable)
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
                        .collect(java.util.stream.Collectors.toMap(
                              DailyPlan::getPlanDate,
                              p -> p,
                              (existing, duplicate) -> existing.getKeyTasks().size() >= duplicate.getKeyTasks().size()
                                    ? existing : duplicate
                        ));

            java.util.Map<String, Double> dailyCompletion = new java.util.HashMap<>();
            double totalDailyRates = 0.0;
            int pastOrTodayCount = 0; // 과거~오늘까지 일수 (미래 제외)
            LocalDate today = LocalDate.now();

            for (LocalDate d = startOfWeek; !d.isAfter(endOfWeek); d = d.plusDays(1)) {
                  DailyPlan plan = planMap.get(d);
                  String dayKey = d.getDayOfWeek().name().substring(0, 3); // MON, TUE...
                  boolean isPastOrToday = !d.isAfter(today);

                  if (plan == null) {
                        dailyCompletion.put(dayKey, 0.0);
                        if (isPastOrToday) {
                              pastOrTodayCount++;
                        }
                  } else {
                        double rate = calculateDailyRate(plan);
                        dailyCompletion.put(dayKey, Math.round(rate * 10.0) / 10.0);

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

      private double calculateDailyRate(DailyPlan plan) {
            if (plan.isRest())
                  return 100.0;
            if (plan.getKeyTasks().isEmpty())
                  return 0.0;
            long dayCompleted = plan.getKeyTasks().stream().filter(Task::isCompleted).count();
            return (double) dayCompleted / plan.getKeyTasks().size() * 100.0;
      }

      @Transactional
      public MonthlyStatusResponse getMonthlyStatus(int year, int month) {
            User user = getCurrentUser();
            LocalDate startOfMonth = LocalDate.of(year, month, 1);
            LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());

            // 1. Get Monthly Log
            MonthlyLog log = monthlyLogRepository.findByUserAndYearAndMonth(user, year, month).orElse(null);
            String monthlyGoal = log != null ? log.getMonthlyGoal() : null;

            // 2. Get Daily Plans
            List<DailyPlan> plans = dailyPlanRepository.findByUserIdAndPlanDateBetween(user.getId(), startOfMonth,
                        endOfMonth);
            java.util.Map<LocalDate, DailyPlan> planMap = plans.stream()
                        .collect(java.util.stream.Collectors.toMap(
                              DailyPlan::getPlanDate,
                              p -> p,
                              (existing, duplicate) -> existing.getKeyTasks().size() >= duplicate.getKeyTasks().size()
                                    ? existing : duplicate
                        ));

            // 3. Calculate Stats and Build Daily Summaries
            List<MonthlyStatusResponse.DailySummary> dailySummaries = new ArrayList<>();
            double totalRates = 0.0;
            int count = 0;
            LocalDate today = LocalDate.now();

            for (LocalDate d = startOfMonth; !d.isAfter(endOfMonth); d = d.plusDays(1)) {
                  DailyPlan plan = planMap.get(d);
                  Double rate = 0.0;
                  boolean isRest = false;
                  boolean hasPlan = false;
                  String memoSnippet = null;
                  int totalTasks = 0;
                  int completedTasks = 0;
                  String mood = null;
                  String appliedTemplateName = null;

                  if (plan != null) {
                        hasPlan = true;
                        isRest = plan.isRest();
                        rate = calculateDailyRate(plan);
                        if (plan.getMonthlyMemo() != null) {
                              memoSnippet = plan.getMonthlyMemo();
                        }
                        if (plan.getKeyTasks() != null) {
                              totalTasks = plan.getKeyTasks().size();
                              completedTasks = (int) plan.getKeyTasks().stream()
                                          .filter(t -> t.isCompleted()).count();
                        }
                        if (plan.getReflection() != null) {
                              mood = plan.getReflection().getMood();
                        }
                        appliedTemplateName = plan.getAppliedTemplateName();
                  }

                  // Add to average if past or today
                  if (!d.isAfter(today)) {
                        totalRates += rate;
                        count++;
                  }

                  dailySummaries.add(MonthlyStatusResponse.DailySummary.builder()
                              .date(d)
                              .completionRate(Math.round(rate * 10.0) / 10.0)
                              .isRest(isRest)
                              .hasPlan(hasPlan)
                              .memoSnippet(memoSnippet)
                              .totalTasks(totalTasks)
                              .completedTasks(completedTasks)
                              .mood(mood)
                              .appliedTemplateName(appliedTemplateName)
                              .build());
            }

            double monthlyRate = count == 0 ? 0.0 : (totalRates / count);
            monthlyRate = Math.round(monthlyRate * 10.0) / 10.0;

            // 4. Calculate XP dynamically and cache in MonthlyLog
            long calculatedXp = XpCalculator.calculate(plans, monthlyGoal);
            if (log != null) {
                  log.setTotalXp(calculatedXp);
            }

            return MonthlyStatusResponse.builder()
                        .year(year)
                        .month(month)
                        .monthlyGoal(monthlyGoal)
                        .totalXp(calculatedXp)
                        .monthlyCompletionRate(monthlyRate)
                        .days(dailySummaries)
                        .build();
      }

      @Transactional
      public void updateMonthlyGoal(int year, int month, String goal) {
            User user = getCurrentUser();
            MonthlyLog log = monthlyLogRepository.findByUserAndYearAndMonth(user, year, month)
                        .orElseGet(() -> MonthlyLog.builder()
                                    .user(user)
                                    .year(year)
                                    .month(month)
                                    .totalXp(0L)
                                    .build());
            log.updateMonthlyGoal(goal);
            monthlyLogRepository.save(log);
      }

      @Transactional
      public void updateMonthlyMemo(LocalDate date, String memo) {
            User user = getCurrentUser();
            DailyPlan plan = dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(user.getId(), date)
                        .orElseGet(() -> DailyPlan.builder()
                                    .user(user)
                                    .planDate(date)
                                    .status(PlanStatus.PLANNING)
                                    .build());

            // If new plan, save it first? cascade should handle it if added to repo
            // But here we need to ensure it's saved.
            if (plan.getId() == null) {
                  plan = dailyPlanRepository.save(plan);
            }

            plan.updateMonthlyMemo(memo);
            // Transactional handles save on modify, but strict saving is fine
      }

      @Transactional
      public void deletePlan(LocalDate date) {
            User user = getCurrentUser();
            List<DailyPlan> plans = dailyPlanRepository.findAllByUserIdAndPlanDate(user.getId(), date);
            if (plans.isEmpty()) {
                  throw new BusinessException(ErrorCode.PLAN_NOT_FOUND);
            }
            dailyPlanRepository.deleteAll(plans);
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

      // ==================== Template ====================

      @Transactional(readOnly = true)
      public List<RoutineTemplateDto> getTemplates() {
            Long userId = getCurrentUserId();
            List<RoutineTemplate> templates = routineTemplateRepository.findByUserIdOrderByCreatedAtDesc(userId);

            return templates.stream()
                        .map(RoutineTemplateDto::from)
                        .collect(Collectors.toList());
      }

      @Transactional(readOnly = true)
      public RoutineTemplateDto getTemplate(Long templateId) {
            Long userId = getCurrentUserId();
            RoutineTemplate template = routineTemplateRepository.findByIdAndUserId(templateId, userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));
            return RoutineTemplateDto.from(template);
      }

      @Transactional
      public RoutineTemplateDto createTemplate(RoutineTemplateCreateRequest request) {
            User user = getCurrentUser();

            RoutineTemplate template = RoutineTemplate.builder()
                        .user(user)
                        .name(request.getName())
                        .description(request.getDescription())
                        .build();
            template = routineTemplateRepository.save(template);

            if (request.getSourcePlanId() != null) {
                  DailyPlan plan = dailyPlanRepository.findById(request.getSourcePlanId())
                              .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));
                  if (!plan.getUser().getId().equals(user.getId())) {
                        throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
                  }
                  List<RoutineTemplateTask> templateTasks = new ArrayList<>();
                  for (Task task : plan.getKeyTasks()) {
                        templateTasks.add(RoutineTemplateTask.builder()
                                    .template(template)
                                    .title(task.getTitle())
                                    .taskOrder(task.getTaskOrder())
                                    .category(task.getCategory())
                                    .startTime(task.getStartTime())
                                    .endTime(task.getEndTime())
                                    .durationMinutes(task.getDurationMinutes())
                                    .description(task.getDescription())
                                    .priority(task.getPriority())
                                    .build());
                  }
                  template.setTasks(templateTasks);
            } else if (request.getTasks() != null) {
                  List<RoutineTemplateTask> templateTasks = new ArrayList<>();
                  int order = 0;
                  for (TemplateTaskRequest tr : request.getTasks()) {
                        templateTasks.add(RoutineTemplateTask.builder()
                                    .template(template)
                                    .title(tr.getTitle())
                                    .taskOrder(tr.getTaskOrder() != null ? tr.getTaskOrder() : order++)
                                    .category(tr.getCategory())
                                    .startTime(tr.getStartTime())
                                    .endTime(tr.getEndTime())
                                    .durationMinutes(tr.getDurationMinutes())
                                    .description(tr.getDescription())
                                    .priority(tr.getPriority())
                                    .build());
                  }
                  template.setTasks(templateTasks);
            }

            return RoutineTemplateDto.from(template);
      }

      @Transactional
      public RoutineTemplateDto updateTemplate(Long templateId, RoutineTemplateCreateRequest request) {
            Long userId = getCurrentUserId();
            RoutineTemplate template = routineTemplateRepository.findByIdAndUserId(templateId, userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));

            if (request.getName() != null)
                  template.updateName(request.getName());
            if (request.getDescription() != null)
                  template.updateDescription(request.getDescription());

            if (request.getTasks() != null) {
                  template.getTasks().clear();
                  int order = 0;
                  for (TemplateTaskRequest tr : request.getTasks()) {
                        template.getTasks().add(RoutineTemplateTask.builder()
                                    .template(template)
                                    .title(tr.getTitle())
                                    .taskOrder(tr.getTaskOrder() != null ? tr.getTaskOrder() : order++)
                                    .category(tr.getCategory())
                                    .startTime(tr.getStartTime())
                                    .endTime(tr.getEndTime())
                                    .durationMinutes(tr.getDurationMinutes())
                                    .description(tr.getDescription())
                                    .priority(tr.getPriority())
                                    .build());
                  }
            }

            return RoutineTemplateDto.from(template);
      }

      @Transactional
      public void deleteTemplate(Long templateId) {
            Long userId = getCurrentUserId();
            RoutineTemplate template = routineTemplateRepository.findByIdAndUserId(templateId, userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));
            routineTemplateRepository.delete(template);
      }

      private void recalculateMonthlyXp(Long userId, LocalDate date) {
            int year = date.getYear();
            int month = date.getMonthValue();
            LocalDate monthStart = date.withDayOfMonth(1);
            LocalDate monthEnd = date.withDayOfMonth(date.lengthOfMonth());

            List<DailyPlan> plans = dailyPlanRepository.findByUserIdAndPlanDateBetween(userId, monthStart, monthEnd);
            MonthlyLog log = monthlyLogRepository.findByUserIdAndYearAndMonth(userId, year, month)
                        .orElse(null);

            String monthlyGoal = log != null ? log.getMonthlyGoal() : null;
            long xp = XpCalculator.calculate(plans, monthlyGoal);

            if (log != null) {
                  log.setTotalXp(xp);
            }
      }

      private void initializeDefaultTemplates(User user) {
            // Template 1: 출근 루틴
            RoutineTemplate morningRoutine = routineTemplateRepository.save(
                        RoutineTemplate.builder()
                                    .user(user)
                                    .name("출근 루틴")
                                    .description("직장인의 하루를 체계적으로 시작하는 루틴")
                                    .type(TemplateType.NORMAL)
                                    .build());
            morningRoutine.setTasks(List.of(
                        RoutineTemplateTask.builder().template(morningRoutine).title("기상 + 스트레칭").taskOrder(0)
                                    .category("HEALTH").startTime(LocalTime.of(6, 0)).endTime(LocalTime.of(6, 30))
                                    .durationMinutes(30).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(morningRoutine).title("아침 식사 + 준비").taskOrder(1)
                                    .category("PERSONAL").startTime(LocalTime.of(6, 30)).endTime(LocalTime.of(7, 15))
                                    .durationMinutes(45).priority("MEDIUM").build(),
                        RoutineTemplateTask.builder().template(morningRoutine).title("출근").taskOrder(2)
                                    .category("PERSONAL").startTime(LocalTime.of(7, 15)).endTime(LocalTime.of(8, 0))
                                    .durationMinutes(45).priority("LOW").build(),
                        RoutineTemplateTask.builder().template(morningRoutine).title("오전 업무 집중").taskOrder(3)
                                    .category("WORK").startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 0))
                                    .durationMinutes(180).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(morningRoutine).title("점심 + 휴식").taskOrder(4)
                                    .category("PERSONAL").startTime(LocalTime.of(12, 0)).endTime(LocalTime.of(13, 0))
                                    .durationMinutes(60).priority("LOW").build(),
                        RoutineTemplateTask.builder().template(morningRoutine).title("오후 업무").taskOrder(5)
                                    .category("WORK").startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(17, 0))
                                    .durationMinutes(240).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(morningRoutine).title("퇴근 + 저녁").taskOrder(6)
                                    .category("PERSONAL").startTime(LocalTime.of(17, 0)).endTime(LocalTime.of(19, 0))
                                    .durationMinutes(120).priority("LOW").build()));

            // Template 2: 자기계발 루틴
            RoutineTemplate selfDevRoutine = routineTemplateRepository.save(
                        RoutineTemplate.builder()
                                    .user(user)
                                    .name("자기계발 루틴")
                                    .description("퇴근 후 성장에 집중하는 하루")
                                    .type(TemplateType.NORMAL)
                                    .build());
            selfDevRoutine.setTasks(List.of(
                        RoutineTemplateTask.builder().template(selfDevRoutine).title("아침 독서").taskOrder(0)
                                    .category("STUDY").startTime(LocalTime.of(6, 30)).endTime(LocalTime.of(7, 30))
                                    .durationMinutes(60).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(selfDevRoutine).title("오전 업무").taskOrder(1)
                                    .category("WORK").startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 0))
                                    .durationMinutes(180).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(selfDevRoutine).title("점심").taskOrder(2)
                                    .category("PERSONAL").startTime(LocalTime.of(12, 0)).endTime(LocalTime.of(13, 0))
                                    .durationMinutes(60).priority("LOW").build(),
                        RoutineTemplateTask.builder().template(selfDevRoutine).title("오후 업무").taskOrder(3)
                                    .category("WORK").startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(17, 0))
                                    .durationMinutes(240).priority("MEDIUM").build(),
                        RoutineTemplateTask.builder().template(selfDevRoutine).title("운동").taskOrder(4)
                                    .category("HEALTH").startTime(LocalTime.of(18, 0)).endTime(LocalTime.of(19, 0))
                                    .durationMinutes(60).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(selfDevRoutine).title("온라인 강의").taskOrder(5)
                                    .category("STUDY").startTime(LocalTime.of(20, 0)).endTime(LocalTime.of(21, 30))
                                    .durationMinutes(90).priority("MEDIUM").build(),
                        RoutineTemplateTask.builder().template(selfDevRoutine).title("하루 회고").taskOrder(6)
                                    .category("PERSONAL").startTime(LocalTime.of(22, 0)).endTime(LocalTime.of(22, 30))
                                    .durationMinutes(30).priority("MEDIUM").build()));

            // Template 3: 업무 집중 루틴
            RoutineTemplate workFocusRoutine = routineTemplateRepository.save(
                        RoutineTemplate.builder()
                                    .user(user)
                                    .name("업무 집중 루틴")
                                    .description("프로젝트 마감 등 업무에 올인하는 하루")
                                    .type(TemplateType.NORMAL)
                                    .build());
            workFocusRoutine.setTasks(List.of(
                        RoutineTemplateTask.builder().template(workFocusRoutine).title("하루 계획 정리").taskOrder(0)
                                    .category("WORK").startTime(LocalTime.of(8, 30)).endTime(LocalTime.of(9, 0))
                                    .durationMinutes(30).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(workFocusRoutine).title("핵심 업무 집중").taskOrder(1)
                                    .category("WORK").startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(12, 0))
                                    .durationMinutes(180).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(workFocusRoutine).title("점심 + 산책").taskOrder(2)
                                    .category("HEALTH").startTime(LocalTime.of(12, 0)).endTime(LocalTime.of(13, 0))
                                    .durationMinutes(60).priority("LOW").build(),
                        RoutineTemplateTask.builder().template(workFocusRoutine).title("회의 + 협업").taskOrder(3)
                                    .category("WORK").startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(15, 0))
                                    .durationMinutes(120).priority("MEDIUM").build(),
                        RoutineTemplateTask.builder().template(workFocusRoutine).title("오후 집중 업무").taskOrder(4)
                                    .category("WORK").startTime(LocalTime.of(15, 0)).endTime(LocalTime.of(17, 30))
                                    .durationMinutes(150).priority("HIGH").build(),
                        RoutineTemplateTask.builder().template(workFocusRoutine).title("업무 정리 + 내일 준비").taskOrder(5)
                                    .category("WORK").startTime(LocalTime.of(17, 30)).endTime(LocalTime.of(18, 0))
                                    .durationMinutes(30).priority("MEDIUM").build()));

            // Template 4: 휴식일
            routineTemplateRepository.save(
                        RoutineTemplate.builder()
                                    .user(user)
                                    .name("휴식일")
                                    .description("충분한 휴식으로 다음 주를 준비하는 날")
                                    .type(TemplateType.REST)
                                    .build());
      }

      @Transactional
      public DailyPlanDto applyTemplate(Long planId, Long templateId) {
            User user = getCurrentUser();

            DailyPlan plan = dailyPlanRepository.findById(planId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));
            if (!plan.getUser().getId().equals(user.getId())) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            RoutineTemplate template = routineTemplateRepository.findByIdAndUserId(templateId, user.getId())
                        .orElseThrow(() -> new BusinessException(ErrorCode.TEMPLATE_NOT_FOUND));

            int existingCount = plan.getKeyTasks().size();
            for (RoutineTemplateTask tt : template.getTasks()) {
                  Task task = Task.builder()
                              .dailyPlan(plan)
                              .title(tt.getTitle())
                              .completed(false)
                              .taskOrder(existingCount + (tt.getTaskOrder() != null ? tt.getTaskOrder() : 0))
                              .category(tt.getCategory())
                              .startTime(tt.getStartTime())
                              .endTime(tt.getEndTime())
                              .durationMinutes(tt.getDurationMinutes())
                              .description(tt.getDescription())
                              .priority(tt.getPriority())
                              .build();
                  taskRepository.save(task);
                  plan.addTask(task);
            }

            // Handle Rest Template Type
            if (template.getType() == TemplateType.REST) {
                  plan.setRest(true);
            } else {
                  plan.setRest(false);
            }

            // Store applied template name for calendar display
            plan.setAppliedTemplateName(template.getName());

            return DailyPlanDto.from(plan);
      }

      // ==================== AI Arrange ====================

      @Transactional
      public AiArrangeResult aiArrangeTasks(Long planId, AiArrangeRequest request) {
            DailyPlan plan = dailyPlanRepository.findById(planId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            Long userId = getCurrentUserId();
            if (!plan.getUser().getId().equals(userId)) {
                  throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
            }

            // 1. Already scheduled tasks (fixed, do not move)
            List<Task> scheduled = plan.getKeyTasks().stream()
                        .filter(t -> t.getStartTime() != null)
                        .collect(Collectors.toList());

            // 2. Unassigned tasks (inventory)
            List<Task> unassigned = plan.getKeyTasks().stream()
                        .filter(t -> t.getStartTime() == null)
                        .collect(Collectors.toList());

            // 3. Call AI
            AiArrangeResult result = routineAiService.arrangeTasks(
                        unassigned, scheduled, request.getTaskText(),
                        request.getStartHour(), request.getEndHour(),
                        request.getMode());

            // 4. Apply results
            for (AiTaskArrangement arr : result.getArrangements()) {
                  if (arr.getExistingTaskId() != null) {
                        // Update existing inventory task with assigned time
                        Task task = taskRepository.findById(arr.getExistingTaskId())
                                    .orElse(null);
                        if (task != null && task.getDailyPlan().getId().equals(planId)) {
                              LocalTime startTime = LocalTime.parse(arr.getStartTime());
                              LocalTime endTime = LocalTime.parse(arr.getEndTime());
                              task.update(
                                          task.getTitle(),
                                          task.isCompleted(),
                                          arr.getCategory() != null ? arr.getCategory() : task.getCategory(),
                                          startTime,
                                          endTime,
                                          arr.getDurationMinutes() != null ? arr.getDurationMinutes() : task.getDurationMinutes(),
                                          task.getDescription(),
                                          arr.getPriority() != null ? arr.getPriority() : task.getPriority());
                        }
                  } else {
                        // Create new task from AI-parsed text
                        LocalTime startTime = LocalTime.parse(arr.getStartTime());
                        LocalTime endTime = LocalTime.parse(arr.getEndTime());
                        Task newTask = Task.builder()
                                    .dailyPlan(plan)
                                    .title(arr.getTitle())
                                    .completed(false)
                                    .taskOrder(plan.getKeyTasks().size())
                                    .category(arr.getCategory())
                                    .startTime(startTime)
                                    .endTime(endTime)
                                    .durationMinutes(arr.getDurationMinutes() != null ? arr.getDurationMinutes() : 60)
                                    .priority(arr.getPriority() != null ? arr.getPriority() : "MEDIUM")
                                    .build();
                        taskRepository.save(newTask);
                        plan.addTask(newTask);
                  }
            }

            // Return result with plan data and reasoning
            result.setPlan(DailyPlanDto.from(plan));
            return result;
      }

      // ==================== Calendar Events ====================

      @Transactional(readOnly = true)
      public List<CalendarEventDto> getCalendarEvents(int year, int month) {
            User user = getCurrentUser();
            LocalDate startOfMonth = LocalDate.of(year, month, 1);
            LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
            return calendarEventRepository.findEventsInRange(user, startOfMonth, endOfMonth)
                        .stream()
                        .map(CalendarEventDto::from)
                        .collect(Collectors.toList());
      }

      @Transactional
      public CalendarEventDto createCalendarEvent(CalendarEventCreateRequest request) {
            User user = getCurrentUser();
            LocalDate startDate = LocalDate.parse(request.getStartDate());
            LocalDate endDate = LocalDate.parse(request.getEndDate());

            CalendarEvent event = CalendarEvent.builder()
                        .user(user)
                        .title(request.getTitle())
                        .description(request.getDescription())
                        .startDate(startDate)
                        .endDate(endDate)
                        .color(request.getColor() != null ? request.getColor() : "#6366f1")
                        .type(CalendarEvent.EventType.valueOf(request.getType() != null ? request.getType() : "MEMO"))
                        .build();
            event = calendarEventRepository.save(event);

            // Google Calendar 동기화 (best-effort)
            try {
                  String googleEventId = googleCalendarService.createAllDayEvent(
                              user.getId(), request.getTitle(), request.getDescription(), startDate, endDate);
                  if (googleEventId != null) {
                        event.setGoogleEventId(googleEventId);
                  }
            } catch (Exception e) {
                  log.warn("Google Calendar sync failed for event {}: {}", event.getId(), e.getMessage());
            }

            return CalendarEventDto.from(event);
      }

      @Transactional
      public CalendarEventDto updateCalendarEvent(Long eventId, CalendarEventCreateRequest request) {
            Long userId = getCurrentUserId();
            CalendarEvent event = calendarEventRepository.findByIdAndUserId(eventId, userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

            LocalDate startDate = LocalDate.parse(request.getStartDate());
            LocalDate endDate = LocalDate.parse(request.getEndDate());

            event.update(
                        request.getTitle(),
                        request.getDescription(),
                        startDate,
                        endDate,
                        request.getColor() != null ? request.getColor() : "#6366f1",
                        CalendarEvent.EventType.valueOf(request.getType() != null ? request.getType() : "MEMO"));

            // Google Calendar 동기화 (best-effort)
            try {
                  googleCalendarService.updateGoogleEvent(
                              userId, event.getGoogleEventId(), request.getTitle(), request.getDescription(), startDate, endDate);
            } catch (Exception e) {
                  log.warn("Google Calendar update failed for event {}: {}", eventId, e.getMessage());
            }

            return CalendarEventDto.from(event);
      }

      @Transactional
      public void deleteCalendarEvent(Long eventId) {
            Long userId = getCurrentUserId();
            CalendarEvent event = calendarEventRepository.findByIdAndUserId(eventId, userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.EVENT_NOT_FOUND));

            // Google Calendar에서도 삭제 (best-effort)
            try {
                  googleCalendarService.deleteGoogleEvent(userId, event.getGoogleEventId());
            } catch (Exception e) {
                  log.warn("Google Calendar delete failed for event {}: {}", eventId, e.getMessage());
            }

            calendarEventRepository.delete(event);
      }
}
