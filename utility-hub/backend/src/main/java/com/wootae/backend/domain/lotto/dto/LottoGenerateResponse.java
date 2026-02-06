package com.wootae.backend.domain.lotto.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class LottoGenerateResponse {
      private Long ruleId;
      private int count;
      private List<List<Integer>> games;
}
