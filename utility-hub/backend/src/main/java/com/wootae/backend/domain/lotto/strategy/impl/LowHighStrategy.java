package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Component
public class LowHighStrategy extends AbstractLottoStrategy {
      public String getType() { return "LOW_HIGH"; }
      public String getName() { return "저고 균형"; }
      public String getDescription() { return "저번호(1~22) 3개 + 고번호(23~45) 3개"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            while (selected.stream().filter(n -> n <= 22).count() < 3) {
                  selected.add(random.nextInt(22) + 1);
            }
            while (selected.size() < PICK_COUNT) {
                  selected.add(random.nextInt(23) + 23);
            }
            return new ArrayList<>(selected);
      }
}
