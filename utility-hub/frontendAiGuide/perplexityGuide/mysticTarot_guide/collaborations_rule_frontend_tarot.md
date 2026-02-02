미스틱 타로 프론트엔드 협업 규칙
collaborations_rule_frontend_tarot.md

도메인: Mystic Tarot – Frontend (React SPA)
작성자: Perplexity (Architect & QA)
버전: v1.0
작성일: 2026-01-30

이 문서는 미스틱 타로 프론트엔드 전용 협업 헌법이다.

Perplexity(설계/검수) · Gemini(구현) · Claude(리팩터링/문서화) 세 팀은 이 문서를 기준으로만 역할과 핸드오프를 수행한다.

1. 역할 정의 (R&R)
1.1 Perplexity – Architect & QA (프론트 기준점)
역할

설계:

design_spec_frontend_tarot.md 작성 및 버전 관리 (현재 v1.1).
​

프론트 전용 API 사용 규칙, UX 플로우, 데이터 모델 정의.

규칙/체크리스트:

본 문서(collaborations_rule_frontend_tarot.md) 관리.

checklist_frontend_tarot.md (프론트 검수용 체크리스트) 작성/업데이트.
​

검수:

Gemini 구현/수정 결과에 대해 설계 준수 여부 검토.

클라이언트 검증, 에러 처리, 테스트 전략 준수 여부 점검.

산출물

design_spec_frontend_tarot.md

collaborations_rule_frontend_tarot.md (본 문서)

checklist_frontend_tarot.md (별도 문서, QA용)

1.2 Gemini – Main Builder (프론트 구현 담당)
역할

설계 준수 구현:

Perplexity 스펙을 기준으로 React/TS 코드, CSS/Tailwind, 라우팅 구현.
​

Agentic Workflow:

implementation_plan.md: 프론트 구현 계획 수립.
​

task.md: 작업 단위 체크리스트 관리.
​

walkthrough.md: 실제 구현 결과 및 수동 검증 기록.
​

상태/테스트:

useDailyCard, useThreeCardReading 등 훅 구현 및 테스트 코드 작성(최소 1개 이상).

산출물

실제 프론트 소스 코드 (src/ 전체).
​

implementation_plan.md, task.md, walkthrough.md (프론트 파트).
​

1.3 Claude – Refiner & Documentation (프론트 폴리싱 담당)
역할

리팩터링:

구조 개선, 컴포넌트 분리, 타입 정리, 죽은 코드 제거.
​

문서화:

프론트용 README.md, test_strategy.md 등 문서 작성/정리.
​

스타일/톤:

코드 스타일·네이밍·주석 정리, 프론트 디자인/복잡 UX 설명 보완.
​

산출물

README.md (미스틱 타로 프론트 메인 문서).
​

test_strategy.md (Vitest + MSW + Playwright 테스트 전략).

필요 시 코드 레벨 리팩터링 PR/패치 제안.

2. 문서 체계 & Single Source of Truth
2.1 프론트 전용 핵심 문서
구분	파일	역할	소유
설계	design_spec_frontend_tarot.md	프론트 전체 설계 SSoT	Perplexity
규칙	collaborations_rule_frontend_tarot.md	협업 헌법 (본 문서)	Perplexity
체크리스트	checklist_frontend_tarot.md	QA/검수 체크 포인트	Perplexity
구현 계획	implementation_plan.md	작업 분해/순서	Gemini
작업 로그	task.md	ToDo/진행 상황	Gemini
구현 결과	walkthrough.md	구현 내용/수동 검증 내역	Gemini
문서	README.md	프로젝트 개요/시작 가이드	Claude
테스트 전략	test_strategy.md	Vitest/E2E 전략	Claude
규칙: 설계·규칙·체크리스트는 항상 Perplexity가 최종판을 가진다.
Gemini/Claude가 새 규칙을 제안할 수는 있지만, 최종 반영은 Perplexity 문서 업데이트로만 이루어진다.

3. 기본 워크플로 (설계 → 구현 → 검증)
3.1 Step 1 – 설계 (Perplexity)
사용자/도메인 요구에 따라 Perplexity가 설계 문서 업데이트:

design_spec_frontend_tarot.md에 라우트/화면/타입/API/UX 플로우 정의.

필요 시 frontend_api_usage_tarot/prompt_wireframe_tarot 내용 편입/정제.

협업 규칙/체크리스트에 영향이 있으면:

collaborations_rule_frontend_tarot.md, checklist_frontend_tarot.md도 함께 업데이트.
​

변경 완료 후, Gemini/Claude에 “설계 vX.Y 업데이트 완료” 형태로 넘긴다.

3.2 Step 2 – 구현 (Gemini)
Gemini는 항상 가장 최신 design_spec_frontend_tarot.md 버전을 먼저 읽고 implementation_plan.md 작성.
​

task.md에 작업 항목을 쪼개서 기록:

라우팅, 훅, API 클라이언트, UI 컴포넌트, 애니메이션, 테스트 등.
​

구현 중 원래 설계와 맞지 않는 부분이 발견되면:

코드로 임의 수정 금지.

Perplexity 설계 변경 요청 → Perplexity가 문서를 수정 → 수정된 스펙을 기준으로 다시 구현.

구현 후:

walkthrough.md에 주요 플로우, 검증 방법, 발견된 이슈/해결내역을 정리.
​

3.3 Step 3 – 검증 (Perplexity + Claude)
Gemini가 구현 결과(코드 + walkthrough.md)를 Perplexity에 넘긴다.
​

Perplexity:

checklist_frontend_tarot.md 기준으로 설계 준수 여부 검토.
​

API 사용, 데이터 검증, 에러 처리, UX 플로우, 성능 최소 요구 등을 확인.

Claude:

필요 시 리팩터링/문서 보강 PR 제안.

테스트 전략(test_strategy.md)과 실제 테스트 코드가 align되는지 확인.

4. 도메인별 규칙 (프론트 전용)
4.1 데이터 & API 레이어
API 계약:

항상 design_spec_frontend_tarot.md의 타입/엔드포인트를 기준으로 구현.
​

API 응답/오류 구조가 바뀌면:

백엔드 스펙 + Perplexity 설계 먼저 수정 → 프론트 반영.
​

이미지 경로:

card.imagePath 앞에 백엔드 호스트를 붙여 사용 (설계에 명시된 규칙).
​

Markdown:

aiReading은 react-markdown으로 렌더, 향후 rehype-sanitize 적용을 설계에 반영 후 구현.

4.2 UX/애니메이션
설계된 플로우(운명 확정 모달, Mystic Scattering, 봉투 애니메이션 등)는 설계 문서에 기록된 단계 순서를 따른다.
​

새로운 연출을 추가할 때:

단순 시각 변경(색상, duration 등)은 구현 단계에서 조정 가능.

플로우 변화(단계 추가/삭제, “봉투 이전에 결과를 일부 보여주기” 등)는 Perplexity 설계에 먼저 반영 후 구현.
​

5. 테스트 & 품질 규칙
5.1 테스트 필수 범위
test_strategy.md에서 정의한 최소 기준을 따른다.

우선순위:

API Layer: lib/api/tarotApi.ts – 90% 이상 커버리지 목표.
​

Hooks: useDailyCard, useThreeCardReading – 90% 이상.
​

주요 컴포넌트/페이지:

TarotCardView, DailyCardPage, ThreeCardReadingPage – 70~80%.
​

E2E:

오늘의 카드 Happy Path, 3카드 스프레드 Happy Path – Playwright 테스트 2개.

5.2 CI 규칙
CI에서 npm run test:coverage 실패(커버리지 미달) 시 PR merge 불가.

신규 기능/화면 추가 시:

동시에 테스트 케이스 1개 이상 추가가 기본 원칙 (“테스트 없는 코드는 레거시다”).

6. 설계 변경(브레이킹 체인지) 처리
6.1 변경 순서 (강제)
Perplexity:

변경 필요 사항 정리 → design_spec_frontend_tarot.md를 버전 업(v1.2 등) 하여 수정.
​

필요 시 frontend_api_usage_tarot.md, prompt_wireframe_tarot.md, test_strategy.md 등도 맞춰 갱신 요청.

이 변경을 README/협업 가이드에 요약:

예: “v1.2 변경점: 오늘의 카드에 운세 카테고리 추가, 3카드 스프레드에 리빌 단계 분리”.

Gemini:

새 설계 버전만 기준으로 코드 수정.

기존 구현을 임의로 “맞춰서” 바꾸지 말고, 항상 스펙을 먼저 본다.
​

Claude:

변경된 플로우/타입에 맞게 문서/테스트 전략만 후행 정리.

7. 금지 사항 / 주의 사항
Perplexity 관련:

Gemini/Claude는 Perplexity 설계 없이 프론트 주 설계 문서를 새로 만들지 않는다 (역추적 문서는 임시 참고용일 뿐).
​

API 관련:

프론트에서 임의로 API 필드명을 바꾸거나, 설계에 없는 엔드포인트를 추가해서 사용하지 않는다.
​

UX 관련:

건강/재정/법률 주제에 대해 강한 확신형 표현을 넣지 않는다 (디스클레이머 규칙 준수).

보안 관련:

Markdown 렌더링 시 dangerouslySetInnerHTML 직접 사용 금지.

향후 sanitize 설정은 Perplexity 설계 갱신 후에만 허용.

8. 운영 루틴 (프론트 기준)
아침:

Perplexity와 오늘 프론트 작업 스펙/리스크 정리 (design_spec_frontend_tarot diff 확인).
​

낮:

Gemini가 구현 + 테스트 + walkthrough.md 업데이트.
​

오후/저녁:

Claude가 리팩터링/문서 업데이트.

Perplexity가 checklist_frontend_tarot.md 기준으로 검수 및 다음 날 TODO 정의.
​

이 문서에 정의되지 않은 새로운 규칙/패턴이 필요해지면,
항상 Perplexity가 이 문서를 먼저 업데이트하고,
그 후에 Gemini/Claude가 새 규칙을 따른다.