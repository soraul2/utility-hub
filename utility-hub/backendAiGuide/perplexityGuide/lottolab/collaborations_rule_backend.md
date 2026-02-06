collaborations_rule_backend.md – Lotto Market v2 Backend Collaboration Rules
문서 버전: v1.0
작성자: Perplexity (Backend Architect & QA)
프로젝트: lotto-market-v2 (Spring Boot + Spring Security + OAuth2 + JWT + Spring AI)

1. 협업 기본 원칙
Single Source of Truth

design_spec_backend.md는 백엔드 설계의 최종 기준이다.

설계 변경 없이 코드만 고치는 행위는 금지한다.

에러 코드/DTO/에러 응답 포맷은 일관을 유지한다.

프론트–백엔드 API 계약은 반드시 design_spec_backend.md에 기록된 내용과 일치해야 한다.

2. AI 모델별 역할 (R&R)
2.1 Perplexity – Backend Architect & QA (Control Tower)
역할

설계 주도:

API 스펙, 에러 코드, 패키지 구조, Spring Security + OAuth2 + JWT, Spring AI 연동 설계 결정

규칙 관리:

collaborations_rule_backend.md, checklist_security_backend.md 관리

품질 보증:

구현 코드 리뷰

테스트/보안 점검

design_spec_backend.md와의 일치 여부 검증

배출 아티팩트

design_spec_backend.md

collaborations_rule_backend.md

checklist_security_backend.md

2.2 Gemini (Antigravity) – Backend Main Builder (Spring Specialist)
역할

Spring Boot 구현

Controller, Service, Config, Entity, Repository 구현

Spring Security + OAuth2 + JWT 구현

SecurityConfig, JwtAuthenticationFilter, CustomOAuth2UserService, OAuth2AuthenticationSuccessHandler 등

Spring AI 연동

ChatClient 설정, 프롬프트 적용, 예외 변환 로직 구현

상태 추적

implementation_plan.md

walkthrough_backend.md 유지

배출 아티팩트

Backend Source Code

implementation_plan.md

walkthrough_backend.md

2.3 Claude – Refiner & Editor (Polisher)
역할

리팩터링

서비스/도메인 구조 개선, 중복 제거

테스트 보강

문서화

API 명세 정리

README_backend.md 작성

design_spec_backend.md와 구현 간의 차이 정리

안전 리팩터링

외부 동작(엔드포인트/JSON 스키마/에러 코드)을 바꾸지 않는 범위에서만 구조 개선

배출 아티팩트

리팩터링된 Backend 모듈

기술 문서 (API 명세, README_backend.md 등)

3. Backend Collaboration Loop (설계–구현–검증)
백엔드는 다음 루프를 엄격히 따른다.

[Design] – Perplexity

design_spec_backend.md와 checklist_security_backend.md 작성

API 스펙, 에러 코드, 패키지 구조, Spring Security + OAuth2 + JWT, Spring AI 연동 설계 확정

[Build] – Gemini

design_spec_backend.md를 기준으로 Spring Boot 코드 구현

implementation_plan.md로 작업 계획 정리

walkthrough_backend.md로 구현 과정/의사결정 기록

[Review] – Perplexity

구현된 코드가 design_spec_backend.md와 checklist_security_backend.md를 잘 지키는지 검증

위반 사항 리스트와 수정 제안 제공

[Refine] – Claude

Perplexity 검증이 끝난 코드를 안전 리팩터링

문서 정리 및 README_backend.md 작성

주의:
설계/API 변경이 필요하면 코드부터 고치지 말고,
반드시 Perplexity와 함께 design_spec_backend.md를 먼저 수정한 뒤,
그 변경을 기준으로 Gemini가 코드를 업데이트한다.

4. 규칙 / Conventions
4.1 패키지 구조
com.wootae.backend.lotto – 도메인 로직 (Controller, Service, DTO, Entity, Repository)

com.wootae.backend.global – 에러, 설정, 공통 인프라

4.2 인증/인가
인증 방식

Spring Security + OAuth2 + JWT

Naver, Google 소셜 로그인 지원

토큰 전달

모든 API 요청은 Authorization: Bearer <JWT> 헤더에 포함

권한

ROLE_USER, ROLE_PREMIUM, ROLE_ADMIN

@PreAuthorize로 엔드포인트 보호

4.3 에러 응답 포맷
모든 API는 공통 JSON 에러 포맷 사용

ErrorResponse 구조

json
{
  "status": "number",
  "errorCode": "string",
  "message": "string",
  "timestamp": "string (ISO 8601)"
}
에러 코드는 design_spec_backend.md에 정의된 코드만 사용 (AUTH_UNAUTHORIZED, EXPIRED_TOKEN, INVALID_REFRESH_TOKEN 등)

4.4 보안/토큰
토큰 저장

기본 권장: HttpOnly + Secure 쿠키 (XSS 방어)

localStorage는 프로덕션에서 가능하면 피함

토큰 만료

Access Token: 1시간

Refresh Token: 14일

CORS

환경별로 cors.allowed-origins 설정

프로덕션에서는 화이트리스트 기반 접근

CSRF

HttpOnly/Secure 쿠키로 기본 방어

필요 시 CSRF 토큰 기반 추가 보안 적용

4.5 Spring AI
모든 AI 호출은 ChatClient를 통해 통일

프롬프트는 규칙 ID/타입/파라미터를 포함한 템플릿 사용

예외는 AI_PROVIDER_ERROR, AI_TIMEOUT 등으로 매핑해 클라이언트에 노출

4.6 테스트
./mvnw test, ./mvnw package 모두 성공 시에만 CI/CD 배포 진행

핵심 서비스 메서드에 단위 테스트

/api/rules, /api/rules/{ruleId}/generate, /api/user/me 등에 대한 통합 테스트

테스트 커버리지 목표: 핵심 서비스 80% 이상

5. 문서 템플릿 목록
팀이 이 협업 헌법을 유지하기 위해 참고할 문서:

design_spec_backend.md – API/도메인/구조 설계

collaborations_rule_backend.md – 이 문서

checklist_security_backend.md – 보안/로그/검증 체크리스트

test_strategy_backend.md – 테스트 전략

arch_decision_backend.md – 아키텍처 결정 사항 기록 (옵션)

design_vs_implementation.md – 설계 vs 구현 불일치 기록

