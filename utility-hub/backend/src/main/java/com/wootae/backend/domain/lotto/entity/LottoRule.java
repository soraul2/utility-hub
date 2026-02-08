package com.wootae.backend.domain.lotto.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@SuperBuilder
@EntityListeners(AuditingEntityListener.class)
@Table(name = "lotto_rules")
public class LottoRule {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = false)
      private String name;

      @Column(nullable = false)
      private String type; // ATTACK, STABLE, BALANCE, LAB

      @Column(columnDefinition = "TEXT")
      private String description;

      @Column(columnDefinition = "TEXT")
      private String script;

      @Column(columnDefinition = "TEXT")
      private String parameters; // JSON format parameters

      @Builder.Default
      @Column(nullable = false)
      private Double attack = 0.0;

      @Builder.Default
      @Column(nullable = false)
      private Double stability = 0.0;

      @Builder.Default
      @Column(nullable = false)
      private Double volatility = 0.0;

      @Builder.Default
      @Column(nullable = false)
      private Double popularity = 0.0;

      @Builder.Default
      @Column(nullable = false)
      private Double recentForm = 0.0;

      @Builder.Default
      @Column(name = "rule_rank", nullable = false)
      private Integer rank = 0;

      private String badge;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public void update(String name, String type, String script, String parameters) {
            this.name = name;
            this.type = type;
            this.script = script;
            this.parameters = parameters;
      }

      public void updateMarketStats(Double attack, Double stability, Double volatility,
                  Double popularity, Double recentForm, Integer rank, String badge) {
            if (attack != null) this.attack = attack;
            if (stability != null) this.stability = stability;
            if (volatility != null) this.volatility = volatility;
            if (popularity != null) this.popularity = popularity;
            if (recentForm != null) this.recentForm = recentForm;
            if (rank != null) this.rank = rank;
            if (badge != null) this.badge = badge;
      }
}
