package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.dto.LottoRuleRequest;
import com.wootae.backend.domain.lotto.dto.LottoRuleResponse;
import com.wootae.backend.domain.lotto.service.LottoRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class LottoRuleController {

      private final LottoRuleService lottoRuleService;

      @GetMapping
      public ResponseEntity<List<LottoRuleResponse>> getAllRules() {
            return ResponseEntity.ok(lottoRuleService.getAllRules());
      }

      @GetMapping("/{id}")
      public ResponseEntity<LottoRuleResponse> getRule(@PathVariable Long id) {
            return ResponseEntity.ok(lottoRuleService.getRule(id));
      }

      @PostMapping
      public ResponseEntity<LottoRuleResponse> createRule(@RequestBody LottoRuleRequest request) {
            return ResponseEntity.ok(lottoRuleService.createRule(request));
      }

      @PutMapping("/{id}")
      public ResponseEntity<LottoRuleResponse> updateRule(@PathVariable Long id,
                  @RequestBody LottoRuleRequest request) {
            return ResponseEntity.ok(lottoRuleService.updateRule(id, request));
      }

      @DeleteMapping("/{id}")
      public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
            lottoRuleService.deleteRule(id);
            return ResponseEntity.noContent().build();
      }
}
