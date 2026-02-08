package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.dto.LottoGenerateRequest;
import com.wootae.backend.domain.lotto.dto.LottoGenerateResponse;
import com.wootae.backend.domain.lotto.service.LottoGenerateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class LottoGenerateController {

      private final LottoGenerateService lottoGenerateService;

      @PostMapping("/{ruleId}/generate")
      public ResponseEntity<LottoGenerateResponse> generateNumbers(
                  @PathVariable Long ruleId,
                  @Valid @RequestBody LottoGenerateRequest request) {
            return ResponseEntity.ok(lottoGenerateService.generate(ruleId, request.getCount()));
      }
}
