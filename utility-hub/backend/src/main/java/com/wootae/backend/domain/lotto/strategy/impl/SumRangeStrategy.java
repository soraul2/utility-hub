package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SumRangeStrategy extends AbstractLottoStrategy {
      public String getType() { return "SUM_RANGE"; }
      public String getName() { return "합계 최적화"; }
      public String getDescription() { return "6개 합계가 100~175 구간 (당첨 평균 합계)"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            for (int i = 0; i < 1000; i++) {
                  List<Integer> ticket = generateRandom();
                  int sum = ticket.stream().mapToInt(Integer::intValue).sum();
                  if (sum >= 100 && sum <= 175) return ticket;
            }
            return generateRandom();
      }
}
