TextToMd Full Spec – Backend & Frontend v0.3.x
0. Overview
도메인 이름: TextToMd (텍스트 → Markdown 변환 도구)

목표

일반 텍스트를 로컬 규칙 또는 LLM을 활용해 예쁘고 구조화된 Markdown으로 변환한다.
​

프론트엔드에서 로컬 변환 모드 + AI 변환 모드 + 10가지 Persona를 지원하고, 모델/토큰 정보 및 에러 상황을 명확히 보여준다.

버전

Backend: backend-text2md v0.3.0

Frontend: text2md-frontend v0.3.x

Single Source of Truth

이 문서는 TextToMd 도메인의 상위 스펙이며, 아래 문서들을 요약·통합한다:

design_spec_backend.md, checklist_security_backend.md, collaborations_rule_backend.md
​

design_spec_front_text2md.md, checklist_security_front_v0.3_text2md.md, collaborations_rule_front_v0.3_text2md.md

1. 시스템 개요
1.1 주요 시나리오
사용자는 /tools/text-to-md 페이지에서 긴 텍스트를 입력한다.
​

모드를 선택한다:

로컬(Local): 브라우저에서 단순 규칙(autoHeading, autoList)으로 Markdown 변환.

AI(AI): 백엔드 /api/text-to-md 호출, Persona에 맞는 Markdown 생성.
​

결과 패널에서 변환된 Markdown을 확인하고, 복사하거나 .md 파일로 다운로드한다.
​

AI 모드에서는 사용된 모델명과 토큰 수, 에러 코드에 따른 상황별 메시지, “Thinking” 상태를 확인할 수 있다.

1.2 기술 스택
Backend: Java 21, Spring Boot 3.5.x, Spring Web, Spring AI 1.1.x (ChatClient), Lombok, springdoc-openapi.
​

Frontend: Vite, React, TypeScript, Tailwind CSS, Apple 스타일 Glassmorphism UI.
​

2. 백엔드 스펙 (요약)
2.1 패키지 구조
루트: com.wootae.utilityhub

domain.text2md.controller.TextToMdController

domain.text2md.service.TextToMdService

domain.text2md.dto.TextToMdDTO (Request, Response, Persona enum)

global.error.{ErrorCode,BusinessException,GlobalExceptionHandler}
​

2.2 API 계약
Endpoint: POST /api/text-to-md

Request DTO

java
public static class Request {
  private String rawText;
  private boolean autoHeading;
  private boolean autoList;
  private Persona persona = Persona.STANDARD;
}
Persona Enum
STANDARD, SMART, DRY, ACADEMIC, CASUAL, TECHNICAL, CREATIVE, MINIMAL, DETAILED, BUSINESS
​

Response DTO

java
public static class Response {
  private String markdownText;
  private String model;      // 예: "gemini-2.0-flash-exp"
  private Integer tokensUsed;
}
Error Response (공통)

json
{
  "code": "TEXT_001",
  "message": "변환할 텍스트가 비어 있거나 너무 깁니다."
}
주요 에러 코드 (ErrorCode)

TEXT_001 – INVALID_TEXT_INPUT (400)

AI_001 – AI_PROVIDER_ERROR (502)

AI_002 – AI_TIMEOUT (504, 선택)

PERSONA_001 – INVALID_PERSONA (400, 선택)
​

2.3 서비스 & AI 연동
TextToMdService.convert(Request)

validateRequest → buildPrompt(Persona별 프롬프트) → callAi(Spring AI ChatClient).
​

buildPrompt

Persona에 따라 buildSmartPrompt, buildDryPrompt 등으로 분기.
​

callAi

ChatClient Fluent API 사용, 예외 발생 시 BusinessException(AI_PROVIDER_ERROR)로 래핑.
​

2.4 백엔드 체크리스트 포인트
rawText null/공백/최대 길이(예: 10,000자) 검증.
​

Persona null → STANDARD 처리, 잘못된 값 → 400.
​

에러 응답 { code, message } 이외 내부 정보 노출 금지.

원문 전체를 로그에 남기지 않고, 필요 시 일부만 로깅.
​

3. 프론트엔드 스펙 (요약)
3.1 라우트 & 구조
라우트: /tools/text-to-md

주요 구조

TextToMd.tsx – 페이지 컨테이너

ModeToggle, PersonaSelector, EditorLayout, ThinkingIndicator 컴포넌트.
​

useTextToMd, useTextToMdAi 훅.

textToMd.ts (로컬 변환), textToMdApi.ts (백엔드 호출), errorMapper.ts.

유틸: clipboard.ts, fileDownload.ts, (선택) useLocalStorage.ts.
​

3.2 상태 모델
ts
type TextToMdMode = "local" | "ai";

interface TextToMdOptions {
  autoHeading: boolean;
  autoList: boolean;
}

type Persona = /* 10개 Enum 문자열 */;

interface TextToMdState {
  mode: TextToMdMode;
  rawText: string;
  options: TextToMdOptions;
  persona: Persona;
  markdownText: string;
  isLoading: boolean;
  errorMessage?: string;
  inputErrorMessage?: string;
  model?: string;
  tokensUsed?: number;
  retryCount: number;
}
3.3 UI / UX 요약
“큰 에디터” 레이아웃

좌: 입력 카드(큰 Textarea + 옵션 + 입력 에러).

우: 출력 카드(Markdown 미리보기 + 모델/토큰 + 복사/다운로드).

모드 토글

Local: 로컬 변환 버튼, AI 관련 UI 비활성.

AI: Persona 선택, ThinkingIndicator, 모델/토큰 표시 활성.
​

에러 UX

TEXT_001: 입력 영역 아래에 에러 메시지.

AI_001, AI_002, PERSONA_001 등: 상단 Alert로 표시.
​

Thinking 상태

AI 호출 중 “구조 분석 중…”, “다듬는 중…” 등 메시지를 순환 표시.
​

4. 프론트–백 계약 (요약 테이블)
항목	백엔드	프론트
URL	POST /api/text-to-md	textToMdApi.ts에서 fetch/axios 호출
Request	{ rawText, autoHeading, autoList, persona }	TextToMdState → Request 변환
Persona 기본값	STANDARD	UI 초기값 및 null 방지 처리
Success Response	{ markdownText, model, tokensUsed }	결과 패널 + 메타데이터 표시
Error Response	{ code, message }	errorMapper로 메시지 변환 후 UX 분기
TEXT_001	입력 검증 오류	입력 영역 아래 메시지
AI_001/AI_002	AI 오류/타임아웃	상단 Alert, 재시도 안내
PERSONA_001	잘못된 Persona	Alert, Persona 선택 유도
5. 에러 처리 & 재시도 전략
5.1 에러 코드 매핑
errorMapper.ts

mapErrorCodeToMessage(code, defaultMessage)로 변환.
​

주요 코드:

TEXT_001, AI_001, AI_002, PERSONA_001.

5.2 프론트 상태 반영
TEXT_001 → inputErrorMessage (Textarea 아래).
​

기타 코드 → errorMessage (상단 Alert).

네트워크 오류 → “네트워크 오류” 메시지 + 재시도 버튼 or 안내.
​

5.3 재시도 로직 (AI 모드)
useTextToMdAi에서:

useRef로 retryCountRef 관리.
​

필요 시 간단한 backoff(예: 1초 간격, 최대 n회).

UI에 재시도 횟수(선택)를 표시.

6. 저장소 & 보안
로컬스토리지

마지막 모드(local/ai), Persona, 옵션(autoHeading/autoList)만 저장.
​

원본 텍스트는 기본적으로 저장하지 않음.

민감 정보

API 키, 토큰, 계정 정보는 프론트에 존재하지 않는다.

백엔드에서는 rawText 전체를 로그에 남기지 않고, 필요 시 일부만 기록.
​

7. 테스트 & 검증 플랜
7.1 자동 테스트
백엔드

TextToMdService.validateRequest 정상/에러 케이스.
​

Persona별 프롬프트 생성 테스트.

프론트

textToMd.ts 로컬 변환 유닛 테스트.

useTextToMdAi 상태/에러/재시도 테스트.

errorMapper 코드 → 메시지 매핑 테스트.
​

7.2 수동 시나리오
Local 모드

긴 텍스트 입력 → 로컬 변환 → 결과 확인.

AI 모드

10 Persona 각각에 대해 변환 → 스타일 차이 육안 확인.
​

모델/토큰 정보 표시 확인.

에러 시나리오

빈 텍스트 → TEXT_001 에러 UX 확인.

네트워크 차단 → 재시도 동작 및 메시지 확인.

AI 서비스 오류 → AI_001 메시지 확인.

8. 협업 & 버전 관리
8.1 R&R 요약
Perplexity

스펙/체크리스트/협업 규칙 관리, 최종 QA.

Gemini

구현 + Implementation/Task 문서 관리.

Claude

Safe Refactoring + Walkthrough/Refactoring 문서 정리.
​

8.2 문서 버전
Backend

v0.1: 기본 API

v0.2.x: Smart Assistant 단일 Persona

v0.3.0: 10 Persona, persona 필드, 모델/토큰 메타데이터.
​

Frontend

v0.2: 로컬 TextToMd, 작은 입력 영역.
​

v0.3.x: Local/AI 모드, 큰 에디터, Persona/Thinking, 에러/메타데이터 UX, 리팩토링 완료.