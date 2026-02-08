package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.entity.SimulationResult;
import com.wootae.backend.domain.lotto.entity.WeeklyStrategyRanking;
import com.wootae.backend.domain.lotto.repository.SimulationResultRepository;
import com.wootae.backend.domain.lotto.repository.WeeklyStrategyRankingRepository;
import com.wootae.backend.domain.lotto.strategy.LottoStrategy;
import com.wootae.backend.domain.lotto.strategy.impl.AttackStrategy;
import com.wootae.backend.domain.lotto.strategy.impl.BalanceStrategy;
import com.wootae.backend.domain.lotto.strategy.impl.RandomStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WeeklyRankingServiceTest {

      @Mock
      private SimulationResultRepository simulationResultRepository;

      @Mock
      private WeeklyStrategyRankingRepository weeklyRankingRepository;

      @Mock
      private LottoGenerateService lottoGenerateService;

      @InjectMocks
      private WeeklyRankingService weeklyRankingService;

      private Map<String, LottoStrategy> strategyMap;

      @BeforeEach
      void setUp() {
            strategyMap = new LinkedHashMap<>();
            strategyMap.put("RANDOM", new RandomStrategy());
            strategyMap.put("ATTACK", new AttackStrategy());
            strategyMap.put("BALANCE", new BalanceStrategy());
      }

      @Test
      @DisplayName("주간 점수 계산 - 등수별 가중치 적용")
      void calculateWeeklyScore() {
            SimulationResult result = SimulationResult.builder()
                        .strategyType("RANDOM")
                        .drawNo(1210)
                        .totalTickets(100000)
                        .rank1Count(1)
                        .rank2Count(2)
                        .rank3Count(10)
                        .rank4Count(100)
                        .rank5Count(2000)
                        .noWinCount(97887)
                        .estimatedPrize(2500000000L)
                        .build();

            double score = weeklyRankingService.calculateWeeklyScore(result);

            // 1×1000 + 2×500 + 10×100 + 100×10 + 2000×1 = 1000+1000+1000+1000+2000 = 6000
            assertThat(score).isEqualTo(6000.0);
      }

      @Test
      @DisplayName("주간 점수 계산 - 당첨 없으면 0점")
      void calculateWeeklyScore_noWins() {
            SimulationResult result = SimulationResult.builder()
                        .strategyType("RANDOM")
                        .drawNo(1210)
                        .totalTickets(100000)
                        .rank1Count(0)
                        .rank2Count(0)
                        .rank3Count(0)
                        .rank4Count(0)
                        .rank5Count(0)
                        .noWinCount(100000)
                        .estimatedPrize(0L)
                        .build();

            double score = weeklyRankingService.calculateWeeklyScore(result);
            assertThat(score).isEqualTo(0.0);
      }

      @Test
      @DisplayName("주간 랭킹 계산 및 저장 - 정상 케이스")
      void calculateAndSaveRankings() {
            int drawNo = 1210;

            given(weeklyRankingRepository.existsByDrawNo(drawNo)).willReturn(false);
            given(lottoGenerateService.getStrategyMap()).willReturn(strategyMap);

            // 각 전략의 시뮬레이션 결과
            SimulationResult randomResult = createResult("RANDOM", drawNo, 0, 0, 5, 50, 1000);
            SimulationResult attackResult = createResult("ATTACK", drawNo, 1, 0, 3, 40, 800);
            SimulationResult balanceResult = createResult("BALANCE", drawNo, 0, 1, 8, 60, 1200);

            given(simulationResultRepository.findByStrategyTypeAndDrawNo("RANDOM", drawNo))
                        .willReturn(Optional.of(randomResult));
            given(simulationResultRepository.findByStrategyTypeAndDrawNo("ATTACK", drawNo))
                        .willReturn(Optional.of(attackResult));
            given(simulationResultRepository.findByStrategyTypeAndDrawNo("BALANCE", drawNo))
                        .willReturn(Optional.of(balanceResult));

            // 이전 랭킹 없음 (첫 주)
            given(weeklyRankingRepository.findRecentRankings(anyString(), anyInt()))
                        .willReturn(List.of());
            given(weeklyRankingRepository.findRankByStrategyTypeAndDrawNo(anyString(), anyInt()))
                        .willReturn(Optional.empty());

            given(weeklyRankingRepository.saveAll(anyList())).willAnswer(inv -> inv.getArgument(0));

            List<WeeklyStrategyRanking> rankings = weeklyRankingService.calculateAndSaveRankings(drawNo);

            assertThat(rankings).hasSize(3);
            // 1위: 가장 높은 점수
            assertThat(rankings.get(0).getRankPosition()).isEqualTo(1);
            // 순위가 제대로 매겨졌는지
            assertThat(rankings.get(1).getRankPosition()).isEqualTo(2);
            assertThat(rankings.get(2).getRankPosition()).isEqualTo(3);

            verify(weeklyRankingRepository).saveAll(anyList());
      }

      @Test
      @DisplayName("이미 계산된 회차는 기존 결과 반환")
      void calculateAndSaveRankings_alreadyExists() {
            int drawNo = 1210;
            List<WeeklyStrategyRanking> existing = List.of(
                        createRanking("ATTACK", drawNo, 1),
                        createRanking("BALANCE", drawNo, 2),
                        createRanking("RANDOM", drawNo, 3));

            given(weeklyRankingRepository.existsByDrawNo(drawNo)).willReturn(true);
            given(weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(drawNo)).willReturn(existing);

            List<WeeklyStrategyRanking> result = weeklyRankingService.calculateAndSaveRankings(drawNo);

            assertThat(result).hasSize(3);
            verify(weeklyRankingRepository, never()).saveAll(anyList());
      }

      @Test
      @DisplayName("현재 랭킹 조회")
      void getCurrentRankings() {
            int latestDrawNo = 1210;
            List<WeeklyStrategyRanking> rankings = List.of(
                        createRanking("ATTACK", latestDrawNo, 1),
                        createRanking("BALANCE", latestDrawNo, 2),
                        createRanking("RANDOM", latestDrawNo, 3));

            given(weeklyRankingRepository.findLatestRankedDrawNo()).willReturn(Optional.of(latestDrawNo));
            given(weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(latestDrawNo)).willReturn(rankings);

            List<WeeklyStrategyRanking> result = weeklyRankingService.getCurrentRankings();

            assertThat(result).hasSize(3);
            assertThat(result.get(0).getStrategyType()).isEqualTo("ATTACK");
      }

      @Test
      @DisplayName("현재 랭킹 없으면 빈 리스트")
      void getCurrentRankings_noData() {
            given(weeklyRankingRepository.findLatestRankedDrawNo()).willReturn(Optional.empty());

            List<WeeklyStrategyRanking> result = weeklyRankingService.getCurrentRankings();

            assertThat(result).isEmpty();
      }

      @Test
      @DisplayName("Top 3 전략 타입 조회")
      void getTop3StrategyTypes() {
            int latestDrawNo = 1210;
            List<WeeklyStrategyRanking> rankings = List.of(
                        createRanking("ATTACK", latestDrawNo, 1),
                        createRanking("BALANCE", latestDrawNo, 2),
                        createRanking("RANDOM", latestDrawNo, 3),
                        createRanking("HOT", latestDrawNo, 4));

            given(weeklyRankingRepository.findLatestRankedDrawNo()).willReturn(Optional.of(latestDrawNo));
            given(weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(latestDrawNo)).willReturn(rankings);

            List<String> top3 = weeklyRankingService.getTop3StrategyTypes();

            assertThat(top3).hasSize(3);
            assertThat(top3).containsExactly("ATTACK", "BALANCE", "RANDOM");
      }

      @Test
      @DisplayName("Top 3 전략 여부 확인")
      void isTop3Strategy() {
            int latestDrawNo = 1210;
            List<WeeklyStrategyRanking> rankings = List.of(
                        createRanking("ATTACK", latestDrawNo, 1),
                        createRanking("BALANCE", latestDrawNo, 2),
                        createRanking("RANDOM", latestDrawNo, 3),
                        createRanking("HOT", latestDrawNo, 4));

            given(weeklyRankingRepository.findLatestRankedDrawNo()).willReturn(Optional.of(latestDrawNo));
            given(weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(latestDrawNo)).willReturn(rankings);

            assertThat(weeklyRankingService.isTop3Strategy("ATTACK")).isTrue();
            assertThat(weeklyRankingService.isTop3Strategy("HOT")).isFalse();
      }

      @Test
      @DisplayName("전략 히스토리 조회")
      void getStrategyHistory() {
            List<WeeklyStrategyRanking> history = List.of(
                        createRanking("ATTACK", 1210, 1),
                        createRanking("ATTACK", 1209, 3),
                        createRanking("ATTACK", 1208, 2));

            given(weeklyRankingRepository.findByStrategyTypeOrderByDrawNoDesc("ATTACK")).willReturn(history);

            List<WeeklyStrategyRanking> result = weeklyRankingService.getStrategyHistory("ATTACK");

            assertThat(result).hasSize(3);
            assertThat(result.get(0).getDrawNo()).isEqualTo(1210);
      }

      @Test
      @DisplayName("랭킹 요약 정보 조회")
      void getRankingSummary() {
            int latestDrawNo = 1210;
            WeeklyStrategyRanking r1 = createRankingWithChange("ATTACK", latestDrawNo, 1, 3, 2);
            WeeklyStrategyRanking r2 = createRankingWithChange("BALANCE", latestDrawNo, 2, 1, -1);
            WeeklyStrategyRanking r3 = createRankingWithChange("RANDOM", latestDrawNo, 3, 2, -1);

            given(weeklyRankingRepository.findLatestRankedDrawNo()).willReturn(Optional.of(latestDrawNo));
            given(weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(latestDrawNo))
                        .willReturn(List.of(r1, r2, r3));

            Map<String, Object> summary = weeklyRankingService.getRankingSummary();

            assertThat(summary).containsKey("drawNo");
            assertThat(summary).containsKey("top3");
            assertThat(summary).containsKey("biggestRise");
            assertThat(summary.get("drawNo")).isEqualTo(latestDrawNo);
      }

      @Test
      @DisplayName("랭킹 요약 - 데이터 없으면 NO_DATA")
      void getRankingSummary_noData() {
            given(weeklyRankingRepository.findLatestRankedDrawNo()).willReturn(Optional.empty());

            Map<String, Object> summary = weeklyRankingService.getRankingSummary();

            assertThat(summary).containsEntry("status", "NO_DATA");
      }

      // --- Helper methods ---

      private SimulationResult createResult(String type, int drawNo,
                  int r1, int r2, int r3, int r4, int r5) {
            return SimulationResult.builder()
                        .strategyType(type)
                        .drawNo(drawNo)
                        .totalTickets(100000)
                        .rank1Count(r1)
                        .rank2Count(r2)
                        .rank3Count(r3)
                        .rank4Count(r4)
                        .rank5Count(r5)
                        .noWinCount(100000 - r1 - r2 - r3 - r4 - r5)
                        .estimatedPrize(0L)
                        .build();
      }

      private WeeklyStrategyRanking createRanking(String type, int drawNo, int rank) {
            return WeeklyStrategyRanking.builder()
                        .drawNo(drawNo)
                        .strategyType(type)
                        .weeklyScore(1000.0 / rank)
                        .weightedScore(1000.0 / rank)
                        .rankPosition(rank)
                        .previousRank(null)
                        .rankChange(0)
                        .rank1Count(0)
                        .rank2Count(0)
                        .rank3Count(0)
                        .rank4Count(0)
                        .rank5Count(0)
                        .totalWins(0)
                        .totalTickets(100000)
                        .estimatedPrize(0L)
                        .build();
      }

      private WeeklyStrategyRanking createRankingWithChange(String type, int drawNo,
                  int rank, int prevRank, int change) {
            WeeklyStrategyRanking ranking = createRanking(type, drawNo, rank);
            ranking.updateRank(rank, prevRank);
            return ranking;
      }
}
