package com.wootae.backend.domain.tarot.controller;

import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.service.TarotReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wootae.backend.domain.tarot.enums.TarotAssistantType;

@Tag(name = "Tarot Reading", description = "타로 리딩 관련 API")
@RestController
@RequestMapping("/api/tarot")
@RequiredArgsConstructor
public class TarotController {

      private final TarotReadingService readingService;

      @Operation(summary = "3카드 스프레드 리딩 생성", description = "사용자의 질문을 받아 과거, 현재, 미래 3장의 카드를 뽑고 AI 해석을 반환합니다.")
      @PostMapping("/readings/three-cards")
      public ResponseEntity<TarotDTOs.ThreeCardSpreadResponse> createThreeCardReading(
                  @RequestBody TarotDTOs.ThreeCardSpreadRequest request) {
            TarotDTOs.ThreeCardSpreadResponse response = readingService.createThreeCardReading(request);
            return ResponseEntity.ok(response);
      }

      @Operation(summary = "오늘의 카드 생성", description = "사용자의 이름을 옵션으로 받아 오늘의 운세 카드를 한 장 뽑고 AI 해석을 반환합니다.")
      @GetMapping("/daily-card")
      public ResponseEntity<TarotDTOs.DailyCardResponse> getDailyCard(
                  @Parameter(description = "사용자 이름 (선택)", example = "홍길동") @RequestParam(required = false) String userName) {
            TarotDTOs.DailyCardResponse response = readingService.createDailyReading(userName);
            return ResponseEntity.ok(response);
      }

      @Operation(summary = "조수 리딩 생성", description = "기존 세션에 대해 특정 조수(페르소나)의 추가 해석을 생성합니다.")
      @PostMapping("/readings/{sessionId}/assistants/{type}")
      public ResponseEntity<TarotDTOs.AssistantReadingResponse> createAssistantReading(
                  @PathVariable Long sessionId,
                  @PathVariable TarotAssistantType type,
                  @RequestParam(required = false, defaultValue = "false") boolean summary) {

            // Note: This requires a method in TarotReadingService or a direct call to AI
            // service
            // For now, let's assume we need to add this logic to the service or a dedicated
            // controller
            // I'll add a temporary implementation calling the service if it exists, or
            // suggest adding it.
            // Since I saw generateAssistantReading in TarotReadingService, I should use it.
            return ResponseEntity.ok(readingService.createAssistantReading(sessionId, type, summary));
      }

      // 히스토리 조회를 위한 플레이스홀더 (추후 구현 예정)
}
