package com.wootae.backend.domain.lotto.dto;

import com.wootae.backend.domain.lotto.entity.LottoRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LottoRuleResponse {

      private Long id;
      private String name;
      private String type;
      private String description;
      private String script;
      private String parameters;
      private LocalDateTime createdAt;
      private LocalDateTime updatedAt;

      public static LottoRuleResponse from(LottoRule rule) {
            return LottoRuleResponse.builder()
                        .id(rule.getId())
                        .name(rule.getName())
                        .type(rule.getType())
                        .description(rule.getDescription())
                        .script(rule.getScript())
                        .parameters(rule.getParameters())
                        .createdAt(rule.getCreatedAt())
                        .updatedAt(rule.getUpdatedAt())
                        .build();
      }
}
