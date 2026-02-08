package com.wootae.backend.domain.lotto.dto;

import com.wootae.backend.domain.lotto.entity.UserTicketHistory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserHistoryResponse {

      private List<HistoryItem> history;

      @Getter
      @Builder
      @NoArgsConstructor
      @AllArgsConstructor
      public static class HistoryItem {
            private LocalDate date;
            private Integer drawId;
            private List<Integer> ticket;
            private Integer rank;
            private Long prize;
      }

      public static UserHistoryResponse from(List<UserTicketHistory> histories) {
            ObjectMapper mapper = new ObjectMapper();
            List<HistoryItem> items = histories.stream()
                        .map(h -> {
                              List<Integer> ticketNumbers;
                              try {
                                    ticketNumbers = mapper.readValue(h.getTicket(), new TypeReference<>() {});
                              } catch (Exception e) {
                                    ticketNumbers = List.of();
                              }
                              return HistoryItem.builder()
                                          .date(h.getDrawDate())
                                          .drawId(h.getDrawId())
                                          .ticket(ticketNumbers)
                                          .rank(h.getRankResult())
                                          .prize(h.getPrize())
                                          .build();
                        })
                        .toList();

            return UserHistoryResponse.builder()
                        .history(items)
                        .build();
      }
}
