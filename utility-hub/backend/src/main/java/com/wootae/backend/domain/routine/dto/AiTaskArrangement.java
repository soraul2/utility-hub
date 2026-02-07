package com.wootae.backend.domain.routine.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiTaskArrangement {
      private Long existingTaskId;
      private String title;
      private String category;
      private String priority;
      private Integer durationMinutes;
      private String startTime;
      private String endTime;
      private String reason;
}
