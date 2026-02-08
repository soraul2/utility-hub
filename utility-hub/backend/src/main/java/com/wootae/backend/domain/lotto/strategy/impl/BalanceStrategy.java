package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Component
public class BalanceStrategy extends AbstractLottoStrategy {
      public String getType() { return "BALANCE"; }
      public String getName() { return "균형형"; }
      public String getDescription() { return "홀수 3개 + 짝수 3개 조합"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            while (selected.stream().filter(n -> n % 2 != 0).count() < 3) {
                  int num = random.nextInt(23) * 2 + 1;
                  if (num <= MAX_NUMBER) selected.add(num);
            }
            while (selected.size() < PICK_COUNT) {
                  int num = random.nextInt(22) * 2 + 2;
                  if (num <= MAX_NUMBER) selected.add(num);
            }
            return new ArrayList<>(selected);
      }
}
