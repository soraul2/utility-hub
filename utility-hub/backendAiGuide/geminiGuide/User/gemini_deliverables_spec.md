# Gemini 팀 작업 명세 및 산출물 가이드 (Based on Perplexity Design)

이 문서는 `collaborationGuide`와 `perplexityGuide`의 산출물(`design_spec_backend.md`, `backend_checklist_dev.md`)을 바탕으로 **Gemini(Antigravity) 팀**이 수행해야 할 구체적인 작업 내용과 제출해야 할 산출물을 정의합니다.

---

## 1. 개요 및 역할 (Role & Responsibility)

*   **Role**: **Backend Main Builder (Spring Boot 구현 및 Spring AI 연동)**
*   **책임**: Perplexity가 설계한 API 명세와 도메인 규칙을 바탕으로, 실제 동작하는 Spring Boot 애플리케이션을 구현하고 테스트합니다.
*   **목표**: `design_spec_backend.md`의 스펙을 100% 준수하는 무결점 백엔드 코드 작성.

---

## 2. 필수 산출물 (Deliverables)

Gemini 팀은 작업 과정에서 다음 4가지 핵심 산출물을 반드시 생성하고 유지 관리해야 합니다.

### 2.1. 구현 계획서 (`implementation_plan.md`)
*   **위치**: `<appDataDir>/brain/<conversation-id>/implementation_plan.md` 또는 `geminiGuide/User/implementation_plan.md` (프로젝트 규칙에 따름)
*   **내용**:
    *   Perplexity의 `design_spec_backend.md` 분석 결과
    *   생성할 패키지 및 클래스 목록 (Controller, Service, Repository, DTO 등)
    *   작업 단계별 순서 (Scaffolding -> Domain -> Security -> API -> Test)
    *   제약 사항 및 의존성 확인

### 2.2. 백엔드 소스 코드 (Source Code)
*   **위치**: `backend/src/main/java/com/lottomarket/...` (지정된 패키지 구조)
*   **내용**:
    *   **Architecture**: Controller -> Service -> Repository 구조 준수
    *   **Stack**: Spring Boot, Spring Security, Spring Data JPA, JWT Implementation
    *   **Naming**: Class(PascalCase), Method(camelCase) 등 팀 컨벤션 준수

### 2.3. 테스트 코드 및 결과 (Tests)
*   **위치**: `backend/src/test/java/...`
*   **내용**:
    *   **Unit Test**: Service 레이어 주요 비즈니스 로직 (AuthService, JwtTokenService 등)
    *   **Integration Test**: Controller 레이어 API 테스트 (`@WebMvcTest` or `@SpringBootTest`)
    *   **목표**: `mvn test` 통과 및 커버리지 확보 (권장 80%+)

### 2.4. 구현 결과 보고서 (`walkthrough_backend.md`)
*   **위치**: `geminiGuide/User/walkthrough_backend.md` (또는 지정된 아티팩트 위치)
*   **내용**:
    *   구현된 기능 요약
    *   테스트 실행 결과 (스크린샷 또는 로그 증빙)
    *   API 동작 검증 (Postman/Curl 테스트 결과)
    *   `design_spec_backend.md`와의 일치 여부 자가 점검 (Compliance Check)

---

## 3. 상세 작업 명세 (Work Specification)

`design_spec_backend.md` (Auth v1)에 기반한 구체적인 구현 항목입니다.

### 3.1. 도메인 및 DB 모델링 (`com.lottomarket.auth.domain`)
- [ ] **User Entity 구현**:
    - 필드: `id`, `email`, `nickname`, `provider`(Enum), `providerId`, `role`(Enum), `premium`, `premiumUntil`, timestamps
    - 제약조건: `(provider, providerId)` 유니크 인덱스 설정
- [ ] **Repository 구현**: `UserRepository` (findByProviderAndProviderId 등)
- [ ] **Enums**: `AuthProvider(NAVER, GOOGLE)`, `UserRole(ROLE_USER, ROLE_ADMIN)`

### 3.2. 보안 및 인증 (`com.lottomarket.auth.config` / `service`)
- [ ] **Spring Security 설정**:
    - Stateless Session 정책 설정
    - CSRF Disable (JWT 사용)
    - CORS 설정 (React 프론트엔드 허용)
- [ ] **OAuth2/JWT 구현**:
    - `CustomOAuth2UserService`: 소셜 로그인 후 유저 정보 매핑
    - `JwtTokenService`: Access(1h)/Refresh(14d) 토큰 발급, 검증, 파싱 로직
    - `JwtAuthenticationFilter`: 요청 헤더에서 JWT 추출 및 인증 처리

### 3.3. API 구현 (`com.lottomarket.auth.controller`)
- [ ] **POST /api/auth/oauth2/{provider}/login**
    - 소셜 인증 코드/토큰 수신 -> User 생성/갱신 -> JWT 발급 및 반환
- [ ] **GET /api/auth/me**
    - `Authorization: Bearer {token}` 헤더 확인 -> 현재 내 정보 반환
- [ ] **POST /api/auth/token/refresh**
    - Refresh Token 검증 -> Access Token 재발급

### 3.4. 예외 처리 및 표준 준수 (`com.lottomarket.global.error`)
- [ ] **Global Exception Handler**: 모든 예외를 공통 JSON 포맷으로 반환
- [ ] **Error Response Format**:
    ```json
    { "code": "AUTH_001", "message": "...", "details": null }
    ```
- [ ] **Error Codes**: `AUTH_001` (지원하지 않는 Provider), `TOKEN_001` (유효하지 않은 토큰) 등 Perplexity 스펙 준수

---

## 4. 작업 프로세스 (Workflow)

1.  **Planning**: `implementation_plan.md` 작성 후 사용자(Perplexity 대리) 승인 요청.
2.  **Implementation**: Spring Boot 코드 작성 (Domain -> Service/Config -> Controller 순).
3.  **Verification**: 단위/통합 테스트 작성 및 `mvn test` 실행.
4.  **Reporting**: `walkthrough_backend.md`에 결과 정리 및 `checklist_security_backend.md` 자가 점검 수행.
5.  **Review Request**: 작업 완료 알림.

---
*작성자: Gemini (Antigravity)*
*참조 문서: design_spec_backend.md, final_collaboration_guide_backend.md*
