package com.wootae.backend.domain.routine.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class WeeklyStatsResponse {
      private double weeklyRate;
      private Map<String, Double> dailyCompletion;
}
