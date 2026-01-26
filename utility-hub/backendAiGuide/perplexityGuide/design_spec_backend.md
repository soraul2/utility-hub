
1) design_spec_backend.md (v0.3.0)
text
# design_spec_backend.md – Utility Hub Backend (TextToMd) v0.3.0

## 0. Overview

- 목적:
  - Utility Hub의 텍스트 → Markdown 도구에 대해, Spring Boot + Spring AI 기반 백엔드 API를 설계한다.
  - 프론트엔드에서 AI 모드를 사용할 때, 일관된 입력/출력/에러 포맷과 **10가지 페르소나(persona)** 를 제공한다.
- 범위:
  - TextToMd AI 변환 전용 백엔드 API (추후 다른 도메인으로 확장 가능).
  - 패키지 구조, 클래스/메서드 시그니처, 예외/에러 응답 규칙, Spring AI 사용 방식, Multi-Persona 프롬프트 설계.

- 기술 스택:
  - Java 21 + Spring Boot 3.5.x
  - Spring Web
  - Spring AI 1.1.x (ChatClient Fluent API)[web:186][web:187]
  - Lombok
  - springdoc-openapi (Swagger UI)
  - (선택) Spring Validation

이 설계서는 v0.3.0 기준이며,  
v0.1: 기본 TextToMd API 설계  
v0.2.x: Smart Assistant 기반 단일 페르소나 구현  
v0.3.0: **10 Persona 확장 + persona 필드 추가** 를 포함한다.

---

## 1. 패키지 구조

루트 패키지:

```text
com.wootae.utilityhub
├─ domain
│  └─ text2md
│     ├─ controller
│     │  └─ TextToMdController.java
│     ├─ service
│     │  └─ TextToMdService.java
│     ├─ dto
│     │  └─ TextToMdDTO.java  // static class Request, Response, enum Persona
│     └─ config
│        └─ TextToMdAiConfig.java  // Spring AI 관련 설정 (필요 시)
└─ global
   ├─ error
   │  ├─ ErrorCode.java
   │  ├─ BusinessException.java
   │  └─ GlobalExceptionHandler.java
   ├─ security
   │  └─ SecurityConfig.java (추후 인증/인가 도입 시)
   └─ util
      └─ (필요 시) 공용 유틸 클래스
실제 구현에서는 현재 com.wootae.backend 네임스페이스를 사용 중이며, 구조 원칙은 동일하다.

2. API 스펙
2.1 엔드포인트
POST /api/text-to-md

2.2 Request DTO
java
public class TextToMdDTO {

    @Getter
    @Setter
    public static class Request {

        @Schema(
            description = "마크다운으로 변환할 원본 텍스트",
            example = "안녕하세요.\n이 텍스트를 마크다운 형식으로 정리해 주세요."
        )
        private String rawText;

        @Schema(
            description = "첫 줄을 자동으로 H1 헤더로 처리할지 여부",
            example = "true"
        )
        private boolean autoHeading;

        @Schema(
            description = "각 줄을 자동으로 리스트로 변환할지 여부",
            example = "false"
        )
        private boolean autoList;

        @Schema(
            description = "마크다운 변환 스타일 (페르소나)",
            example = "STANDARD"
        )
        private Persona persona = Persona.STANDARD; // 기본값
    }

    public enum Persona {
        STANDARD,   // 표준 마크다운 (이모지 없음, 중립적)
        SMART,      // 친절한 AI 비서 (이모지, 요약 포함)
        DRY,        // 건조한 팩트 중심 (명사형 종결)
        ACADEMIC,   // 학술적 (인용 스타일, 섹션 번호)
        CASUAL,     // 캐주얼 (편안한 말투, 이모지 다수)
        TECHNICAL,  // 기술 문서 (코드 블록, 구조화)
        CREATIVE,   // 창의적 (감성적 표현, 비유)
        MINIMAL,    // 미니멀 (핵심만, 불렛 포인트)
        DETAILED,   // 상세 (단계별 설명, 예시)
        BUSINESS    // 비즈니스 (전문적, 액션 아이템)
    }
}
2.3 Response DTO
java
public class TextToMdDTO {

    @Getter
    @Setter
    public static class Response {

        @Schema(
            description = "LLM이 생성한 마크다운 텍스트",
            example = "# 안녕하세요\n\n- 이 텍스트를\n- 마크다운 형식으로\n- 정리했습니다."
        )
        private String markdownText;

        @Schema(description = "사용된 모델 이름 (선택)", example = "gemini-2.0-flash-exp")
        private String model;

        @Schema(description = "사용된 토큰 수 (선택)", example = "123")
        private Integer tokensUsed;
    }
}
2.4 에러 응답
공통 에러 응답 포맷:

json
{
  "code": "TEXT_001",
  "message": "변환할 텍스트가 비어 있거나 너무 깁니다."
}
code: 에러 식별용 코드 (프론트 분기용)

message: 사용자에게 그대로 노출 가능한 한국어 에러 메시지

(선택) INVALID_PERSONA (PERSONA_001) 추가 가능.

3. TextToMdService 설계
3.1 클래스 구조
java
@Service
@RequiredArgsConstructor
public class TextToMdService {

    private final ChatClient.Builder chatClientBuilder; // Spring AI ChatClient 빌더

    public TextToMdDTO.Response convert(TextToMdDTO.Request request) {
        validateRequest(request);
        String prompt = buildPrompt(request);
        String markdown = callAi(prompt);

        if (markdown != null) {
            markdown = markdown.replace("\\n", "\n")
                               .replace("\\r\\n", "\n")
                               .replaceAll("\n{3,}", "\n\n");
        }

        TextToMdDTO.Response response = new TextToMdDTO.Response();
        response.setMarkdownText(markdown);
        response.setModel("gemini-2.0-flash-exp");
        // tokensUsed는 추후 필요 시 채움
        return response;
    }

    private void validateRequest(TextToMdDTO.Request request) { ... }

    private String buildPrompt(TextToMdDTO.Request request) { ... }

    private String callAi(String promptText) { ... }
}
3.2 입력 검증 규칙
rawText:

null 또는 공백 문자열 → 에러코드 TEXT_001 (400)

최대 길이 제한 (예: 10,000자) 초과 → 에러코드 TEXT_001 (400)

persona:

null → Persona.STANDARD 기본값 처리

잘못된 문자열 값은 JSON 파싱 단계에서 400으로 실패 (스프링 변환 예외)

3.3 프롬프트 설계 (buildPrompt)
3.3.1 Multi-Persona 지원
persona 필드에 따라 다른 프롬프트를 생성한다.
현재 구현(v0.3.0)은 switch 문으로 10개 프롬프트 빌더 메서드를 호출한다.
추후 Strategy Pattern으로 분리 가능(별도 refactoring_guide 참고).

java
private String buildPrompt(TextToMdDTO.Request request) {
    StringBuilder sb = new StringBuilder();

    TextToMdDTO.Persona persona = request.getPersona();
    if (persona == null) {
        persona = TextToMdDTO.Persona.STANDARD;
    }

    switch (persona) {
        case SMART -> buildSmartPrompt(sb, request);
        case DRY -> buildDryPrompt(sb, request);
        case ACADEMIC -> buildAcademicPrompt(sb, request);
        case CASUAL -> buildCasualPrompt(sb, request);
        case TECHNICAL -> buildTechnicalPrompt(sb, request);
        case CREATIVE -> buildCreativePrompt(sb, request);
        case MINIMAL -> buildMinimalPrompt(sb, request);
        case DETAILED -> buildDetailedPrompt(sb, request);
        case BUSINESS -> buildBusinessPrompt(sb, request);
        default -> buildStandardPrompt(sb, request);
    }

    return sb.toString();
}
각 메서드는 해당 페르소나에 맞는 프롬프트를 생성한다:

STANDARD: 이모지 없음, 표준 마크다운, 중립적 어조.

SMART: 친절한 어조, 이모지 사용, 요약 포함.

DRY: 건조한 어조, 팩트 중심, 명사형 종결.

ACADEMIC: 학술적 어조, 인용 스타일, 섹션 번호.

CASUAL: 편안한 말투, 이모지 다수, 짧은 문장.

TECHNICAL: 코드 블록 강조, 기술 용어 유지, 구조화.

CREATIVE: 감성적 표현, 비유 사용, 문학적 구조.

MINIMAL: 핵심만 추출, 불렛 포인트 위주, 최소 설명.

DETAILED: 단계별 설명, 예시 포함, 주석 추가.

BUSINESS: 전문적 어조, 데이터 강조, 액션 아이템.

(추후) Strategy Pattern으로 분리 시, PromptStrategy 인터페이스 및 Persona별 구현 클래스로 위 로직을 이동한다.

4. Spring AI 연동 (callAi)
ChatClient 사용 패턴 (Fluent API):

java
private String callAi(String promptText) {
    try {
        ChatClient chatClient = chatClientBuilder.build();
        return chatClient
                .prompt()
                .user(promptText)
                .call()
                .content();
    } catch (Exception e) {
        log.error("AI Service Error", e);
        throw new BusinessException(ErrorCode.AI_PROVIDER_ERROR);
    }
}
필요 시:

chatClient.prompt().user(promptText).call().chatResponse() 를 사용해 모델 이름, 토큰 사용량 등 메타데이터 추출 가능.[web:186][web:199]

5. Controller 설계
java
@Tag(name = "Text to Markdown", description = "텍스트를 마크다운 형식으로 변환하는 API")
@RestController
@RequestMapping("/api/text-to-md")
@RequiredArgsConstructor
public class TextToMdController {

    private final TextToMdService textToMdService;

    @Operation(summary = "텍스트 → 마크다운 변환", description = "원본 텍스트를 AI를 사용해 마크다운 형식으로 변환합니다.")
    @PostMapping
    public ResponseEntity<TextToMdDTO.Response> convert(
            @RequestBody @Valid TextToMdDTO.Request request
    ) {
        TextToMdDTO.Response response = textToMdService.convert(request);
        return ResponseEntity.ok(response);
    }
}
Swagger UI: /swagger-ui/index.html 에서 확인 가능.

6. 프론트와의 계약
프론트엔드 요청:

POST /api/text-to-md

Body:

json
{
  "rawText": "string",
  "autoHeading": true,
  "autoList": false,
  "persona": "STANDARD"  // 선택, 미지정 시 STANDARD
}
persona 값:

"STANDARD" | "SMART" | "DRY" | "ACADEMIC" | "CASUAL" | "TECHNICAL" | "CREATIVE" | "MINIMAL" | "DETAILED" | "BUSINESS"

응답:

성공:

json
{
  "markdownText": "string",
  "model": "gemini-2.0-flash-exp",
  "tokensUsed": 123
}
실패:

json
{
  "code": "TEXT_001",
  "message": "변환할 텍스트가 비어 있거나 너무 깁니다."
}
7. Persona 사양 표
Persona	사용 시나리오	주요 특징
STANDARD	일반 문서 정리	이모지 없음, 표준 마크다운, 중립적 어조
SMART	학습 자료, 블로그	친절한 어조, 이모지 사용, 요약 포함
DRY	업무 보고서, 회의록	건조한 어조, 팩트 중심, 명사형 종결
ACADEMIC	논문, 연구 자료	학술적 어조, 인용 스타일, 섹션 번호
CASUAL	메모, 일상 기록	편안한 말투, 이모지 다수, 짧은 문장
TECHNICAL	개발 문서, API 명세	코드 블록 강조, 기술 용어 유지, 구조화
CREATIVE	스토리, 에세이	감성적 표현, 비유 사용, 문학적 구조
MINIMAL	빠른 스캔, 요약	핵심만 추출, 불렛 포인트 위주, 최소 설명
DETAILED	상세 가이드, 튜토리얼	단계별 설명, 예시 포함, 주석 추가
BUSINESS	제안서, 기획서	전문적 어조, 데이터 강조, 액션 아이템 중심
8. Testing & CI
단위 테스트:

TextToMdService.validateRequest 정상/에러 케이스.

buildPrompt 또는 Persona별 전략 로직이 persona에 따라 다른 프롬프트를 생성하는지 검증.

persona 필드 미지정 요청이 STANDARD로 처리되는지 테스트.

통합 테스트:

/api/text-to-md에 대해 각 페르소나로 요청 시 200 응답 및 서로 다른 출력 패턴을 검증.

CI:

백엔드 변경 시 ./mvnw test 또는 ./gradlew test, ./mvnw package 또는 ./gradlew build 모두 성공해야 배포 워크플로우 진행.[web:232][web:249][web:255]

text

***

## 2) `checklist_security_backend.md` (v0.3.0 반영)

```markdown
# checklist_security_backend.md – Utility Hub Backend (TextToMd) v0.3.0

본 체크리스트는 Utility Hub 백엔드(TextToMd API)의  
입력값 검증, 에러 처리, 보안/로깅, Spring AI 연동 안정성을 점검하기 위한 문서이다.

---

## 1. 입력값 검증 (Validation)

- [ ] `rawText`가 null 또는 공백일 때 `TEXT_001` 에러로 400 응답을 반환한다.
- [ ] `rawText` 길이에 상한(예: 10,000자)을 두고, 초과 시 `TEXT_001` 에러로 처리한다.
- [ ] JSON 파싱 오류(필드 타입 불일치 등)는 Spring 기본 400 응답 포맷 또는 공통 에러 핸들러로 정규화한다.
- [ ] `autoHeading`, `autoList`가 boolean이 아닐 경우 400 응답이 발생하며, 에러 메시지는 한국어로 짧고 명확하다.[web:232]
- [ ] `persona` 필드가 null일 경우 서버에서 `STANDARD`로 안전하게 기본값 처리한다.
- [ ] `persona` 필드에 잘못된 Enum 값이 입력될 경우 JSON 파싱 오류로 400 응답을 반환하고, 에러 메시지는 과도한 내부 정보를 노출하지 않는다.

---

## 2. 에러 처리 & 에러 응답 포맷

- [ ] 모든 비즈니스 예외는 `BusinessException` + `ErrorCode`를 통해 관리된다.
- [ ] `ErrorCode`에는 최소 다음 항목이 정의되어 있다:
  - [ ] `INVALID_TEXT_INPUT (TEXT_001, 400)`
  - [ ] `AI_PROVIDER_ERROR (AI_001, 502)`
  - [ ] (선택) `AI_TIMEOUT (AI_002, 504)`
  - [ ] (선택) `INVALID_PERSONA (PERSONA_001, 400)` – 지원하지 않는 페르소나 처리용
- [ ] `GlobalExceptionHandler`는 `BusinessException` 발생 시 JSON `{ code, message }` 형식으로 응답한다.
- [ ] 알 수 없는 예외(`Exception`) 발생 시 500 + 일반적인 메시지(예: “알 수 없는 오류가 발생했습니다.”)만 노출한다.
- [ ] 에러 응답에는 스택 트레이스, 내부 클래스명, SQL/시스템 정보 등 민감하거나 구현 세부 정보가 포함되지 않는다.[web:232][web:277]

---

## 3. Spring AI 연동 안정성

- [ ] Spring AI ChatClient 호출 시 예외를 적절히 캐치하여 `BusinessException(ErrorCode.AI_PROVIDER_ERROR)` 등으로 변환한다.[web:186][web:201]
- [ ] LLM 응답이 null 또는 비어 있을 경우, 안전한 기본값(빈 문자열 등) 또는 적절한 에러로 처리한다.
- [ ] AI 요청당 타임아웃 설정이 `application.properties`/`application.yml` 또는 클라이언트 설정에 명시되어 있다.
- [ ] ChatClient 설정(모델 이름, API 키 등)은 설정 파일/환경 변수에서 관리하고, 서비스 비즈니스 로직과 분리되어 있다.[web:186][web:232]

---

## 4. 보안 & 프라이버시

- [ ] OpenAI/LLM API 키는 환경 변수 또는 외부 설정(예: `.env`, `application.yml`)로 관리되며, 깃 저장소에 커밋되지 않는다.[web:231][web:232][web:271]
- [ ] 원본 텍스트(`rawText`) 전체를 평문 로그로 남기지 않는다.
  - [ ] 로그가 필요할 경우, 최대 N자(예: 200자)까지만 잘라서 저장하거나, 요청 ID만 남기고 본문은 저장하지 않는다.[web:233][web:236][web:242]
- [ ] API 통신은 운영 환경에서 HTTPS를 사용하는 것을 기본으로 한다.[web:232][web:277]
- [ ] 인증/인가 도입 시, `SecurityConfig`에서 `/api/text-to-md` 경로의 접근 정책을 명시한다.[web:230][web:229]
- [ ] CORS 정책은 프론트엔드 도메인(또는 개발용 localhost)에 맞춰 최소 권한으로 설정한다.

---

## 5. 레이트 리밋 & 리소스 보호 (옵션)

- [ ] TextToMd API에 대해 간단한 요청 제한(예: IP/사용자 기준 분당 N건) 정책을 정의했다.[web:234][web:237]
- [ ] 레이트 리밋 초과 시, HTTP 429 또는 적절한 상태코드와 함께 한국어 에러 메시지를 반환한다.
- [ ] 레이트 리밋/스로틀링 정책은 운영 환경의 LLM 요금/성능 특성에 맞게 튜닝 가능하게 설계되어 있다.

---

## 6. 로깅 & 모니터링

- [ ] TextToMd 요청에 대해 최소한 다음 항목을 로그로 남긴다:
  - [ ] 요청 ID 또는 트레이스 ID
  - [ ] 응답 시간(소요 시간)
  - [ ] 성공/실패 여부, 에러 코드
- [ ] 예외 발생 시, 서버 내부 로그에는 스택 트레이스를 남기되, 클라이언트에게는 간단한 메시지만 전달한다.
- [ ] 로그에는 PII/민감 데이터(예: 인증 토큰, API 키, 사용자의 상세 텍스트 내용)가 포함되지 않도록 필터링 또는 마스킹 규칙이 적용되어 있다.[web:233][web:236][web:242]
- [ ] 로그 레벨은 개발/운영 환경에 따라 적절히 조정된다 (DEBUG/INFO/WARN/ERROR).[web:232]

---

## 7. 문서 & 테스트

- [ ] Swagger(UI)에서 TextToMd API의 Request/Response/에러 응답 구조와 `persona` Enum이 확인 가능하다.[web:142][web:148]
- [ ] 단위 테스트:
  - [ ] `TextToMdService.validateRequest`에 대해 정상/에러 케이스 테스트가 존재한다.
  - [ ] 각 페르소나별 프롬프트 생성 로직에 대한 테스트가 존재한다.
  - [ ] `persona` 필드 없는 요청이 `STANDARD`로 처리되는지 검증한다.
- [ ] 통합 테스트:
  - [ ] `/api/text-to-md`에 대해 여러 페르소나로 요청 시 200 응답 및 서로 다른 출력 패턴을 검증한다.
- [ ] CI에서 백엔드 테스트와 빌드(`./mvnw test`+`./mvnw package` 또는 `./gradlew test`+`./gradlew build`)가 성공해야만 배포 워크플로우가 실행된다.[web:232][web:249][web:255]