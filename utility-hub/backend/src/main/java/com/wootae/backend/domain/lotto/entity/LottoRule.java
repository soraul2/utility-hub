package com.wootae.backend.domain.lotto.entity;

import jakarta.persistence.*;
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
      private String type; // e.g., "FILTER", "WEIGHT", "AI", "PATTERN"

      @Column(columnDefinition = "TEXT")
      private String description;

      @Column(columnDefinition = "TEXT")
      private String script; // Logic script or detailed configuration

      @Column(columnDefinition = "TEXT")
      private String parameters; // JSON format parameters

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
}
