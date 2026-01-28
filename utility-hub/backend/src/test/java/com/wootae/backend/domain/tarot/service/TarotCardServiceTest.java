package com.wootae.backend.domain.tarot.service;

import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class TarotCardServiceTest {

      @Autowired
      private TarotCardService tarotCardService;

      @Test
      void testDeckInitialization() {
            // 덱이 78장의 카드로 초기화되는지 확인
            List<TarotDTOs.DrawnCardDto> allCards = tarotCardService.drawCards(78);
            assertThat(allCards).hasSize(78);

            // 모든 카드가 고유한지 확인
            Set<String> cardIds = new HashSet<>();
            for (TarotDTOs.DrawnCardDto card : allCards) {
                  cardIds.add(card.getCardInfo().getId());
            }
            assertThat(cardIds).hasSize(78);
      }

      @Test
      void testDrawCards() {
            // 3장의 카드를 뽑는지 확인
            List<TarotDTOs.DrawnCardDto> drawnCards = tarotCardService.drawCards(3);
            assertThat(drawnCards).hasSize(3);

            // 각 카드가 null이 아닌지 확인
            for (TarotDTOs.DrawnCardDto card : drawnCards) {
                  assertThat(card.getCardInfo()).isNotNull();
                  assertThat(card.getCardInfo().getNameKo()).isNotBlank();
                  assertThat(card.getCardInfo().getNameEn()).isNotBlank();
            }
      }

      @Test
      void testRandomness() {
            // 여러 번 뽑았을 때 다른 결과가 나오는지 확인 (무작위성 검증)
            List<TarotDTOs.DrawnCardDto> draw1 = tarotCardService.drawCards(3);
            List<TarotDTOs.DrawnCardDto> draw2 = tarotCardService.drawCards(3);

            // 두 번의 뽑기가 동일하지 않을 가능성이 높음 (완벽한 테스트는 아니지만 기본적인 무작위성 확인)
            boolean isDifferent = !draw1.get(0).getCardInfo().getId().equals(draw2.get(0).getCardInfo().getId()) ||
                        !draw1.get(1).getCardInfo().getId().equals(draw2.get(1).getCardInfo().getId()) ||
                        !draw1.get(2).getCardInfo().getId().equals(draw2.get(2).getCardInfo().getId());

            assertThat(isDifferent).isTrue();
      }
}
