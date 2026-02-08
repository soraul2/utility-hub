package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class PrimeStrategy extends AbstractLottoStrategy {
      private static final int[] PRIMES = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43};

      public String getType() { return "PRIME"; }
      public String getName() { return "소수 전략"; }
      public String getDescription() { return "소수 4개 이상 포함"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            List<Integer> primeList = new ArrayList<>();
            for (int p : PRIMES) primeList.add(p);
            Collections.shuffle(primeList, random);
            for (int i = 0; i < 4 && i < primeList.size(); i++) {
                  selected.add(primeList.get(i));
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
