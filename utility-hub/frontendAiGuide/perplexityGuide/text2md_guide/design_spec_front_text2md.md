3) collaborations_rule_front_v0.3_text2md.md
1. Roles & Responsibilities – TextToMd v0.3.x
Perplexity (Frontend Architect & QA)
설계

design_spec_front_text2md.md에서:

로컬/AI 모드 구조

Persona UI

큰 에디터 레이아웃

에러/재시도 UX를 정의한다.

백엔드 설계(design_spec_backend.md)와 Request/Response/에러 코드를 동기화한다.
​

검증

구현 코드/UX가:

백엔드 계약

프론트 체크리스트(checklist_security_front_v0.3_text2md.md)

Safe Refactoring 원칙을 모두 만족하는지 리뷰한다.
​

Gemini (Frontend Main Builder)
책임

초기 v0.3.x 구현:

모드 토글, PersonaSelector, EditorLayout, ThinkingIndicator 컴포넌트 구현.
​

useTextToMdAi, textToMdApi 등 로직 구현 및 API 연동.
​

구현 계획 문서:

implementation_plan_front_text2md.md 작성 및 Task 관리를 수행.

기능 검증:

Task 리스트(TextToMd v0.3.0/v0.3.x Implementation Tasks) 기준으로 기능을 체크한다.
​

Claude (Refiner & Documentation)
책임

리팩터링:

errorMapper.ts, clipboard.ts, fileDownload.ts 도입.
​

재시도 로직 개선, 상태 관리 단순화.
​

문서화:

TextToMd Frontend v0.3.x Walkthrough 및 Refactoring Tasks를 정리.

원칙:

외부 동작(API 호출, 입력/출력/에러 포맷, UX 플로우)은 변경하지 않는 Safe Refactoring만 수행한다.
​

2. Workflow – 설계 → 구현 → 리팩터링 → 검증
Design (Perplexity)

백엔드 + 프론트 설계 문서를 업데이트:

10 Persona, Request/Response, 에러 코드, “큰 에디터”, 모드 토글, ThinkingIndicator.

프론트 체크리스트를 v0.3.x 요구사항에 맞게 확장.
​

Plan & Build (Gemini)

문서 읽기:

design_spec_backend.md

checklist_security_backend.md

collaborations_rule_backend.md

design_spec_front_text2md.md

checklist_security_front_v0.3_text2md.md

collaborations_rule_front_v0.3_text2md.md.
​

구현:

Task 리스트(TextToMd v0.3.0/v0.3.x Implementation Tasks)를 따라 컴포넌트/훅/유틸/페이지를 완성.
​

검증:

npm run build 성공, 기본 기능 수동 테스트 완료.
​

Refine (Claude)

리팩토링 계획 문서(리팩토링 계획 - TextToMd 프론트엔드 v0.3.x)에 따라 Phase 1~3 실행.
​

리팩터링 Task 리스트(TextToMd v0.3.x Frontend Refactoring Tasks)를 완료.
​

Review & QA (Perplexity)

최종 코드/UX를:

설계 문서

체크리스트

Task 완료 상태
와 비교해 검수하고, 필요 시 문서의 다음 버전을 갱신한다.

3. Spec-Driven Collaboration 원칙
TextToMd 도메인의 Single Source of Truth:

백엔드: design_spec_backend.md, checklist_security_backend.md, collaborations_rule_backend.md.
​

프론트: design_spec_front_text2md.md, checklist_security_front_v0.3_text2md.md, collaborations_rule_front_v0.3_text2md.md.

변경 순서

Perplexity가 설계/체크리스트/협업 문서를 먼저 수정.

Gemini가 구현 또는 수정.

Claude가 리팩터링 및 문서화를 수행.

v0.3.x 핵심 원칙

v0.2의 로컬 변환 동작을 유지한 상태에서 AI 모드를 추가한다.

사용자 관점에서 “동일 화면에서 모드/Persona를 바꿔가며 크게 보이는 에디터로 작업”하는 경험을 일관되게 유지한다.