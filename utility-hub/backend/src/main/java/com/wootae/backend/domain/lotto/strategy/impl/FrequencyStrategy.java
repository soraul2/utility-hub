package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class FrequencyStrategy extends AbstractLottoStrategy {
      public String getType() { return "FREQUENCY"; }
      public String getName() { return "역대 빈도"; }
      public String getDescription() { return "역대 전체 출현 빈도 상위 번호 위주"; }
      public String getCategory() { return "DATA_BASED"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            if (context.getAllDraws().isEmpty()) return generateRandom();
            Map<Integer, Integer> freqMap = buildFrequencyMap(context.getAllDraws());
            List<Integer> topNumbers = getTopNumbers(freqMap, 15);
            return pickFromPool(topNumbers);
      }
}
