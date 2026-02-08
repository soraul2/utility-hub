package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.entity.LottoDraw;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class LottoMatchService {

      public int matchRank(List<Integer> ticket, LottoDraw draw) {
            Set<Integer> winningNumbers = Set.of(
                        draw.getDrwtNo1(), draw.getDrwtNo2(), draw.getDrwtNo3(),
                        draw.getDrwtNo4(), draw.getDrwtNo5(), draw.getDrwtNo6());
            int bonusNumber = draw.getBnusNo();

            Set<Integer> ticketSet = new HashSet<>(ticket);
            long matchCount = ticketSet.stream().filter(winningNumbers::contains).count();
            boolean hasBonus = ticketSet.contains(bonusNumber);

            if (matchCount == 6) return 1;
            if (matchCount == 5 && hasBonus) return 2;
            if (matchCount == 5) return 3;
            if (matchCount == 4) return 4;
            if (matchCount == 3) return 5;
            return 0; // 미당첨
      }

      public long estimatePrize(int rank, LottoDraw draw) {
            return switch (rank) {
                  case 1 -> draw.getFirstWinamnt() != null ? draw.getFirstWinamnt() : 2_000_000_000L;
                  case 2 -> 50_000_000L;
                  case 3 -> 1_500_000L;
                  case 4 -> 50_000L;
                  case 5 -> 5_000L;
                  default -> 0L;
            };
      }
}
