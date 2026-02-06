package com.wootae.backend.domain.lotto.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.lotto.dto.LottoRuleRequest;
import com.wootae.backend.domain.lotto.dto.LottoRuleResponse;
import com.wootae.backend.domain.lotto.service.LottoRuleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LottoRuleController.class)
class LottoRuleControllerTest {

      @Autowired
      private MockMvc mockMvc;

      @MockBean
      private LottoRuleService lottoRuleService;

      @Autowired
      private ObjectMapper objectMapper;

      @Test
      @WithMockUser
      @DisplayName("규칙 목록 조회 성공")
      void getAllRules() throws Exception {
            // given
            given(lottoRuleService.getAllRules())
                        .willReturn(List.of(
                                    LottoRuleResponse.builder().id(1L).name("Test Rule 1").build(),
                                    LottoRuleResponse.builder().id(2L).name("Test Rule 2").build()));

            // when & then
            mockMvc.perform(get("/api/rules"))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.length()").value(2))
                        .andExpect(jsonPath("$[0].name").value("Test Rule 1"));
      }

      @Test
      @WithMockUser
      @DisplayName("규칙 생성 성공")
      void createRule() throws Exception {
            // given
            LottoRuleRequest request = new LottoRuleRequest();
            request.setName("New Rule");
            request.setType("FILTER");

            given(lottoRuleService.createRule(any(LottoRuleRequest.class)))
                        .willReturn(LottoRuleResponse.builder().id(1L).name("New Rule").type("FILTER").build());

            // when & then
            mockMvc.perform(post("/api/rules")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.name").value("New Rule"));
      }
}
