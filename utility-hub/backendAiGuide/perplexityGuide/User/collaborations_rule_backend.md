# collaborations_rule_backend.md

## 1. Roles

- Perplexity (Backend Architect & QA)
  - design_spec_backend.md, checklist_security_backend.md, collaborations_rule_backend.md 작성/업데이트
  - API 스펙, 에러 규칙, 패키지 구조, 보안 정책 설계 및 리뷰
- Gemini (Backend Main Builder)
  - Spring Boot 구현 (Controller, Service, Config, Entity, Repo)
  - Spring Security + OAuth2 + JWT 설정 구현
  - 테스트 코드 작성, walkthrough_backend.md, implementation_plan.md 관리
- Claude (Refiner & Editor)
  - 리팩터링 (구조 개선, 중복 제거)
  - 테스트 보강, README_backend 및 기술 문서 정리

## 2. Collaboration Loop

1) Design (Perplexity)
   - design_spec_backend.md, checklist_security_backend.md 수정/추가
   - User, Auth, ErrorCode, 패키지 구조 업데이트

2) Build (Gemini)
   - implementation_plan.md에 파일/클래스/테스트 계획 정리
   - 설계서를 기준으로 코드 구현
   - mvn test / mvn package 실행 및 결과 기록

3) Review (Perplexity)
   - 구현 코드가 설계를 준수하는지 검증
   - API 스펙, 에러 포맷, 보안 체크리스트 충족 여부 확인

4) Refine (Claude)
   - 외부 동작(엔드포인트, JSON, 에러 코드)은 유지하면서 내부 구조 개선
   - 테스트 커버리지 향상 및 문서 정리

## 3. Architecture & Code Style

- Layered Architecture
  - controller / service / repository / config / global.error
- Naming
  - 클래스: PascalCase, 메서드/변수: camelCase
- Lombok
  - DTO: @Getter, @Setter
  - 의존성 주입: @RequiredArgsConstructor + private final 필드

## 4. Error Handling & Security 정책

- Error Handling
  - ErrorCode + BusinessException + GlobalExceptionHandler 구조 고정
  - 모든 에러는 {code, message, details} JSON 포맷 사용
- Security
  - OAuth2 provider: NAVER, GOOGLE
  - JWT 기반 stateless 인증
  - 민감 정보/토큰은 로그에 직접 남기지 않음
  - CORS, 인증/인가 설정은 SecurityConfig에서 일관 관리

## 5. Change Management

- 설계/API 변경이 필요하면 항상
  1) design_spec_backend.md / checklist_security_backend.md 먼저 수정
  2) 그 후 Gemini가 코드를 업데이트
- 설계와 코드가 어긋난 상태로 두지 않는다.