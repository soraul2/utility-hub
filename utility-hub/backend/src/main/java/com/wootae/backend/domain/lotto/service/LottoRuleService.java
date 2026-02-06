package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.LottoRuleRequest;
import com.wootae.backend.domain.lotto.dto.LottoRuleResponse;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LottoRuleService {

      private final LottoRuleRepository lottoRuleRepository;

      public List<LottoRuleResponse> getAllRules() {
            return lottoRuleRepository.findAll().stream()
                        .map(LottoRuleResponse::from)
                        .collect(Collectors.toList());
      }

      public LottoRuleResponse getRule(Long id) {
            LottoRule rule = lottoRuleRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
            return LottoRuleResponse.from(rule);
      }

      @Transactional
      public LottoRuleResponse createRule(LottoRuleRequest request) {
            LottoRule rule = LottoRule.builder()
                        .name(request.getName())
                        .type(request.getType())
                        .description(request.getDescription())
                        .script(request.getScript())
                        .parameters(request.getParameters())
                        .build();
            LottoRule savedRule = lottoRuleRepository.save(rule);
            return LottoRuleResponse.from(savedRule);
      }

      @Transactional
      public LottoRuleResponse updateRule(Long id, LottoRuleRequest request) {
            LottoRule rule = lottoRuleRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

            rule.update(request.getName(), request.getType(), request.getScript(), request.getParameters());

            return LottoRuleResponse.from(rule);
      }

      @Transactional
      public void deleteRule(Long id) {
            if (!lottoRuleRepository.existsById(id)) {
                  throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND);
            }
            lottoRuleRepository.deleteById(id);
      }
}
