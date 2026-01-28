design_spec.md – Utility Hub v0.2
0. Overview
프로젝트 이름: Utility Hub v0.2

목적:

여러 유틸리티 도구(뽀모도로 타이머, 농업용 멀칭 비닐 계산기, 텍스트 → Markdown 변환기)를 하나의 웹앱에서 통합 제공하는 허브.

Apple 스타일 Glassmorphism 디자인 언어를 적용해, 네이티브 앱에 가까운 경험 제공.

도구 추가/확장 시에도 일관된 UX와 코드 구조 유지.

기술 스택:

Vite + React + TypeScript

Tailwind CSS

Apple-like Glassmorphism UI (커스텀 디자인 시스템)

이 설계서는 v0.2 기준으로 작성되었으며, v0.2.2에서 멀칭 비닐 계산기 UI 구조를 유지한 채 컴포넌트 분리 및 접근성 개선(ARIA 속성, 타입/상수 정리 등)을 포함한다.

Global Architecture
1.1 라우팅 구조
/ 또는 /dashboard

메인 유틸리티 허브 대시보드 (도구 카드, 검색, 필터).

/tools/pomodoro

뽀모도로 타이머.

/tools/mulching-film

농업용 멀칭 비닐 계산기.

/tools/text-to-md

텍스트 → Markdown 변환기.

라우팅은 react-router-dom 기준으로 구현한다.

1.2 폴더 구조 (요약)
src/layouts

MainLayout.tsx: 플로팅 헤더 + 중앙 정렬 컨테이너 + 푸터.

src/context

ThemeContext.tsx: theme: "light" | "dark" 상태 관리.

src/components/ui

GlassCard.tsx, GlassButton.tsx, GlassInput.tsx, GlassToggle.tsx, Alert.tsx 등.

src/hooks

usePomodoro.ts – 뽀모도로 상태/타이머 관리 커스텀 훅.
useMulchingHistory.ts – 멀칭 계산 기록 관리 훅.
useTextToMd.ts – 텍스트 입력/옵션/변환 상태 관리 훅.

규칙: 각 도구의 상태 관리는 전용 커스텀 훅으로 분리하고, 페이지 컴포넌트는 UI 렌더링에만 집중한다.

src/pages

Dashboard.tsx
tools/Pomodoro.tsx
tools/MulchingFilm.tsx
tools/TextToMd.tsx

src/lib

pomodoro.ts – 상태 머신/타이머 유틸.
mulchingFilm.ts – 멀칭 계산 로직.
textToMd.ts – 텍스트 → Markdown 변환 로직.

1.3 전역 상태
type Theme = "light" | "dark";

interface AppState {
theme: Theme;
// 선택: 최근 설정/기록
recentMulchingResults?: MulchingFilmResult[];
recentPomodoroStats?: PomodoroSessionStat[];
}

theme는 ThemeContext에서 관리하고 localStorage.theme에 저장·복원.

최근 기록은 필요에 따라 localStorage 사용(민감 정보 없음).

디자인 시스템 (Apple Glassmorphism)
2.1 디자인 원칙
Glassmorphism 핵심 요소:

반투명 카드: bg-white/60 (light), bg-slate-900/40 (dark).
강한 블러: backdrop-blur-xl.
부드러운 그림자: shadow-xl.
큰 라운드: rounded-3xl.
풍부하지만 과하지 않은 그라디언트 배경.
​

적용 범위:

메인 카드, 헤더, 주요 컨트롤에만 Glass 효과 사용.
폼 인풋/텍스트 영역은 가독성 우선(너무 높은 투명도 피함).

2.2 색상 & 타이포그래피
기본 색 토큰 (Tailwind 커스터마이징):

bg-app-light: #F3F4F6 (light background)
bg-app-dark: #020617 (dark background)
card-light: bg-white/60
card-dark: bg-slate-900/40
text-main-light: text-slate-900
text-main-dark: text-slate-100
accent: 파란/보라 계열 포인트 컬러 1~2개.

타이포그래피:

헤더/숫자에 굵은 폰트 사용 (예: font-semibold/font-bold).
본문/설명은 가독성 좋은 text-sm~text-base.
숫자 중심 UI(타이머, 롤 수, 금액)는 text-3xl 이상 크기로 표기.

2.3 레이아웃
MainLayout

max-w-5xl mx-auto px-4 py-6 정도의 중앙 정렬.

상단 플로팅 Glass 헤더:

왼쪽: 앱 이름 또는 로고.
오른쪽: 테마 토글(해/달) + 간단한 네비게이션.

배경: 라이트/다크에 따라 다른 Mesh Gradient CSS 적용.

각 도구 페이지 공통 패턴

상단: 결과/상태 요약 GlassCard.
하단: 입력 폼 + 행동 버튼(계산하기/변환하기/시작 등).
모바일: 수직 스택, 데스크톱: 2열 레이아웃(왼쪽 결과, 오른쪽 입력).

2.4 공용 UI 컴포넌트
GlassCard

Props: title?, children, className?.

기본 클래스:

rounded-3xl backdrop-blur-xl shadow-xl border border-white/20
라이트/다크에 따라 배경색 변경 (bg-white/60 vs bg-slate-900/40).

GlassButton

Props: variant (primary | secondary | ghost 등), size, onClick, disabled.

기본 스타일:

rounded-full px-5 py-2 font-medium transition-all duration-300 active:scale-95
variant에 따라 배경/테두리/텍스트색 조합.

GlassInput

Props: label, type, value, onChange, error?, suffix?(단위 표시).

에러 시: border-red-500, 아래에 text-xs text-red-500 mt-1.

ThemeToggle (해/달 토글)

Props: theme, onToggle.

아이콘 변화 + 부드러운 슬라이드/페이드 애니메이션.

메인 허브 페이지 (/dashboard)
3.1 기능 요구사항
지원 도구 목록을 카드 그리드로 표시.

검색: 도구 이름, 설명, 태그 기준 부분 검색.

카테고리 필터: "productivity", "agriculture", "documentation" 등으로 필터링.

카드 클릭 시 해당 도구 페이지로 이동.

3.2 Tool 메타데이터
type ToolCategory = "productivity" | "agriculture" | "documentation";

interface ToolMeta {
id: string;
name: string;
description: string;
category: ToolCategory;
icon: string; // 예: "timer", "leaf", "markdown"
route: string;
tags: string[];
isFeatured: boolean;
}

v0.1에 정의한 3개의 ToolMeta는 그대로 사용하되, 아이콘은 Glass 스타일에 맞는 심플한 아이콘 세트를 사용한다.

3.3 UI 구성
상단 Hero 영역 GlassCard:

제목: “Utility Hub”
부제: “집중, 농업 계산, 문서화를 한 곳에서 처리하세요.”

검색 + 필터 영역:

검색 인풋(돋보기 아이콘 포함).
카테고리 pill 버튼(GlassButton).

카드 그리드:

각 카드에 아이콘, 이름, 설명, 카테고리 배지, “열기” 버튼.

Tool #1 – 뽀모도로 타이머 (/tools/pomodoro)
4.1 기능 요구사항
집중/짧은 휴식/긴 휴식 모드를 지원하는 타이머.

설정 패널에서 시간/세트 수/자동 시작 여부 설정.

원형 Progress Ring 형태의 타이머 UI.

현재 모드, 남은 시간, 현재 라운드, 오늘 완료 세션 수 표시.

4.2 데이터 모델
interface PomodoroSettings {
workDurationMinutes: number; // 기본 25
shortBreakMinutes: number; // 기본 5
longBreakMinutes: number; // 기본 15
roundsPerCycle: number; // 기본 4
autoStartNext: boolean; // 기본 true
}

type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
currentPhase: PomodoroPhase;
remainingSeconds: number;
currentRound: number;
isRunning: boolean;
todayCompletedWorkSessions: number;
}

4.3 상태 전환 규칙
work 종료:

currentRound < roundsPerCycle → shortBreak.
currentRound === roundsPerCycle → longBreak.

shortBreak 종료 → work, currentRound += 1.

longBreak 종료 → 사이클 종료(필요 시 currentRound = 1로 리셋).

4.4 UI 구조
상단 GlassCard:

중앙에 원형 Progress Ring + 남은 시간(대형 숫자).
아래에 현재 모드(집중/짧은 휴식/긴 휴식)와 현재 라운드.

하단 GlassCard:

설정 입력: Focus/Short/Long/라운드 수 + 자동 시작 토글.
버튼 행: 시작/일시정지, 리셋.

Tool #2 – 농업용 멀칭 비닐 계산기 (/tools/mulching-film)
5.1 기능 요구사항
입력:

발의 면적(평)
비닐 폭(cm)
비닐 길이(m)
롤당 가격(원)

출력:

필요한 롤 수 (소수 둘째 자리까지).
예상 금액(원).
계산 상세 내역 (밭 전체 면적, 한 롤당 멀칭 면적, 최종 계산식).

UX:

“입력 상태(Before)”와 “결과 상태(After)”가 명확히 구분.
“계산하기” 버튼을 누를 때만 계산 수행.
최근 5건 계산 결과 기록 및 표시.

5.2 입력/출력 모델
interface MulchingFilmInput {
fieldAreaPyeong: number;
mulchWidthCm: number;
mulchLengthM: number;
pricePerRollWon: number;
}

interface MulchingFilmResult {
requiredRolls: number; // 원값
requiredRollsRounded: number; // 소수 둘째 자리 반올림
estimatedCostWon: number;
fieldAreaM2: number;
areaPerRollM2: number;
createdAt: string; // ISO 문자열 (최근 기록용)
}

5.3 계산 로직
상수:

const PYEONG_TO_M2 = 3.305785; // 정밀 값 사용

계산:

const fieldAreaM2 = fieldAreaPyeong * PYEONG_TO_M2;
const mulchWidthM = mulchWidthCm / 100;
const areaPerRollM2 = mulchWidthM * mulchLengthM;
const requiredRolls = fieldAreaM2 / areaPerRollM2;
const requiredRollsRounded = Math.round(requiredRolls * 100) / 100;
const estimatedCostWon = requiredRollsRounded * pricePerRollWon;

5.4 UI 구조
상단 결과 GlassCard:

큰 숫자로 “필요 수량: X.XX 롤”.
그 아래 “예상 금액: NN,NNN 원”.

중앙 상세 GlassCard (노란 포인트/아이콘):

밭 전체 면적 (평 → ㎡ 변환).
한 롤당 멀칭 가능 면적.
최종 계산식.

하단 입력 GlassCard:

GlassInput 4개 (단위 suffix: 평, cm, m, 원).
“계산하기” 버튼.

우측 또는 하단:

“최근 5건 계산 기록” 리스트(작은 GlassCard).

5.x 멀칭 비닐 계산기 UX 상세 규칙
5.x.1 페이지 구조 원칙
멀칭 비닐 계산기는 단일 페이지에서 다음 요소를 모두 제공한다.

상단 결과 요약
계산 상세 내역
입력 폼
최근 계산 기록

결과 확인을 위해 별도의 결과 전용 페이지로 이동하지 않는다.

브라우저 뒤로 가기 없이, 같은 화면에서 입력 수정 → 재계산을 반복할 수 있어야 한다.

5.x.2 상단 결과·상세 영역
“필요 수량(롤)”과 “예상 금액(원)”을 상단 GlassCard에 대형 숫자로 표시한다.

결과 바로 아래에 “계산 상세 내역” GlassCard를 배치하여 다음 정보를 항상 함께 보여준다.

밭 전체 면적 (평 → ㎡ 변환값)
한 롤당 멀칭 가능 면적 (폭 × 길이)
최종 계산식(예: 330.58 ÷ 90.00 = 3.67롤)

사용자는 입력값과 관계없이 최신 계산 기준 상세 내역을 한눈에 확인할 수 있어야 한다.

5.x.3 입력 폼 영역
입력 폼은 결과·상세 카드 아래에 위치하며 다음 필드를 가진다.

발의 면적(평)
비닐 폭(cm)
비닐 길이(m)
롤당 가격(원)

“계산하기” 버튼을 눌러야만 결과 영역이 업데이트된다.

계산 후에도 입력값은 폼에 그대로 남아, 일부만 수정하고 재계산할 수 있어야 한다.

잘못된 입력(0 이하, NaN, 비어 있음 등)은 GlassInput 아래 에러 메시지로 표시하며, 결과 영역은 갱신하지 않는다.

세부 규칙는 checklist_security.md를 따른다.

5.x.4 최근 계산 기록 영역
페이지 하단에 “최근 계산 기록” GlassCard를 두고, 최근 최대 5건을 리스트로 표시한다.

각 기록 항목에는 **면적, 비닐 규격(폭×길이), 수량(롤), 금액(원)**을 한 줄로 보여준다.

기록은 브라우저 로컬 저장소에만 저장하며, 새 계산 시 맨 위에 추가되고 오래된 항목은 제거된다.

기록을 초기화(전체 삭제)하는 컨트롤이 존재하고, 클릭 시 간단한 안내 문구 또는 확인 동작을 거친다.

5.x.5 상호작용 플로우
기본 플로우:

사용자가 입력 폼에 값을 입력한다.
“계산하기” 버튼을 누른다.
동일 페이지 상단의 결과·상세 카드가 즉시 업데이트된다.
하단 최근 기록에 해당 계산이 추가된다.

이 플로우에서 페이지 전환, 모달 이동, 뒤로 가기 버튼 의존은 허용하지 않는다.

리팩터링 시에도 위 플로우와 레이아웃 계층(상단 결과 → 상세 → 입력 → 기록)을 변경하지 않는 것을 원칙으로 한다.

5.x.6 v0.2.2 안전 리팩터링 메모

멀칭 비닐 계산기 페이지의 상단 결과 → 상세 → 입력 폼 → 최근 기록 구조와 사용자 플로우는 변경하지 않는다.
​

MulchingFilm.tsx는 메인 컨테이너 역할만 담당하고, 다음 서브 컴포넌트로 분리한다.

ResultDisplay (결과 표시)

DetailSection (계산 상세 내역)

InputForm (입력 폼 + 검증)

HistoryTable (최근 기록)

접근성 강화를 위해 입력 필드에 다음 ARIA 속성을 적용한다.

aria-label, aria-required, aria-invalid, aria-describedby

금액 표시는 설계된 계산식은 그대로 유지하되, UI 레이어에서는 한국어 단위 포맷터(예: formatWonSimple)를 사용해 “만/억” 단위로 가독성을 높일 수 있다.
​

Tool #3 – 텍스트 → Markdown 변환기 (/tools/text-to-md)
6.1 기능 요구사항
텍스트 입력 영역(Textarea).

옵션:

자동 헤더 (첫 줄을 #로 감싸기).
자동 리스트 (줄 단위 리스트화).

출력:

변환된 Markdown 텍스트.
“복사하기” 버튼.
.md로 다운로드 버튼.

6.2 데이터 모델
interface TextToMdOptions {
autoHeading: boolean;
autoList: boolean;
}

interface TextToMdState {
rawText: string;
options: TextToMdOptions;
markdownText: string;
}

6.3 변환 규칙 (초안)
autoHeading:

첫 줄이 비어 있지 않으면 앞에 #를 붙인다.

autoList:

여러 줄 텍스트를 줄 단위로 분리, 비어 있지 않은 줄 앞에 -를 붙인다.

공통:

양 끝 공백 정리, 연속 빈 줄 최소화.

6.4 UI 구조
좌측(또는 상단) GlassCard:

제목 + 옵션 스위치(토글 버튼).
큰 Textarea (GlassInput 스타일 변형) – 라이트/다크에서 모두 가독성 확보.

우측(또는 하단) GlassCard:

변환된 Markdown 표시 영역 (monospace 폰트).
하단에 “복사하기” / “.md로 다운로드” GlassButton.

Validation & Error Handling (요약)
세부 항목은 checklist_security.md v0.2를 따른다.
​

모든 숫자 입력 필드:

0 이하/NaN/비어 있음 → 에러 메시지 + 계산/시작 차단.

Textarea:

비어 있을 때 변환 버튼 비활성화 또는 경고 표시.

에러 메시지:

한국어, 짧고 명확.
GlassInput 아래에 표시, 시각적 하이라이트.

비기능 요구사항 (NFR)
접근성

라이트/다크 모드 모두에서 충분한 색 대비 및 가독성 유지.
​
키보드 포커스 가능한 모든 요소는 명확한 포커스 링을 가진다.
예: focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400.

성능

클라이언트 사이드 계산(타이머, 계산기, 변환 로직)은 O(n) 수준(입력 길이 기준) 유지.
​
불필요한 리렌더링을 피하기 위해 상태 관리 최소화.

빌드

npm run build 성공.
CI에서 린트/테스트 통과.

문서 & 협업
본 설계서는 다음 문서와 함께 사용한다.

collaborations_rule.md v0.2
checklist_security.md v0.2

Gemini/Antigravity는 구현/수정 전 항상 이 세 문서를 우선 읽고,
설계와 실제 구현 간의 차이가 생기면 Perplexity를 통해 먼저 설계를 갱신한다.
​

이 버전을 그대로 design_spec.md 최신본으로 사용하면, 멀칭 비닐 계산기 UX와 v0.2.2 안전 리팩터링 내용까지 포함해 Perplexity–Gemini–Claude 팀이 공통 기준으로 삼기 좋다.