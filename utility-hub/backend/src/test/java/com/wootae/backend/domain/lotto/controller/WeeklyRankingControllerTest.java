package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.entity.WeeklyStrategyRanking;
import com.wootae.backend.domain.lotto.service.WeeklyRankingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class WeeklyRankingControllerTest {

      @Mock
      private WeeklyRankingService weeklyRankingService;

      @InjectMocks
      private WeeklyRankingController weeklyRankingController;

      private MockMvc mockMvc;

      @BeforeEach
      void setUp() {
            mockMvc = MockMvcBuilders.standaloneSetup(weeklyRankingController).build();
      }

      @Test
      @DisplayName("현재 랭킹 조회 - 데이터 있음")
      void getCurrentRankings() throws Exception {
            List<WeeklyStrategyRanking> rankings = List.of(
                        createRanking("ATTACK", 1210, 1),
                        createRanking("BALANCE", 1210, 2),
                        createRanking("RANDOM", 1210, 3));

            given(weeklyRankingService.getCurrentRankings()).willReturn(rankings);

            mockMvc.perform(get("/api/rankings/current"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.drawNo").value(1210))
                        .andExpect(jsonPath("$.totalStrategies").value(3))
                        .andExpect(jsonPath("$.rankings[0].rank").value(1))
                        .andExpect(jsonPath("$.rankings[0].strategyType").value("ATTACK"));
      }

      @Test
      @DisplayName("현재 랭킹 조회 - 데이터 없음")
      void getCurrentRankings_noData() throws Exception {
            given(weeklyRankingService.getCurrentRankings()).willReturn(List.of());

            mockMvc.perform(get("/api/rankings/current"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.status").value("NO_DATA"));
      }

      @Test
      @DisplayName("랭킹 요약 조회")
      void getRankingSummary() throws Exception {
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("drawNo", 1210);
            summary.put("totalStrategies", 22);
            summary.put("top3", List.of());

            given(weeklyRankingService.getRankingSummary()).willReturn(summary);

            mockMvc.perform(get("/api/rankings/summary"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.drawNo").value(1210))
                        .andExpect(jsonPath("$.totalStrategies").value(22));
      }

      @Test
      @DisplayName("특정 회차 랭킹 조회")
      void getRankingsByDraw() throws Exception {
            List<WeeklyStrategyRanking> rankings = List.of(
                        createRanking("ATTACK", 1209, 1));

            given(weeklyRankingService.getRankingsByDrawNo(1209)).willReturn(rankings);

            mockMvc.perform(get("/api/rankings/draw/1209"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.drawNo").value(1209))
                        .andExpect(jsonPath("$.rankings[0].strategyType").value("ATTACK"));
      }

      @Test
      @DisplayName("전략 히스토리 조회")
      void getStrategyHistory() throws Exception {
            List<WeeklyStrategyRanking> history = List.of(
                        createRanking("ATTACK", 1210, 1),
                        createRanking("ATTACK", 1209, 3));

            given(weeklyRankingService.getStrategyHistory("ATTACK")).willReturn(history);

            mockMvc.perform(get("/api/rankings/strategy/ATTACK"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.strategyType").value("ATTACK"))
                        .andExpect(jsonPath("$.totalWeeks").value(2))
                        .andExpect(jsonPath("$.currentRank").value(1))
                        .andExpect(jsonPath("$.bestRank").value(1))
                        .andExpect(jsonPath("$.worstRank").value(3));
      }

      @Test
      @DisplayName("Top 3 조회")
      void getTop3() throws Exception {
            List<WeeklyStrategyRanking> rankings = List.of(
                        createRanking("ATTACK", 1210, 1),
                        createRanking("BALANCE", 1210, 2),
                        createRanking("RANDOM", 1210, 3),
                        createRanking("HOT", 1210, 4));

            given(weeklyRankingService.getCurrentRankings()).willReturn(rankings);

            mockMvc.perform(get("/api/rankings/top3"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.drawNo").value(1210))
                        .andExpect(jsonPath("$.top3.length()").value(3));
      }

      @Test
      @DisplayName("프리미엄 전략 여부 확인 - Top 3")
      void checkPremium_isTop3() throws Exception {
            given(weeklyRankingService.isTop3Strategy("ATTACK")).willReturn(true);

            mockMvc.perform(get("/api/rankings/check-premium/ATTACK"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.isPremium").value(true));
      }

      @Test
      @DisplayName("프리미엄 전략 여부 확인 - 무료")
      void checkPremium_isFree() throws Exception {
            given(weeklyRankingService.isTop3Strategy("RANDOM")).willReturn(false);

            mockMvc.perform(get("/api/rankings/check-premium/RANDOM"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.isPremium").value(false));
      }

      @Test
      @DisplayName("수동 랭킹 계산")
      void calculateRankings() throws Exception {
            List<WeeklyStrategyRanking> rankings = List.of(
                        createRanking("ATTACK", 1210, 1),
                        createRanking("BALANCE", 1210, 2));

            given(weeklyRankingService.calculateAndSaveRankings(1210)).willReturn(rankings);

            mockMvc.perform(post("/api/rankings/calculate/1210"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.status").value("COMPLETED"))
                        .andExpect(jsonPath("$.drawNo").value(1210))
                        .andExpect(jsonPath("$.totalStrategies").value(2));
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
}
