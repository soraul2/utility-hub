package com.wootae.backend.domain.routine.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "routine_template_tasks")
public class RoutineTemplateTask {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "template_id", nullable = false)
      private RoutineTemplate template;

      @Column(nullable = false)
      private String title;

      @Column(name = "task_order")
      private Integer taskOrder;

      @Column(length = 50)
      private String category;

      @Column(name = "start_time")
      private LocalTime startTime;

      @Column(name = "end_time")
      private LocalTime endTime;

      @Column(name = "duration_minutes")
      private Integer durationMinutes;

      @Column(columnDefinition = "TEXT")
      private String description;

      @Column(length = 20)
      private String priority;
}
