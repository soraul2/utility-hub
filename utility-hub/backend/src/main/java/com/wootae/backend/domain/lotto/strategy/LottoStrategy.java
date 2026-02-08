package com.wootae.backend.domain.lotto.strategy;

import java.util.List;

public interface LottoStrategy {

      String getType();

      String getName();

      String getDescription();

      String getCategory();

      List<Integer> generate(LottoStrategyContext context);
}
