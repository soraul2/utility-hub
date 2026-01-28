3) collaborations_rule_front_v0.3_text2md.md
1. Roles & Responsibilities (TextToMd AI 확장)
Perplexity (Architect & QA)
문서

design_spec_backend.md와 design_spec_front_text2md.md에서 TextToMd AI 모드/Persona/에러 포맷을 정의하고 동기화한다.
​

프론트 체크리스트(checklist_security_front_v0.3_text2md.md)를 관리한다.

검증

프론트 구현이:

백엔드 API 스펙과 일치하는지

모드/Persona/에러 처리가 설계대로 동작하는지

“큰 에디터” UI 요구사항(입력/출력 영역 높이)이 충족되는지 검수한다.

Gemini (Frontend Main Builder)
구현 범위

/tools/text-to-md 페이지에서:

로컬/AI 모드 토글 UI 구현.

Persona 선택 컴포넌트 구현.

대형 입력/출력 영역 레이아웃 구현.

src/lib/api/textToMdApi.ts를 만들어 백엔드 /api/text-to-md와 통신.

문서화

구현/수정 사항을 implementation_plan_front_text2md.md, walkthrough_front_text2md.md 등에 기록.

특히:

어떤 컴포넌트/훅을 새로 만들었는지

로컬/AI 모드 전환 로직

에러/로딩 상태 UX를 어떻게 처리했는지 정리.

Claude (Refiner & Documentation)
리팩터링

TextToMd 페이지를:

메인 컨테이너 + 서브 컴포넌트(입력 카드, 출력 카드, 옵션/Persona 패널)로 분리.

필요 시 useTextToMdLocal / useTextToMdAi 등으로 훅 분리.
​

문서

README_front_text2md.md 또는 종합 README에서:

로컬 vs AI 모드 사용법

Persona 선택 가이드

제한사항(예: 입력 최대 길이, 시간 지연 가능성)을 설명.

2. Workflow – 설계 → 구현 → 검증
Design (Perplexity)

백엔드와 프론트 설계 문서에 TextToMd AI 모드 요구사항 추가:

API 계약(Request/Response/에러 코드)

프론트 UI/UX (모드 토글, Persona, 큰 에디터 배치) 정의.

프론트 체크리스트 업데이트 (checklist_security_front_v0.3_text2md.md).

Plan & Build (Gemini)

작업 전

다음 문서를 먼저 읽는다:

design_spec_backend.md

design_spec_front_text2md.md

checklist_security_front_v0.3_text2md.md

collaborations_rule_front_v0.3_text2md.md

구현

TextToMd 페이지를 v0.2 기준에서 v0.3.x 구조로 확장:

로컬/AI 모드 토글 추가

Persona UI 추가

입력/출력 영역 확대 및 2열 레이아웃 적용

API 연동 및 에러 처리 로직 구현.

기록

변경 사항을 implementation_plan_front_text2md.md, walkthrough_front_text2md.md에 단계별로 기록.

Review & QA (Perplexity)

코드/UX를 설계서 + 체크리스트 기준으로 검토:

API 계약 위반 여부

모드/Persona에 따른 동작 차이

에러/로딩 UX

“큰 에디터” 정확한 반영 여부.

Refine & Document (Claude)

구조 개선:

컴포넌트/훅 분리

타입/상수 정리

ARIA/접근성 강화.

외부 동작(입력, 출력, 에러 포맷, API 호출 플로우)은 변경하지 않는 안전 리팩터링 원칙을 유지한다.
​

3. Spec-Driven Collaboration 원칙 (프론트 TextToMd 확장용)
design_spec_backend.md와 design_spec_front_text2md.md는 TextToMd 도메인의 Single Source of Truth이다.

변경 순서

Perplexity가 설계 문서(백엔드+프론트)를 먼저 갱신.

Gemini가 구현/수정.

Claude가 리팩터링/문서화를 수행.

v0.3.x에서는:

기존 v0.2 로컬 변환 동작을 깨뜨리지 않고, AI 모드를 추가하는 것을 기본 원칙으로 한다.

TextToMd 페이지는 “하나의 화면에서 로컬/AI 모드를 자유롭게 전환”하는 UX를 유지한다.

