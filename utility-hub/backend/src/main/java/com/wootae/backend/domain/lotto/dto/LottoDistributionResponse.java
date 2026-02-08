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
public class LottoDistributionResponse {

      private Long ruleId;
      private Map<String, Long> distribution; // number -> frequency
}
