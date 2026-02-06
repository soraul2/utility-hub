package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.dto.LottoGenerateResponse;
import com.wootae.backend.domain.lotto.service.LottoGenerateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class LottoGenerateController {

      private final LottoGenerateService lottoGenerateService;

      @PostMapping("/{id}/generate")
      public ResponseEntity<LottoGenerateResponse> generateNumbers(
                  @PathVariable Long id,
                  @RequestParam(defaultValue = "5") int count) {
            return ResponseEntity.ok(lottoGenerateService.generate(id, count));
      }
}
