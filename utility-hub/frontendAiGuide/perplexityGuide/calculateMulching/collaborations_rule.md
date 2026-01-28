collaborations_rule.md – Utility Hub v0.2
1. Roles & Responsibilities
Perplexity (Architect & QA)
요구사항 정리, 기능 분해, 설계서(design_spec.md) 작성 및 업데이트.

협업 규칙 문서(collaborations_rule.md) 관리.

체크리스트(checklist_security.md 등) 설계 및 코드 리뷰 시 적용.

v0.2 이후에도:

Apple 스타일 Glassmorphism 디자인 원칙이 잘 지켜지는지,

각 도구가 설계된 입출력/계산식과 일치하는지 검증.

Gemini / Antigravity (Main Builder)
Vite + React + TypeScript + Tailwind 기반 실제 구현 담당.

Perplexity가 제공한 문서를 전제로:

implementation_plan.md에 구현 계획 수립.

task.md를 쪼개 단계별로 작업.

walkthrough.md에 변경 사항/구현 세부 내역 기록.

디자인 시스템 구현:

GlassCard, GlassButton, GlassInput 등 공용 컴포넌트 설계·적용.

라이트/다크 모드, 메쉬 그라디언트, 플로팅 헤더 등 UI 패턴 유지.

Claude (Refiner & Documentation)
복잡한 로직/컴포넌트 리팩터링.

README, 개발 가이드, API/UX 문서 정리.

Perplexity 설계와 실제 코드 사이에서 “Readable한 문서”를 만들어 팀 간 이해를 돕는 역할.

2. Workflow – 설계 → 구현 → 검증
Design (Perplexity)

사용자의 목표/요구사항을 바탕으로 design_spec.md 작성.

입력/출력 필드, 계산식, 에러 처리, UI 구조, 디자인 토큰 정의.

checklist_security.md 등 도메인 체크리스트 준비.

Plan & Build (Gemini)

프로젝트 루트 utility-hub 폴더 기준으로 작업.

design_spec.md, collaborations_rule.md, checklist_security.md를 먼저 읽고 implementation_plan.md 작성.

Vite + React + Tailwind로 기능 구현:

공통 레이아웃(MainLayout, Header, Footer).

대시보드 + 3개 도구(뽀모도로, 멀칭 비닐, Text→Markdown).

Review & Refine (Perplexity & Claude)

Perplexity:

구현 코드/UX를 설계서 + 체크리스트 기준으로 검토.

계산 정확도, 다크모드 가독성, 입력 검증 등을 점검.

Claude:

구조 개선(컴포넌트 분리, 훅 추출 등)과 문서 정리.

필요 시 스타일/네이밍 통일.

3. Architecture & Code Style
3.1 프론트엔드 구조
스택:

Vite + React + TypeScript

Tailwind CSS

폴더 구조(요약):

src/layouts – MainLayout, 헤더/푸터/네비게이션

src/context – ThemeContext (light/dark)

src/components/ui – GlassCard, GlassButton, GlassInput, Alert 등

src/pages – Dashboard, tools/Pomodoro, tools/MulchingFilm, tools/TextToMd

src/lib – 계산/변환 로직 (멀칭 계산, 뽀모도로 상태 머신, 텍스트→Markdown 변환 등)

3.2 네이밍 규칙
TypeScript/React:

컴포넌트/클래스: PascalCase (GlassCard, PomodoroTimer)

변수/함수: camelCase (mulchingFilmInput, calculateRequiredRolls)

파일/폴더:

페이지/라우트: Pomodoro.tsx처럼 PascalCase 파일명, 필요 시 기능별 하위 폴더.

유틸/로직: kebab-case 또는 camelCase 허용 (프로젝트 내 일관성 유지).

3.3 주석
“무엇을 하는지”보다 “왜 이렇게 구현했는지” 설명.

복잡한 부분(예: 멀칭 계산 공식, 타이머 상태 전환)은 수식·단위와 함께 간단히 주석.

4. UI & Design Rules (Apple Glassmorphism)
4.1 디자인 언어
기본 스타일: Apple 스타일 Glassmorphism / Liquid Glass.

투명/반투명 카드, backdrop-blur-xl, bg-white/60 또는 bg-slate-900/40.

부드러운 그림자(shadow-xl), 큰 라운드(rounded-3xl).

제한된 색 팔레트 + 명확한 계층 구조.

사용 원칙:

Glass 효과는 주요 카드/헤더/핵심 컨트롤에만 사용한다.

배경은 메쉬 그라디언트 등으로 깊이를 주되, 텍스트 가독성을 해치지 않도록 채도/밝기 조절.

4.2 공통 레이아웃
메인 레이아웃:

중앙 정렬된 최대 너비 컨테이너 (예: max-w-5xl mx-auto).

상단 플로팅 Glass 헤더(앱 이름 + 다크모드 토글).

본문에 도구 카드/페이지 내용 배치.

각 도구 페이지:

상단 요약 카드(결과/현재 상태).

하단 또는 우측에 입력 폼 + 액션 버튼.

모바일에서는 수직 스택, 데스크톱에서는 2열 레이아웃.

4.3 테마 (Light / Dark)
글로벌 상태: theme = "light" | "dark" (ThemeContext에서 관리).

해/달 아이콘 토글:

해: 라이트 모드 활성

달: 다크 모드 활성

라이트/다크 모드 시:

Glass 카드 배경, 텍스트 색, 경계선 색이 충분한 대비를 가지도록 Tailwind 토큰 사용 (text-slate-900 vs text-slate-100 등).

입력 필드/텍스트 영역은 다크 모드에서 dark:bg-slate-900/60, dark:text-white로 가독성 확보.

5. Error Handling & Security (요약)
상세 항목은 checklist_security.md를 따른다.

입력 검증:

모든 숫자 필드는 0보다 큰 값만 허용, 비어 있거나 잘못된 입력에 대한 에러 메시지 필수.

단위는 라벨/보조 텍스트로 명확하게 표기(발(평), cm, m, 원 등).

에러 표시:

GlassInput 아래에 작은 오류 텍스트 표시, 테두리 색 변경(border-red-500).

전역 오류/알림은 Glass 스타일 Alert 컴포넌트 사용.

데이터 저장:

로컬스토리지에는 theme, 최근 입력값처럼 민감하지 않은 값만 저장.

.md 다운로드, 최근 계산 기록 등은 민감 정보가 포함되지 않도록 설계.
​

6. Testing Policy
테스트 범위:

멀칭 비닐 계산 로직: 입력 → 롤 수/금액 계산 정확성.

뽀모도로: Phase 전환 상태 머신.

Text→Markdown: 옵션별 변환 결과.

도구:

vitest + React Testing Library 권장.

규칙(기본):

핵심 비즈니스 로직당 최소 1개 이상의 단위 테스트.

배포 전 npm run test / npm run build 성공 필수.
​

도구 & 프레임워크

Vitest + React Testing Library 사용을 기본으로 한다.

범위와 위치

src/lib의 핵심 비즈니스 로직:

각 파일당 최소 1개 이상의 단위 테스트를 src/lib/__tests__/*.test.ts에 작성한다.

예: mulchingFilm.test.ts, pomodoro.test.ts, textToMd.test.ts

커스텀 훅(src/hooks):

주요 훅당 happy path 기준 테스트를 1개 이상 작성한다.

타이머 시작/정지, 기록 추가/초기화, 텍스트 변환 등의 기본 흐름 검증.

페이지/컴포넌트:

최소한 각 도구 페이지에 대해 “렌더링 + 기본 상호작용 1회” 수준의 통합 테스트를 권장한다.

규칙(강조):

핵심 로직에 대한 테스트 없이 기능을 추가/변경하지 않는다.

배포 전에는 npm run test와 npm run build가 모두 성공해야 한다.

6.x 리팩터링 규칙 (v0.2.2 이후)
Claude가 수행하는 리팩터링(refactoring) 은 UI/UX 플로우와 설계된 입력/출력 스펙을 바꾸지 않는 것을 원칙으로 한다.

구조 개선(컴포넌트 분리, 타입/상수 파일 도입, ARIA 속성 추가 등)은 refactoring_report.md·walkthrough_v0.2.2.md에 기록하고, 필요한 경우 Perplexity가 design_spec.md의 해당 섹션(예: 멀칭 계산기 5.x)에 짧은 메모로 반영한다.
​

리팩터링 후에는 항상 다음을 만족해야 한다.

npm run build 성공.

기존 수동 테스트 시나리오(멀칭 비닐 계산: 결과·상세·기록·다크모드·접근성)가 모두 통과.

7. Collaboration & Prompting
Perplexity에 요청할 때:

“설계 변경/기능 추가”는 항상 design_spec.md 갱신부터 요청.

“이 변경 사항을 반영해 collaborations_rule/checklist_security를 업데이트해 달라”고 명확히 지시.

Gemini에 요청할 때:

항상 collaborations_rule.md, design_spec.md, checklist_security.md를 함께 제공.

“이 문서들을 절대 기준으로 삼아 v0.x 구현/수정하라”는 식으로 프롬프트.

Claude에 요청할 때:

“v0.2 코드가 위 문서와 일치하도록 리팩터링 및 문서화를 진행해 달라”고 요청.

v0.2.2 이후에는 “외부 동작을 바꾸지 않는 안전 리팩터링”을 기본 조건으로 명시한다.
​

8. 버전 관리
현재 문서 버전: v0.2

변경 로그:

v0.1: HUD Admin Template 기반 Admin 스타일.

v0.2: Apple 스타일 Glassmorphism UI로 전체 오버홀, Glass* 컴포넌트 도입, 중앙 정렬 레이아웃 적용.

v0.2.2: 멀칭 비닐 계산기 UI 구조를 유지한 채, 서브 컴포넌트 분리와 접근성(ARIA) 강화, 타입/상수 정리를 포함한 안전 리팩터링 수행.

이 버전의 collaborations_rule.md를 사용하면, v0.2 설계와 v0.2.2 리팩터링 원칙(행동 불변 + 구조 개선)이 명확히 문서화된 상태에서 Perplexity–Gemini–Claude가 계속 협업할 수 있다.

9. Git Repository Info
Project URL: https://github.com/soraul2/utility-hub.git

이 저장소는 전체 프로젝트(문서 + 소스 코드)를 포함하며, 모든 AI 에이전트는 작업 시작 전 최신 코드를 git pull로 동기화해야 한다.