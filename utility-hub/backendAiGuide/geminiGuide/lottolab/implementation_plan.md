# Implementation Plan - Lotto Market v2 Backend

이 문서는 **Perplexity의 설계서(`design_spec_backend.md`)**와 **보안 체크리스트(`checklist_security_backend.md`)**를 기반으로, **Gemini 팀**이 수행할 구체적인 구현 계획입니다.

## 🎯 목표
Spring Boot 3.5.10, JDK 21, Spring Security, JWT, Spring AI를 사용하여 **Lotto Market v2**의 견고한 백엔드를 구축합니다.

## ⚠️ User Review Required (중요 확인 사항)
> [!IMPORTANT]
> **.env / application.yml 보안 설정**:
> OAuth2 Client ID/Secret, JWT Secret Key는 절대 깃허브에 커밋되지 않도록 `.env` 파일로 관리하거나 환경 변수로 주입해야 합니다. 로컬 개발 시 `application-local.yml` 또는 `.env` 파일이 준비되었는지 확인해주세요.

## 📋 Proposed Changes (구현 단계)

### Phase 1: Project Skeleton & Configuration (기반 다지기)
프로젝트의 기본 구조를 잡고 공통 설정을 적용합니다.

#### [NEW] `com.wootae.backend.global.config`
- `SwaggerConfig.java`: API 문서화를 위한 Swagger/OpenAPI 설정.
- `SecurityConfig.java`: Spring Security 체인 설정 (CSRF disable, CORS 설정, Session Stateless, URL별 권한 설정).
- `CorsConfig.java`: `design_spec`에 정의된 출처(localhost:3000 등) 허용.

#### [NEW] `com.wootae.backend.global.error`
- `ErrorCode.java` (Enum): 설계서에 정의된 에러 코드(`AUTH_UNAUTHORIZED`, `TEXT_001` 등) 구현.
- `BusinessException.java`: RuntimeException을 상속받는 커스텀 예외.
- `GlobalExceptionHandler.java`: `@RestControllerAdvice`를 사용하여 모든 예외를 `ErrorResponse` 포맷으로 통일하여 반환.
- `ErrorResponse.java`: `{ status, errorCode, message, timestamp }` 포맷의 DTO.

### Phase 2: Authentication & User Module (인증/인가)
OAuth2 소셜 로그인과 JWT 발급/검증 로직을 구현합니다.

#### [NEW] `com.wootae.backend.global.auth`
- `JwtTokenService.java`: JWT 생성(Access/Refresh), 검증, 파싱 로직. (HmacSHA256)
- `JwtAuthenticationFilter.java`: 요청 헤더의 `Authorization: Bearer` 토큰 검증 필터.
- `OAuthAttributesExtractor.java`: 네이버/구글 유저 정보 표준화 추출기.
- `CustomOAuth2UserService.java`: 소셜 로그인 성공 시 승인 처리 및 유저 정보 로드.
- `OAuth2AuthenticationSuccessHandler.java`: 로그인 성공 후 JWT 발급 및 리다이렉트 처리.

#### [NEW] `com.wootae.backend.lotto.entity` (User)
- `User.java`: 사용자 엔티티 (`u_id`, `email`, `nickname`, `role`, `provider`, `refreshToken`).

#### [NEW] `com.wootae.backend.lotto.controller` (Auth)
- `UserController.java`: `/api/user/me` (내 정보 조회, 탈퇴).

### Phase 3: Lotto Domain - Rules & Generation (핵심 비즈니스)
로또 규칙 관리와 번호 생성 로직을 구현합니다.

#### [NEW] `com.wootae.backend.lotto.entity` (Domain)
- `LottoRule.java`: 규칙 정의 엔티티 (`type`, `name`, `script`, `parameters`).
- `LottoSimulationStats.java`: 시뮬레이션 결과 통계 엔티티.
- `LottoDraw.java`: 로또 회차별 당첨 번호 데이터.

#### [NEW] `com.wootae.backend.lotto.repository`
- `LottoRuleRepository.java`, `LottoSimulationStatsRepository.java`, `UserRepository.java`, `LottoDrawRepository.java`.

#### [NEW] `com.wootae.backend.lotto.service`
- `LottoRuleService.java`: 규칙 목록 조회, 상세 조회 (`/api/rules/**`).
- `LottoGenerateService.java`: 규칙 기반 번호 생성 로직 (`/api/rules/{id}/generate`).
    - *Note*: 실제 번호 생성 알고리즘은 설계서의 "파라미터"를 해석하여 구현.

#### [NEW] `com.wootae.backend.lotto.controller` (Business)
- `LottoRuleController.java`: 규칙 관련 API 엔드포인트.
- `LottoGenerateController.java`: 번호 생성 API 엔드포인트.

### Phase 4: Spring AI Integration (AI 기능)
규칙에 대한 AI 설명 기능을 구현합니다.

#### [NEW] `com.wootae.backend.lotto.service`
- `LottoAiService.java`: `ChatClient`를 주입받아 프롬프트 생성 및 AI 응답 처리.
    - 프롬프트 템플릿: "이 로또 규칙(ID: {id}, 특성: {type})에 대해 설명해줘..."

#### [NEW] `com.wootae.backend.lotto.controller`
- `LottoAiController.java`: `/api/ai/rule-explain` 엔드포인트.

### Phase 5: Verification & Testing (검증)
구현된 기능의 안정성을 검증합니다.

#### [TEST] Unit & Integration Tests
- `JwtTokenServiceTest.java`: 토큰 생성/검증 단위 테스트.
- `LottoRuleControllerTest.java`: API 입출력 및 예외 처리 통합 테스트 (`@WebMvcTest`).
- `LottoGenerateServiceTest.java`: 번호 생성 로직 검증.

## ✅ Verification Plan (검증 계획)

### Automated Tests
- `./mvnw test` 명령어로 전체 테스트 스위트 실행.
    - **Goal**: Build Success & All Tests Passed.
- 핵심 API (`/api/user/me`, `/api/rules`, `/api/generate`)에 대한 MockMvc 테스트 통과 확인.

### Manual Verification
- **Swagger UI** (`/swagger-ui.html`) 접속하여 API 호출 테스트.
- **Postman**을 사용하여:
    1. OAuth2 로그인 시도 -> 리다이렉트 확인.
    2. 발급받은 JWT로 API 요청 (`Authorization` 헤더) -> 200 OK 확인.
    3. 유효하지 않은 토큰으로 요청 -> 401 Unauthorized 및 정의된 JSON 에러 응답 확인.
