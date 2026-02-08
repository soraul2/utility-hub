package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Component
public class StableStrategy extends AbstractLottoStrategy {
      public String getType() { return "STABLE"; }
      public String getName() { return "안정형"; }
      public String getDescription() { return "5개 구간에서 균등 분배"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            int[] ranges = {1, 10, 20, 30, 40};
            for (int start : ranges) {
                  if (selected.size() >= PICK_COUNT) break;
                  int end = Math.min(start + 9, MAX_NUMBER);
                  selected.add(random.nextInt(end - start + 1) + start);
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
