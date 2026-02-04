package com.wootae.backend.domain.tarot.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.entity.TarotReadingSession;
import com.wootae.backend.domain.tarot.entity.TarotSpread;
import com.wootae.backend.domain.tarot.repository.TarotReadingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.wootae.backend.domain.tarot.enums.TarotAssistantType;

@Slf4j
@Service
@RequiredArgsConstructor
public class TarotReadingService {

      private final TarotCardService cardService;
      private final TarotAiService aiService;
      private final TarotReadingRepository readingRepository;
      private final ObjectMapper objectMapper;

      public TarotDTOs.ThreeCardSpreadResponse createThreeCardReading(TarotDTOs.ThreeCardSpreadRequest request,
                  Long memberId, boolean isAdmin) {
            // 0. Rate Limiting Logic
            if (memberId != null && !isAdmin) {
                  checkDailyLimit(memberId);
            }
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
                        .memberId(memberId)
                        .build();

            TarotReadingSession savedSession = saveSession(session);

            return TarotDTOs.ThreeCardSpreadResponse.builder()
                        .sessionId(savedSession.getId())
                        .shareUuid(savedSession.getShareUuid()) // Share UUID 반환
                        .cards(positionedCards)
                        .aiReading(aiReading)
                        .createdAt(savedSession.getCreatedAt())
                        .build();
      }

      public TarotDTOs.DailyCardResponse createDailyReading(String userName, Long memberId, boolean isAdmin) {
            // 0. Rate Limiting Logic
            if (memberId != null && !isAdmin) {
                  checkDailyLimit(memberId);
            }
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
                        .memberId(memberId)
                        .build();

            TarotReadingSession savedSession = saveSession(session);

            return TarotDTOs.DailyCardResponse.builder()
                        .sessionId(savedSession.getId())
                        .shareUuid(savedSession.getShareUuid()) // Share UUID 반환
                        .card(dailyCard)
                        .aiReading(aiReading)
                        .createdAt(savedSession.getCreatedAt())
                        .build();
      }

      @Transactional
      protected TarotReadingSession saveSession(TarotReadingSession session) {
            return readingRepository.save(session);
      }

      public TarotDTOs.AssistantReadingResponse createAssistantReading(Long sessionId, TarotAssistantType type,
                  boolean summary) {
            TarotReadingSession session = readingRepository.findById(sessionId)
                        .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

            List<TarotDTOs.DrawnCardDto> cards;
            try {
                  cards = objectMapper.readValue(session.getDrawnCardsJson(),
                              new TypeReference<List<TarotDTOs.DrawnCardDto>>() {
                              });
            } catch (JsonProcessingException e) {
                  throw new RuntimeException("Failed to deserialize cards for assistant reading", e);
            }

            String aiReading = aiService.generateAssistantReading(session, cards, type, summary);

            return TarotDTOs.AssistantReadingResponse.builder()
                        .assistantType(type)
                        .assistantName(type.getKoreanName())
                        .assistantTitle(type.getDescription())
                        .reading(aiReading)
                        .build();
      }

      private void checkDailyLimit(Long memberId) {
            LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
            LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
            long count = readingRepository.countByMemberIdAndCreatedAtBetween(memberId, startOfDay, endOfDay);
            if (count >= 100) {
                  throw new RuntimeException("일일 사용 한도(100회)를 초과했습니다.");
            }
      }

      @Transactional(readOnly = true)
      public Page<TarotDTOs.HistoryResponse> getHistory(Long memberId, TarotSpread spreadType, String search,
                  Pageable pageable) {
            Page<TarotReadingSession> sessions;

            boolean hasSearch = search != null && !search.trim().isEmpty();

            if (spreadType == null) {
                  if (hasSearch) {
                        sessions = readingRepository.findAllByMemberIdAndQuestionContaining(memberId, search, pageable);
                  } else {
                        sessions = readingRepository.findAllByMemberId(memberId, pageable);
                  }
            } else {
                  if (hasSearch) {
                        sessions = readingRepository.findAllByMemberIdAndSpreadTypeAndQuestionContaining(memberId,
                                    spreadType, search, pageable);
                  } else {
                        sessions = readingRepository.findAllByMemberIdAndSpreadType(memberId, spreadType, pageable);
                  }
            }

            return sessions.map(session -> {
                  String summary = session.getAiReading() != null ? session.getAiReading() : "";
                  String spreadTypeName = session.getSpreadType() != null ? session.getSpreadType().name()
                              : "UNKNOWN";

                  return TarotDTOs.HistoryResponse.builder()
                              .sessionId(session.getId())
                              .question(session.getQuestion())
                              .spreadType(spreadTypeName)
                              .createdAt(session.getCreatedAt())
                              .shareUuid(session.getShareUuid())
                              .summarySnippet(summary.length() > 50
                                          ? summary.substring(0, 50) + "..."
                                          : summary)
                              .build();
            });
      }

      @Transactional
      public void deleteReading(Long sessionId, Long memberId) {
            TarotReadingSession session = readingRepository.findByIdAndMemberId(sessionId, memberId)
                        .orElseThrow(() -> new RuntimeException("삭제할 수 없는 리딩입니다."));
            readingRepository.delete(session);
      }

      @Transactional(readOnly = true)
      public TarotDTOs.ShareResponse getShare(String shareUuid) {
            TarotReadingSession session = readingRepository.findByShareUuid(shareUuid)
                        .orElseThrow(() -> new RuntimeException("공유된 리딩을 찾을 수 없습니다."));

            List<TarotDTOs.DrawnCardDto> cards;
            try {
                  cards = objectMapper.readValue(session.getDrawnCardsJson(),
                              new TypeReference<List<TarotDTOs.DrawnCardDto>>() {
                              });
            } catch (JsonProcessingException e) {
                  throw new RuntimeException("Card data error", e);
            }

            return TarotDTOs.ShareResponse.builder()
                        .spreadType(session.getSpreadType().name())
                        .question(session.getQuestion())
                        .userName(session.getUserName())
                        .createdAt(session.getCreatedAt())
                        .aiReading(session.getAiReading())
                        .cards(cards)
                        .build();
      }

      @Transactional
      public void migrateSessions(List<Long> sessionIds, Long memberId) {
            List<TarotReadingSession> sessions = readingRepository.findAllById(sessionIds);
            for (TarotReadingSession session : sessions) {
                  if (session.getMemberId() == null) {
                        session.assignMember(memberId);
                  }
            }
      }
}
