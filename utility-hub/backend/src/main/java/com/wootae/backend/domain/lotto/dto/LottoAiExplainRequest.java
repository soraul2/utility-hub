package com.wootae.backend.domain.lotto.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LottoAiExplainRequest {

      @NotNull(message = "규칙 ID는 필수입니다.")
      @Min(value = 1, message = "유효한 규칙 ID를 입력해주세요.")
      private Long ruleId;
}
