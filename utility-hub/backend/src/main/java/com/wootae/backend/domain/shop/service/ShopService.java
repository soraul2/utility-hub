package com.wootae.backend.domain.shop.service;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import com.wootae.backend.domain.routine.entity.MonthlyLog;
import com.wootae.backend.domain.routine.repository.DailyPlanRepository;
import com.wootae.backend.domain.routine.repository.MonthlyLogRepository;
import com.wootae.backend.domain.routine.util.XpCalculator;
import com.wootae.backend.domain.shop.config.ThemeCatalog;
import com.wootae.backend.domain.shop.dto.ShopDTOs.*;
import com.wootae.backend.domain.shop.entity.ThemePurchase;
import com.wootae.backend.domain.shop.repository.ThemePurchaseRepository;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShopService {

      private final UserRepository userRepository;
      private final MonthlyLogRepository monthlyLogRepository;
      private final DailyPlanRepository dailyPlanRepository;
      private final ThemePurchaseRepository themePurchaseRepository;

      public ShopDataResponse getShopData(Long userId) {
            User user = getUser(userId);
            boolean isAdmin = user.getRole() == UserRole.ROLE_ADMIN;
            PointBalanceResponse points = buildPointBalance(user);

            Set<String> ownedKeys = themePurchaseRepository.findByUserId(userId).stream()
                        .map(ThemePurchase::getThemeKey)
                        .collect(Collectors.toSet());

            String activeKey = user.getActiveThemeKey();

            List<ThemeItemResponse> themes = ThemeCatalog.getAll().stream()
                        .map(def -> ThemeItemResponse.builder()
                                    .key(def.getKey())
                                    .name(def.getName())
                                    .description(def.getDescription())
                                    .price(def.getPrice())
                                    .category(def.getCategory())
                                    .previewColor(def.getPreviewColor())
                                    .owned(isAdmin || def.getPrice() == 0L || ownedKeys.contains(def.getKey()))
                                    .active(activeKey != null ? activeKey.equals(def.getKey())
                                                : "default".equals(def.getKey()))
                                    .build())
                        .collect(Collectors.toList());

            return ShopDataResponse.builder()
                        .points(points)
                        .themes(themes)
                        .build();
      }

      public PointBalanceResponse getPointBalance(Long userId) {
            User user = getUser(userId);
            return buildPointBalance(user);
      }

      @Transactional
      public PurchaseResponse purchaseTheme(Long userId, String themeKey) {
            if (!ThemeCatalog.exists(themeKey)) {
                  throw new BusinessException(ErrorCode.THEME_NOT_FOUND);
            }

            if (ThemeCatalog.isFree(themeKey)) {
                  throw new BusinessException(ErrorCode.THEME_ALREADY_OWNED);
            }

            if (themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)) {
                  throw new BusinessException(ErrorCode.THEME_ALREADY_OWNED);
            }

            User user = getUser(userId);
            boolean isAdmin = user.getRole() == UserRole.ROLE_ADMIN;
            Long price = ThemeCatalog.get(themeKey).getPrice();

            Long totalEarned = isAdmin ? Long.MAX_VALUE : calculateTotalEarnedPoints(userId);

            if (!isAdmin) {
                  Long available = totalEarned - user.getSpentPoints();

                  if (available < price) {
                        throw new BusinessException(ErrorCode.INSUFFICIENT_POINTS);
                  }

                  user.spendPoints(price);
            }

            ThemePurchase purchase = ThemePurchase.builder()
                        .user(user)
                        .themeKey(themeKey)
                        .build();
            themePurchaseRepository.save(purchase);

            log.info("테마 구매 완료: userId={}, themeKey={}, price={}, admin={}", userId, themeKey, price, isAdmin);

            Long remaining = isAdmin ? Long.MAX_VALUE : (totalEarned - user.getSpentPoints());
            return PurchaseResponse.builder()
                        .themeKey(themeKey)
                        .pointsSpent(isAdmin ? 0L : price)
                        .remainingPoints(remaining)
                        .build();
      }

      @Transactional
      public void setActiveTheme(Long userId, String themeKey) {
            User user = getUser(userId);

            if (themeKey == null || themeKey.isBlank() || "default".equals(themeKey)) {
                  user.setActiveThemeKey(null);
                  return;
            }

            if (!ThemeCatalog.exists(themeKey)) {
                  throw new BusinessException(ErrorCode.THEME_NOT_FOUND);
            }

            boolean isAdmin = user.getRole() == UserRole.ROLE_ADMIN;

            // Admin can equip any theme, others need purchase or free theme
            if (!isAdmin && !ThemeCatalog.isFree(themeKey)
                        && !themePurchaseRepository.existsByUserIdAndThemeKey(userId, themeKey)) {
                  throw new BusinessException(ErrorCode.THEME_NOT_OWNED);
            }

            user.setActiveThemeKey(themeKey);
      }

      private PointBalanceResponse buildPointBalance(User user) {
            boolean isAdmin = user.getRole() == UserRole.ROLE_ADMIN;

            if (isAdmin) {
                  return PointBalanceResponse.builder()
                              .totalEarned(999999L)
                              .totalSpent(0L)
                              .available(999999L)
                              .build();
            }

            Long totalEarned = calculateTotalEarnedPoints(user.getId());
            Long totalSpent = user.getSpentPoints();
            return PointBalanceResponse.builder()
                        .totalEarned(totalEarned)
                        .totalSpent(totalSpent)
                        .available(totalEarned - totalSpent)
                        .build();
      }

      private Long calculateTotalEarnedPoints(Long userId) {
            List<MonthlyLog> logs = monthlyLogRepository.findByUserId(userId);
            long total = 0;

            for (MonthlyLog log : logs) {
                  LocalDate start = LocalDate.of(log.getYear(), log.getMonth(), 1);
                  LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
                  List<DailyPlan> plans = dailyPlanRepository.findByUserIdAndPlanDateBetween(userId, start, end);
                  total += XpCalculator.calculate(plans, log.getMonthlyGoal());
            }

            return total;
      }

      private User getUser(Long userId) {
            return userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
      }
}
