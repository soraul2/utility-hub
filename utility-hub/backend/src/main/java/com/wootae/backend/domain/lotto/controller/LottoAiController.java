package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.service.LottoAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class LottoAiController {

      private final LottoAiService lottoAiService;

      @GetMapping("/rule-explain/{id}")
      public ResponseEntity<String> explainRule(@PathVariable Long id) {
            return ResponseEntity.ok(lottoAiService.explainRule(id));
      }
}
