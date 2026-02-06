package com.wootae.backend.domain.routine.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
public class TemplateTaskRequest {
      private String title;
      private Integer taskOrder;
      private String category;
      private LocalTime startTime;
      private LocalTime endTime;
      private Integer durationMinutes;
      private String description;
      private String priority;
}
