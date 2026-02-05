# 🚀 Routine MVP V2 - Utility Hub 디자인 고도화 구현 계획

**목표**: 사용자 제공 디자인(FocusFlow 스타일)을 반영하여 단순 리스트 형태의 MVP를 타임라인 기반의 고도화된 루틴 관리 도구로 업그레이드.

---

## Phase 1️⃣: 백엔드 모델 확장 (Domain Expansion)

### 1-1. Entity 업데이트 및 DB 마이그레이션
기존 엔티티에 디자인 요구사항 속성을 추가하고, **DB 스키마 마이그레이션을 선행**합니다.

*   **Task (태스크) 테이블 확장 (`routine_tasks`)**
    *   `category` (VARCHAR): `WORK`, `PERSONAL`, `HEALTH`, `STUDY`
    *   `start_time` (TIME): 시작 시간
    *   `end_time` (TIME): 종료 시간
    *   `description` (TEXT): 상세 노트
    *   `priority` (VARCHAR): `HIGH`, `MEDIUM`, `LOW`
    *   *SQL*:
        ```sql
        ALTER TABLE routine_tasks 
        ADD COLUMN category VARCHAR(50),
        ADD COLUMN start_time TIME,
        ADD COLUMN end_time TIME,
        ADD COLUMN description TEXT,
        ADD COLUMN priority VARCHAR(20);
        ```

*   **Reflection (회고) 테이블 확장 (`routine_reflections`)**
    *   `energy_level` (INT): 1~5 수준
    *   `morning_goal` (VARCHAR): 아침 목표
    *   *SQL*:
        ```sql
        ALTER TABLE routine_reflections
        ADD COLUMN energy_level INT,
        ADD COLUMN morning_goal VARCHAR(255);
        ```

### 1-2. DTO 및 API 응답 구조 변경
*   **DailyPlanResponse (확장)**:
    ```json
    {
      "id": 1,
      "keyTasks": [
        {
          "id": 101,
          "title": "회의 준비",
          "category": "WORK",
          "startTime": "09:00:00",
          "endTime": "10:00:00",
          "priority": "HIGH",
          "description": "자료 준비 필수",
          "completed": false
        }
      ],
      "reflection": {
        "energyLevel": 4,
        "morningGoal": "MVP 완성"
      }
    }
    ```
*   **Stats API (신규)**: `GET /api/v1/routine/stats/weekly`
    *   Response: `{ "weeklyRate": 85, "dailyCompletion": { "MON": 100, "TUE": 66, ... } }`

---

## Phase 2️⃣: 프론트엔드 UI/UX 전면 개편

### 2-1. 공통 컴포넌트 (`components/routine/ui`)
*   **`TaskCategoryBadge`**: 카테고리별 색상/라벨 뱃지.
*   **`TimelineItem`**: 시간축에 따른 태스크 카드 (Hover 효과 포함).
*   **`WeekProgress`**: 주간 진행바 및 요일별 상태 표시기.
*   **`AddTaskModal`**: 상세 입력(시간, 카테고리, 노트)을 위한 모달.

### 2-2. 페이지별 구현 (`pages/routine`)
*   **`DailyPlanPage` (Timeline View)**:
    *   좌측: 타임라인 (08:00 AM ~ ) 리스트 렌더링.
    *   우측 패널:
        *   **Quick Reflection**: 아침 목표 및 에너지 레벨.
        *   **Pro Tip**: 동기 부여 카드.
        *   **3 Key Tasks**: 우선순위 상위 3개 별도 강조.
*   **`WeeklyReviewPage` (New)**:
    *   주간 완료율 그래프.
    *   요일별 성공/실패 마커.
    *   남은 과제(Pending Tasks) 리스트 및 스케줄링 버튼.
*   **`ArchivePage` (Enhanced)**:
    *   단순 그리드 -> 썸네일/카드 스타일 리스트 (디자인 레퍼런스 반영).
    *   상세 회고 보기 모달/페이지 연결.

---

## Phase 3️⃣: 로직 및 통합

### 3-1. 타임라인 로직
*   시간 순 정렬 및 "Unassigned Slot" 시각화 로직 구현.
*   Drag & Drop (Optional): 태스크 시간 변경 (우선순위 낮음, 추후 고려).

### 3-2. 데이터 연동 및 상태 관리 (Zustand 확장)
*   **Store 구조 복잡도 증가 대응**:
    *   기존: `today`, `reflections`, `isLoading`
    *   **확장**:
        ```typescript
        interface RoutineState {
          today: DailyPlanV2 | null; // 확장된 타입
          weeklyStats: WeeklyStats | null; // 주간 데이터
          categories: CategoryFilter[]; // 필터링 상태
          selectedDate: Date; // 날짜 네비게이션
          viewMode: 'TIMELINE' | 'LIST'; // 뷰 설정
          // Actions...
        }
        ```
*   **Data Fetching**:
    *   `loadToday()`: 오늘 플랜 + 확장된 태스크 정보
    *   `loadWeeklyStats(startDate)`: 주간 통계 별도 호출 (Dashboard 용)

---

## 4. 📂 구조 변경 (Frontend)
```
src/
├── components/routine/
│   ├── ui/ (Badge, Card, Progress...)
│   ├── timeline/ (DailyTimeline, TimeSlot...)
│   ├── modal/ (AddTaskModal...)
│   └── stats/ (WeeklyChart...)
```
