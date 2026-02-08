package com.wootae.backend.domain.lotto.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "weekly_strategy_rankings",
            uniqueConstraints = @UniqueConstraint(columnNames = {"draw_no", "strategy_type"}))
public class WeeklyStrategyRanking {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(name = "draw_no", nullable = false)
      private Integer drawNo;

      @Column(name = "strategy_type", nullable = false, length = 30)
      private String strategyType;

      // 이번 회차 원점수 (1등×1000 + 2등×500 + 3등×100 + 4등×10 + 5등×1)
      @Column(nullable = false)
      private Double weeklyScore;

      // 최근 4주 가중 평균 점수 (40/30/20/10%)
      @Column(nullable = false)
      private Double weightedScore;

      // 현재 순위
      @Column(nullable = false)
      private Integer rankPosition;

      // 이전 순위 (null이면 신규 진입)
      private Integer previousRank;

      // 순위 변동 (양수 = 상승, 음수 = 하락)
      @Column(nullable = false)
      private Integer rankChange;

      // 이번 회차 시뮬레이션 결과 요약
      @Column(nullable = false)
      private Integer rank1Count;

      @Column(nullable = false)
      private Integer rank2Count;

      @Column(nullable = false)
      private Integer rank3Count;

      @Column(nullable = false)
      private Integer rank4Count;

      @Column(nullable = false)
      private Integer rank5Count;

      @Column(nullable = false)
      private Integer totalWins;

      @Column(nullable = false)
      private Integer totalTickets;

      @Column(nullable = false)
      private Long estimatedPrize;

      @Column(nullable = false, updatable = false)
      private LocalDateTime createdAt;

      @Builder
      public WeeklyStrategyRanking(Integer drawNo, String strategyType,
                  Double weeklyScore, Double weightedScore,
                  Integer rankPosition, Integer previousRank, Integer rankChange,
                  Integer rank1Count, Integer rank2Count, Integer rank3Count,
                  Integer rank4Count, Integer rank5Count,
                  Integer totalWins, Integer totalTickets, Long estimatedPrize) {
            this.drawNo = drawNo;
            this.strategyType = strategyType;
            this.weeklyScore = weeklyScore != null ? weeklyScore : 0.0;
            this.weightedScore = weightedScore != null ? weightedScore : 0.0;
            this.rankPosition = rankPosition != null ? rankPosition : 0;
            this.previousRank = previousRank;
            this.rankChange = rankChange != null ? rankChange : 0;
            this.rank1Count = rank1Count != null ? rank1Count : 0;
            this.rank2Count = rank2Count != null ? rank2Count : 0;
            this.rank3Count = rank3Count != null ? rank3Count : 0;
            this.rank4Count = rank4Count != null ? rank4Count : 0;
            this.rank5Count = rank5Count != null ? rank5Count : 0;
            this.totalWins = totalWins != null ? totalWins : 0;
            this.totalTickets = totalTickets != null ? totalTickets : 0;
            this.estimatedPrize = estimatedPrize != null ? estimatedPrize : 0L;
            this.createdAt = LocalDateTime.now();
      }

      public void updateRank(int newRank, Integer prevRank) {
            this.rankPosition = newRank;
            this.previousRank = prevRank;
            this.rankChange = prevRank != null ? prevRank - newRank : 0;
      }

      public void updateWeightedScore(double weighted) {
            this.weightedScore = weighted;
      }
}
