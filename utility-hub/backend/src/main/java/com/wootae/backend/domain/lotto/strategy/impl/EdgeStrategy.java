package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class EdgeStrategy extends AbstractLottoStrategy {
      public String getType() { return "EDGE"; }
      public String getName() { return "끝수 다양화"; }
      public String getDescription() { return "끝자리(0~9)가 최대한 겹치지 않도록"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            for (int i = 0; i < 1000; i++) {
                  List<Integer> ticket = generateRandom();
                  Set<Integer> lastDigits = ticket.stream().map(n -> n % 10).collect(Collectors.toSet());
                  if (lastDigits.size() >= 5) return ticket;
            }
            return generateRandom();
      }
}
