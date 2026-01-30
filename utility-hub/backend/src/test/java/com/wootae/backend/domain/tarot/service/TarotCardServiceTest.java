package com.wootae.backend.domain.tarot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TarotCardServiceTest {

      private TarotCardService tarotCardService; // System Under Test

      private ResourceLoader resourceLoader;
      private ObjectMapper objectMapper;

      @BeforeEach
      void setUp() throws IOException {
            resourceLoader = mock(ResourceLoader.class);
            objectMapper = new ObjectMapper(); // Use real ObjectMapper

            // Mock JSON data
            String jsonContent = "[" +
                        "{\"nameEn\": \"The Fool\", \"arcana\": \"MAJOR\", \"number\": 0}," + // Not positive
                        "{\"nameEn\": \"The Magician\", \"arcana\": \"MAJOR\", \"number\": 1}," + // Not positive
                        "{\"nameEn\": \"The Sun\", \"arcana\": \"MAJOR\", \"number\": 19}," + // Positive
                        "{\"nameEn\": \"The Star\", \"arcana\": \"MAJOR\", \"number\": 17}," + // Positive
                        "{\"nameEn\": \"Ace of Cups\", \"suit\": \"CUPS\", \"number\": 1}," + // Positive
                        "{\"nameEn\": \"Ten of Cups\", \"suit\": \"CUPS\", \"number\": 10}," + // Positive
                        "{\"nameEn\": \"Five of Swords\", \"suit\": \"SWORDS\", \"number\": 5}" + // Negative? Not in
                                                                                                  // list
                        "]";

            Resource mockResource = new ByteArrayResource(jsonContent.getBytes(StandardCharsets.UTF_8));
            when(resourceLoader.getResource(anyString())).thenReturn(mockResource);

            tarotCardService = new TarotCardService(resourceLoader, objectMapper);
            tarotCardService.initializeDeck(); // Manually trigger @PostConstruct logic
      }

      @Test
      @DisplayName("Deck Initialization Test")
      void testDeckInitialization() {
            List<TarotDTOs.DrawnCardDto> cards = tarotCardService.drawCards(7); // Should draw all if size is 7
            assertThat(cards).hasSize(7);
      }

      @Test
      @DisplayName("Random Draw Test")
      void testDrawCards() {
            List<TarotDTOs.DrawnCardDto> cards = tarotCardService.drawCards(3);
            assertThat(cards).hasSize(3);
            assertThat(cards).doesNotHaveDuplicates();
      }

      @Test
      @DisplayName("Draw Positive Cards (Fortuna Logic)")
      void testDrawPositiveCards() {
            // Expected positive cards in our mock data: The Sun, The Star, Ace of Cups, Ten
            // of Cups (4 cards)
            List<TarotDTOs.DrawnCardDto> cards = tarotCardService.drawPositiveCards(3);

            assertThat(cards).hasSize(3);
            for (TarotDTOs.DrawnCardDto card : cards) {
                  // Verify drawn card is one of the positive ones
                  assertThat(List.of("The Sun", "The Star", "Ace of Cups", "Ten of Cups"))
                              .contains(card.getCardInfo().getNameEn());

                  // Verify NO reversed cards for Fortuna
                  assertThat(card.isReversed()).isFalse();
            }
      }

      @Test
      @DisplayName("Draw Positive Cards - Not Enough Positive Cards Fallback")
      void testDrawPositiveCardsFallback() {
            // Request more than available positive cards (we have 4 positive in mock)
            // But actually logic says: if size < count, fallback to normal draw.
            // We have 4 positive, let's request 5.
            List<TarotDTOs.DrawnCardDto> cards = tarotCardService.drawPositiveCards(5);

            assertThat(cards).hasSize(5);
            // Behavior: logs warning and calls drawCards(count), which returns mixed.
            // So might contain "The Fool" or "Five of Swords"
      }
}
