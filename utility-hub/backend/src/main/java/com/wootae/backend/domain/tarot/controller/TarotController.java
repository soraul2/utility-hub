package com.wootae.backend.domain.tarot.controller;

import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.service.TarotReadingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import com.wootae.backend.domain.user.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import com.wootae.backend.domain.tarot.enums.TarotAssistantType;
import com.wootae.backend.domain.tarot.entity.TarotSpread;

import java.util.List;

@Tag(name = "Tarot Reading", description = "타로 리딩 관련 API")
@RestController
@RequestMapping("/api/tarot")
@RequiredArgsConstructor
public class TarotController {

      private final TarotReadingService readingService;
      private final UserRepository userRepository;

      @Operation(summary = "3카드 스프레드 리딩 생성", description = "사용자의 질문을 받아 과거, 현재, 미래 3장의 카드를 뽑고 AI 해석을 반환합니다. 로그인 시 1일 100회 제한.")
      @PostMapping("/readings/three-cards")
      public ResponseEntity<TarotDTOs.ThreeCardSpreadResponse> createThreeCardReading(
                  @RequestBody TarotDTOs.ThreeCardSpreadRequest request,
                  @AuthenticationPrincipal UserDetails userDetails) {

            Long memberId = null;
            boolean isAdmin = false;
            if (userDetails != null) {
                  try {
                        Long userId = Long.parseLong(userDetails.getUsername());
                        User user = userRepository.findById(userId).orElse(null);
                        if (user != null) {
                              memberId = user.getId();
                              isAdmin = user.getRole() == UserRole.ROLE_ADMIN;
                        }
                  } catch (NumberFormatException e) {
                        // username이 숫자가 아닌 경우 (이메일 등) 무시
                  }
            }

            TarotDTOs.ThreeCardSpreadResponse response = readingService.createThreeCardReading(request, memberId,
                        isAdmin);
            return ResponseEntity.ok(response);
      }

      @Operation(summary = "오늘의 카드 생성", description = "오늘의 운세 카드를 한 장 뽑고 AI 해석을 반환합니다. 로그인 시 1일 100회 제한.")
      @GetMapping("/daily-card")
      public ResponseEntity<TarotDTOs.DailyCardResponse> getDailyCard(
                  @Parameter(description = "사용자 이름 (선택)", example = "홍길동") @RequestParam(required = false) String userName,
                  @AuthenticationPrincipal UserDetails userDetails) {

            Long memberId = null;
            boolean isAdmin = false;
            if (userDetails != null) {
                  try {
                        Long userId = Long.parseLong(userDetails.getUsername());
                        User user = userRepository.findById(userId).orElse(null);
                        if (user != null) {
                              memberId = user.getId();
                              isAdmin = user.getRole() == UserRole.ROLE_ADMIN;
                        }
                  } catch (NumberFormatException e) {
                        // username이 숫자가 아닌 경우 (이메일 등) 무시
                  }
            }

            TarotDTOs.DailyCardResponse response = readingService.createDailyReading(userName, memberId, isAdmin);
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

      @Operation(summary = "타로 히스토리 조회", description = "로그인한 사용자의 과거 리딩 내역을 페이징하여 조회합니다.")
      @GetMapping("/history")
      public ResponseEntity<Page<TarotDTOs.HistoryResponse>> getHistory(
                  @AuthenticationPrincipal UserDetails userDetails,
                  @RequestParam(required = false) TarotSpread spreadType,
                  @RequestParam(required = false) String search,
                  @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

            if (userDetails == null) {
                  return ResponseEntity.status(401).build();
            }
            try {
                  Long userId = Long.parseLong(userDetails.getUsername());
                  User user = userRepository.findById(userId)
                              .orElseThrow(() -> new RuntimeException("User not found"));
                  return ResponseEntity.ok(readingService.getHistory(user.getId(), spreadType, search, pageable));
            } catch (NumberFormatException e) {
                  return ResponseEntity.status(401).build();
            }
      }

      @Operation(summary = "타로 리딩 삭제", description = "특정 리딩 기록을 삭제합니다. 본인 기록만 삭제 가능합니다.")
      @DeleteMapping("/history/{sessionId}")
      public ResponseEntity<Void> deleteReading(
                  @PathVariable Long sessionId,
                  @AuthenticationPrincipal UserDetails userDetails) {

            if (userDetails == null) {
                  return ResponseEntity.status(401).build();
            }
            try {
                  Long userId = Long.parseLong(userDetails.getUsername());
                  User user = userRepository.findById(userId)
                              .orElseThrow(() -> new RuntimeException("User not found"));
                  readingService.deleteReading(sessionId, user.getId());
                  return ResponseEntity.ok().build();
            } catch (NumberFormatException e) {
                  return ResponseEntity.status(401).build();
            }
      }

      @Operation(summary = "공유된 타로 리딩 조회", description = "UUID를 통해 공유된 타로 리딩 상세 내용을 조회합니다.")
      @GetMapping("/share/{shareUuid}")
      public ResponseEntity<TarotDTOs.ShareResponse> getSharedReading(@PathVariable String shareUuid) {
            return ResponseEntity.ok(readingService.getShare(shareUuid));
      }

      @Operation(summary = "게스트 데이터 이관", description = "로컬 스토리지에 저장된 게스트 세션들을 로그인한 사용자 계정으로 이관합니다.")
      @PostMapping("/migrate")
      public ResponseEntity<Void> migrateData(
                  @RequestBody TarotDTOs.MigrateRequest request,
                  @AuthenticationPrincipal UserDetails userDetails) {

            if (userDetails == null) {
                  return ResponseEntity.status(401).build();
            }
            try {
                  Long userId = Long.parseLong(userDetails.getUsername());
                  User user = userRepository.findById(userId)
                              .orElseThrow(() -> new RuntimeException("User not found"));

                  if (request.getSessionIds() != null && !request.getSessionIds().isEmpty()) {
                        readingService.migrateSessions(request.getSessionIds(), user.getId());
                  }
                  return ResponseEntity.ok().build();
            } catch (NumberFormatException e) {
                  return ResponseEntity.status(401).build();
            }
      }
}
