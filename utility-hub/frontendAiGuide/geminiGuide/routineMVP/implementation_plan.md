# 📋 Implementation Plan - Routine MVP

## 1. 🎯 목표 (Goal)
Perplexity 팀의 `design_spec.md`를 바탕으로 "하루 5분 루틴 관리"를 위한 **Routine MVP** 웹 애플리케이션을 구현합니다.
사용자가 직관적으로 하루를 계획하고 회고할 수 있는 **React 기반의 Single Page Application(SPA)**을 구축하며, `localStorage`를 활용하여 데이터 영속성을 보장합니다.

## 2. 🏗️ 기술 스택 및 아키텍처 (Tech Stack)
*   **Core**: React 18, TypeScript, Vite
*   **Styling**: TailwindCSS (Design System & Utils)
*   **Routing**: React Router v6
*   **State Management**: Zustand (Context API보다 직관적인 전역 상태 관리) - *Spec의 "State: useState → Zustand 전환 준비" 반영하여 초기부터 도입 권장*
*   **Utility**:
    *   `date-fns` (날짜 처리)
    *   `react-beautiful-dnd` or `@dnd-kit/core` (Task Drag & Drop)
    *   `framer-motion` (UI 인터랙션 및 화면 전환 애니메이션)
    *   `lucide-react` (아이콘)
*   **Data Persistence**: `localStorage` (Key: `routine-daily`, `routine-archive`)

## 3. 🧩 디렉토리 구조 (Directory Structure)
```
src/
├── components/
│   ├── layout/       # Sidebar, LayoutScaffold
│   ├── common/       # Button, Card, Input
│   └── domain/       # Routine 관련 특화 컴포넌트
│       ├── KeyTaskInput.tsx
│       ├── TimeBlock.tsx
│       ├── ReflectionForm.tsx
│       └── TaskList.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── TasksPage.tsx
│   ├── CalendarPage.tsx
│   ├── ReflectionPage.tsx
│   └── ArchivePage.tsx
├── store/
│   └── useRoutineStore.ts  # DailyPlan & Archive 관리
├── types/
│   └── routine.d.ts      # TypeScript Interfaces
└── utils/
    └── storage.ts        # localStorage Wrapper
```

## 4. 📅 구현 단계별 계획 (Phases)

### Phase 1: 프로젝트 셋업 및 기본 구조
*   [ ] Vite + React + TS 프로젝트 초기화
*   [ ] TailwindCSS 설정 및 `index.css` 디자인 토큰(폰트, 컬러) 정의
*   [ ] 라우팅 설정 (`react-router-dom`) 및 Layout 컴포넌트 구현
*   [ ] 기본 공통 컴포넌트 (Button, Card) 구현

### Phase 2: 핵심 데이터 모델 및 스토어 구현
*   [ ] `types/routine.d.ts` 정의 (Design Spec 준수)
*   [ ] `useRoutineStore` 구현 (Zustand)
    *   Action: `setKeyTask`, `addTimeBlock`, `saveReflection`, `loadFromStorage`
*   [ ] `localStorage` 연동 로직 구현

### Phase 3: 주요 페이지 및 기능 구현 (MVP Core)
*   **3-1. Home Page (Daily Plan)**
    *   [ ] Key Task 입력 필드 (3개 제한)
    *   [ ] TimeBlock 타임라인 (6AM ~ 11PM) Visual Rendering
    *   [ ] Task Drag & Drop 구현 (Pending)
*   **3-2. Tasks Page**
    *   [ ] 주간 미완료 태스크 리스트업
    *   [ ] 태스크 추가/삭제 기능
*   **3-3. Reflection & Archive**
    *   [ ] 회고 폼 (3가지 질문) 및 저장 로직
    *   [ ] Archive 리스트 뷰 및 데이터 조회

### Phase 4: UI/UX 고도화 및 검증
*   [ ] 반응형 디자인 점검 (Mobile View)
*   [ ] 애니메이션 추가 (페이지 전환, 태스크 완료 인터랙션)
*   [ ] 에러 핸들링 (입력값 검증 등)
*   [ ] 최종 빌드 및 테스트

## 5. 🧪 검증 계획 (Verification Plan)
### 자동화 테스트 (Automated Tests)
*   `vitest`를 사용하여 유틸리티 함수(날짜 계산, 스토리지 로직) 단위 테스트

### 수동 검증 (Manual Verification)
1.  **시나리오 A (아침)**: Key Task 3개 입력 -> 타임라인에 드래그하여 배치 -> 저장 확인
2.  **시나리오 B (저녁)**: Reflection 페이지 진입 -> 회고 작성 -> 저장 후 Archive 페이지에서 데이터 확인
3.  **데이터 유지**: 브라우저 새로고침 후 데이터 유지 여부 확인

## 6. 🎨 디자인 제안 (Design Suggestions)
*   **Glassmorphism Theme**: 기존 AI Hub 프로젝트와 일관성을 유지하기 위해 은은한 글래스모피즘 적용.
*   **Micro-interactions**: 태스크 완료 체크 시 파티클 효과, 타임라인 배치 시 햅틱 피드백(모바일) 느낌의 시각적 강조.
*   **Gamification**: 연속 달성일(Streak) 표시로 습관 형성 강화.
