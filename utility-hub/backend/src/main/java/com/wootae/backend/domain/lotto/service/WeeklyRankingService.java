package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.entity.SimulationResult;
import com.wootae.backend.domain.lotto.entity.WeeklyStrategyRanking;
import com.wootae.backend.domain.lotto.repository.SimulationResultRepository;
import com.wootae.backend.domain.lotto.repository.WeeklyStrategyRankingRepository;
import com.wootae.backend.domain.lotto.strategy.LottoStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeeklyRankingService {

      private final SimulationResultRepository simulationResultRepository;
      private final WeeklyStrategyRankingRepository weeklyRankingRepository;
      private final LottoGenerateService lottoGenerateService;

      // 점수 가중치
      private static final double RANK1_POINTS = 1000.0;
      private static final double RANK2_POINTS = 500.0;
      private static final double RANK3_POINTS = 100.0;
      private static final double RANK4_POINTS = 10.0;
      private static final double RANK5_POINTS = 1.0;

      // 4주 가중 평균 비율
      private static final double[] WEEKLY_WEIGHTS = {0.40, 0.30, 0.20, 0.10};

      /**
       * 특정 회차의 주간 랭킹을 계산하고 저장
       */
      @Transactional
      public List<WeeklyStrategyRanking> calculateAndSaveRankings(int drawNo) {
            // 이미 계산된 경우 기존 결과 반환
            if (weeklyRankingRepository.existsByDrawNo(drawNo)) {
                  log.info("{}회차 랭킹이 이미 존재합니다. 기존 결과를 반환합니다.", drawNo);
                  return weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(drawNo);
            }

            Map<String, LottoStrategy> strategies = lottoGenerateService.getStrategyMap();
            List<WeeklyStrategyRanking> rankings = new ArrayList<>();

            // 1. 각 전략의 주간 점수 계산
            for (String strategyType : strategies.keySet()) {
                  Optional<SimulationResult> resultOpt =
                              simulationResultRepository.findByStrategyTypeAndDrawNo(strategyType, drawNo);

                  if (resultOpt.isEmpty()) continue;

                  SimulationResult result = resultOpt.get();
                  double weeklyScore = calculateWeeklyScore(result);

                  // 2. 4주 가중 평균 계산
                  double weightedScore = calculateWeightedScore(strategyType, drawNo, weeklyScore);

                  // 3. 이전 순위 조회
                  Integer previousRank = findPreviousRank(strategyType, drawNo);

                  WeeklyStrategyRanking ranking = WeeklyStrategyRanking.builder()
                              .drawNo(drawNo)
                              .strategyType(strategyType)
                              .weeklyScore(weeklyScore)
                              .weightedScore(weightedScore)
                              .rankPosition(0) // 임시 - 아래에서 설정
                              .previousRank(previousRank)
                              .rankChange(0)
                              .rank1Count(result.getRank1Count())
                              .rank2Count(result.getRank2Count())
                              .rank3Count(result.getRank3Count())
                              .rank4Count(result.getRank4Count())
                              .rank5Count(result.getRank5Count())
                              .totalWins(result.getRank1Count() + result.getRank2Count()
                                          + result.getRank3Count() + result.getRank4Count()
                                          + result.getRank5Count())
                              .totalTickets(result.getTotalTickets())
                              .estimatedPrize(result.getEstimatedPrize())
                              .build();

                  rankings.add(ranking);
            }

            // 4. 가중 점수 기준으로 순위 매기기 (높을수록 좋음)
            rankings.sort(Comparator.comparingDouble(WeeklyStrategyRanking::getWeightedScore).reversed());

            for (int i = 0; i < rankings.size(); i++) {
                  int rank = i + 1;
                  WeeklyStrategyRanking r = rankings.get(i);
                  r.updateRank(rank, r.getPreviousRank());
            }

            // 5. 저장
            weeklyRankingRepository.saveAll(rankings);
            log.info("{}회차 주간 랭킹 계산 완료: {}개 전략", drawNo, rankings.size());

            return rankings;
      }

      /**
       * 시뮬레이션 결과에서 주간 점수 계산
       */
      public double calculateWeeklyScore(SimulationResult result) {
            return result.getRank1Count() * RANK1_POINTS
                        + result.getRank2Count() * RANK2_POINTS
                        + result.getRank3Count() * RANK3_POINTS
                        + result.getRank4Count() * RANK4_POINTS
                        + result.getRank5Count() * RANK5_POINTS;
      }

      /**
       * 4주 가중 평균 점수 계산 (40/30/20/10%)
       */
      private double calculateWeightedScore(String strategyType, int currentDrawNo, double currentWeekScore) {
            // 이전 3주의 점수 조회
            List<WeeklyStrategyRanking> recentRankings = weeklyRankingRepository
                        .findRecentRankings(strategyType, currentDrawNo - 1);

            double weightedSum = currentWeekScore * WEEKLY_WEIGHTS[0];
            double weightSum = WEEKLY_WEIGHTS[0];

            for (int i = 0; i < Math.min(recentRankings.size(), 3); i++) {
                  weightedSum += recentRankings.get(i).getWeeklyScore() * WEEKLY_WEIGHTS[i + 1];
                  weightSum += WEEKLY_WEIGHTS[i + 1];
            }

            // 데이터가 4주 미만이면 있는 만큼으로 정규화
            return weightSum > 0 ? weightedSum / weightSum * 1.0 : currentWeekScore;
      }

      /**
       * 이전 회차 순위 조회
       */
      private Integer findPreviousRank(String strategyType, int currentDrawNo) {
            return weeklyRankingRepository
                        .findRankByStrategyTypeAndDrawNo(strategyType, currentDrawNo - 1)
                        .orElse(null);
      }

      /**
       * 현재(최신) 주간 랭킹 조회
       */
      @Transactional(readOnly = true)
      public List<WeeklyStrategyRanking> getCurrentRankings() {
            Optional<Integer> latestDrawNo = weeklyRankingRepository.findLatestRankedDrawNo();
            if (latestDrawNo.isEmpty()) return List.of();
            return weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(latestDrawNo.get());
      }

      /**
       * 특정 회차의 Top N 랭킹 조회
       */
      @Transactional(readOnly = true)
      public List<WeeklyStrategyRanking> getTopRankings(int drawNo, int limit) {
            List<WeeklyStrategyRanking> all = weeklyRankingRepository
                        .findTopRankings(drawNo);
            return all.stream().limit(limit).collect(Collectors.toList());
      }

      /**
       * 특정 전략의 랭킹 히스토리
       */
      @Transactional(readOnly = true)
      public List<WeeklyStrategyRanking> getStrategyHistory(String strategyType) {
            return weeklyRankingRepository.findByStrategyTypeOrderByDrawNoDesc(strategyType);
      }

      /**
       * 특정 회차의 랭킹 조회
       */
      @Transactional(readOnly = true)
      public List<WeeklyStrategyRanking> getRankingsByDrawNo(int drawNo) {
            return weeklyRankingRepository.findByDrawNoOrderByRankPositionAsc(drawNo);
      }

      /**
       * 현재 Top 3 전략 타입 반환 (프리미엄 잠금용)
       */
      @Transactional(readOnly = true)
      public List<String> getTop3StrategyTypes() {
            List<WeeklyStrategyRanking> current = getCurrentRankings();
            return current.stream()
                        .limit(3)
                        .map(WeeklyStrategyRanking::getStrategyType)
                        .collect(Collectors.toList());
      }

      /**
       * 특정 전략이 현재 Top 3인지 확인
       */
      @Transactional(readOnly = true)
      public boolean isTop3Strategy(String strategyType) {
            return getTop3StrategyTypes().contains(strategyType.toUpperCase());
      }

      /**
       * 랭킹 요약 정보 (API 응답용)
       */
      @Transactional(readOnly = true)
      public Map<String, Object> getRankingSummary() {
            List<WeeklyStrategyRanking> rankings = getCurrentRankings();
            if (rankings.isEmpty()) return Map.of("status", "NO_DATA");

            int drawNo = rankings.get(0).getDrawNo();

            // 최대 상승/하락 전략
            WeeklyStrategyRanking biggestRise = rankings.stream()
                        .filter(r -> r.getPreviousRank() != null)
                        .max(Comparator.comparingInt(WeeklyStrategyRanking::getRankChange))
                        .orElse(null);

            WeeklyStrategyRanking biggestDrop = rankings.stream()
                        .filter(r -> r.getPreviousRank() != null)
                        .min(Comparator.comparingInt(WeeklyStrategyRanking::getRankChange))
                        .orElse(null);

            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("drawNo", drawNo);
            summary.put("totalStrategies", rankings.size());
            summary.put("top3", rankings.stream().limit(3).map(this::toRankingMap).collect(Collectors.toList()));

            if (biggestRise != null && biggestRise.getRankChange() > 0) {
                  summary.put("biggestRise", Map.of(
                              "strategyType", biggestRise.getStrategyType(),
                              "change", "+" + biggestRise.getRankChange()));
            }
            if (biggestDrop != null && biggestDrop.getRankChange() < 0) {
                  summary.put("biggestDrop", Map.of(
                              "strategyType", biggestDrop.getStrategyType(),
                              "change", biggestDrop.getRankChange()));
            }

            return summary;
      }

      private Map<String, Object> toRankingMap(WeeklyStrategyRanking r) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("rank", r.getRankPosition());
            map.put("strategyType", r.getStrategyType());
            map.put("weeklyScore", r.getWeeklyScore());
            map.put("weightedScore", String.format("%.1f", r.getWeightedScore()));
            map.put("rankChange", r.getRankChange());
            map.put("previousRank", r.getPreviousRank());
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
}
