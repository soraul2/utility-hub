package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class LuckyStrategy extends AbstractLottoStrategy {
      private static final int[] LUCKY = {3, 7, 9, 11, 13, 21, 27, 33, 37, 44};

      public String getType() { return "LUCKY"; }
      public String getName() { return "행운의 수"; }
      public String getDescription() { return "문화적 행운의 수 우대 (3,7,9,11,13 등)"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            List<Integer> luckyList = new ArrayList<>();
            for (int n : LUCKY) luckyList.add(n);
            Collections.shuffle(luckyList, random);
            int count = random.nextInt(2) + 3;
            for (int i = 0; i < count && i < luckyList.size(); i++) {
                  selected.add(luckyList.get(i));
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
