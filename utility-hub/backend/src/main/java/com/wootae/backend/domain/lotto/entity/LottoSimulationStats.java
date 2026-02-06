package com.wootae.backend.domain.lotto.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "lotto_simulation_stats")
public class LottoSimulationStats {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "rule_id")
      private LottoRule rule;

      private Long totalSimulations = 0L;
      private Long totalWins = 0L;
      private Double winRate = 0.0;

      // Store distribution of wins (e.g., "5th:10, 4th:2...") ideally in JSON or
      // separate table
      // For simplicity stringified JSON or CSV
      private String rankDistribution;

      public void updateStats(long wins, long simulations) {
            this.totalSimulations += simulations;
            this.totalWins += wins;
            if (this.totalSimulations > 0) {
                  this.winRate = (double) this.totalWins / this.totalSimulations * 100.0;
            }
      }
}
