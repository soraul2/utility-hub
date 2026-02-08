package com.wootae.backend.domain.lotto.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "simulation_results",
            uniqueConstraints = @UniqueConstraint(columnNames = {"strategy_type", "draw_no"}))
public class SimulationResult {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(name = "strategy_type", nullable = false, length = 30)
      private String strategyType;

      @Column(name = "draw_no", nullable = false)
      private Integer drawNo;

      @Column(nullable = false)
      private Integer totalTickets;

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
      private Integer noWinCount;

      @Column(nullable = false)
      private Long estimatedPrize;

      @Column(nullable = false, updatable = false)
      private LocalDateTime createdAt;

      @Builder
      public SimulationResult(String strategyType, Integer drawNo, Integer totalTickets,
                  Integer rank1Count, Integer rank2Count, Integer rank3Count,
                  Integer rank4Count, Integer rank5Count, Integer noWinCount, Long estimatedPrize) {
            this.strategyType = strategyType;
            this.drawNo = drawNo;
            this.totalTickets = totalTickets;
            this.rank1Count = rank1Count != null ? rank1Count : 0;
            this.rank2Count = rank2Count != null ? rank2Count : 0;
            this.rank3Count = rank3Count != null ? rank3Count : 0;
            this.rank4Count = rank4Count != null ? rank4Count : 0;
            this.rank5Count = rank5Count != null ? rank5Count : 0;
            this.noWinCount = noWinCount != null ? noWinCount : 0;
            this.estimatedPrize = estimatedPrize != null ? estimatedPrize : 0L;
            this.createdAt = LocalDateTime.now();
      }
}
