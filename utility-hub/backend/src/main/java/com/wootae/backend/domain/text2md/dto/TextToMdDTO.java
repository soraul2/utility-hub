package com.wootae.backend.domain.text2md.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

public class TextToMdDTO {

      @Getter
      @Setter
      public static class Request {

            @Schema(description = "마크다운으로 변환할 원본 텍스트", example = "안녕하세요.\\n이 텍스트를 마크다운 형식으로 정리해 주세요.")
            // Validation delegated to Service to ensure TEXT_001 error code
            private String rawText;

            @Schema(description = "첫 줄을 자동으로 H1 헤더로 처리할지 여부", example = "true")
            private boolean autoHeading;

            @Schema(description = "각 줄을 자동으로 리스트로 변환할지 여부", example = "false")
            private boolean autoList;

            @Schema(description = "마크다운 변환 스타일 (페르소나)", example = "STANDARD")
            private Persona persona = Persona.STANDARD;
      }

      @Getter
      @Setter
      public static class Response {

            @Schema(description = "LLM이 생성한 마크다운 텍스트", example = "# 안녕하세요\\n\\n- 이 텍스트를\\n- 마크다운 형식으로\\n- 정리했습니다.")
            private String markdownText;

            @Schema(description = "사용된 모델 이름 (선택)", example = "gemini-pro")
            private String model;

            @Schema(description = "사용된 토큰 수 (선택)", example = "123")
            private Integer tokensUsed;
      }

      /**
       * 마크다운 변환 스타일 (페르소나)
       */
      public enum Persona {
            STANDARD, // 표준 마크다운 (이모지 없음, 중립적)
            SMART, // 친절한 AI 비서 (이모지, 요약 포함)
            DRY, // 건조한 팩트 중심 (명사형 종결)
            ACADEMIC, // 학술적 (인용 스타일, 섹션 번호)
            CASUAL, // 캐주얼 (편안한 말투, 이모지 다수)
            TECHNICAL, // 기술 문서 (코드 블록, 구조화)
            CREATIVE, // 창의적 (감성적 표현, 비유)
            MINIMAL, // 미니멀 (핵심만, 불렛 포인트)
            DETAILED, // 상세 (단계별 설명, 예시)
            BUSINESS // 비즈니스 (전문적, 액션 아이템)
      }
}
