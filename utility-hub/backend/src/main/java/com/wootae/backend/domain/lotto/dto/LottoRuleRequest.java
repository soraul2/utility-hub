package com.wootae.backend.domain.lotto.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LottoRuleRequest {

      @NotBlank(message = "규칙 이름은 필수입니다.")
      private String name;

      @NotBlank(message = "규칙 유형은 필수입니다.")
      private String type;

      private String description;
      private String script;
      private String parameters;
}
