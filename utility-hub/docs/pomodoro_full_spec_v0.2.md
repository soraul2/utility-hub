Pomodoro Full Spec – Utility Hub v0.2
0. Overview
도메인 이름: Pomodoro Timer (뽀모도로 타이머)

목표

집중/짧은 휴식/긴 휴식 주기를 자동으로 관리하는 라운드 기반 뽀모도로 타이머를 제공한다.

Utility Hub v0.2 내에서 Apple 스타일 Glassmorphism UI와 일관된 UX를 유지한다.
​

버전: pomodoro-frontend v0.2

라우트: /tools/pomodoro

1. 아키텍처 & 폴더 구조
1.1 라우팅
/tools/pomodoro

MainLayout 내의 하나의 도구 페이지로 동작한다.
​

1.2 관련 파일 (예시)
src/pages/tools/Pomodoro.tsx

페이지 컨테이너, 레이아웃 및 주요 컴포넌트 조합 담당.

src/hooks/usePomodoro.ts

뽀모도로 상태/타이머 관리 커스텀 훅.
​

src/lib/pomodoro.ts

상태 머신·타이머 유틸 및 비즈니스 로직.
​

공통 UI

src/components/ui/GlassCard.tsx, GlassButton.tsx, GlassInput.tsx, GlassToggle.tsx, Alert.tsx.
​

2. 데이터 모델 & 상태 머신
2.1 설정 모델
ts
interface PomodoroSettings {
  workDurationMinutes: number;   // 기본 25
  shortBreakMinutes: number;     // 기본 5
  longBreakMinutes: number;      // 기본 15
  roundsPerCycle: number;        // 기본 4
  autoStartNext: boolean;        // 기본 true
}
모든 시간 단위는 “분” 기준이며, UI에서 숫자 입력으로 관리한다.
​

2.2 상태 모델
ts
type PomodoroPhase = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  currentPhase: PomodoroPhase;
  remainingSeconds: number;
  currentRound: number;
  isRunning: boolean;
  todayCompletedWorkSessions: number;
}
remainingSeconds는 현재 Phase 남은 시간을 초 단위로 관리.

todayCompletedWorkSessions는 하루 동안 완료된 work 세션 수를 누적해 보여준다.
​

2.3 상태 전환 규칙
work 종료 시

currentRound < roundsPerCycle → shortBreak로 전환.

currentRound === roundsPerCycle → longBreak로 전환.
​

shortBreak 종료 → work로 전환, currentRound += 1.

longBreak 종료

한 사이클 종료, 필요 시 currentRound = 1로 리셋.
​

autoStartNext = true인 경우:

각 Phase 종료 시 다음 Phase를 자동으로 시작.

autoStartNext = false:

Phase 종료 후 isRunning = false로 두고, 사용자가 Start를 눌러 다음 Phase를 시작.

3. UI / UX 스펙
3.1 페이지 레이아웃
상단 GlassCard (상태 요약)
​

중앙: 원형 Progress Ring + 남은 시간(대형 숫자).

아래: 현재 모드 텍스트

“집중 시간”, “짧은 휴식”, “긴 휴식” 등.

추가 정보:

현재 라운드 (currentRound / roundsPerCycle)

오늘 완료된 집중 세션 수 (todayCompletedWorkSessions).

하단 GlassCard (설정 & 제어)
​

입력 필드:

집중 시간(분)

짧은 휴식 시간(분)

긴 휴식 시간(분)

라운드 수

자동 시작 토글(autoStartNext)

버튼 행:

시작/일시정지 (Start/Pause)

리셋 (Reset)

레이아웃 공통 규칙

모바일: 상단 상태 카드 → 하단 설정 카드의 수직 스택.

데스크톱: 상단 상태 카드가 강조되며, 필요 시 2열 레이아웃도 허용 (좌 상태, 우 설정).
​

3.2 Glassmorphism 적용
카드

rounded-3xl, backdrop-blur-xl, shadow-xl, border border-white/20.

배경색:

라이트: bg-white/60

다크: bg-slate-900/40.
​

타이머 숫자

text-4xl 이상, 굵은 폰트로 가독성 확보.

버튼

GlassButton 스타일:

rounded-full px-5 py-2 font-medium transition-all active:scale-95.
​

4. 입력 검증 & 에러 처리
4.1 Validation 규칙 (Settings)
집중/휴식/긴 휴식 시간(분):

허용 범위: 1~180 분.
​

라운드 수:

허용 범위: 1~20.
​

잘못된 값 (0 이하, NaN, 빈 값 등):

타이머 시작 차단 or 안전한 기본값으로 되돌리기.

GlassInput 아래에 짧고 명확한 한국어 에러 메시지 표시.

4.2 에러 피드백
각 입력 필드 아래:

text-xs text-red-500 mt-1 형태의 에러 텍스트.

에러 상태의 Input: border-red-500.
​

예기치 못한 런타임 오류:

콘솔에만 상세 로그.

사용자에게는 일반 안내 메시지만 (예: “예기치 못한 오류가 발생했습니다. 다시 시도해 주세요.”).

5. 라이트/다크 모드 & 접근성
5.1 테마
글로벌 상태: theme = "light" | "dark" (ThemeContext).

ThemeToggle:

해 아이콘: 라이트 모드

달 아이콘: 다크 모드.
​

대비:

텍스트/배경 대비는 WCAG 본문 4.5:1 이상 유지.

5.2 접근성
포커스

주요 버튼/컨트롤에 focus-visible:outline-2 등 포커스 링 적용.
​

타이머

현재 Phase와 남은 시간을 스크린리더가 읽을 수 있도록 ARIA 속성 고려(예: aria-live="polite").

6. 비기능 요구사항 (NFR)
6.1 성능
타이머 구현은 1초 간격 업데이트를 기본으로 하되:

백그라운드 탭/슬립 상태에서 과도한 CPU 사용을 피한다 (예: setInterval 최소화, 가시성 API 활용 등).
​

상태 업데이트는 O(1) 수준, 불필요한 리렌더 최소화.

6.2 저장소
필요 시 recentPomodoroStats를 로컬스토리지에 저장할 수 있으나:

민감 정보는 포함하지 않는다.

파싱 실패 시 안전한 기본값으로 되돌린다.
​

7. 테스트 & 검증
7.1 유닛 테스트
src/lib/pomodoro.ts

상태 머신 로직:

work → shortBreak/longBreak 전환.

shortBreak/longBreak → work 전환.

roundsPerCycle에 따른 currentRound 증가/리셋.
​

usePomodoro 훅

시작/일시정지/리셋 플로우.

autoStartNext true/false에 따른 동작 차이.

7.2 통합 테스트
Pomodoro.tsx 페이지

기본 렌더링 + 한 번의 Start/Pause 상호작용.

설정 값 변경 후 타이머 동작 확인.
​

7.3 체크리스트 연계
checklist_security.md v0.2의 다음 항목을 기준으로 검증:

집중/휴식 시간 범위(1~180), 라운드 수 범위(1~20).
​

잘못된 설정값 입력 시 타이머 시작 차단/기본값 복원.

백그라운드 상태에서 과도한 CPU 사용 없음.

8. 협업 & 버전 관리 (뽀모도로 도메인 관점)
상위 문서

design_spec.md v0.2

checklist_security.md v0.2

collaborations_rule.md v0.2.
​

Perplexity

뽀모도로 도메인 설계/체크리스트 업데이트, 코드 리뷰 및 QA.

Gemini

usePomodoro, Pomodoro.tsx, 관련 테스트 구현.

Claude

리팩토링(훅/컴포넌트 분리, ARIA 추가), 문서화 정리.