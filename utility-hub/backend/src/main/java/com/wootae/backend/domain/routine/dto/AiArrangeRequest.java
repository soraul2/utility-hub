package com.wootae.backend.domain.routine.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AiArrangeRequest {
      private int startHour;
      private int endHour;
      private String taskText;
      private String mode;
}
