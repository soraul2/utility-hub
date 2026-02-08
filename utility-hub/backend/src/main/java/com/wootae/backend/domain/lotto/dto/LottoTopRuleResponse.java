package com.wootae.backend.domain.lotto.dto;

import com.wootae.backend.domain.lotto.entity.LottoRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LottoTopRuleResponse {

      private Long ruleId;
      private String name;
      private Integer rank;
      private String badge;
      private Double attack;
      private Double stability;
      private Double volatility;
      private Double popularity;

      public static LottoTopRuleResponse from(LottoRule rule) {
            return LottoTopRuleResponse.builder()
                        .ruleId(rule.getId())
                        .name(rule.getName())
                        .rank(rule.getRank())
                        .badge(rule.getBadge())
                        .attack(rule.getAttack())
                        .stability(rule.getStability())
                        .volatility(rule.getVolatility())
                        .popularity(rule.getPopularity())
                        .build();
      }
}
