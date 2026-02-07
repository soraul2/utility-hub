package com.wootae.backend.domain.shop.service;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import com.wootae.backend.domain.routine.entity.MonthlyLog;
import com.wootae.backend.domain.routine.entity.PlanStatus;
import com.wootae.backend.domain.routine.entity.Task;
import com.wootae.backend.domain.routine.repository.DailyPlanRepository;
import com.wootae.backend.domain.routine.repository.MonthlyLogRepository;
import com.wootae.backend.domain.shop.config.ThemeCatalog;
import com.wootae.backend.domain.shop.dto.ShopDTOs.PointBalanceResponse;
import com.wootae.backend.domain.shop.dto.ShopDTOs.PurchaseResponse;
import com.wootae.backend.domain.shop.dto.ShopDTOs.ShopDataResponse;
import com.wootae.backend.domain.shop.dto.ShopDTOs.ThemeItemResponse;
import com.wootae.backend.domain.shop.entity.ThemePurchase;
import com.wootae.backend.domain.shop.repository.ThemePurchaseRepository;
import com.wootae.backend.domain.user.entity.AuthProvider;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShopServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ThemePurchaseRepository themePurchaseRepository;

    @Mock
    private MonthlyLogRepository monthlyLogRepository;

    @Mock
    private DailyPlanRepository dailyPlanRepository;

    @InjectMocks
    private ShopService shopService;

    // ============================================================
    // Helper methods
    // ============================================================

    private User createUser(Long id, UserRole role) {
        User user = User.builder()
                .email("test@test.com")
                .nickname("테스트")
                .provider(AuthProvider.GOOGLE)
                .providerId("g_" + id)
                .role(role)
                .build();
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    /**
     * DailyPlan with completed tasks.
     * XP per plan: 5 (created) + completedCount * 10 + bonus (50 if 100%, 20 if >=80%)
     */
    private DailyPlan createDailyPlanWithTasks(User user, LocalDate date, int totalTasks, int completedTasks) {
        DailyPlan plan = DailyPlan.builder()
                .user(user)
                .planDate(date)
                .status(PlanStatus.CONFIRMED)
                .build();

        List<Task> tasks = new ArrayList<>();
        for (int i = 0; i < totalTasks; i++) {
            Task task = Task.builder()
                    .dailyPlan(plan)
                    .title("Task " + (i + 1))
                    .completed(i < completedTasks)
                    .taskOrder(i)
                    .build();
            tasks.add(task);
        }
        plan.setKeyTasks(tasks);
        return plan;
    }

    /**
     * Sets up monthly log + daily plans mocking so that calculateTotalEarnedPoints returns
     * a predictable amount.
     *
     * 2 plans, each with 1/1 completed task (100% rate):
     *   per plan = 5 (created) + 10 (1 completed) + 50 (100% bonus) = 65
     *   2 plans = 130, plus monthly goal bonus = 10 => total 140 XP
     */
    private void mockPointCalculation(Long userId, User user, long expectedXp) {
        MonthlyLog log = MonthlyLog.builder()
                .user(user)
                .year(2025)
                .month(1)
                .monthlyGoal("목표 달성하기")
                .build();

        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2025, 1, 31);

        DailyPlan plan1 = createDailyPlanWithTasks(user, LocalDate.of(2025, 1, 5), 1, 1);
        DailyPlan plan2 = createDailyPlanWithTasks(user, LocalDate.of(2025, 1, 10), 1, 1);

        when(monthlyLogRepository.findByUserId(userId)).thenReturn(List.of(log));
        when(dailyPlanRepository.findByUserIdAndPlanDateBetween(eq(userId), eq(start), eq(end)))
                .thenReturn(List.of(plan1, plan2));
        // expected XP = 5+10+50 + 5+10+50 + 10(monthlyGoal) = 140
    }

    // ============================================================
    // 1. getShopData - regular user
    // ============================================================

    @Test
    @DisplayName("일반 사용자 - 무료 테마는 소유, 유료 테마는 미소유 상태로 조회된다")
    void getShopData_regularUser() {
        // given
        Long userId = 1L;
        User user = createUser(userId, UserRole.ROLE_USER);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(themePurchaseRepository.findByUserId(userId)).thenReturn(Collections.emptyList());
        when(monthlyLogRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        // when
        ShopDataResponse response = shopService.getShopData(userId);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getThemes()).isNotEmpty();

        for (ThemeItemResponse theme : response.getThemes()) {
            if (theme.getPrice() == 0L) {
                assertThat(theme.isOwned()).isTrue();
            } else {
                assertThat(theme.isOwned()).isFalse();
            }
        }

        // "default" should be active when no activeThemeKey is set
        ThemeItemResponse defaultTheme = response.getThemes().stream()
                .filter(t -> "default".equals(t.getKey()))
                .findFirst().orElseThrow();
        assertThat(defaultTheme.isActive()).isTrue();
    }

    // ============================================================
    // 2. getShopData - admin user
    // ============================================================

    @Test
    @DisplayName("관리자 사용자 - 모든 테마가 소유 상태이며 포인트는 999,999이다")
    void getShopData_adminUser() {
        // given
        Long userId = 1L;
        User admin = createUser(userId, UserRole.ROLE_ADMIN);

        when(userRepository.findById(userId)).thenReturn(Optional.of(admin));
        when(themePurchaseRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        // when
        ShopDataResponse response = shopService.getShopData(userId);

        // then
        assertThat(response.getPoints().getTotalEarned()).isEqualTo(999999L);
        assertThat(response.getPoints().getAvailable()).isEqualTo(999999L);
        assertThat(response.getPoints().getTotalSpent()).isEqualTo(0L);

        for (ThemeItemResponse theme : response.getThemes()) {
            assertThat(theme.isOwned()).isTrue();
        }
    }

    // ============================================================
    // 3. purchaseTheme - success
    // ============================================================

    @Test
    @DisplayName("포인트가 충분한 사용자가 유료 테마를 정상 구매한다")
    void purchaseTheme_success() {
        // given
        Long userId = 1L;
        User user = createUser(userId, UserRole.ROLE_USER);
        String themeKey = "ocean"; // price = 100
        Long price = ThemeCatalog.get(themeKey).getPrice();

        when(themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        mockPointCalculation(userId, user, 140L); // total earned = 140

        // when
        PurchaseResponse response = shopService.purchaseTheme(userId, themeKey);

        // then
        assertThat(response.getThemeKey()).isEqualTo(themeKey);
        assertThat(response.getPointsSpent()).isEqualTo(price);
        assertThat(response.getRemainingPoints()).isEqualTo(140L - price); // 140 - 100 = 40

        verify(themePurchaseRepository).save(any(ThemePurchase.class));
        assertThat(user.getSpentPoints()).isEqualTo(price);
    }

    // ============================================================
    // 4. purchaseTheme - insufficient points
    // ============================================================

    @Test
    @DisplayName("포인트가 부족하면 INSUFFICIENT_POINTS 예외가 발생한다")
    void purchaseTheme_insufficientPoints() {
        // given
        Long userId = 1L;
        User user = createUser(userId, UserRole.ROLE_USER);
        String themeKey = "aurora"; // price = 500

        when(themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Mock point calculation to return only 140 XP (not enough for 500)
        mockPointCalculation(userId, user, 140L);

        // when & then
        assertThatThrownBy(() -> shopService.purchaseTheme(userId, themeKey))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.INSUFFICIENT_POINTS);

        verify(themePurchaseRepository, never()).save(any());
    }

    // ============================================================
    // 5. purchaseTheme - already owned
    // ============================================================

    @Test
    @DisplayName("이미 보유한 테마를 구매하면 THEME_ALREADY_OWNED 예외가 발생한다")
    void purchaseTheme_alreadyOwned() {
        // given
        Long userId = 1L;
        String themeKey = "ocean";

        when(themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)).thenReturn(true);

        // when & then
        assertThatThrownBy(() -> shopService.purchaseTheme(userId, themeKey))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.THEME_ALREADY_OWNED);

        verify(themePurchaseRepository, never()).save(any());
    }

    // ============================================================
    // 6. purchaseTheme - admin bypass
    // ============================================================

    @Test
    @DisplayName("관리자는 포인트 차감 없이 테마를 구매할 수 있다")
    void purchaseTheme_adminBypass() {
        // given
        Long userId = 1L;
        User admin = createUser(userId, UserRole.ROLE_ADMIN);
        String themeKey = "aurora"; // price = 500

        when(themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(admin));

        // when
        PurchaseResponse response = shopService.purchaseTheme(userId, themeKey);

        // then
        assertThat(response.getThemeKey()).isEqualTo(themeKey);
        assertThat(response.getPointsSpent()).isEqualTo(0L);
        assertThat(response.getRemainingPoints()).isEqualTo(Long.MAX_VALUE);

        // spendPoints should NOT be called for admin
        assertThat(admin.getSpentPoints()).isEqualTo(0L);
        verify(themePurchaseRepository).save(any(ThemePurchase.class));
    }

    // ============================================================
    // 7. purchaseTheme - theme not found
    // ============================================================

    @Test
    @DisplayName("존재하지 않는 테마를 구매하면 THEME_NOT_FOUND 예외가 발생한다")
    void purchaseTheme_themeNotFound() {
        // given
        Long userId = 1L;
        String invalidKey = "nonexistent_theme";

        // when & then
        assertThatThrownBy(() -> shopService.purchaseTheme(userId, invalidKey))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.THEME_NOT_FOUND);

        verify(themePurchaseRepository, never()).save(any());
    }

    // ============================================================
    // 8. setActiveTheme - success
    // ============================================================

    @Test
    @DisplayName("구매한 테마를 활성 테마로 설정할 수 있다")
    void setActiveTheme_success() {
        // given
        Long userId = 1L;
        User user = createUser(userId, UserRole.ROLE_USER);
        String themeKey = "ocean";

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)).thenReturn(true);

        // when
        shopService.setActiveTheme(userId, themeKey);

        // then
        assertThat(user.getActiveThemeKey()).isEqualTo(themeKey);
    }

    // ============================================================
    // 9. setActiveTheme - not owned
    // ============================================================

    @Test
    @DisplayName("구매하지 않은 유료 테마를 활성화하면 THEME_NOT_OWNED 예외가 발생한다")
    void setActiveTheme_notOwned() {
        // given
        Long userId = 1L;
        User user = createUser(userId, UserRole.ROLE_USER);
        String themeKey = "aurora"; // paid theme, not owned

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)).thenReturn(false);

        // when & then
        assertThatThrownBy(() -> shopService.setActiveTheme(userId, themeKey))
                .isInstanceOf(BusinessException.class)
                .extracting(e -> ((BusinessException) e).getErrorCode())
                .isEqualTo(ErrorCode.THEME_NOT_OWNED);
    }

    // ============================================================
    // 10. setActiveTheme - admin bypass
    // ============================================================

    @Test
    @DisplayName("관리자는 구매하지 않은 테마도 활성화할 수 있다")
    void setActiveTheme_adminBypass() {
        // given
        Long userId = 1L;
        User admin = createUser(userId, UserRole.ROLE_ADMIN);
        String themeKey = "aurora";

        when(userRepository.findById(userId)).thenReturn(Optional.of(admin));

        // when
        shopService.setActiveTheme(userId, themeKey);

        // then
        assertThat(admin.getActiveThemeKey()).isEqualTo(themeKey);
        verify(themePurchaseRepository, never()).existsByUserIdAndThemeKey(any(), any());
    }

    // ============================================================
    // 11. setActiveTheme - null / default / blank resets to null
    // ============================================================

    @Test
    @DisplayName("테마를 null, 빈 문자열, 또는 'default'로 설정하면 activeThemeKey가 null로 초기화된다")
    void setActiveTheme_nullOrDefault() {
        // given
        Long userId = 1L;
        User user = createUser(userId, UserRole.ROLE_USER);
        user.setActiveThemeKey("ocean"); // previously set

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // when - null
        shopService.setActiveTheme(userId, null);
        assertThat(user.getActiveThemeKey()).isNull();

        // when - "default"
        user.setActiveThemeKey("ocean");
        shopService.setActiveTheme(userId, "default");
        assertThat(user.getActiveThemeKey()).isNull();

        // when - blank
        user.setActiveThemeKey("ocean");
        shopService.setActiveTheme(userId, "   ");
        assertThat(user.getActiveThemeKey()).isNull();
    }

    // ============================================================
    // 12. buildPointBalance - admin (tested via getShopData)
    // ============================================================

    @Test
    @DisplayName("관리자의 포인트 잔액은 항상 totalEarned=999999, totalSpent=0, available=999999이다")
    void buildPointBalance_admin() {
        // given
        Long userId = 1L;
        User admin = createUser(userId, UserRole.ROLE_ADMIN);

        when(userRepository.findById(userId)).thenReturn(Optional.of(admin));
        when(themePurchaseRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        // when
        ShopDataResponse response = shopService.getShopData(userId);
        PointBalanceResponse points = response.getPoints();

        // then
        assertThat(points.getTotalEarned()).isEqualTo(999999L);
        assertThat(points.getTotalSpent()).isEqualTo(0L);
        assertThat(points.getAvailable()).isEqualTo(999999L);

        // Should NOT call monthlyLogRepository or dailyPlanRepository for admin
        verify(monthlyLogRepository, never()).findByUserId(any());
        verify(dailyPlanRepository, never()).findByUserIdAndPlanDateBetween(any(), any(), any());
    }

    // ============================================================
    // 13. buildPointBalance - regular user (tested via getPointBalance)
    // ============================================================

    @Test
    @DisplayName("일반 사용자의 포인트 잔액은 총 획득 포인트에서 사용 포인트를 뺀 값이다")
    void buildPointBalance_regularUser() {
        // given
        Long userId = 1L;
        User user = createUser(userId, UserRole.ROLE_USER);
        user.spendPoints(50L); // spent 50 points previously

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        // Mock point calculation: 140 XP total earned
        mockPointCalculation(userId, user, 140L);

        // when
        PointBalanceResponse points = shopService.getPointBalance(userId);

        // then
        assertThat(points.getTotalEarned()).isEqualTo(140L);
        assertThat(points.getTotalSpent()).isEqualTo(50L);
        assertThat(points.getAvailable()).isEqualTo(90L); // 140 - 50
    }
}
