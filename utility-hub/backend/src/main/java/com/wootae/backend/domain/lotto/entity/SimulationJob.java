package com.wootae.backend.domain.lotto.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "simulation_jobs")
public class SimulationJob {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = false, length = 20)
      private String status; // RUNNING, COMPLETED, FAILED, PAUSED

      @Column(nullable = false)
      private Integer totalTasks;

      @Column(nullable = false)
      private Integer completedTasks;

      @Column(length = 30)
      private String currentStrategy;

      private Integer currentDrawNo;

      private LocalDateTime startedAt;

      private LocalDateTime completedAt;

      @Column(columnDefinition = "TEXT")
      private String errorMessage;

      public static SimulationJob create(int totalTasks) {
            SimulationJob job = new SimulationJob();
            job.status = "RUNNING";
            job.totalTasks = totalTasks;
            job.completedTasks = 0;
            job.startedAt = LocalDateTime.now();
            return job;
      }

      public void updateProgress(String strategyType, int drawNo, int completedTasks) {
            this.currentStrategy = strategyType;
            this.currentDrawNo = drawNo;
            this.completedTasks = completedTasks;
      }

      public void complete() {
            this.status = "COMPLETED";
            this.completedAt = LocalDateTime.now();
      }

      public void fail(String errorMessage) {
            this.status = "FAILED";
            this.errorMessage = errorMessage;
            this.completedAt = LocalDateTime.now();
      }

      public void pause() {
            this.status = "PAUSED";
      }

      public double getProgressPercent() {
            if (totalTasks == 0) return 0;
            return (double) completedTasks / totalTasks * 100;
      }
}
