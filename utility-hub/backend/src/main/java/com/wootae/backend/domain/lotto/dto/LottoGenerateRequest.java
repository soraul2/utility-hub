package com.wootae.backend.domain.lotto.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LottoGenerateRequest {

      @Min(value = 1, message = "최소 1게임 이상 생성해야 합니다.")
      @Max(value = 100, message = "최대 100게임까지 생성할 수 있습니다.")
      private int count = 5;
}
