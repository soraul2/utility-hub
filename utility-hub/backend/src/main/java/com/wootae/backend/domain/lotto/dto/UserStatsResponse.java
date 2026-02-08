package com.wootae.backend.domain.lotto.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsResponse {

      private Long totalTickets;
      private Long totalWins;
      private Integer bestRank;
      private Long totalPrize;
}
