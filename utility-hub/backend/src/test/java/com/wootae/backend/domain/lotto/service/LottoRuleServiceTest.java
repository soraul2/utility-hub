package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.LottoRuleDetailResponse;
import com.wootae.backend.domain.lotto.dto.LottoRuleRequest;
import com.wootae.backend.domain.lotto.dto.LottoRuleResponse;
import com.wootae.backend.domain.lotto.dto.LottoTopRuleResponse;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import com.wootae.backend.domain.lotto.repository.LottoSimulationStatsRepository;
import com.wootae.backend.global.error.BusinessException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class LottoRuleServiceTest {

      @InjectMocks
      private LottoRuleService lottoRuleService;

      @Mock
      private LottoRuleRepository lottoRuleRepository;

      @Mock
      private LottoSimulationStatsRepository lottoSimulationStatsRepository;

      @Test
      @DisplayName("규칙 목록 전체 조회")
      void getAllRules() {
            given(lottoRuleRepository.findAll()).willReturn(List.of(
                        LottoRule.builder().id(1L).name("Rule 1").type("ATTACK").build(),
                        LottoRule.builder().id(2L).name("Rule 2").type("STABLE").build()));

            List<LottoRuleResponse> result = lottoRuleService.getAllRules(null, null);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).getName()).isEqualTo("Rule 1");
      }

      @Test
      @DisplayName("규칙 목록 - type 필터")
      void getAllRules_filterByType() {
            given(lottoRuleRepository.findByType("ATTACK")).willReturn(List.of(
                        LottoRule.builder().id(1L).name("Attack Rule").type("ATTACK").build()));

            List<LottoRuleResponse> result = lottoRuleService.getAllRules("ATTACK", null);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getType()).isEqualTo("ATTACK");
      }

      @Test
      @DisplayName("TOP 5 규칙 조회")
      void getTopRules() {
            given(lottoRuleRepository.findTop5Rules()).willReturn(List.of(
                        LottoRule.builder().id(1L).name("Top Rule").rank(1).popularity(0.9).build()));

            List<LottoTopRuleResponse> result = lottoRuleService.getTopRules();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getRank()).isEqualTo(1);
      }

      @Test
      @DisplayName("규칙 상세 조회 성공")
      void getRuleDetail() {
            LottoRule rule = LottoRule.builder().id(1L).name("Detail Rule").type("ATTACK")
                        .attack(0.9).stability(0.6).build();
            given(lottoRuleRepository.findById(1L)).willReturn(Optional.of(rule));
            given(lottoSimulationStatsRepository.findByRuleId(1L)).willReturn(Optional.empty());

            LottoRuleDetailResponse result = lottoRuleService.getRuleDetail(1L);

            assertThat(result.getRuleId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("Detail Rule");
            assertThat(result.getAttack()).isEqualTo(0.9);
      }

      @Test
      @DisplayName("규칙 상세 조회 실패 - 존재하지 않는 규칙")
      void getRuleDetail_notFound() {
            given(lottoRuleRepository.findById(999L)).willReturn(Optional.empty());

            assertThatThrownBy(() -> lottoRuleService.getRuleDetail(999L))
                        .isInstanceOf(BusinessException.class);
      }

      @Test
      @DisplayName("규칙 생성 성공")
      void createRule() {
            LottoRuleRequest request = new LottoRuleRequest();
            request.setName("New Rule");
            request.setType("BALANCE");

            LottoRule saved = LottoRule.builder().id(1L).name("New Rule").type("BALANCE").build();
            given(lottoRuleRepository.save(any(LottoRule.class))).willReturn(saved);

            LottoRuleResponse result = lottoRuleService.createRule(request);

            assertThat(result.getRuleId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("New Rule");
      }

      @Test
      @DisplayName("규칙 삭제 성공")
      void deleteRule() {
            given(lottoRuleRepository.existsById(1L)).willReturn(true);
            lottoRuleService.deleteRule(1L);
      }

      @Test
      @DisplayName("규칙 삭제 실패 - 존재하지 않는 규칙")
      void deleteRule_notFound() {
            given(lottoRuleRepository.existsById(999L)).willReturn(false);

            assertThatThrownBy(() -> lottoRuleService.deleteRule(999L))
                        .isInstanceOf(BusinessException.class);
      }
}
