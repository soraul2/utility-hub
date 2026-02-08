package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class HotStrategy extends AbstractLottoStrategy {
      public String getType() { return "HOT"; }
      public String getName() { return "핫 번호"; }
      public String getDescription() { return "최근 20회차에서 출현 빈도 높은 번호 위주"; }
      public String getCategory() { return "DATA_BASED"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            if (context.getRecentDraws().isEmpty()) return generateRandom();
            Map<Integer, Integer> freqMap = buildFrequencyMap(context.getRecentDraws());
            List<Integer> hotNumbers = getTopNumbers(freqMap, 15);
            return pickFromPool(hotNumbers);
      }
}
