package com.wootae.backend.domain.routine.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ReflectionRequest {
      private Long planId;
      private int rating;
      private String mood;
      private String whatWentWell;
      private String whatDidntGoWell;
      private String tomorrowFocus;
      private Integer energyLevel;
      private String morningGoal;
}
