package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

@Component
public class AttackStrategy extends AbstractLottoStrategy {
      public String getType() { return "ATTACK"; }
      public String getName() { return "공격형"; }
      public String getDescription() { return "고번호(30~45) 최소 3개 보장"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            while (selected.size() < 3) {
                  selected.add(random.nextInt(16) + 30);
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
