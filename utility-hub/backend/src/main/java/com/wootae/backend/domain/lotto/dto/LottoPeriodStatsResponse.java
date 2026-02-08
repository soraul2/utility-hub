package com.wootae.backend.domain.lotto.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LottoPeriodStatsResponse {

      private Long ruleId;
      private String period; // RECENT_4_WEEKS, RECENT_8_WEEKS, ALL_TIME
      private Map<String, Long> stats; // "1st" -> count, "2nd" -> count, etc.
}
