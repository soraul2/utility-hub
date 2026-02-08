package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Component
public class ConsecutiveStrategy extends AbstractLottoStrategy {
      public String getType() { return "CONSECUTIVE"; }
      public String getName() { return "연번 포함"; }
      public String getDescription() { return "최소 1쌍의 연속 번호 포함"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            int start = random.nextInt(MAX_NUMBER - 1) + 1;
            selected.add(start);
            selected.add(start + 1);
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
