package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Component
public class DecadeStrategy extends AbstractLottoStrategy {
      public String getType() { return "DECADE"; }
      public String getName() { return "10단위 균등"; }
      public String getDescription() { return "각 10단위 구간에서 최소 1개씩 선택"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            int[][] decades = {{1, 10}, {11, 20}, {21, 30}, {31, 40}, {41, 45}};
            for (int[] decade : decades) {
                  if (selected.size() >= PICK_COUNT) break;
                  selected.add(random.nextInt(decade[1] - decade[0] + 1) + decade[0]);
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
