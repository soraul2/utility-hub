package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.LottoGenerateResponse;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class LottoGenerateServiceTest {

      @InjectMocks
      private LottoGenerateService lottoGenerateService;

      @Mock
      private LottoRuleRepository lottoRuleRepository;

      @Test
      @DisplayName("번호 생성 성공 - 6개 번호 5게임")
      void generateNumbers() {
            // given
            Long ruleId = 1L;
            LottoRule rule = LottoRule.builder()
                        .id(ruleId)
                        .name("Test Rule")
                        .type("RANDOM")
                        .build();

            given(lottoRuleRepository.findById(ruleId)).willReturn(Optional.of(rule));

            // when
            LottoGenerateResponse response = lottoGenerateService.generate(ruleId, 5);

            // then
            assertThat(response.getRuleId()).isEqualTo(ruleId);
            assertThat(response.getCount()).isEqualTo(5);
            assertThat(response.getGames()).hasSize(5);
            assertThat(response.getGames().get(0)).hasSize(6);
            assertThat(response.getGames().get(0)).isSorted();
      }
}
