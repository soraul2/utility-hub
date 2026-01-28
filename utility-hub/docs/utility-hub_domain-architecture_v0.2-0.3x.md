Utility Hub v0.2–v0.3.x – Domain Architecture Spec
0. Overview
프로젝트 이름: Utility Hub

도메인
1. Main Dashboard
2. Pomodoro Timer
3. Mulching Film Calculator
4. Text → Markdown (v0.2 Local, v0.3.x Local + AI)
5. Phone Cost Calculator (v0.1) [NEW]

목표
여러 유틸리티 도구를 하나의 웹앱에서 통합 제공하되, 공통 레이아웃·디자인 시스템·코드 구조를 유지한다.
​

1. 공통 프론트엔드 아키텍처
1.1 기술 & 라우팅
스택: Vite + React + TypeScript + Tailwind CSS.
​

라우트
- / 또는 /dashboard – Main Dashboard
- /tools/pomodoro – 뽀모도로 타이머
- /tools/mulching-film – 멀칭 비닐 계산기
- /tools/text-to-md – 텍스트 → Markdown 도구
- /tools/phone-cost – 휴대폰 요금 계산기 [NEW]

1.2 폴더 구조 (공통)
src/layouts/MainLayout.tsx
플로팅 헤더 + 중앙 정렬 컨테이너 + 푸터.
​

src/context/ThemeContext.tsx
theme: "light" | "dark" 전역 상태, localStorage 연동.
​

src/components/ui/*
GlassCard, GlassButton, GlassInput, GlassToggle, Alert 등.

src/pages/*
- Dashboard.tsx
- tools/Pomodoro.tsx
- tools/MulchingFilm.tsx
- tools/TextToMd.tsx
- tools/PhoneCost/PhoneCost.tsx [NEW]

src/lib/* (Legacy & Simple Logic)
- pomodoro.ts
- mulchingFilm.ts
- textToMd.ts

src/api/* (Network & Error Types)
- textToMdApi.ts, errorMapper.ts

src/hooks/*
- usePomodoro.ts
- useMulchingHistory.ts
- useTextToMd.ts, useTextToMdAi.ts
- usePhoneCost.ts [NEW]

1.3 공통 디자인 시스템
Glassmorphism
- 카드: rounded-3xl, backdrop-blur-xl, shadow-xl, border border-white/20.
- 배경:
  - 라이트: bg-white/60
  - 다크: bg-slate-900/40

레이아웃 패턴
각 도메인 페이지:
- 상단 요약 카드(결과/상태)
- 하단(또는 우측) 입력 폼 + 액션 버튼.
- 모바일: 수직 스택, 데스크톱: 2열 레이아웃.
​

2. Main Dashboard 아키텍처
2.1 책임
Utility Hub 내 도구 진입점 역할.
도구 목록, 검색, 필터링, 라우팅을 제공.
​

2.2 데이터 모델
```ts
type ToolCategory = "productivity" | "agriculture" | "documentation" | "finance";

interface ToolMeta {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;   // "timer", "leaf", "markdown", "mobile-screen"
  route: string; // "/tools/..."
  tags: string[];
  isFeatured: boolean;
}
```

2.3 UI 구조
상단 Hero GlassCard
- 제목: “Utility Hub”
- 부제: “집중, 농업 계산, 문서화, 통신비 절약을 한 곳에서 처리하세요.”
​

검색 & 필터
- 검색 인풋 + 카테고리 Pill (GlassButton).

카드 그리드
- 각 도구 카드에 아이콘, 이름, 설명, 카테고리 배지, “열기” 버튼.
- 클릭 시 해당 /tools/...로 이동.
​

3. Pomodoro Timer 아키텍처
3.1 개요
라우트: /tools/pomodoro
역할: 집중/짧은 휴식/긴 휴식 라운드 기반 타이머.
​

3.2 모듈 구조
- Pomodoro.tsx: 상단 상태 카드 + 하단 설정 카드 구성.
- usePomodoro.ts: 상태/타이머 관리 훅.
- lib/pomodoro.ts: 상태 머신, Phase 전환 규칙 구현.
​

3.3 데이터 & 상태 머신
```ts
interface PomodoroSettings {
  workDurationMinutes: number;   // 25
  shortBreakMinutes: number;     // 5
  longBreakMinutes: number;      // 15
  roundsPerCycle: number;        // 4
  autoStartNext: boolean;        // true
}

type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  currentPhase: PomodoroPhase;
  remainingSeconds: number;
  currentRound: number;
  isRunning: boolean;
  todayCompletedWorkSessions: number;
}
```

3.4 UX 포인트
- 상단 GlassCard: 원형 Progress Ring + 남은 시간 + 현재 모드.
- 하단 GlassCard: 설정 입력 + Start/Pause/Reset 버튼.
- 입력 검증: 시간 1–180분, 라운드 1–20.
​

4. Mulching Film Calculator 아키텍처
4.1 개요
라우트: /tools/mulching-film
역할: 밭 면적·비닐 규격·롤당 가격 입력 → 필요한 롤 수 + 예상 금액 계산.
​

4.2 모듈 구조
- MulchingFilm.tsx (v0.2.2): 메인 컨테이너 + 서브 컴포넌트(ResultDisplay, DetailSection, InputForm, HistoryTable).
- lib/mulchingFilm.ts: 비즈니스 계산 로직.
- useMulchingHistory.ts: localStorage 기반 최근 기록 관리.
​

4.3 데이터 모델
```ts
interface MulchingFilmInput {
  fieldAreaPyeong: number;
  mulchWidthCm: number;
  mulchLengthM: number;
  pricePerRollWon: number;
}

interface MulchingFilmResult {
  requiredRolls: number;
  requiredRollsRounded: number;
  estimatedCostWon: number;
  fieldAreaM2: number;
  areaPerRollM2: number;
  createdAt: string;
}
```

4.4 UX 레이어
- 상단 결과: 필요 수량, 예상 금액(대형 숫자).
- 상세: 면적, 한 롤당 면적, 계산식.
- 입력: 4개 GlassInput + “계산하기” 버튼.
- 기록: 최근 5건, 로컬스토리지 저장.
​

5. Text → Markdown 아키텍처
5.1 개요 (v0.3.x)
라우트: /tools/text-to-md
역할: 텍스트를 Markdown으로 변환 (Local 규칙 또는 AI 페르소나 활용).
​

5.2 모듈 구조
- Page: TextToMd.tsx
- Hooks: useTextToMd.ts (공통), useTextToMdAi.ts (AI).
- Components: ModeToggle, PersonaSelector, EditorLayout, ThinkingIndicator.
- API: lib/api/textToMdApi.ts, lib/api/errorMapper.ts.
​

5.3 데이터 모델 (프론트)
```ts
type TextToMdMode = "local" | "ai";
type Persona = "STANDARD" | "SMART" ... "BUSINESS"; // 10종

interface TextToMdState {
  mode: TextToMdMode;
  rawText: string;
  persona: Persona;
  markdownText: string;
  isLoading: boolean;
  errorMessage?: string;
  model?: string;
  tokensUsed?: number;
}
```

5.4 UX 기능
- 모드 토글: Local vs AI.
- AI 모드: 10개 페르소나 선택, 모델/토큰 메타데이터 표시, ThinkingIndicator.
- 에러 처리: 입력 에러(하단), AI/네트워크 에러(상단 Alert).
​

6. Phone Cost Calculator 아키텍처 [NEW]
6.1 개요
라우트: /tools/phone-cost
역할: 통신사 약정(Carrier) vs 자급제+알뜰폰(MVNO) 24개월 총 비용 비교.
​

6.2 모듈 구조
- Page: PhoneCost.tsx (메인 컨테이너).
- Components:
  - CarrierPlanForm.tsx: 통신사 입력 폼 (VAT 토글, 부가서비스).
  - MvnoPlanForm.tsx: 알뜰폰 입력 폼.
  - ComparisonResult.tsx: 결과 비교 및 추천.
- Hook: hooks/usePhoneCost.ts (상태 관리, 오케스트레이션).
- Utils:
  - utils/calculators.ts: 비용 계산 로직.
  - utils/validators.ts: 입력 검증 로직.
  - utils/formatters.ts: 금액 포맷팅.
- Shared: constants.ts (상수/에러메시지), types.ts (데이터 모델).

6.3 데이터 모델
```ts
interface CarrierPlanInput {
  highPlanMonths: number; highPlanMonthly: number;
  lowPlanMonths: number; lowPlanMonthly: number;
  deviceCostTotal: number;
  addons: { name: string; monthlyFee: number; months: number }[];
}

interface MvnoPlanInput {
  mvnoDeviceCost: number;
  mvnoMonthly: number;
  mvnoMonths: number;
}

interface PlanComparisonResult {
  carrierTotal: number;
  mvnoTotal: number;
  difference: number;
  cheaper: 'carrier' | 'mvno' | 'same';
  formula: { carrier: string; mvno: string };
}
```

6.4 UX 포인트
- Glassmorphism 카드형 UI (2열 레이아웃).
- 부가세(VAT) 10% 토글: 별도 On/Off 가능, 계산 시 1.1배 적용.
- 한글 금액 표기: "120만원" 등 직관적 포맷팅 지원.
- 검증 및 에러: 입력 즉시 유효성 검사, 접근성(ARIA)을 고려한 에러 메시지 연결.
- 상세 계산식 노출: 결과 카드 하단에 투명한 계산 내역 제공.

7. 협업 관점 요약
Single Source of Truth
- 각 도메인별 Full Spec / Checklist / Design Spec 문서를 최우선으로 한다.
- 본 통합 아키텍처 문서는 전체적인 그림을 조망하기 위한 Road Map 역할을 한다.

R&R
- Perplexity: 스펙/체크리스트/QA 담당.
- Gemini: 구현(Build) 담당.
- Claude: 리팩토링(Refine) 및 문서화 담당.