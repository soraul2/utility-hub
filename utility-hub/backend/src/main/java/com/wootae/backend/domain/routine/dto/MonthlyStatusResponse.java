package com.wootae.backend.domain.routine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyStatusResponse {
      private Integer year;
      private Integer month;
      private String monthlyGoal;
      private Long totalXp;
      private Double monthlyCompletionRate;
      private List<DailySummary> days;

      @Getter
      @NoArgsConstructor
      @AllArgsConstructor
      @Builder
      public static class DailySummary {
            private LocalDate date;
            private Double completionRate; // 0.0 - 100.0
            private boolean isRest;
            private boolean hasPlan;
            private String memoSnippet; // First few chars of monthlyMemo
      }
}
