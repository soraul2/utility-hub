package com.wootae.backend.domain.lotto.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.lotto.dto.LottoRuleDetailResponse;
import com.wootae.backend.domain.lotto.dto.LottoRuleRequest;
import com.wootae.backend.domain.lotto.dto.LottoRuleResponse;
import com.wootae.backend.domain.lotto.dto.LottoTopRuleResponse;
import com.wootae.backend.domain.lotto.service.LottoRuleService;
import com.wootae.backend.global.error.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class LottoRuleControllerTest {

      private MockMvc mockMvc;

      @Mock
      private LottoRuleService lottoRuleService;

      @InjectMocks
      private LottoRuleController lottoRuleController;

      private final ObjectMapper objectMapper = new ObjectMapper();

      @BeforeEach
      void setUp() {
            mockMvc = MockMvcBuilders.standaloneSetup(lottoRuleController)
                        .setControllerAdvice(new GlobalExceptionHandler())
                        .build();
      }

      @Test
      @DisplayName("규칙 목록 조회 성공")
      void getAllRules() throws Exception {
            given(lottoRuleService.getAllRules(isNull(), isNull()))
                        .willReturn(List.of(
                                    LottoRuleResponse.builder().ruleId(1L).name("Test Rule 1").build(),
                                    LottoRuleResponse.builder().ruleId(2L).name("Test Rule 2").build()));

            mockMvc.perform(get("/api/rules"))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.rules.length()").value(2))
                        .andExpect(jsonPath("$.rules[0].name").value("Test Rule 1"));
      }

      @Test
      @DisplayName("규칙 목록 조회 - type 필터")
      void getAllRulesWithTypeFilter() throws Exception {
            given(lottoRuleService.getAllRules(eq("ATTACK"), isNull()))
                        .willReturn(List.of(
                                    LottoRuleResponse.builder().ruleId(1L).name("Attack Rule").type("ATTACK").build()));

            mockMvc.perform(get("/api/rules").param("type", "ATTACK"))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.rules.length()").value(1))
                        .andExpect(jsonPath("$.rules[0].type").value("ATTACK"));
      }

      @Test
      @DisplayName("TOP 5 규칙 조회 성공")
      void getTopRules() throws Exception {
            given(lottoRuleService.getTopRules())
                        .willReturn(List.of(
                                    LottoTopRuleResponse.builder().ruleId(1L).name("Top Rule").rank(1).build()));

            mockMvc.perform(get("/api/rules/top"))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.topRules.length()").value(1))
                        .andExpect(jsonPath("$.topRules[0].rank").value(1));
      }

      @Test
      @DisplayName("규칙 상세 조회 성공")
      void getRuleDetail() throws Exception {
            given(lottoRuleService.getRuleDetail(1L))
                        .willReturn(LottoRuleDetailResponse.builder()
                                    .ruleId(1L).name("Detail Rule").type("ATTACK")
                                    .attack(0.9).stability(0.6).build());

            mockMvc.perform(get("/api/rules/1"))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.ruleId").value(1))
                        .andExpect(jsonPath("$.name").value("Detail Rule"))
                        .andExpect(jsonPath("$.attack").value(0.9));
      }

      @Test
      @DisplayName("규칙 생성 성공")
      void createRule() throws Exception {
            LottoRuleRequest request = new LottoRuleRequest();
            request.setName("New Rule");
            request.setType("FILTER");

            given(lottoRuleService.createRule(any(LottoRuleRequest.class)))
                        .willReturn(LottoRuleResponse.builder().ruleId(1L).name("New Rule").type("FILTER").build());

            mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                        .andDo(print())
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.name").value("New Rule"));
      }

      @Test
      @DisplayName("규칙 생성 실패 - 이름 누락 시 400")
      void createRule_validationFail() throws Exception {
            LottoRuleRequest request = new LottoRuleRequest();
            request.setType("FILTER");

            mockMvc.perform(post("/api/rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                        .andDo(print())
                        .andExpect(status().isBadRequest());
      }
}
