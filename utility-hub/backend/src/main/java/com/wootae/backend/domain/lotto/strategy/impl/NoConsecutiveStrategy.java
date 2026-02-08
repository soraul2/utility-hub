package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class NoConsecutiveStrategy extends AbstractLottoStrategy {
      public String getType() { return "NO_CONSECUTIVE"; }
      public String getName() { return "연번 제외"; }
      public String getDescription() { return "연속 번호가 하나도 없는 조합"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            for (int i = 0; i < 1000; i++) {
                  List<Integer> ticket = generateRandom();
                  if (!hasConsecutive(ticket)) return ticket;
            }
            return generateRandom();
      }
}
