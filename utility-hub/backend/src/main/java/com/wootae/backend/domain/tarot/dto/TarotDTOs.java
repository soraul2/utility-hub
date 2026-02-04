package com.wootae.backend.domain.tarot.dto;

import com.wootae.backend.domain.tarot.entity.TarotCard;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import com.wootae.backend.domain.tarot.enums.TarotAssistantType;

import java.time.LocalDateTime;
import java.util.List;

public class TarotDTOs {

      @Getter
      @Setter
      @Builder
      @Schema(description = "조수 리딩 응답 객체")
      public static class AssistantReadingResponse {
            @Schema(description = "조수 타입")
            private TarotAssistantType assistantType;

            @Schema(description = "조수 이름 (한글)")
            private String assistantName;

            @Schema(description = "조수 칭호")
            private String assistantTitle;

            @Schema(description = "AI 리딩 결과")
            private String reading;
      }

      @Getter
      @Setter
      @Builder
      @Schema(description = "3카드 스프레드 요청 객체")
      public static class ThreeCardSpreadRequest {
            @Schema(description = "사용자 질문", example = "오늘의 연애운이 궁금해")
            private String question;

            @Schema(description = "주제 (선택: LOVE, CAREER, WEALTH, GENERAL)", example = "LOVE")
            private String topic; // Optional: "LOVE", "CAREER", "WEALTH", "GENERAL"

            // Optional User Profile
            @Schema(description = "사용자 이름 (선택)", example = "홍길동")
            private String userName;

            @Schema(description = "사용자 성별 (선택: MALE, FEMALE, OTHER)", example = "MALE")
            private String userGender; // "MALE", "FEMALE", "OTHER"

            @Schema(description = "사용자 나이 (선택)", example = "25")
            private Integer userAge;

            @Schema(description = "선택한 리더 타입 (옵션)", nullable = true)
            private TarotAssistantType assistantType;
      }

      @Getter
      @Setter
      @Builder
      @Schema(description = "뽑힌 카드 정보")
      public static class DrawnCardDto {
            @Schema(description = "카드 위치 (PAST, PRESENT, FUTURE)", example = "PAST")
            private String position; // "PAST", "PRESENT", "FUTURE" or "DAILY"

            @Schema(description = "역방향 여부")
            private boolean isReversed;

            @Schema(description = "카드 상세 정보")
            private TarotCard cardInfo; // Embedding full card info for frontend convenience
      }

      @Getter
      @Setter
      @Builder
      @Schema(description = "3카드 스프레드 응답 객체")
      public static class ThreeCardSpreadResponse {
            @Schema(description = "세션 ID")
            private Long sessionId;

            @Schema(description = "뽑힌 카드 목록 (3장)")
            private List<DrawnCardDto> cards;

            @Schema(description = "AI 타로 해석")
            private String aiReading;

            @Schema(description = "생성 일시")
            private LocalDateTime createdAt;

            @Schema(description = "공유용 UUID")
            private String shareUuid;
      }

      @Getter
      @Setter
      @Builder
      @Schema(description = "히스토리 응답 객체 (목록 조회용)")
      public static class HistoryResponse {
            @Schema(description = "세션 ID")
            private Long sessionId;

            @Schema(description = "질문 내용")
            private String question;

            @Schema(description = "스프레드 타입 (THREE_CARD 등)")
            private String spreadType; // Description

            @Schema(description = "생성 일시")
            private LocalDateTime createdAt;

            @Schema(description = "리딩 요약 (첫 50자)")
            private String summarySnippet; // First 50 chars of reading

            @Schema(description = "공유용 UUID")
            private String shareUuid;
      }

      @Getter
      @Setter
      @Builder
      @Schema(description = "오늘의 카드 응답 객체")
      public static class DailyCardResponse {
            @Schema(description = "세션 ID")
            private Long sessionId;

            @Schema(description = "뽑힌 카드 정보 (1장)")
            private DrawnCardDto card;

            @Schema(description = "AI 타로 해석")
            private String aiReading;

            @Schema(description = "생성 일시")
            private LocalDateTime createdAt;

            @Schema(description = "공유용 UUID")
            private String shareUuid;
      }

      @Getter
      @Setter
      @Builder
      @Schema(description = "공유된 타로 리딩 응답 객체")
      public static class ShareResponse {
            @Schema(description = "스프레드 타입 (DAILY_ONE, THREE_CARD)")
            private String spreadType;

            @Schema(description = "사용자 질문")
            private String question;

            @Schema(description = "사용자 이름 (익명일 경우 'Mystic Guest')")
            private String userName;

            @Schema(description = "생성 일시")
            private LocalDateTime createdAt;

            @Schema(description = "AI 리딩 결과")
            private String aiReading;

            @Schema(description = "카드 목록")
            private List<DrawnCardDto> cards;
      }

      @Getter
      @Setter
      @io.swagger.v3.oas.annotations.media.Schema(description = "게스트 데이터 이관 요청")
      public static class MigrateRequest {
            @io.swagger.v3.oas.annotations.media.Schema(description = "로컬 스토리지의 세션 ID 목록")
            private List<Long> sessionIds;
      }
}
