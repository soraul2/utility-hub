package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class MirrorStrategy extends AbstractLottoStrategy {
      public String getType() { return "MIRROR"; }
      public String getName() { return "거울수"; }
      public String getDescription() { return "직전 회차 당첨번호의 보수(46-N) 활용"; }
      public String getCategory() { return "DATA_BASED"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            if (context.getLatestDraw() == null) return generateRandom();
            List<Integer> lastNumbers = extractNumbers(context.getLatestDraw());
            var mirrorPool = new TreeSet<Integer>();
            for (int num : lastNumbers) {
                  int mirror = 46 - num;
                  if (mirror >= MIN_NUMBER && mirror <= MAX_NUMBER) mirrorPool.add(mirror);
            }

            var selected = new TreeSet<Integer>();
            var mirrorList = new ArrayList<>(mirrorPool);
            Collections.shuffle(mirrorList, random);
            int count = Math.min(random.nextInt(2) + 3, mirrorList.size());
            for (int i = 0; i < count; i++) selected.add(mirrorList.get(i));
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
