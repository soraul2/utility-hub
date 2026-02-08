package com.wootae.backend.domain.lotto.dto;

import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.entity.LottoSimulationStats;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LottoRuleDetailResponse {

      private Long ruleId;
      private String name;
      private String type;
      private Double attack;
      private Double stability;
      private Double volatility;
      private Double popularity;
      private Double recentForm;
      private String badge;
      private String description;
      private RuleStats stats;

      @Getter
      @Builder
      @NoArgsConstructor
      @AllArgsConstructor
      public static class RuleStats {
            private Map<String, Long> wins;
            private List<Integer> recent5Weeks;
      }

      public static LottoRuleDetailResponse from(LottoRule rule, LottoSimulationStats simStats) {
            RuleStats stats = null;
            if (simStats != null) {
                  stats = RuleStats.builder()
                              .wins(Map.of()) // populated from rankDistribution
                              .recent5Weeks(List.of())
                              .build();
            }

            return LottoRuleDetailResponse.builder()
                        .ruleId(rule.getId())
                        .name(rule.getName())
                        .type(rule.getType())
                        .attack(rule.getAttack())
                        .stability(rule.getStability())
                        .volatility(rule.getVolatility())
                        .popularity(rule.getPopularity())
                        .recentForm(rule.getRecentForm())
                        .badge(rule.getBadge())
                        .description(rule.getDescription())
                        .stats(stats)
                        .build();
      }
}
