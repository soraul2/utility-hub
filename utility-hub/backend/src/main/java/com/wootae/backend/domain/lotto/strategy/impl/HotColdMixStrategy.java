package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class HotColdMixStrategy extends AbstractLottoStrategy {
      public String getType() { return "HOT_COLD_MIX"; }
      public String getName() { return "핫콜드 혼합"; }
      public String getDescription() { return "핫 번호 3개 + 콜드 번호 3개 조합"; }
      public String getCategory() { return "DATA_BASED"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            if (context.getRecentDraws().isEmpty()) return generateRandom();
            Map<Integer, Integer> freqMap = buildFrequencyMap(context.getRecentDraws());

            var selected = new TreeSet<Integer>();
            List<Integer> hotNumbers = getTopNumbers(freqMap, 15);
            List<Integer> coldNumbers = new ArrayList<>();
            for (int i = MIN_NUMBER; i <= MAX_NUMBER; i++) coldNumbers.add(i);
            coldNumbers.sort(Comparator.comparingInt(n -> freqMap.getOrDefault(n, 0)));
            List<Integer> coldPool = coldNumbers.subList(0, Math.min(15, coldNumbers.size()));

            Collections.shuffle(hotNumbers, random);
            var coldShuffled = new ArrayList<>(coldPool);
            Collections.shuffle(coldShuffled, random);

            for (int i = 0; i < 3 && i < hotNumbers.size(); i++) selected.add(hotNumbers.get(i));
            for (int num : coldShuffled) {
                  if (selected.size() >= PICK_COUNT) break;
                  selected.add(num);
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
