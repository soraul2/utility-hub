package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ColdStrategy extends AbstractLottoStrategy {
      public String getType() { return "COLD"; }
      public String getName() { return "콜드 번호"; }
      public String getDescription() { return "최근 20회차에서 출현 빈도 낮은 번호 위주"; }
      public String getCategory() { return "DATA_BASED"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            if (context.getRecentDraws().isEmpty()) return generateRandom();
            Map<Integer, Integer> freqMap = buildFrequencyMap(context.getRecentDraws());
            List<Integer> coldNumbers = new ArrayList<>();
            for (int i = MIN_NUMBER; i <= MAX_NUMBER; i++) coldNumbers.add(i);
            coldNumbers.sort(Comparator.comparingInt(n -> freqMap.getOrDefault(n, 0)));
            return pickFromPool(coldNumbers.subList(0, Math.min(15, coldNumbers.size())));
      }
}
