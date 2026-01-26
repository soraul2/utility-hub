# Backend Architecture & Handover Guide

> **To. Claude Team**
> 이 문서는 `Utility Hub`의 **TextToMd(텍스트 마크다운 변환)** 백엔드 서비스의 현재 구조와 구현 로직, 그리고 향후 리팩토링 포인트를 설명합니다.

## 1. Project Overview
- **Stack**: Java 21, Spring Boot 3.5.x, Gradle
- **AI Model**: Google Gemini (via `spring-ai-google-genai` 1.1.2)
- **Key Feature**: `TextToMdService` converts raw text into structured Markdown with 3 distinct personas.

## 2. Package Structure (`com.wootae.backend`)
```
backend/
├── content/               # (Optional) Future content domain
├── domain/
│   └── text2md/
│       ├── controller/    # TextToMdController (REST API)
│       ├── dto/           # TextToMdDTO (Request/Response/Persona Enum)
│       └── service/       # TextToMdService (Core Logic & Prompts)
├── global/
│   ├── config/            # Swagger, CORS config
│   └── error/             # GlobalExceptionHandler, BusinessException
└── BackendApplication.java
```

## 3. Key Implementation Details

### 3.1. Multi-Persona Logic (`TextToMdService`)
현재 서비스는 `switch-case` 문을 사용하여 페르소나별 프롬프트를 생성합니다. (v0.3.0 기준 **10가지** 확장 완료)

- **STANDARD** (기본): 이모지 없음, 표준 마크다운.
- **SMART**: 친절한 AI 비서.
- **DRY**: 건조한 팩트 중심.
- **ACADEMIC/CASUAL/TECHNICAL/CREATIVE/MINIMAL/DETAILED/BUSINESS**: 각 목적에 특화된 프롬프트.

### 3.2. Response Cleaning
Gemini API 응답 시 JSON 문자열 내의 개행 문자(`\n`)가 이중으로 이스케이프되거나 리터럴로 들어오는 문제를 해결하기 위해 강력한 정제 로직이 포함되어 있습니다.
```java
// TextToMdService.java
markdown = markdown.replace("\\n", "\n"); 
markdown = markdown.replaceAll("\n{3,}", "\n\n"); // 과도한 공백 제거
```

## 4. Refactoring Suggestions (For Claude)

이 프로젝트를 이어받아 구조를 개선할 때 다음 포인트들을 우선적으로 고려해 주세요.

### 4.1. Strategy Pattern for Prompts
현재 `TextToMdService` 내부에 모든 프롬프트 생성 로직(`buildSmartPrompt`, `buildDryPrompt` 등)이 하드코딩되어 있습니다. 이를 **Strategy Pattern**으로 리팩토링하여 확장성을 높여주세요.

**As-Is:**
```java
switch (persona) {
    case SMART -> buildSmartPrompt(sb);
    case DRY -> buildDryPrompt(sb);
    ...
}
```

**To-Be (Suggestion):**
- `PromptStrategy` 인터페이스 생성
- `SmartPromptStrategy`, `DryPromptStrategy` 구현체 분리
- `TextToMdService`는 적절한 Strategy만 주입받아 사용

### 4.2. Prompt Externalization
프롬프트 텍스트가 자바 코드 안에 섞여 있어 관리가 어렵습니다. 이를 `prompts.yml`이나 별도의 리소스 파일로 분리하여 관리하는 방안을 검토해 주세요.

### 4.3. Error Handling
AI 모델 호출 실패(`ResourceExhausted` 등)에 대한 Retry 로직이 Spring AI 기본 설정에 의존하고 있습니다. 필요 시 `Resilience4j` 등을 도입하여 더 정교한 회복 탄력성을 확보해 주세요.

---
**Good Luck, Claude Team! 🚀**
