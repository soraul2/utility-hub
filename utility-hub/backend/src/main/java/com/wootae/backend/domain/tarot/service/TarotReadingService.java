package com.wootae.backend.domain.tarot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.entity.TarotReadingSession;
import com.wootae.backend.domain.tarot.entity.TarotSpread;
import com.wootae.backend.domain.tarot.repository.TarotReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.wootae.backend.domain.tarot.enums.TarotAssistantType;

@Slf4j
@Service
@RequiredArgsConstructor
public class TarotReadingService {

      private final TarotCardService cardService;
      private final TarotAiService aiService;
      private final TarotReadingRepository readingRepository;
      private final ObjectMapper objectMapper;

      public TarotDTOs.ThreeCardSpreadResponse createThreeCardReading(TarotDTOs.ThreeCardSpreadRequest request) {
            // (existing code...)
            List<TarotDTOs.DrawnCardDto> drawnCards;
            if (request.getAssistantType() == TarotAssistantType.FORTUNA) {
                  drawnCards = cardService.drawPositiveCards(3);
            } else {
                  drawnCards = cardService.drawCards(3);
            }

            // Mapping with positions
            List<TarotDTOs.DrawnCardDto> positionedCards = List.of(
                        TarotDTOs.DrawnCardDto.builder().position("PAST").cardInfo(drawnCards.get(0).getCardInfo())
                                    .isReversed(drawnCards.get(0).isReversed()).build(),
                        TarotDTOs.DrawnCardDto.builder().position("PRESENT").cardInfo(drawnCards.get(1).getCardInfo())
                                    .isReversed(drawnCards.get(1).isReversed()).build(),
                        TarotDTOs.DrawnCardDto.builder().position("FUTURE").cardInfo(drawnCards.get(2).getCardInfo())
                                    .isReversed(drawnCards.get(2).isReversed()).build());

            // 2. Generate AI reading
            String aiReading;
            if (request.getAssistantType() != null) {
                  // Create temporary session object for context (not saved yet)
                  TarotReadingSession tempSession = TarotReadingSession.builder()
                              .question(request.getQuestion())
                              .userName(request.getUserName())
                              .build();
                  aiReading = aiService.generateAssistantReading(tempSession, positionedCards,
                              request.getAssistantType());
            } else {
                  aiReading = aiService.generateReading(request, positionedCards);
            }

            // 3. Save session
            String cardsJson;
            try {
                  cardsJson = objectMapper.writeValueAsString(positionedCards);
            } catch (JsonProcessingException e) {
                  throw new RuntimeException("Failed to serialize cards", e);
            }

            TarotReadingSession session = TarotReadingSession.builder()
                        .question(request.getQuestion())
                        .spreadType(TarotSpread.THREE_CARD)
                        .userName(request.getUserName())
                        .userAge(request.getUserAge())
                        .userGender(request.getUserGender())
                        .drawnCardsJson(cardsJson)
                        .aiReading(aiReading)
                        .build();

            TarotReadingSession savedSession = saveSession(session);

            return TarotDTOs.ThreeCardSpreadResponse.builder()
                        .sessionId(savedSession.getId())
                        .cards(positionedCards)
                        .aiReading(aiReading)
                        .createdAt(savedSession.getCreatedAt())
                        .build();
      }

      public TarotDTOs.DailyCardResponse createDailyReading(String userName) {
            // (existing code...)
            List<TarotDTOs.DrawnCardDto> drawnCards = cardService.drawCards(1);
            TarotDTOs.DrawnCardDto dailyCard = drawnCards.get(0);
            dailyCard.setPosition("DAILY");

            // 2. Generate AI reading
            String aiReading = aiService.generateDailyReading(dailyCard);

            // 3. Save session
            String cardsJson;
            try {
                  cardsJson = objectMapper.writeValueAsString(List.of(dailyCard));
            } catch (JsonProcessingException e) {
                  throw new RuntimeException("Failed to serialize cards", e);
            }

            TarotReadingSession session = TarotReadingSession.builder()
                        .question("오늘의 운세는?")
                        .spreadType(TarotSpread.DAILY_ONE)
                        .userName(userName)
                        .drawnCardsJson(cardsJson)
                        .aiReading(aiReading)
                        .build();

            TarotReadingSession savedSession = saveSession(session);

            return TarotDTOs.DailyCardResponse.builder()
                        .sessionId(savedSession.getId())
                        .card(dailyCard)
                        .aiReading(aiReading)
                        .createdAt(savedSession.getCreatedAt())
                        .build();
      }

      @Transactional
      protected TarotReadingSession saveSession(TarotReadingSession session) {
            return readingRepository.save(session);
      }
}
