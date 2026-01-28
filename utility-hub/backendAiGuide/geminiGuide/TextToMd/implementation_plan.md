# Implementation Plan - Utility Hub Backend (TextToMd)

이 문서는 `design_spec_backend.md`를 바탕으로 **TextToMd 백엔드 API**를 구현하기 위한 제미나이(Gemini) 팀의 계획서입니다.

## User Review Required

> [!IMPORTANT]
> - **Spring AI 의존성**: 프로젝트에 `spring-ai-starter` 관련 의존성이 `pom.xml`에 추가되어 있어야 합니다.
> - **API Key**: `.env` 또는 `application.properties`에 OpenAI/LLM API 키 설정이 필요합니다. (보안상 커밋 제외)

## Proposed Changes

### Backend Structure (`com.wootae.backend`)

#### [NEW] [TextToMdDTO.java](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/domain/text2md/dto/TextToMdDTO.java)
- `Request`: `rawText`, `autoHeading`, `autoList`, **`persona`** (New)
- `Response`: `markdownText`, `model`, `tokensUsed`
- **`Enum Persona`**: `STANDARD`, `SMART`, `DRY`, `ACADEMIC`, `CASUAL`, `TECHNICAL`, `CREATIVE`, `MINIMAL`, `DETAILED`, `BUSINESS`

#### [NEW] [TextToMdService.java](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/domain/text2md/service/TextToMdService.java)
- `validateRequest()`: 입력값 검증 (null check, length limit)
- `buildPrompt()`: **Multi-Persona Switch Logic** 구현 (10 Types)
    - `buildStandardPrompt()`: 표준 (이모지 금지)
    - `buildSmartPrompt()`: 스마트 비서
    - `buildDryPrompt()`: 건조/팩트
    - `buildAcademicPrompt()`: 학술
    - `buildCasualPrompt()`: 캐주얼
    - `buildTechnicalPrompt()`: 기술
    - `buildCreativePrompt()`: 창의
    - `buildMinimalPrompt()`: 미니멀
    - `buildDetailedPrompt()`: 상세
    - `buildBusinessPrompt()`: 비즈니스
- `callAi()`: Spring AI `ChatClient` 호출 및 예외 처리
- `convert()`: 메인 비즈니스 로직

#### [NEW] [TextToMdController.java](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/domain/text2md/controller/TextToMdController.java)
- `POST /api/text-to-md`: 엔드포인트 구현 (CORS 허용)
- OpenAPI(Swagger) 어노테이션 적용

#### [NEW] [Global Error Handling](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/global/error/)
- `ErrorCode.java`: `TEXT_001`, `AI_001` 등 정의
- `BusinessException.java`: RuntimeException 상속
- `GlobalExceptionHandler.java`: `@RestControllerAdvice`로 공통 포맷 응답

### Configuration

#### [MODIFY] [application.properties](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/resources/application.properties)
- Spring AI 설정 (Timeout, Key referencing)
- Logging level 설정

## Verification Plan

### Automated Tests
- **Unit Test**: `TextToMdServiceTest`
- **Integration Test**: `TextToMdControllerTest`

### Manual Verification
- **Swagger UI** (`/swagger-ui.html`): API 기본 테스트
- **[NEW] `simple_test.html`**:
    - 프론트엔드 연동 전 `Persona`별 출력 결과(Smart vs Dry)를 즉시 시각적으로 검증하기 위한 테스트 도구.
