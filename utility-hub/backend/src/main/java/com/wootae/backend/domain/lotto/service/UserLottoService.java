package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.UserHistoryResponse;
import com.wootae.backend.domain.lotto.dto.UserStatsResponse;
import com.wootae.backend.domain.lotto.entity.UserTicketHistory;
import com.wootae.backend.domain.lotto.repository.UserTicketHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserLottoService {

      private final UserTicketHistoryRepository userTicketHistoryRepository;

      public UserHistoryResponse getUserHistory(Long userId) {
            List<UserTicketHistory> histories = userTicketHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return UserHistoryResponse.from(histories);
      }

      public UserStatsResponse getUserStats(Long userId) {
            Long totalTickets = userTicketHistoryRepository.countByUserId(userId);
            Long totalWins = userTicketHistoryRepository.countWinsByUserId(userId);
            Integer bestRank = userTicketHistoryRepository.findBestRankByUserId(userId);
            Long totalPrize = userTicketHistoryRepository.sumPrizeByUserId(userId);

            return UserStatsResponse.builder()
                        .totalTickets(totalTickets)
                        .totalWins(totalWins)
                        .bestRank(bestRank)
                        .totalPrize(totalPrize)
                        .build();
      }
}
