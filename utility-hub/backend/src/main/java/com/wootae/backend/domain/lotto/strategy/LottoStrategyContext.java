package com.wootae.backend.domain.lotto.strategy;

import com.wootae.backend.domain.lotto.entity.LottoDraw;
import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.List;

@Getter
@Builder
public class LottoStrategyContext {

      @Builder.Default
      private final List<LottoDraw> recentDraws = Collections.emptyList();

      @Builder.Default
      private final List<LottoDraw> allDraws = Collections.emptyList();

      private final LottoDraw latestDraw;

      public boolean hasDrawData() {
            return latestDraw != null || !recentDraws.isEmpty();
      }
}
