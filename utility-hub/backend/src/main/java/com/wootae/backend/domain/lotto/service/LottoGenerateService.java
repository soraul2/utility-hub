package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.LottoGenerateResponse;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LottoGenerateService {

      private final LottoRuleRepository lottoRuleRepository;

      public LottoGenerateResponse generate(Long ruleId, int count) {
            LottoRule rule = lottoRuleRepository.findById(ruleId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

            // TODO: Interpret rule parameters and type for advanced logic
            // Current implementation: Pure Random 6/45 for all types
            List<List<Integer>> games = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                  games.add(generateRandomGame());
            }

            return LottoGenerateResponse.builder()
                        .ruleId(ruleId)
                        .count(count)
                        .games(games)
                        .build();
      }

      private List<Integer> generateRandomGame() {
            List<Integer> numbers = IntStream.rangeClosed(1, 45)
                        .boxed()
                        .collect(Collectors.toList());
            Collections.shuffle(numbers);
            return numbers.subList(0, 6).stream().sorted().collect(Collectors.toList());
      }
}
