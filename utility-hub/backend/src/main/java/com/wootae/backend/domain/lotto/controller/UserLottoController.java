package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.dto.UserHistoryResponse;
import com.wootae.backend.domain.lotto.dto.UserStatsResponse;
import com.wootae.backend.domain.lotto.service.UserLottoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class UserLottoController {

      private final UserLottoService userLottoService;

      @GetMapping("/history")
      public ResponseEntity<UserHistoryResponse> getUserHistory(@AuthenticationPrincipal Long userId) {
            return ResponseEntity.ok(userLottoService.getUserHistory(userId));
      }

      @GetMapping("/stats")
      public ResponseEntity<UserStatsResponse> getUserStats(@AuthenticationPrincipal Long userId) {
            return ResponseEntity.ok(userLottoService.getUserStats(userId));
      }
}
