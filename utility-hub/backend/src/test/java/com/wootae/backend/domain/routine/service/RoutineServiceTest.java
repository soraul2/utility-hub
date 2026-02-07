package com.wootae.backend.domain.routine.service;

import com.wootae.backend.domain.routine.dto.*;
import com.wootae.backend.domain.routine.entity.*;
import com.wootae.backend.domain.routine.repository.*;
import com.wootae.backend.domain.user.entity.AuthProvider;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoutineServiceTest {

    @Mock
    private DailyPlanRepository dailyPlanRepository;
    @Mock
    private TaskRepository taskRepository;
    @Mock
    private ReflectionRepository reflectionRepository;
    @Mock
    private TimeBlockRepository timeBlockRepository;
    @Mock
    private WeeklyReviewRepository weeklyReviewRepository;
    @Mock
    private RoutineTemplateRepository routineTemplateRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MonthlyLogRepository monthlyLogRepository;
    @Mock
    private CalendarEventRepository calendarEventRepository;

    @InjectMocks
    private RoutineService routineService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ==================== Helper Methods ====================

    private void mockSecurityContext(Long userId) {
        SecurityContext context = mock(SecurityContext.class);
        Authentication auth = new UsernamePasswordAuthenticationToken(
                userId.toString(), "", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);
    }

    private User createTestUser(Long id) {
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스트")
                .provider(AuthProvider.GOOGLE)
                .providerId("g_" + id)
                .role(UserRole.ROLE_USER)
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private DailyPlan createTestPlan(Long id, User user, LocalDate date) {
        DailyPlan plan = DailyPlan.builder()
                .user(user)
                .planDate(date)
                .status(PlanStatus.PLANNING)
                .build();
        plan.setId(id);
        return plan;
    }

    private Task createTestTask(Long id, DailyPlan plan) {
        Task task = Task.builder()
                .dailyPlan(plan)
                .title("테스트 태스크")
                .completed(false)
                .taskOrder(0)
                .build();
        ReflectionTestUtils.setField(task, "id", id);
        return task;
    }

    private TaskCreateRequest createTaskCreateRequest() {
        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("새 태스크");
        request.setCategory("WORK");
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(10, 0));
        request.setDurationMinutes(60);
        request.setDescription("태스크 설명");
        request.setPriority("HIGH");
        return request;
    }

    private ReflectionRequest createReflectionRequest(Long planId) {
        ReflectionRequest request = new ReflectionRequest();
        request.setPlanId(planId);
        request.setRating(4);
        request.setMood("GOOD");
        request.setWhatWentWell("잘된 점");
        request.setWhatDidntGoWell("아쉬운 점");
        request.setTomorrowFocus("내일 집중할 것");
        request.setEnergyLevel(3);
        request.setMorningGoal("아침 목표");
        return request;
    }

    // ==================== Test: getOrCreateTodayPlan ====================

    @Test
    @DisplayName("오늘의 플랜이 없으면 새로 생성한다")
    void getOrCreateTodayPlan_createsNewPlanWhenNoneExists() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        LocalDate today = LocalDate.now();

        mockSecurityContext(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, today))
                .thenReturn(Optional.empty());
        when(dailyPlanRepository.save(any(DailyPlan.class))).thenAnswer(invocation -> {
            DailyPlan p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });
        when(timeBlockRepository.saveAll(anyList())).thenReturn(new ArrayList<>());

        // when
        DailyPlanDto result = routineService.getOrCreateTodayPlan();

        // then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getPlanDate()).isEqualTo(today);
        assertThat(result.getStatus()).isEqualTo("PLANNING");
        verify(dailyPlanRepository).save(any(DailyPlan.class));
        verify(timeBlockRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("오늘의 플랜이 이미 존재하면 기존 플랜을 반환한다")
    void getOrCreateTodayPlan_returnsExistingPlan() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        LocalDate today = LocalDate.now();
        DailyPlan existingPlan = createTestPlan(10L, user, today);

        mockSecurityContext(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, today))
                .thenReturn(Optional.of(existingPlan));

        // when
        DailyPlanDto result = routineService.getOrCreateTodayPlan();

        // then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getPlanDate()).isEqualTo(today);
        verify(dailyPlanRepository, never()).save(any(DailyPlan.class));
    }

    // ==================== Test: addTask ====================

    @Test
    @DisplayName("태스크를 성공적으로 추가한다")
    void addTask_success() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());
        TaskCreateRequest request = createTaskCreateRequest();

        mockSecurityContext(userId);
        when(dailyPlanRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            ReflectionTestUtils.setField(t, "id", 100L);
            return t;
        });

        // when
        TaskDto result = routineService.addTask(1L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getTitle()).isEqualTo("새 태스크");
        assertThat(result.getCategory()).isEqualTo("WORK");
        assertThat(result.getPriority()).isEqualTo("HIGH");
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("존재하지 않는 플랜에 태스크 추가 시 PLAN_NOT_FOUND 예외가 발생한다")
    void addTask_planNotFound() {
        // given
        when(dailyPlanRepository.findById(999L)).thenReturn(Optional.empty());

        TaskCreateRequest request = createTaskCreateRequest();

        // when & then
        assertThatThrownBy(() -> routineService.addTask(999L, request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.PLAN_NOT_FOUND));
    }

    @Test
    @DisplayName("다른 사용자의 플랜에 태스크 추가 시 UNAUTHORIZED_ACCESS 예외가 발생한다")
    void addTask_unauthorizedAccess() {
        // given
        Long userId = 1L;
        Long otherUserId = 2L;
        User otherUser = createTestUser(otherUserId);
        DailyPlan otherPlan = createTestPlan(1L, otherUser, LocalDate.now());

        mockSecurityContext(userId);
        when(dailyPlanRepository.findById(1L)).thenReturn(Optional.of(otherPlan));

        TaskCreateRequest request = createTaskCreateRequest();

        // when & then
        assertThatThrownBy(() -> routineService.addTask(1L, request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.UNAUTHORIZED_ACCESS));
    }

    // ==================== Test: updateTask ====================

    @Test
    @DisplayName("태스크의 모든 필드를 성공적으로 업데이트한다")
    void updateTask_successWithAllFields() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());
        Task task = createTestTask(10L, plan);

        mockSecurityContext(userId);
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        TaskCreateRequest request = new TaskCreateRequest();
        request.setTitle("수정된 태스크");
        request.setCategory("STUDY");
        request.setStartTime(LocalTime.of(14, 0));
        request.setEndTime(LocalTime.of(16, 0));
        request.setDurationMinutes(120);
        request.setDescription("수정된 설명");
        request.setPriority("MEDIUM");

        // when
        TaskDto result = routineService.updateTask(10L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("수정된 태스크");
        assertThat(result.getCategory()).isEqualTo("STUDY");
        assertThat(result.getDurationMinutes()).isEqualTo(120);
        assertThat(result.getPriority()).isEqualTo("MEDIUM");
    }

    @Test
    @DisplayName("태스크 업데이트 시 unassign이 true이면 시간 필드가 null로 설정된다")
    void updateTask_unassignClearsTimeFields() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());
        Task task = Task.builder()
                .dailyPlan(plan)
                .title("시간이 있는 태스크")
                .completed(false)
                .taskOrder(0)
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(10, 0))
                .build();
        ReflectionTestUtils.setField(task, "id", 10L);

        mockSecurityContext(userId);
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        TaskCreateRequest request = new TaskCreateRequest();
        request.setUnassign(true);

        // when
        TaskDto result = routineService.updateTask(10L, request);

        // then
        assertThat(result).isNotNull();
        assertThat(task.getStartTime()).isNull();
        assertThat(task.getEndTime()).isNull();
    }

    // ==================== Test: toggleTask ====================

    @Test
    @DisplayName("태스크의 완료 상태를 토글한다")
    void toggleTask_togglesCompletion() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());
        Task task = createTestTask(10L, plan);

        assertThat(task.isCompleted()).isFalse();

        mockSecurityContext(userId);
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        // when
        TaskDto result = routineService.toggleTask(10L);

        // then
        assertThat(result).isNotNull();
        assertThat(task.isCompleted()).isTrue();
    }

    // ==================== Test: confirmPlan / unconfirmPlan ====================

    @Test
    @DisplayName("플랜을 확정 상태(CONFIRMED)로 변경한다")
    void confirmPlan_setsStatusToConfirmed() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        LocalDate date = LocalDate.now();
        DailyPlan plan = createTestPlan(1L, user, date);
        plan.setStatus(PlanStatus.PLANNING);

        mockSecurityContext(userId);
        when(dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, date))
                .thenReturn(Optional.of(plan));

        // when
        DailyPlanDto result = routineService.confirmPlan(date);

        // then
        assertThat(result).isNotNull();
        assertThat(plan.getStatus()).isEqualTo(PlanStatus.CONFIRMED);
        assertThat(result.getStatus()).isEqualTo("CONFIRMED");
    }

    @Test
    @DisplayName("플랜을 계획 상태(PLANNING)로 되돌린다")
    void unconfirmPlan_setsStatusToPlanning() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        LocalDate date = LocalDate.now();
        DailyPlan plan = createTestPlan(1L, user, date);
        plan.setStatus(PlanStatus.CONFIRMED);

        mockSecurityContext(userId);
        when(dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, date))
                .thenReturn(Optional.of(plan));

        // when
        DailyPlanDto result = routineService.unconfirmPlan(date);

        // then
        assertThat(result).isNotNull();
        assertThat(plan.getStatus()).isEqualTo(PlanStatus.PLANNING);
        assertThat(result.getStatus()).isEqualTo("PLANNING");
    }

    // ==================== Test: saveReflection ====================

    @Test
    @DisplayName("회고가 없으면 새로 생성한다")
    void saveReflection_createsNewReflection() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());
        ReflectionRequest request = createReflectionRequest(1L);

        mockSecurityContext(userId);
        when(dailyPlanRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(reflectionRepository.findByDailyPlanId(1L)).thenReturn(Optional.empty());
        when(reflectionRepository.save(any(Reflection.class))).thenAnswer(invocation -> {
            Reflection r = invocation.getArgument(0);
            ReflectionTestUtils.setField(r, "id", 100L);
            return r;
        });

        // when
        ReflectionDto result = routineService.saveReflection(request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getRating()).isEqualTo(4);
        assertThat(result.getMood()).isEqualTo("GOOD");
        verify(reflectionRepository).save(any(Reflection.class));
    }

    @Test
    @DisplayName("기존 회고가 있으면 업데이트한다")
    void saveReflection_updatesExistingReflection() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());

        Reflection existingReflection = Reflection.builder()
                .dailyPlan(plan)
                .rating(3)
                .mood("NEUTRAL")
                .whatWentWell("이전 내용")
                .whatDidntGoWell("이전 내용")
                .tomorrowFocus("이전 내용")
                .energyLevel(2)
                .morningGoal("이전 목표")
                .build();
        ReflectionTestUtils.setField(existingReflection, "id", 50L);

        ReflectionRequest request = createReflectionRequest(1L);

        mockSecurityContext(userId);
        when(dailyPlanRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(reflectionRepository.findByDailyPlanId(1L)).thenReturn(Optional.of(existingReflection));

        // when
        ReflectionDto result = routineService.saveReflection(request);

        // then
        assertThat(result).isNotNull();
        assertThat(existingReflection.getRating()).isEqualTo(4);
        assertThat(existingReflection.getMood()).isEqualTo("GOOD");
        assertThat(existingReflection.getWhatWentWell()).isEqualTo("잘된 점");
        assertThat(existingReflection.getEnergyLevel()).isEqualTo(3);
        verify(reflectionRepository, never()).save(any(Reflection.class));
    }

    // ==================== Test: applyTemplate ====================

    @Test
    @DisplayName("NORMAL 템플릿을 적용하면 태스크가 플랜에 추가된다")
    void applyTemplate_appliesTemplateTasks() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());

        RoutineTemplate template = RoutineTemplate.builder()
                .user(user)
                .name("테스트 템플릿")
                .description("설명")
                .type(TemplateType.NORMAL)
                .build();
        ReflectionTestUtils.setField(template, "id", 10L);

        List<RoutineTemplateTask> templateTasks = List.of(
                RoutineTemplateTask.builder().template(template).title("태스크1").taskOrder(0)
                        .category("WORK").startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(10, 0))
                        .durationMinutes(60).priority("HIGH").build(),
                RoutineTemplateTask.builder().template(template).title("태스크2").taskOrder(1)
                        .category("STUDY").startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(11, 0))
                        .durationMinutes(60).priority("MEDIUM").build(),
                RoutineTemplateTask.builder().template(template).title("태스크3").taskOrder(2)
                        .category("HEALTH").startTime(LocalTime.of(11, 0)).endTime(LocalTime.of(12, 0))
                        .durationMinutes(60).priority("LOW").build()
        );
        template.setTasks(templateTasks);

        mockSecurityContext(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(dailyPlanRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(routineTemplateRepository.findByIdAndUserId(10L, userId)).thenReturn(Optional.of(template));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            ReflectionTestUtils.setField(t, "id", (long) (Math.random() * 1000));
            return t;
        });

        // when
        DailyPlanDto result = routineService.applyTemplate(1L, 10L);

        // then
        assertThat(result).isNotNull();
        assertThat(plan.getKeyTasks()).hasSize(3);
        assertThat(plan.isRest()).isFalse();
        assertThat(plan.getAppliedTemplateName()).isEqualTo("테스트 템플릿");
        verify(taskRepository, times(3)).save(any(Task.class));
    }

    @Test
    @DisplayName("REST 템플릿을 적용하면 플랜의 isRest가 true로 설정된다")
    void applyTemplate_restTemplateSetIsRest() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());

        RoutineTemplate template = RoutineTemplate.builder()
                .user(user)
                .name("휴식일")
                .description("쉬는 날")
                .type(TemplateType.REST)
                .build();
        ReflectionTestUtils.setField(template, "id", 20L);

        mockSecurityContext(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(dailyPlanRepository.findById(1L)).thenReturn(Optional.of(plan));
        when(routineTemplateRepository.findByIdAndUserId(20L, userId)).thenReturn(Optional.of(template));

        // when
        DailyPlanDto result = routineService.applyTemplate(1L, 20L);

        // then
        assertThat(result).isNotNull();
        assertThat(plan.isRest()).isTrue();
        assertThat(plan.getAppliedTemplateName()).isEqualTo("휴식일");
    }

    // ==================== Test: deleteTask ====================

    @Test
    @DisplayName("태스크를 성공적으로 삭제한다")
    void deleteTask_success() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        DailyPlan plan = createTestPlan(1L, user, LocalDate.now());
        Task task = createTestTask(10L, plan);

        mockSecurityContext(userId);
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        // when
        routineService.deleteTask(10L);

        // then
        verify(taskRepository).delete(task);
    }

    // ==================== Test: getWeeklyStats ====================

    @Test
    @DisplayName("주간 통계를 올바르게 계산한다")
    void getWeeklyStats_calculatesCorrectly() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        // Plan for Monday: 2 tasks, 1 completed (50%)
        DailyPlan mondayPlan = createTestPlan(1L, user, monday);
        Task mondayTask1 = createTestTask(101L, mondayPlan);
        Task mondayTask2 = Task.builder()
                .dailyPlan(mondayPlan)
                .title("완료된 태스크")
                .completed(true)
                .taskOrder(1)
                .build();
        ReflectionTestUtils.setField(mondayTask2, "id", 102L);
        mondayPlan.getKeyTasks().add(mondayTask1);
        mondayPlan.getKeyTasks().add(mondayTask2);

        // Plan for Tuesday: rest day (100%)
        DailyPlan tuesdayPlan = createTestPlan(2L, user, monday.plusDays(1));
        tuesdayPlan.setRest(true);

        List<DailyPlan> plans = new ArrayList<>();
        plans.add(mondayPlan);
        plans.add(tuesdayPlan);

        mockSecurityContext(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(dailyPlanRepository.findByUserIdAndPlanDateBetween(eq(userId), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(plans);

        // when
        WeeklyStatsResponse result = routineService.getWeeklyStats(today);

        // then
        assertThat(result).isNotNull();
        assertThat(result.getDailyCompletion()).isNotEmpty();
        assertThat(result.getDailyCompletion().get("MON")).isEqualTo(50.0);
        assertThat(result.getDailyCompletion().get("TUE")).isEqualTo(100.0);
    }

    // ==================== Test: getTemplates ====================

    @Test
    @DisplayName("템플릿이 없으면 기본 템플릿을 초기화한 후 반환한다")
    void getTemplates_initializesDefaultsWhenEmpty() {
        // given
        Long userId = 1L;
        User user = createTestUser(userId);

        mockSecurityContext(userId);

        // First call returns empty -> triggers initialization
        // Second call returns the initialized templates
        when(routineTemplateRepository.findByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of())
                .thenReturn(List.of(
                        buildMockTemplate(1L, user, "출근 루틴", TemplateType.NORMAL),
                        buildMockTemplate(2L, user, "자기계발 루틴", TemplateType.NORMAL),
                        buildMockTemplate(3L, user, "업무 집중 루틴", TemplateType.NORMAL),
                        buildMockTemplate(4L, user, "휴식일", TemplateType.REST)
                ));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(routineTemplateRepository.save(any(RoutineTemplate.class))).thenAnswer(invocation -> {
            RoutineTemplate t = invocation.getArgument(0);
            ReflectionTestUtils.setField(t, "id", (long) (Math.random() * 1000));
            return t;
        });

        // when
        List<RoutineTemplateDto> result = routineService.getTemplates();

        // then
        assertThat(result).hasSize(4);
        verify(routineTemplateRepository, times(4)).save(any(RoutineTemplate.class));
        verify(routineTemplateRepository, times(2)).findByUserIdOrderByCreatedAtDesc(userId);
    }

    private RoutineTemplate buildMockTemplate(Long id, User user, String name, TemplateType type) {
        RoutineTemplate template = RoutineTemplate.builder()
                .user(user)
                .name(name)
                .description("설명")
                .type(type)
                .build();
        ReflectionTestUtils.setField(template, "id", id);
        return template;
    }
}
