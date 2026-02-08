package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.entity.WeeklyStrategyRanking;
import com.wootae.backend.domain.lotto.service.WeeklyRankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class WeeklyRankingController {

      private final WeeklyRankingService weeklyRankingService;

      /**
       * 현재(최신) 주간 랭킹 전체 조회
       * GET /api/rankings/current
       */
      @GetMapping("/current")
      public ResponseEntity<Map<String, Object>> getCurrentRankings() {
            List<WeeklyStrategyRanking> rankings = weeklyRankingService.getCurrentRankings();
            if (rankings.isEmpty()) {
                  return ResponseEntity.ok(Map.of("status", "NO_DATA", "message", "아직 랭킹 데이터가 없습니다."));
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("drawNo", rankings.get(0).getDrawNo());
            response.put("totalStrategies", rankings.size());
            response.put("rankings", rankings.stream().map(this::toDetailMap).collect(Collectors.toList()));
            return ResponseEntity.ok(response);
      }

      /**
       * 랭킹 요약 (Top 3 + 최대 상승/하락)
       * GET /api/rankings/summary
       */
      @GetMapping("/summary")
      public ResponseEntity<Map<String, Object>> getRankingSummary() {
            return ResponseEntity.ok(weeklyRankingService.getRankingSummary());
      }

      /**
       * 특정 회차의 랭킹 조회
       * GET /api/rankings/draw/{drawNo}
       */
      @GetMapping("/draw/{drawNo}")
      public ResponseEntity<Map<String, Object>> getRankingsByDraw(@PathVariable int drawNo) {
            List<WeeklyStrategyRanking> rankings = weeklyRankingService.getRankingsByDrawNo(drawNo);
            if (rankings.isEmpty()) {
                  return ResponseEntity.ok(Map.of("status", "NO_DATA",
                              "message", drawNo + "회차 랭킹 데이터가 없습니다."));
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("drawNo", drawNo);
            response.put("totalStrategies", rankings.size());
            response.put("rankings", rankings.stream().map(this::toDetailMap).collect(Collectors.toList()));
            return ResponseEntity.ok(response);
      }

      /**
       * 특정 전략의 랭킹 히스토리
       * GET /api/rankings/strategy/{strategyType}
       */
      @GetMapping("/strategy/{strategyType}")
      public ResponseEntity<Map<String, Object>> getStrategyHistory(@PathVariable String strategyType) {
            List<WeeklyStrategyRanking> history = weeklyRankingService
                        .getStrategyHistory(strategyType.toUpperCase());
            if (history.isEmpty()) {
                  return ResponseEntity.ok(Map.of("status", "NO_DATA",
                              "strategyType", strategyType.toUpperCase(),
                              "message", "해당 전략의 랭킹 히스토리가 없습니다."));
            }

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("strategyType", strategyType.toUpperCase());
            response.put("totalWeeks", history.size());
            response.put("currentRank", history.get(0).getRankPosition());
            response.put("bestRank", history.stream().mapToInt(WeeklyStrategyRanking::getRankPosition).min().orElse(0));
            response.put("worstRank", history.stream().mapToInt(WeeklyStrategyRanking::getRankPosition).max().orElse(0));
            response.put("avgScore", String.format("%.1f",
                        history.stream().mapToDouble(WeeklyStrategyRanking::getWeeklyScore).average().orElse(0)));
            response.put("history", history.stream().map(this::toHistoryMap).collect(Collectors.toList()));
            return ResponseEntity.ok(response);
      }

      /**
       * 현재 Top 3 전략 (프리미엄 표시용)
       * GET /api/rankings/top3
       */
      @GetMapping("/top3")
      public ResponseEntity<Map<String, Object>> getTop3() {
            List<WeeklyStrategyRanking> rankings = weeklyRankingService.getCurrentRankings();
            if (rankings.isEmpty()) {
                  return ResponseEntity.ok(Map.of("status", "NO_DATA"));
            }

            List<Map<String, Object>> top3 = rankings.stream()
                        .limit(3)
                        .map(this::toDetailMap)
                        .collect(Collectors.toList());

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("drawNo", rankings.get(0).getDrawNo());
            response.put("top3", top3);
            return ResponseEntity.ok(response);
      }

      /**
       * 특정 전략이 Top 3인지 확인
       * GET /api/rankings/check-premium/{strategyType}
       */
      @GetMapping("/check-premium/{strategyType}")
      public ResponseEntity<Map<String, Object>> checkPremium(@PathVariable String strategyType) {
            boolean isPremium = weeklyRankingService.isTop3Strategy(strategyType);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("strategyType", strategyType.toUpperCase());
            response.put("isPremium", isPremium);
            response.put("message", isPremium ? "이 전략은 이번 주 Top 3입니다." : "이 전략은 무료로 이용 가능합니다.");
            return ResponseEntity.ok(response);
      }

      /**
       * 수동으로 특정 회차 랭킹 계산 트리거
       * POST /api/rankings/calculate/{drawNo}
       */
      @PostMapping("/calculate/{drawNo}")
      public ResponseEntity<Map<String, Object>> calculateRankings(@PathVariable int drawNo) {
            List<WeeklyStrategyRanking> rankings = weeklyRankingService.calculateAndSaveRankings(drawNo);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "COMPLETED");
            response.put("drawNo", drawNo);
            response.put("totalStrategies", rankings.size());
            response.put("top3", rankings.stream().limit(3).map(r -> Map.of(
                        "rank", r.getRankPosition(),
                        "strategyType", r.getStrategyType(),
                        "weightedScore", String.format("%.1f", r.getWeightedScore())
            )).collect(Collectors.toList()));
            return ResponseEntity.ok(response);
      }

      private Map<String, Object> toDetailMap(WeeklyStrategyRanking r) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("rank", r.getRankPosition());
            map.put("strategyType", r.getStrategyType());
            map.put("weeklyScore", r.getWeeklyScore());
            map.put("weightedScore", String.format("%.1f", r.getWeightedScore()));
            map.put("rankChange", r.getRankChange());
            map.put("previousRank", r.getPreviousRank());
            map.put("isPremium", r.getRankPosition() <= 3);
            map.put("rank1Count", r.getRank1Count());
            map.put("rank2Count", r.getRank2Count());
            map.put("rank3Count", r.getRank3Count());
            map.put("rank4Count", r.getRank4Count());
            map.put("rank5Count", r.getRank5Count());
            map.put("totalWins", r.getTotalWins());
            map.put("totalTickets", r.getTotalTickets());
            map.put("estimatedPrize", r.getEstimatedPrize());
            return map;
      }

      private Map<String, Object> toHistoryMap(WeeklyStrategyRanking r) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("drawNo", r.getDrawNo());
            map.put("rank", r.getRankPosition());
            map.put("weeklyScore", r.getWeeklyScore());
            map.put("weightedScore", String.format("%.1f", r.getWeightedScore()));
            map.put("rankChange", r.getRankChange());
            map.put("totalWins", r.getTotalWins());
            return map;
      }
}
