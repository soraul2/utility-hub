package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RandomStrategy extends AbstractLottoStrategy {
      public String getType() { return "RANDOM"; }
      public String getName() { return "완전 랜덤"; }
      public String getDescription() { return "1~45 중 완전 랜덤 6개 선택"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            return generateRandom();
      }
}
