package com.wootae.backend.domain.routine.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "routine_reflections")
@EntityListeners(AuditingEntityListener.class)
public class Reflection {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @OneToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "daily_plan_id", nullable = false, unique = true)
      private DailyPlan dailyPlan;

      @Column(nullable = false)
      private int rating;

      @Column(nullable = false)
      private String mood;

      @Column(columnDefinition = "TEXT")
      private String whatWentWell;

      @Column(columnDefinition = "TEXT")
      private String whatDidntGoWell;

      @Column(columnDefinition = "TEXT")
      private String tomorrowFocus;

      @Column(name = "energy_level")
      private Integer energyLevel;

      @Column(name = "morning_goal")
      private String morningGoal;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public void update(int rating, String mood, String whatWentWell, String whatDidntGoWell, String tomorrowFocus,
                  Integer energyLevel, String morningGoal) {
            this.rating = rating;
            this.mood = mood;
            this.whatWentWell = whatWentWell;
            this.whatDidntGoWell = whatDidntGoWell;
            this.tomorrowFocus = tomorrowFocus;
            this.energyLevel = energyLevel;
            this.morningGoal = morningGoal;
      }
}
