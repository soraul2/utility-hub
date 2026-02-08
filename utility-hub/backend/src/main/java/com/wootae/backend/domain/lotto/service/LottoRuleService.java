package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.*;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.entity.LottoSimulationStats;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import com.wootae.backend.domain.lotto.repository.LottoSimulationStatsRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LottoRuleService {

      private final LottoRuleRepository lottoRuleRepository;
      private final LottoSimulationStatsRepository lottoSimulationStatsRepository;

      public List<LottoRuleResponse> getAllRules(String type, String sort) {
            List<LottoRule> rules;

            if (type != null && !type.isBlank()) {
                  rules = lottoRuleRepository.findByType(type);
            } else {
                  rules = lottoRuleRepository.findAll();
            }

            if (sort != null) {
                  switch (sort.toUpperCase()) {
                        case "RANK" -> rules.sort(Comparator.comparing(LottoRule::getRank));
                        case "POPULARITY" -> rules.sort(Comparator.comparing(LottoRule::getPopularity).reversed());
                  }
            }

            return rules.stream()
                        .map(LottoRuleResponse::from)
                        .collect(Collectors.toList());
      }

      public List<LottoTopRuleResponse> getTopRules() {
            return lottoRuleRepository.findTop5Rules().stream()
                        .map(LottoTopRuleResponse::from)
                        .collect(Collectors.toList());
      }

      public LottoRuleDetailResponse getRuleDetail(Long id) {
            LottoRule rule = lottoRuleRepository.findById(id)
                        .orElseThrow(() -> new BusinessException(ErrorCode.LOTTO_RULE_NOT_FOUND));
            LottoSimulationStats stats = lottoSimulationStatsRepository.findByRuleId(id).orElse(null);
            return LottoRuleDetailResponse.from(rule, stats);
      }

      public LottoPeriodStatsResponse getPeriodStats(Long ruleId, String period) {
            if (!lottoRuleRepository.existsById(ruleId)) {
                  throw new BusinessException(ErrorCode.LOTTO_RULE_NOT_FOUND);
            }

            // Validate period
            if (!List.of("RECENT_4_WEEKS", "RECENT_8_WEEKS", "ALL_TIME").contains(period)) {
                  throw new BusinessException(ErrorCode.LOTTO_INVALID_PERIOD);
            }

            LottoSimulationStats stats = lottoSimulationStatsRepository.findByRuleId(ruleId).orElse(null);
            Map<String, Long> statsMap = new LinkedHashMap<>();
            statsMap.put("1st", 0L);
            statsMap.put("2nd", 0L);
            statsMap.put("3rd", 0L);
            statsMap.put("4th", 0L);
            statsMap.put("5th", 0L);

            if (stats != null && stats.getRankDistribution() != null) {
                  parseRankDistribution(stats.getRankDistribution(), statsMap);
            }

            return LottoPeriodStatsResponse.builder()
                        .ruleId(ruleId)
                        .period(period)
                        .stats(statsMap)
                        .build();
      }

      public LottoDistributionResponse getDistribution(Long ruleId) {
            if (!lottoRuleRepository.existsById(ruleId)) {
                  throw new BusinessException(ErrorCode.LOTTO_RULE_NOT_FOUND);
            }

            LottoSimulationStats stats = lottoSimulationStatsRepository.findByRuleId(ruleId).orElse(null);
            Map<String, Long> distribution = new LinkedHashMap<>();

            if (stats != null && stats.getRankDistribution() != null) {
                  parseRankDistribution(stats.getRankDistribution(), distribution);
            }

            return LottoDistributionResponse.builder()
                        .ruleId(ruleId)
                        .distribution(distribution)
                        .build();
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
                        .orElseThrow(() -> new BusinessException(ErrorCode.LOTTO_RULE_NOT_FOUND));

            rule.update(request.getName(), request.getType(), request.getScript(), request.getParameters());

            return LottoRuleResponse.from(rule);
      }

      @Transactional
      public void deleteRule(Long id) {
            if (!lottoRuleRepository.existsById(id)) {
                  throw new BusinessException(ErrorCode.LOTTO_RULE_NOT_FOUND);
            }
            lottoRuleRepository.deleteById(id);
      }

      private void parseRankDistribution(String rankDistribution, Map<String, Long> target) {
            try {
                  String[] parts = rankDistribution.split(",");
                  for (String part : parts) {
                        String[] kv = part.trim().split(":");
                        if (kv.length == 2) {
                              target.put(kv[0].trim(), Long.parseLong(kv[1].trim()));
                        }
                  }
            } catch (Exception e) {
                  // Keep defaults
            }
      }
}
