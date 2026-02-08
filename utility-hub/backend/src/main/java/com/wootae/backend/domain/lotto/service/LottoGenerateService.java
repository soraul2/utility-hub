package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.LottoGenerateResponse;
import com.wootae.backend.domain.lotto.entity.LottoDraw;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.repository.LottoDrawRepository;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import com.wootae.backend.domain.lotto.strategy.LottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LottoGenerateService {

      private final LottoRuleRepository lottoRuleRepository;
      private final LottoDrawRepository lottoDrawRepository;
      private final Map<String, LottoStrategy> strategyMap;

      public LottoGenerateService(
                  LottoRuleRepository lottoRuleRepository,
                  LottoDrawRepository lottoDrawRepository,
                  List<LottoStrategy> strategies) {
            this.lottoRuleRepository = lottoRuleRepository;
            this.lottoDrawRepository = lottoDrawRepository;
            this.strategyMap = strategies.stream()
                        .collect(Collectors.toMap(LottoStrategy::getType, s -> s));
      }

      public LottoGenerateResponse generate(Long ruleId, int count) {
            LottoRule rule = lottoRuleRepository.findById(ruleId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.LOTTO_RULE_NOT_FOUND));

            LottoStrategyContext context = buildContext();
            LottoStrategy strategy = resolveStrategy(rule.getType());

            List<List<Integer>> tickets = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                  tickets.add(strategy.generate(context));
            }

            return LottoGenerateResponse.builder()
                        .ruleId(ruleId)
                        .tickets(tickets)
                        .build();
      }

      public LottoStrategy resolveStrategy(String type) {
            if (type == null) return strategyMap.get("RANDOM");
            return strategyMap.getOrDefault(type.toUpperCase(), strategyMap.get("RANDOM"));
      }

      public List<String> getAllStrategyTypes() {
            return new ArrayList<>(strategyMap.keySet());
      }

      public Map<String, LottoStrategy> getStrategyMap() {
            return strategyMap;
      }

      public LottoStrategyContext buildContext() {
            List<LottoDraw> recentDraws = lottoDrawRepository.findRecentDraws(20);
            List<LottoDraw> allDraws = lottoDrawRepository.findAllByOrderByDrwNoDesc();
            LottoDraw latestDraw = lottoDrawRepository.findLatestDraw().orElse(null);

            return LottoStrategyContext.builder()
                        .recentDraws(recentDraws)
                        .allDraws(allDraws)
                        .latestDraw(latestDraw)
                        .build();
      }

      public LottoStrategyContext buildContextForDraw(int targetDrawNo, List<LottoDraw> allDrawsSorted) {
            List<LottoDraw> drawsBefore = allDrawsSorted.stream()
                        .filter(d -> d.getDrwNo() < targetDrawNo)
                        .collect(Collectors.toList());

            List<LottoDraw> recent20 = drawsBefore.stream().limit(20).collect(Collectors.toList());
            LottoDraw latest = drawsBefore.isEmpty() ? null : drawsBefore.get(0);

            return LottoStrategyContext.builder()
                        .recentDraws(recent20)
                        .allDraws(drawsBefore)
                        .latestDraw(latest)
                        .build();
      }
}
