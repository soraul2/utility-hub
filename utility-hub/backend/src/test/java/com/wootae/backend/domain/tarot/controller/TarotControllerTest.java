package com.wootae.backend.domain.tarot.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.enums.TarotAssistantType;
import com.wootae.backend.domain.tarot.service.TarotReadingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TarotController.class)
class TarotControllerTest {

      @Autowired
      private MockMvc mockMvc;

      @MockitoBean
      private TarotReadingService readingService;

      @MockitoBean
      private org.springframework.data.jpa.mapping.JpaMetamodelMappingContext jpaMetamodelMappingContext;

      @Autowired
      private ObjectMapper objectMapper;

      @Test
      @DisplayName("3카드 스프레드 리딩 생성 성공 테스트")
      void createThreeCardReading_Success() throws Exception {
            // given
            TarotDTOs.ThreeCardSpreadRequest request = TarotDTOs.ThreeCardSpreadRequest.builder()
                        .question("연애운이 궁금해")
                        .topic("LOVE")
                        .userName("테스터")
                        .assistantType(TarotAssistantType.LUNA)
                        .build();

            TarotDTOs.ThreeCardSpreadResponse response = TarotDTOs.ThreeCardSpreadResponse.builder()
                        .sessionId(1L)
                        .aiReading("AI Reading Result")
                        .createdAt(LocalDateTime.now())
                        .cards(List.of()) // Empty list for simplicity
                        .build();

            given(readingService.createThreeCardReading(any(TarotDTOs.ThreeCardSpreadRequest.class)))
                        .willReturn(response);

            // when & then
            mockMvc.perform(post("/api/tarot/readings/three-cards")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.sessionId").value(1L))
                        .andExpect(jsonPath("$.aiReading").value("AI Reading Result"));
      }

      @Test
      @DisplayName("오늘의 카드 생성 성공 테스트")
      void getDailyCard_Success() throws Exception {
            // given
            String userName = "테스터";
            TarotDTOs.DailyCardResponse response = TarotDTOs.DailyCardResponse.builder()
                        .sessionId(2L)
                        .aiReading("Daily Reading Result")
                        .createdAt(LocalDateTime.now())
                        .build();

            given(readingService.createDailyReading(userName))
                        .willReturn(response);

            // when & then
            mockMvc.perform(get("/api/tarot/daily-card")
                        .param("userName", userName))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.sessionId").value(2L))
                        .andExpect(jsonPath("$.aiReading").value("Daily Reading Result"));
      }
}
