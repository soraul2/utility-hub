package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.LottoAiExplainResponse;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LottoAiService {

      private final ChatClient chatClient;
      private final LottoRuleRepository lottoRuleRepository;

      public LottoAiExplainResponse explainRule(Long ruleId) {
            LottoRule rule = lottoRuleRepository.findById(ruleId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.LOTTO_RULE_NOT_FOUND));

            String prompt = String.format(
                        "다음 로또 규칙에 대해 쉽고 상세하게 설명해줘.\n" +
                                    "- 규칙 이름: %s\n" +
                                    "- 유형: %s\n" +
                                    "- 설명: %s\n" +
                                    "- 스크립트/로직: %s\n" +
                                    "- 파라미터: %s\n\n" +
                                    "이 규칙이 어떤 방식으로 번호를 생성하거나 필터링하는지 분석해서 알려줘.",
                        rule.getName(), rule.getType(), rule.getDescription(), rule.getScript(), rule.getParameters());

            try {
                  String explanation = chatClient.prompt()
                              .user(prompt)
                              .call()
                              .content();

                  return LottoAiExplainResponse.builder()
                              .ruleId(ruleId)
                              .explanation(explanation)
                              .build();
            } catch (Exception e) {
                  log.error("AI provider error for ruleId={}", ruleId, e);
                  throw new BusinessException(ErrorCode.AI_PROVIDER_ERROR);
            }
      }
}
