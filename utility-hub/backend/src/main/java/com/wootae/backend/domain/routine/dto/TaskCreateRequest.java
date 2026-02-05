package com.wootae.backend.domain.routine.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TaskCreateRequest {
      private String title;
      private String category;
      private java.time.LocalTime startTime;
      private java.time.LocalTime endTime;
      private Integer durationMinutes;
      private String description;
      private String priority;
      private Boolean unassign;
}
