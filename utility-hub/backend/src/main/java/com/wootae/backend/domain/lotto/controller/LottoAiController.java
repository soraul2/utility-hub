package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.dto.LottoAiExplainRequest;
import com.wootae.backend.domain.lotto.dto.LottoAiExplainResponse;
import com.wootae.backend.domain.lotto.service.LottoAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class LottoAiController {

      private final LottoAiService lottoAiService;

      @PostMapping("/rule-explain")
      public ResponseEntity<LottoAiExplainResponse> explainRule(
                  @Valid @RequestBody LottoAiExplainRequest request) {
            return ResponseEntity.ok(lottoAiService.explainRule(request.getRuleId()));
      }
}
