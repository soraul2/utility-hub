🚀 AI 협업 표준 가이드 – Backend Edition
(Perplexity + Gemini + Claude + Spring Boot + Spring AI)

이 가이드는 Perplexity의 설계/검수 능력, Gemini(Antigravity)의 에이전틱 구현 능력, Claude의 리팩터링/문서화 능력을 결합하여,
**Spring Boot 기반 백엔드(API & Spring AI 연동)**에서 일관된 고퀄리티를 달성하기 위한 협업 헌법이다.

[!NOTE]
이 문서는 백엔드 협업의 Single Source of Truth이다.
API 설계나 에러 처리, 테스트 전략에 모호함이 생길 때마다 이 문서를 기준으로 판단한다.

1. 👥 AI 모델별 백엔드 역할 (R&R)
text
graph TD
    P[Perplexity<br>Backend Architect & QA] -->|설계/규칙| G[Gemini<br>Backend Builder]
    G -->|코드 구현| P
    P -->|검증/피드백| G
    G -.->|복잡한 모듈/리팩터링| C[Claude<br>Refiner]
    C -.->|구조 개선/문서화| G
    P -.->|백엔드 문서화 요청| C
Role	Model	Backend Description	Key Backend Artifacts
Backend Architect & QA
(Control Tower)	Perplexity	- 설계 주도: API 스펙, 예외/에러 규칙, 패키지 구조 설계
- 규칙 관리: 백엔드 협업 헌법/보안 체크리스트 관리
- 품질 보증: 구현 코드 리뷰, 테스트/보안 점검	design_spec_backend.md
collaborations_rule_backend.md
checklist_security_backend.md
Backend Main Builder
(Spring Specialist)	Gemini
(Antigravity)	- Spring Boot 구현: Controller/Service/Config/Entity/Repo 개발
- Spring AI 연동: ChatClient 설정, 프롬프트 적용, 예외 변환 로직 구현
- 상태 추적: implementation_plan.md, walkthrough_backend.md 관리	Backend Source Code
implementation_plan.md
walkthrough_backend.md
Refiner & Editor
(Polisher)	Claude	- 리팩터링: 서비스/도메인 구조 개선, 중복 제거, 테스트 보강
- 문서화: API 명세 정리, README_backend, 설계 vs 구현 차이 정리
- 안전 리팩터링: 외부 동작을 바꾸지 않는 구조 개선	Refactored Backend Modules
Technical Docs
2. 🔄 Backend Collaboration Loop
(설계–구현–검증 파이프라인: API & Spring AI 중심)

백엔드에서는 [설계(Perplexity) → 구현(Gemini) → 검증(Perplexity) → 리팩터링(Claude)] 루프를 엄격히 따른다.

Step 1. [Design] API & Domain Blueprint (by Perplexity)
Action: 코드 작성 전, 반드시 API 스펙과 도메인 규칙을 먼저 확정한다.

엔드포인트, Request/Response JSON 스키마

에러 코드/메시지 포맷

Spring 패키지 구조, 레이어 구조(Controller/Service/Global Error)

Prompt 예시

“TextToMd 백엔드를 Spring Boot + Spring AI로 만들고 싶어.
design_spec_backend.md, checklist_security_backend.md를 작성해줘.
엔드포인트, DTO 구조, 예외/에러 규칙, 패키지 구조까지 포함해서.”

Outcome

design_spec_backend.md : API/도메인/프롬프트 설계

checklist_security_backend.md : 입력 검증, 보안/로깅, Spring AI 안정성 규칙

collaborations_rule_backend.md : 백엔드 협업 프로세스

[!IMPORTANT]
백엔드에서는 특히

예외 처리(Error Handling)

입력 검증(Validation)

에러 응답 포맷(공통 JSON 구조)
을 설계 단계에서 고정해야, 프론트/백엔드가 같은 계약을 공유할 수 있다.

Step 2. [Build] Spring Boot Implementation (by Gemini / Antigravity)
Action: 설계서를 기준으로 backend/ 디렉토리 내에서 Spring Boot 코드를 구현한다.

Backend Agentic Workflow (가정)

🤖 Coding Agent: Controller, Service, Config, Spring AI 연동 구현

🧪 Testing Agent: Unit/Integration Test 작성 및 실행 (mvn test)

📝 Doc Agent: walkthrough_backend.md, Swagger/OpenAPI 코멘트 업데이트

Workflow

Planning – implementation_plan.md

design_spec_backend.md를 읽고 구현 단계를 정리

패키지/클래스/테스트 파일 목록, 작업 순서 정리

Execution – 코드 구현

com.wootae.utilityhub.domain.text2md 구조에 맞추어 코드 작성

Spring AI ChatClient 설정, 프롬프트/예외 변환 로직 구현

Verification – 테스트 + 문서 기록

./mvnw test, ./mvnw package 실행

결과와 특이사항을 walkthrough_backend.md에 요약

Step 3. [Review] Backend QA & Spec Alignment (by Perplexity)
Action: 구현된 백엔드 코드를 Perplexity에 제공하고,

설계서(design_spec_backend.md)

보안 체크리스트(checklist_security_backend.md)
와의 일치 여부를 검증받는다.

Prompt 예시

“이 Spring Boot 백엔드 코드가 design_spec_backend.md와 checklist_security_backend.md를 잘 지키고 있는지 리뷰해줘.
API 스펙, 에러 응답 포맷, 입력 검증, Spring AI 예외 처리 중심으로 체크해줘.”

Output

위반 사항 리스트

수정 제안 (예: 누락된 검증, 잘못된 에러 코드, 로그에 rawText 전체 노출 등)

Step 4. [Refine] Safe Refactoring & Docs (by Claude)
Action: 검증이 끝난 코드를 Claude에게 넘겨,

구조 개선,

중복 제거,

테스트 보강,

문서화
작업을 맡긴다.

원칙

외부 동작(엔드포인트, JSON 스키마, 에러 코드/메시지)을 절대 바꾸지 않는 안전 리팩터링을 기본으로 한다.

설계 변경이 필요하다면 Perplexity가 design_spec_backend.md를 먼저 업데이트하고, 그 후 구현에 반영한다.

3. 🏛️ Backend Architecture & Code Style
백엔드(Spring Boot) 전용으로 항상 지켜야 할 코드/설계 규칙들이다.

3.1 아키텍처 레벨
Layered Architecture

Controller (Web/API 레이어)

Service (도메인/비즈니스 로직)

(필요 시) Repository (DB 액세스)

Global Error/Config(Security, AI 등)는 global 패키지에서 공통 관리

패키지 예시

com.wootae.utilityhub.domain.text2md.controller

com.wootae.utilityhub.domain.text2md.service

com.wootae.utilityhub.domain.text2md.dto

com.wootae.utilityhub.domain.text2md.config

com.wootae.utilityhub.global.error

3.2 Naming & Lombok
Java:

클래스: PascalCase (TextToMdService, TextToMdController)

변수/메서드: camelCase (rawText, buildPrompt)

Lombok:

DTO: @Getter, @Setter

Service/Controller 의존성: @RequiredArgsConstructor + private final 필드로 생성자 주입

4. 🛡️ Backend Error Handling, Security, Testing 정책
4.1 Error Handling & API 응답 포맷
공통 에러 포맷:

{ "code": "TEXT_001", "message": "변환할 텍스트가 비어 있거나 너무 깁니다." }

ErrorCode enum + BusinessException + GlobalExceptionHandler 구조로 예외 통합 관리.
​

Spring AI 예외는 AI_PROVIDER_ERROR, AI_TIMEOUT 등으로 매핑하여 클라이언트에 노출.

4.2 Security & Logging
Secret(API 키, 토큰 등)는 .env 또는 외부 설정으로만 관리, 깃에 커밋 금지.

로그에는 rawText 전체를 남기지 않고, 최대 N자까지만 잘라 기록하거나 요청 ID만 남기는 방식 사용.

필요 시 CORS, 인증/인가(Spring Security) 설정은 SecurityConfig에서 일관 관리.

4.3 Testing Policy (Spring Boot)
단위 테스트

주요 서비스 메서드 (TextToMdService.convert, validateRequest, buildPrompt)에 대해 정상/에러 케이스 테스트.

통합 테스트

/api/text-to-md에 대해 WebMvcTest 또는 SpringBootTest 기반 통합 테스트 작성.

배포 전 필수

./mvnw test, ./mvnw package 모두 성공해야 CI/CD가 배포 단계를 진행.
​

5. 📊 Backend Metrics & Evaluation
Metric	Backend Description	Goal
Bug Recurrence	동일한 API/도메인 버그 재발 횟수	0회 (발생 시 설계/체크리스트 업데이트)
API Contract Drift	설계서와 실제 API 스펙이 불일치하는 경우	0회 유지, 발생 시 즉시 design_spec 수정
Test Coverage	핵심 Service/Domain 로직 커버리지	80% 이상 권장
Build Stability	CI에서 backend build/test 실패 비율	점진적 감소
6. 🗣️ Backend Prompting Tips (Spring AI & API 설계용)
백엔드 관련 프롬프트에서는 구체적인 클래스/메서드/패키지명을 포함해서 요청하는 것이 좋다.

Bad Prompt ❌	Good Prompt ✅	Effect
"백엔드 만들어줘"	"POST /api/text-to-md 엔드포인트와 TextToMdService 구현을 설계서대로 만들어줘."	범위/대상 명확화
"AI 붙여줘"	"TextToMdService에서 Spring AI ChatClient를 사용해 프롬프트로 마크다운을 생성하는 callAi 메서드를 구현해줘."	Spring AI 사용 위치 명시
"에러 처리 알아서"	"BusinessException + ErrorCode + GlobalExceptionHandler 구조로 예외를 처리해줘. TEXT_001, AI_001 코드를 반드시 사용해."	에러 처리 패턴 고정
[!TIP]
백엔드에서는 특히 **“어떤 클래스/메서드에 무엇을 추가할지”**와
**“어떤 에러 코드/DTO를 사용할지”**를 프롬프트에 명시해 주면,
제미나이·클로드가 설계서와 정확히 맞는 코드를 생성하기 쉽다.

7. 📅 Backend Daily Routine
🌅 Morning (Design Sync)

Perplexity와 오늘 수정/추가할 API 스펙/도메인 규칙을 정리 (design_spec_backend.md 업데이트 여부 포함).

☀️ Day (Implement)

Gemini와 함께 Spring Boot/Spring AI 코드 구현 + 테스트 (mvn test).

🌇 Afternoon (Review)

Perplexity로 설계 준수/보안/테스트 결과 점검.

🌙 Evening (Refine)

Claude에게 복잡한 서비스/도메인 리팩터링 및 문서 정리를 맡김.

[!WARNING]
설계/API 변경이 필요하면 코드부터 고치지 않는다.
항상 Perplexity와 함께 design_spec_backend.md를 먼저 수정하고,
그 변경을 기준으로 Gemini가 코드를 업데이트한다.
설계와 코드가 어긋나는 순간부터 프론트–백엔드 협업 비용이 폭발한다.

