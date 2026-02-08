package com.wootae.backend.domain.lotto.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class LottoGenerateResponse {
      private Long ruleId;
      private List<List<Integer>> tickets;
}
