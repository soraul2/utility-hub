package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.dto.*;
import com.wootae.backend.domain.lotto.service.LottoRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rules")
@RequiredArgsConstructor
public class LottoRuleController {

      private final LottoRuleService lottoRuleService;

      @GetMapping
      public ResponseEntity<Map<String, List<LottoRuleResponse>>> getAllRules(
                  @RequestParam(required = false) String type,
                  @RequestParam(required = false) String sort) {
            List<LottoRuleResponse> rules = lottoRuleService.getAllRules(type, sort);
            return ResponseEntity.ok(Map.of("rules", rules));
      }

      @GetMapping("/top")
      public ResponseEntity<Map<String, List<LottoTopRuleResponse>>> getTopRules() {
            List<LottoTopRuleResponse> topRules = lottoRuleService.getTopRules();
            return ResponseEntity.ok(Map.of("topRules", topRules));
      }

      @GetMapping("/{ruleId}")
      public ResponseEntity<LottoRuleDetailResponse> getRuleDetail(@PathVariable Long ruleId) {
            return ResponseEntity.ok(lottoRuleService.getRuleDetail(ruleId));
      }

      @GetMapping("/{ruleId}/stats/period")
      public ResponseEntity<LottoPeriodStatsResponse> getPeriodStats(
                  @PathVariable Long ruleId,
                  @RequestParam(defaultValue = "ALL_TIME") String period) {
            return ResponseEntity.ok(lottoRuleService.getPeriodStats(ruleId, period));
      }

      @GetMapping("/{ruleId}/stats/distribution")
      public ResponseEntity<LottoDistributionResponse> getDistribution(@PathVariable Long ruleId) {
            return ResponseEntity.ok(lottoRuleService.getDistribution(ruleId));
      }

      @PostMapping
      public ResponseEntity<LottoRuleResponse> createRule(@Valid @RequestBody LottoRuleRequest request) {
            return ResponseEntity.ok(lottoRuleService.createRule(request));
      }

      @PutMapping("/{ruleId}")
      public ResponseEntity<LottoRuleResponse> updateRule(
                  @PathVariable Long ruleId,
                  @Valid @RequestBody LottoRuleRequest request) {
            return ResponseEntity.ok(lottoRuleService.updateRule(ruleId, request));
      }

      @DeleteMapping("/{ruleId}")
      public ResponseEntity<Void> deleteRule(@PathVariable Long ruleId) {
            lottoRuleService.deleteRule(ruleId);
            return ResponseEntity.noContent().build();
      }
}
