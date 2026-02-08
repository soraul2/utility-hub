package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.entity.LottoDraw;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LottoMatchServiceTest {

      private final LottoMatchService matchService = new LottoMatchService();

      private final LottoDraw draw = new LottoDraw(
                  1, LocalDate.of(2025, 1, 1),
                  3, 10, 15, 25, 35, 42, 7,
                  2_000_000_000L, 10L);

      @Test
      @DisplayName("1등 - 6개 일치")
      void rank1() {
            assertThat(matchService.matchRank(List.of(3, 10, 15, 25, 35, 42), draw)).isEqualTo(1);
      }

      @Test
      @DisplayName("2등 - 5개 + 보너스")
      void rank2() {
            assertThat(matchService.matchRank(List.of(3, 7, 10, 15, 25, 35), draw)).isEqualTo(2);
      }

      @Test
      @DisplayName("3등 - 5개 일치")
      void rank3() {
            assertThat(matchService.matchRank(List.of(3, 10, 15, 25, 35, 44), draw)).isEqualTo(3);
      }

      @Test
      @DisplayName("4등 - 4개 일치")
      void rank4() {
            assertThat(matchService.matchRank(List.of(3, 10, 15, 25, 1, 2), draw)).isEqualTo(4);
      }

      @Test
      @DisplayName("5등 - 3개 일치")
      void rank5() {
            assertThat(matchService.matchRank(List.of(3, 10, 15, 1, 2, 4), draw)).isEqualTo(5);
      }

      @Test
      @DisplayName("미당첨 - 2개 일치")
      void noWin_2match() {
            assertThat(matchService.matchRank(List.of(3, 10, 1, 2, 4, 6), draw)).isEqualTo(0);
      }

      @Test
      @DisplayName("미당첨 - 0개 일치")
      void noWin_0match() {
            assertThat(matchService.matchRank(List.of(1, 2, 4, 6, 8, 9), draw)).isEqualTo(0);
      }

      @Test
      @DisplayName("당첨금 추정 - 각 등수별")
      void estimatePrize() {
            assertThat(matchService.estimatePrize(1, draw)).isEqualTo(2_000_000_000L);
            assertThat(matchService.estimatePrize(2, draw)).isEqualTo(50_000_000L);
            assertThat(matchService.estimatePrize(3, draw)).isEqualTo(1_500_000L);
            assertThat(matchService.estimatePrize(4, draw)).isEqualTo(50_000L);
            assertThat(matchService.estimatePrize(5, draw)).isEqualTo(5_000L);
            assertThat(matchService.estimatePrize(0, draw)).isEqualTo(0L);
      }
}
