package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Component
public class ExcludeLastStrategy extends AbstractLottoStrategy {
      public String getType() { return "EXCLUDE_LAST"; }
      public String getName() { return "직전 회차 제외"; }
      public String getDescription() { return "직전 회차 당첨 번호 6개를 제외하고 생성"; }
      public String getCategory() { return "DATA_BASED"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            if (context.getLatestDraw() == null) return generateRandom();
            Set<Integer> excludeSet = new HashSet<>(extractNumbers(context.getLatestDraw()));
            List<Integer> pool = IntStream.rangeClosed(MIN_NUMBER, MAX_NUMBER)
                        .filter(n -> !excludeSet.contains(n))
                        .boxed().collect(Collectors.toList());
            Collections.shuffle(pool, random);
            return pool.subList(0, PICK_COUNT).stream().sorted().collect(Collectors.toList());
      }
}
