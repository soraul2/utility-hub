package com.wootae.backend.domain.routine.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "routine_time_blocks")
public class TimeBlock {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "daily_plan_id", nullable = false)
      private DailyPlan dailyPlan;

      @Column(nullable = false)
      private String period;

      @Column(nullable = false)
      private String label;

      @Column(nullable = false)
      private int startHour;

      @Column(nullable = false)
      private int endHour;

      @OneToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "assigned_task_id")
      private Task assignedTask;

      public void assignTask(Task task) {
            this.assignedTask = task;
      }
}
