package com.wootae.backend.domain.routine.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AiArrangeResult {
      private String reasoning;
      @JsonIgnore
      private List<AiTaskArrangement> arrangements;
      private DailyPlanDto plan;

      public AiArrangeResult(String reasoning, List<AiTaskArrangement> arrangements) {
            this.reasoning = reasoning;
            this.arrangements = arrangements;
            this.plan = null;
      }
}
