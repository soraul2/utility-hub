package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SpreadStrategy extends AbstractLottoStrategy {
      public String getType() { return "SPREAD"; }
      public String getName() { return "최대 분산"; }
      public String getDescription() { return "번호 간 최소 간격 4 이상"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            for (int i = 0; i < 1000; i++) {
                  List<Integer> ticket = generateRandom();
                  if (hasMinGap(ticket, 4)) return ticket;
            }
            for (int i = 0; i < 500; i++) {
                  List<Integer> ticket = generateRandom();
                  if (hasMinGap(ticket, 3)) return ticket;
            }
            return generateRandom();
      }
}
