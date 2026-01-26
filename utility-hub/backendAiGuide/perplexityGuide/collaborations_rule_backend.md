# collaborations_rule_backend.md – Utility Hub Backend (TextToMd) v0.3.0

## 1. Roles & Responsibilities

### Perplexity 팀 (Backend Architect & QA)

- 백엔드 설계 문서 관리:
  - `design_spec_backend.md`, `checklist_security_backend.md`, 본 `collaborations_rule_backend.md`.
- TextToMd 백엔드 API의:
  - API/DTO/페르소나 스펙 정의 및 업데이트.
  - 예외/에러 코드 정책 정의.
  - Spring AI 사용 방식(프롬프트 패턴, ChatClient 구조) 설계.
- v0.x 이후에도:
  - 구현 코드가 설계·체크리스트와 일치하는지 검증.
  - 설계 변경 시 항상 문서를 먼저 갱신하고, 이후 구현 팀에 전달.

### Gemini 팀 (Backend & Frontend Main Builder)

- Backend (`backend/` 디렉토리):
  - Spring Boot + Spring AI 기반 TextToMd API 구현.
  - `design_spec_backend.md`와 `checklist_security_backend.md`를 절대 기준으로 구현/수정.
  - v0.3.0에서:
    - Request DTO에 `persona` 필드와 `Persona` Enum 추가.
    - 10가지 페르소나별 프롬프트 생성 로직 구현.
- Frontend (`frontend/` 디렉토리):
  - Text→Markdown 페이지에 AI 모드 + 페르소나 선택 UI 연동.
  - `persona` 옵션을 포함한 요청을 백엔드로 전송하고, 응답을 결과 영역에 반영.

- 문서:
  - 구현/변경 사항은 `walkthrough_backend.md` (또는 기존 walkthrough의 backend 섹션)에 기록.

### Claude 팀 (Refiner & Documentation)

- Backend 코드 리팩터링:
  - v0.3.0에서 도입된 10 Persona 프롬프트 로직을 Strategy Pattern으로 분리 (Refactoring Guide 준수).
  - 프롬프트 외부화(예: `prompts.yml`) 및 테스트 보강.
- 문서 정리:
  - Swagger 기반 API 명세를 읽기 좋은 문서(README_backend 등)로 정리.
  - Persona별 사용 가이드, 예제 요청/응답 정리.
- 원칙:
  - 기능 외부 동작(API 스펙, 에러 코드/메시지)을 바꾸지 않는 “안전 리팩터링”을 기본으로 한다.
  - 설계 변경 필요 시 Perplexity와 상의 후 설계 문서를 먼저 갱신.

---

## 2. Workflow – 설계 → 구현 → 검증 → 리팩터링

### 2.1 Design (Perplexity)

- `design_spec_backend.md`에:
  - API 스펙 (엔드포인트, Request/Response, `persona` Enum) 정의/업데이트.
  - 10 Persona 사양, 프롬프트 설계 개요 정의.
- `checklist_security_backend.md`에:
  - `persona` 포함 입력 검증/에러 처리/테스트 항목 반영.
- `collaborations_rule_backend.md`에:
  - 버전, 역할, 절차를 갱신.

### 2.2 Plan & Build (Gemini)

- 작업 전:
  - `design_spec_backend.md`, `checklist_security_backend.md`, `collaborations_rule_backend.md`를 먼저 읽는다.
- 구현:
  - TextToMd DTO/Service/Controller에 `persona` 필드 및 로직 추가.
  - Spring AI ChatClient를 활용해 Persona별 프롬프트를 LLM에 전달.
- 기록:
  - 구현/변경 사항을 `implementation_plan.md`, `walkthrough_backend.md`에 기록.

### 2.3 Review & QA (Perplexity)

- Perplexity:
  - 코드/Swagger 명세를 문서와 비교하여 검토.
  - API 스펙, 페르소나 동작, 예외 응답, 입력 검증, 보안/로깅이 설계와 일치하는지 확인.
  - 필요 시 `checklist_security_backend.md` 기반 체크 수행.

### 2.4 Refine & Document (Claude)

- Claude:
  - Strategy Pattern으로 Persona 프롬프트 로직 분리.
  - 프롬프트 외부화, 테스트 및 문서 보강.
- Perplexity:
  - 리팩터링 결과를 검토하고 설계 문서에 필요한 메모/보완 사항 반영.

---

## 3. Branch & CI/CD Policy (Backend 관점)

- 브랜치:
  - `main`: 안정 버전, 프로덕션 배포용.
  - `backend/feature/*`: 백엔드 기능/리팩터링 작업 브랜치.
- PR 규칙:
  - 모든 백엔드 변경은 PR을 통해 `main`에 머지.
  - PR 설명에:
    - 관련 문서 변경(예: v0.2.x → v0.3.0 업데이트)
    - 주요 변경 요약, 테스트 결과를 명시.
- CI:
  - 백엔드 디렉토리 변경 시:
    - `./mvnw test` 또는 `./gradlew test` 성공 필수.
    - `./mvnw package` 또는 `./gradlew build` 성공 필수.[web:232][web:249][web:255]
  - 테스트/빌드 중 하나라도 실패하면 배포 워크플로우는 실행되지 않는다.

---

## 4. Prompt / Model / Persona 변경 절차

- 프롬프트/모델/페르소나 변경이 필요한 경우:

  1. Perplexity가 `design_spec_backend.md`에서 관련 섹션(프롬프트 설계, Persona 테이블 등)을 갱신.
  2. `checklist_security_backend.md`에 필요한 검증/테스트 항목을 추가.
  3. Gemini가 변경된 설계에 맞게 구현 수정.
  4. Claude가 변경 내역을 기반으로 리팩터링/문서화를 수행.

---

## 5. 버전 관리

- 현재 문서 버전: `backend-text2md v0.3.0`

- 변경 로그:
  - v0.1:
    - TextToMd 전용 백엔드 API 설계 및 에러 처리 구조 정의.
    - Spring AI ChatClient 기반의 기본 호출 패턴 도입.
  - v0.2.x:
    - Gemini 팀이 기본 구현 완료 (Smart Assistant 단일 페르소나).
  - v0.3.0 (2026-01-23):
    - **10가지 페르소나 추가**: STANDARD, SMART, DRY, ACADEMIC, CASUAL, TECHNICAL, CREATIVE, MINIMAL, DETAILED, BUSINESS.
    - Request DTO에 `persona` 필드 추가 (기본값: STANDARD).
    - 페르소나별 프롬프트 생성 로직 구현 (Spring AI 기반).
    - 하위 호환성 보장: `persona` 필드 없는 기존 요청은 자동으로 STANDARD로 처리.

---

## 6. Spec-Driven Collaboration 원칙

- Perplexity 설계 문서(`design_spec_backend.md`, `checklist_security_backend.md`, 본 문서)는 백엔드의 **Single Source of Truth**이다.[web:248][web:268]
- API 스펙, DTO, 에러 포맷, Persona 목록에 변경이 필요하면:
  - 항상 문서부터 수정하고,
  - 그 다음 Gemini가 구현을 변경하며,
  - Claude가 리팩터링/문서화를 수행한다.

이 원칙을 통해, 프론트/백엔드/문서/AI 에이전트 간의 사양 불일치를 최소화한다.[web:254][web:257]
