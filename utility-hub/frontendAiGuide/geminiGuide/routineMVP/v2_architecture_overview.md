# 📘 Routine V2 Architecture Overview for Claude Team

이 문서는 **Routine V2 MVP** (Timeline & Weekly Stats update)의 구현 구조와 주요 변경 사항을 **Claude Team**이 빠르게 파악할 수 있도록 정리한 기술 문서입니다.

---

## 1. 🎯 프로젝트 개요 (Context)

기존의 단순 리스트 형태 할 일 관리(ToDo)를 **"시간 관리(Timeline)"**와 **"성과 분석(Insights)"**이 가능한 루틴 관리 도구로 고도화했습니다.

*   **핵심 목표**: 사용자가 하루의 흐름을 시각적으로 파악하고, 주간 성과를 통해 동기부여를 얻도록 함.
*   **주요 변경**: Timeline View 도입, 주간 통계/회고 추가, 감성적인 UI(Glassmorphism) 적용.

---

## 2. 📂 프론트엔드 구조 (Frontend Architecture)

### 2.1 디렉토리 구조
```bash
frontend/src/
├── pages/routine/
│   ├── DailyPlanPage.tsx      # [Main] 타임라인, 태스크 관리 메인
│   ├── WeeklyReviewPage.tsx   # [New] 주간 통계 및 심층 회고
│   ├── ArchivePage.tsx        # [Update] 카드 UI 기반 지난 회고 목록
│   ├── ReflectionPage.tsx     # (Existing) 하루 회고 작성 폼
│   └── RoutineLayout.tsx      # Sidebar 및 기본 레이아웃 (주간 회고 메뉴 추가됨)
│
├── components/routine/
│   ├── timeline/
│   │   └── TimelineItem.tsx   # [New] 시간/태스크 정보를 보여주는 핵심 컴포넌트
│   ├── ui/
│   │   └── TaskCategoryBadge.tsx # [New] 카테고리(WORK, HEALTH 등) 뱃지
│   ├── modal/
│   │   └── AddTaskModal.tsx   # [Update] V2 필드(시간, 카테고리 등) 입력 폼
│   └── Layout/
│       └── Sidebar.tsx        # 메뉴 네비게이션
│
├── stores/
│   └── useRoutineStore.ts     # Zustand Store (주간 통계 상태 추가)
│
└── services/routine/
    └── api.ts                 # Axios Client (getWeeklyStats 추가)
```

### 2.2 주요 컴포넌트 상세
1.  **`DailyPlanPage.tsx`**:
    *   **Timeline View**: `scheduledTasks`(시간 지정된 일)와 `anytimeTasks`(시간 미지정)를 분리하여 렌더링.
    *   **Weekly Widget**: 우측 패널에 미니 주간 통계 그래프 표시.
2.  **`WeeklyReviewPage.tsx`**:
    *   **Stats Visualizer**: `weeklyStats` 데이터를 기반으로 요일별 달성률 막대 그래프(`Weekly Insight`) 렌더링.
    *   **Interactive Tooltip**: 그래프 호버 시 상세 수치 표시.
3.  **`ArchivePage.tsx`**:
    *   **Card Grid**: 기존 리스트를 감성적인 카드 Grid UI로 변경.
    *   **Search/Filter**: 클라이언트 사이드 검색 기능 구현 (키워드 필터링).

---

## 3. 💾 상태 관리 및 데이터 모델 (State & Data)

**Zustand Store (`useRoutineStore`)**가 확장되었습니다.

```typescript
interface RoutineState {
  today: DailyPlan | null;          // 오늘의 플랜 (Tasks 포함)
  weeklyStats: WeeklyStats | null;  // [New] 주간 통계 데이터
  reflections: Reflection[];        // 회고 목록
  
  // Actions
  loadToday: () => Promise<void>;
  loadWeeklyStats: (date: string) => Promise<void>; // [New]
  loadArchive: (page: number, size: number) => Promise<void>;
  // ... (CRUD actions)
}
```

### 3.1 주요 데이터 타입 (TypeScript Interfaces)
`src/types/routine.d.ts`에 정의된 핵심 타입들입니다.

```typescript
// 태스크 (V2 확장)
export interface Task {
  id: number;
  title: string;
  completed: boolean;
  // --- V2 Added ---
  category?: 'WORK' | 'PERSONAL' | 'HEALTH' | 'STUDY';
  startTime?: string; // HH:mm:ss
  endTime?: string;   // HH:mm:ss
  description?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

// 주간 통계 (신규)
export interface WeeklyStats {
  weeklyRate: number; // 주간 전체 달성률 (0~100)
  dailyCompletion: {
    [key: string]: number; // "MON": 80, "TUE": 100 ...
  };
}
```

---

## 4. 🌐 백엔드 연동 포인트 (Backend Integration)

Frontend는 다음 API Endpoint들을 의존합니다. (Backend 로직 수정 시 참고 필요)

| Method | Endpoint | Description | Frontend Usage |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/routine/daily-plans/today` | 오늘 플랜 조회 | `DailyPlanPage` 로드 시 |
| `POST` | `/api/v1/routine/daily-plans/{id}/tasks` | 태스크 생성 | `AddTaskModal` (V2 필드 전송) |
| `GET` | `/api/v1/routine/stats/weekly?date={date}` | **주간 통계 조회** | `DailyPlanPage`, `WeeklyReviewPage` |
| `GET` | `/api/v1/routine/reflections` | 회고 목록 조회 | `ArchivePage` |

> **Note**: `getWeeklyStats` API는 주어진 날짜가 포함된 **해당 주(월~일)**의 통계를 반환해야 합니다.

---

## 5. 🎨 디자인 시스템 (UI/UX)

*   **Tailwind CSS** 기반의 스타일링.
*   **Glassmorphism**: `backdrop-blur`, `bg-white/xx` 등을 적극 사용하여 현대적이고 투명한 느낌 구현.
*   **Icons**: `lucide-react` 라이브러리 사용.
*   **Colors**:
    *   Primary: Indigo (`text-indigo-600`, `bg-indigo-50` 등)
    *   Mood Colors: 
        *   Good/High: Emerald
        *   Normal/Medium: Amber/Yellow
        *   Bad/Low: Rose/Red

---

## 6. ✅ 남은 과제 / Next Steps

1.  **Integration Test**: Frontend-Backend 전체 흐름에 대한 E2E 테스트 필요.
2.  **Weekly Review Save**: 현재 `WeeklyReviewPage`의 회고 작성 폼은 UI만 구현되어 있으며, 실제 저장을 위한 API 연동은 추후 개발 필요 (`POST /api/v1/routine/weekly-reviews` 등 예상).
3.  **Deploy**: 운영 환경 배포 및 모바일 반응형 디테일 튜닝.
