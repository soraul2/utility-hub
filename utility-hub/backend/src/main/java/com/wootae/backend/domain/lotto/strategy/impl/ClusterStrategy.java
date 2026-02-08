package com.wootae.backend.domain.lotto.strategy.impl;

import com.wootae.backend.domain.lotto.strategy.AbstractLottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ClusterStrategy extends AbstractLottoStrategy {
      public String getType() { return "CLUSTER"; }
      public String getName() { return "클러스터링"; }
      public String getDescription() { return "2~3개 묶음으로 번호 생성"; }
      public String getCategory() { return "ALGORITHM"; }

      @Override
      public List<Integer> generate(LottoStrategyContext context) {
            var selected = new TreeSet<Integer>();
            int clusterCount = random.nextInt(2) + 2;
            int numbersPerCluster = PICK_COUNT / clusterCount;

            List<Integer> clusterStarts = new ArrayList<>();
            while (clusterStarts.size() < clusterCount) {
                  int start = random.nextInt(MAX_NUMBER - 3) + 1;
                  boolean tooClose = clusterStarts.stream().anyMatch(s -> Math.abs(s - start) < 8);
                  if (!tooClose) clusterStarts.add(start);
            }
            Collections.sort(clusterStarts);

            for (int start : clusterStarts) {
                  for (int j = 0; j < numbersPerCluster && selected.size() < PICK_COUNT; j++) {
                        int num = start + random.nextInt(4);
                        if (num >= MIN_NUMBER && num <= MAX_NUMBER) selected.add(num);
                  }
            }
            fillRemaining(selected);
            return new ArrayList<>(selected);
      }
}
