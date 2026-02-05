package com.wootae.backend.domain.routine.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class DailyPlanCreateRequest {
      private LocalDate planDate;
}
