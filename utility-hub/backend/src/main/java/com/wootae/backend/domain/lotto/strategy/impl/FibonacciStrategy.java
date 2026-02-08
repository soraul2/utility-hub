package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class FibonacciStrategy extends AbstractLottoStrategy {
      private static final int[] FIBONACCI = {1, 2, 3, 5, 8, 13, 21, 34};

      public String getType() { return "FIBONACCI"; }
      public String getName() { return "피보나치"; }
      public String getDescription() { return "피보나치 수 근처 번호 우선 선택"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            var fibPool = new TreeSet<Integer>();
            for (int f : FIBONACCI) {
                  if (f >= MIN_NUMBER && f <= MAX_NUMBER) fibPool.add(f);
                  if (f - 1 >= MIN_NUMBER) fibPool.add(f - 1);
                  if (f + 1 <= MAX_NUMBER) fibPool.add(f + 1);
            }
            List<Integer> fibList = new ArrayList<>(fibPool);
            Collections.shuffle(fibList, random);
            for (int i = 0; i < 4 && i < fibList.size(); i++) {
                  selected.add(fibList.get(i));
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
