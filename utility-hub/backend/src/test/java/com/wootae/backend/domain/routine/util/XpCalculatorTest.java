package com.wootae.backend.domain.routine.util;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import com.wootae.backend.domain.routine.entity.Reflection;
import com.wootae.backend.domain.routine.entity.Task;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class XpCalculatorTest {

      @Test
      @DisplayName("빈 플랜 리스트일 경우 0 XP를 반환한다")
      void emptyPlanList_returnsZeroXp() {
            // given
            List<DailyPlan> plans = Collections.emptyList();

            // when
            long xp = XpCalculator.calculate(plans, null);

            // then
            assertThat(xp).isEqualTo(0);
      }

      @Test
      @DisplayName("휴식일 플랜은 5 XP를 부여한다")
      void restPlan_gives5Xp() {
            // given
            List<DailyPlan> plans = List.of(createRestPlan());

            // when
            long xp = XpCalculator.calculate(plans, null);

            // then
            assertThat(xp).isEqualTo(5);
      }

      @Test
      @DisplayName("비휴식 플랜에 태스크가 있으면 플랜 생성 보너스 5 XP를 부여한다")
      void planWithTasks_givesPlanCreationBonus() {
            // given
            DailyPlan plan = createPlanWithTasks(3, 0);
            List<DailyPlan> plans = List.of(plan);

            // when
            long xp = XpCalculator.calculate(plans, null);

            // then
            assertThat(xp).isEqualTo(5);
      }

      @Test
      @DisplayName("완료된 태스크당 10 XP를 부여한다 (3/5 완료 = 5 + 30 = 35)")
      void completedTasks_give10XpEach() {
            // given
            DailyPlan plan = createPlanWithTasks(5, 3);
            List<DailyPlan> plans = List.of(plan);

            // when
            long xp = XpCalculator.calculate(plans, null);

            // then
            assertThat(xp).isEqualTo(35);
      }

      @Test
      @DisplayName("100% 완료 시 50 XP 보너스를 부여한다 (5/5 = 5 + 50 + 50 = 105)")
      void allTasksCompleted_gives50Bonus() {
            // given
            DailyPlan plan = createPlanWithTasks(5, 5);
            List<DailyPlan> plans = List.of(plan);

            // when
            long xp = XpCalculator.calculate(plans, null);

            // then
            assertThat(xp).isEqualTo(105);
      }

      @Test
      @DisplayName("80~99% 완료 시 20 XP 보너스를 부여한다 (4/5 = 5 + 40 + 20 = 65)")
      void eightyPercentCompleted_gives20Bonus() {
            // given
            DailyPlan plan = createPlanWithTasks(5, 4);
            List<DailyPlan> plans = List.of(plan);

            // when
            long xp = XpCalculator.calculate(plans, null);

            // then
            assertThat(xp).isEqualTo(65);
      }

      @Test
      @DisplayName("리플렉션이 존재하면 20 XP를 부여한다")
      void reflectionExists_gives20Xp() {
            // given
            DailyPlan plan = createPlanWithReflection(0, 0);
            List<DailyPlan> plans = List.of(plan);

            // when
            long xp = XpCalculator.calculate(plans, null);

            // then
            assertThat(xp).isEqualTo(20);
      }

      @Test
      @DisplayName("월간 목표가 설정되면 10 XP를 부여한다")
      void monthlyGoalSet_gives10Xp() {
            // given
            List<DailyPlan> plans = Collections.emptyList();

            // when
            long xp = XpCalculator.calculate(plans, "이번 달 목표");

            // then
            assertThat(xp).isEqualTo(10);
      }

      @Test
      @DisplayName("복합 시나리오: 휴식일 + 100% 완료(리플렉션) + 80% 완료 + 33% 완료 + 월간 목표 = 220 XP")
      void complexScenario_calculatesCorrectTotalXp() {
            // given
            // Day 1: Rest plan -> 5
            DailyPlan day1 = createRestPlan();

            // Day 2: 5 tasks, 5 completed, with reflection -> 5 + 50 + 50 + 20 = 125
            DailyPlan day2 = createPlanWithReflection(5, 5);

            // Day 3: 5 tasks, 4 completed (80%), no reflection -> 5 + 40 + 20 = 65
            DailyPlan day3 = createPlanWithTasks(5, 4);

            // Day 4: 3 tasks, 1 completed (33%), no reflection -> 5 + 10 = 15
            DailyPlan day4 = createPlanWithTasks(3, 1);

            List<DailyPlan> plans = List.of(day1, day2, day3, day4);

            // when
            long xp = XpCalculator.calculate(plans, "월간 목표 달성하기");

            // then
            // 5 + 125 + 65 + 15 + 10 = 220
            assertThat(xp).isEqualTo(220);
      }

      // ===== Helper Methods =====

      private DailyPlan createRestPlan() {
            return DailyPlan.builder()
                        .planDate(LocalDate.now())
                        .isRest(true)
                        .build();
      }

      private DailyPlan createPlanWithTasks(int total, int completed) {
            DailyPlan plan = DailyPlan.builder()
                        .planDate(LocalDate.now())
                        .build();
            for (int i = 0; i < total; i++) {
                  plan.getKeyTasks().add(Task.builder()
                              .dailyPlan(plan)
                              .title("Task " + i)
                              .completed(i < completed)
                              .build());
            }
            return plan;
      }

      private DailyPlan createPlanWithReflection(int totalTasks, int completedTasks) {
            DailyPlan plan = createPlanWithTasks(totalTasks, completedTasks);
            plan.setReflection(Reflection.builder()
                        .dailyPlan(plan)
                        .rating(4)
                        .mood("GOOD")
                        .build());
            return plan;
      }
}
