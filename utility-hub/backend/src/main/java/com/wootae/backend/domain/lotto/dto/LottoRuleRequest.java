package com.wootae.backend.domain.lotto.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LottoRuleRequest {
      private String name;
      private String type;
      private String description;
      private String script;
      private String parameters;
}
