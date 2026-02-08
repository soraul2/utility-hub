package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Component
public class DoubleStrategy extends AbstractLottoStrategy {
      private static final int[] DOUBLES = {11, 22, 33, 44};

      public String getType() { return "DOUBLE"; }
      public String getName() { return "쌍수 포함"; }
      public String getDescription() { return "쌍수(11,22,33,44) 중 최소 1개 포함"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            selected.add(DOUBLES[random.nextInt(DOUBLES.length)]);
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
