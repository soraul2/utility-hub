package com.wootae.backend.domain.tarot.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.entity.TarotCard;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TarotCardService {

      private final ResourceLoader resourceLoader;
      private final ObjectMapper objectMapper;
      private List<TarotCard> deck = new ArrayList<>();

      @PostConstruct
      public void initializeDeck() {
            try {
                  Resource resource = resourceLoader.getResource("classpath:tarot_data.json");
                  try (InputStream inputStream = resource.getInputStream()) {
                        this.deck = objectMapper.readValue(inputStream, new TypeReference<List<TarotCard>>() {
                        });
                        log.info("Tarot deck initialized with {} cards from JSON", deck.size());
                  }
            } catch (Exception e) {
                  log.error("Failed to initialize tarot deck from JSON", e);
                  this.deck = new ArrayList<>();
            }
      }

      public List<TarotDTOs.DrawnCardDto> drawCards(int count) {
            if (count > deck.size()) {
                  throw new IllegalArgumentException("카드 덱 크기보다 더 많은 카드를 뽑을 수 없습니다.");
            }

            List<Integer> indices = new ArrayList<>();
            for (int i = 0; i < deck.size(); i++) {
                  indices.add(i);
            }
            Collections.shuffle(indices);

            List<TarotDTOs.DrawnCardDto> drawnCards = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                  TarotCard card = deck.get(indices.get(i));
                  boolean reversed = Math.random() < 0.5;

                  drawnCards.add(TarotDTOs.DrawnCardDto.builder()
                              .position("") // Set by caller
                              .cardInfo(card)
                              .isReversed(reversed)
                              .build());
            }

            log.info("Drew {} cards from deck", count);
            return drawnCards;
      }

      public List<TarotDTOs.DrawnCardDto> drawPositiveCards(int count) {
            List<String> positiveCardNames = List.of(
                        "The Sun", "The Star", "The World", "The Lovers", "Wheel of Fortune",
                        "The Empress", "Strength", "Ace of Cups", "Ten of Cups",
                        "Ace of Pentacles", "Ten of Pentacles", "Six of Wands", "Ace of Wands");

            List<TarotCard> positiveDeck = deck.stream()
                        .filter(card -> positiveCardNames.contains(card.getNameEn()))
                        .toList();

            if (positiveDeck.size() < count) {
                  // Fallback if names don't match or not enough cards found
                  log.warn("Not enough positive cards found. Falling back to specific Major Arcana indices.");
                  return drawCards(count);
            }

            List<Integer> indices = new ArrayList<>();
            for (int i = 0; i < positiveDeck.size(); i++) {
                  indices.add(i);
            }
            Collections.shuffle(indices);

            List<TarotDTOs.DrawnCardDto> drawnCards = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                  TarotCard card = positiveDeck.get(indices.get(i));
                  // Master Fortuna always gives Upright cards (No Reversed) for maximum luck
                  boolean reversed = false;

                  drawnCards.add(TarotDTOs.DrawnCardDto.builder()
                              .position("") // Set by caller
                              .cardInfo(card)
                              .isReversed(reversed)
                              .build());
            }

            log.info("Drew {} POSITIVE cards for Fortuna", count);
            return drawnCards;
      }
}
