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
@Table(name = "routine_tasks")
@EntityListeners(AuditingEntityListener.class)
public class Task {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "daily_plan_id", nullable = false)
      private DailyPlan dailyPlan;

      @Column(nullable = false)
      private String title;

      @Column(nullable = false)
      @Builder.Default
      private boolean completed = false;

      @Column(name = "task_order")
      private Integer taskOrder;

      @Column(length = 50)
      private String category;

      @Column(name = "start_time")
      private java.time.LocalTime startTime;

      @Column(name = "end_time")
      private java.time.LocalTime endTime;

      @Column(name = "duration_minutes")
      private Integer durationMinutes;

      @Column(columnDefinition = "TEXT")
      private String description;

      @Column(length = 20)
      private String priority;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public void update(String title, boolean completed, String category, java.time.LocalTime startTime,
                  java.time.LocalTime endTime, Integer durationMinutes, String description, String priority) {
            this.title = title;
            this.completed = completed;
            this.category = category;
            this.startTime = startTime;
            this.endTime = endTime;
            this.durationMinutes = durationMinutes;
            this.description = description;
            this.priority = priority;
      }

      public void toggleComplete() {
            this.completed = !this.completed;
      }
}
