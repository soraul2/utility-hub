# Routine Hub 프론트엔드 분석 보고서

## 1. 프로젝트 구조 개요

### 주요 디렉토리 구성
```
frontend/src/
├── pages/routine/          # 5개 페이지 컴포넌트
├── components/routine/     # 7개 UI 컴포넌트
├── stores/                 # Zustand 상태 관리 (1개 파일)
├── services/routine/       # API 통신 계층 (1개 파일)
└── types/routine.d.ts      # 타입 정의
```

---

## 2. 타입 정의 분석

**파일:** `frontend/src/types/routine.d.ts`

### 주요 타입

| 타입 | 용도 | 필드 수 |
|------|------|--------|
| `Category` | 작업 분류 | WORK, PERSONAL, HEALTH, STUDY |
| `Priority` | 우선순위 | HIGH, MEDIUM, LOW |
| `Task` | 개별 작업 | 14개 필드 (필수+선택) |
| `TimeBlock` | 시간대 블록 | 5개 필드 |
| `Reflection` | 하루 회고 | 8개 필드 (선택적) |
| `DailyPlan` | 일일 계획 | 6개 주요 필드 |
| `WeeklyStats` | 주간 통계 | 2개 필드 |
| `TaskDto` | 작업 생성 DTO | 6개 필드 |
| `ReflectionDto` | 회고 생성 DTO | 7개 필드 |

### 평가
- 명확한 구조로 V1, V2 필드 구분
- `TaskDto`와 `Task` 간의 필드 불일치 존재
- Optional 필드가 많아 타입 안정성 저하 가능

---

## 3. 페이지 컴포넌트 분석

### 3.1 DailyPlanPage.tsx (407줄)

**목적:** 일일 계획 수립 및 실행 관리의 핵심 페이지

**주요 기능:**
1. **이중 뷰 모드:**
   - Planning Stage: 계획 수립 (KineticPool + KineticTimeline)
   - Live Execution (Confirmed): 확정된 계획 실행 (ConfirmedPlanView)

2. **Kinetic 시스템:**
   - Inventory (좌측 사이드바): 미할당 작업 목록
   - Timeline (중앙): 시간대별 작업 배치
   - 드래그 앤 드롭으로 작업 할당

3. **빠른 추가 기능:**
   - Quick Mode: 카테고리, 우선순위, 소요시간 빠른 입력
   - Detail Mode: 상세 설명, 시작시간 등 추가 정보

**의존성:**
- useRoutineStore (loadPlan, confirmPlan, deleteTask, updateTask, addTask)
- KineticPool, KineticTimeline, ConfirmedPlanView
- date-fns, lucide-react

**문제점:**
- 코드 길이 407줄로 과도함 → 컴포넌트 분할 필요
- 로컬 상태 관리 복잡 (newTask 객체)
- 네트워크 에러 처리 미흡
- `loadPlan` 중복 호출 (line 43, 74)
- 인라인 스타일 과다
- 입력 검증 부재 (durationHours/Minutes의 음수 처리)
- 접근성 문제 (스크린 리더 설명 부족)

---

### 3.2 RoutineLayout.tsx (16줄)

**목적:** Routine 모든 페이지의 상위 레이아웃

**구조:**
```
<RoutineLayout>
  <Header /> (고정)
  <main>
    <Outlet /> (페이지별 콘텐츠)
  </main>
</RoutineLayout>
```

**문제점:**
- 여백 처리 (`pt-20`) 하드코딩
- dark 모드 미지원

---

### 3.3 ReflectionPage.tsx (217줄)

**목적:** 일일 회고 작성 및 저장

**주요 기능:**
1. **5단계 회고 양식:**
   - 만족도 별점 (1-5)
   - 기분 선택 (나쁨/보통/좋음)
   - 잘한 점 (Keep)
   - 아쉬운 점 (Problem)
   - 내일 다짐 (Try) - KPT 프레임워크

**문제점:**
- 성공/실패 피드백 부재 - saveReflection 후 토스트 없음
- 필드 길이 제한 없음
- 중복 회고 방지 로직 미비
- 회고 수정 기능 없음 (덮어쓰기만 가능)
- 회고 삭제 불가능
- 에너지 레벨 입력 필드 없음 (타입에는 정의됨)

---

### 3.4 WeeklyReviewPage.tsx (259줄)

**목적:** 주간 통계 및 회고

**주요 기능:**
1. **Overview 탭:** 주간 종합 점수, 일별 완료도 그래프, Key Highlights, Weekly Badge
2. **Weekly Reflection 탭:** 주간 회고 폼

**심각한 문제:**
- **Save 버튼 비작동** (line 249에 onClick 핸들러 없음)
- 데이터 하드코딩 (line 99: "+12% 성장")
- 일별 데이터 정렬 로직 불명확

---

### 3.5 ArchivePage.tsx (178줄)

**목적:** 과거 회고 기록 열람 및 검색

**문제점:**
- pagination 미구현 - 처음 20개만 로드
- 정렬 옵션 없음
- 필터링 기능 없음

---

## 4. UI 컴포넌트 분석

### 4.1 Header.tsx (60줄)
- Help 버튼 비작동 (onClick 없음)
- 사용자 이름 "JD" 하드코딩
- 로그아웃 기능 없음

### 4.2 KineticPool.tsx (138줄)
**목적:** 미할당 작업 인벤토리

- 우수한 UX (드래그 중 시각적 피드백)
- 드래그 상태 간 깜빡임 문제
- 빈 상태에서 CTA 없음

### 4.3 KineticTimeline.tsx (293줄)
**목적:** 시간대별 작업 배치 (핵심 인터랙션)

**핵심 기능:**
- 시간 좌표 변환 (posToTime, timeToPos)
- 드래그, 리사이즈, 드롭
- 겹치는 작업 자동 정렬 (레인 배치)

**문제점:**
- 코드 복잡도 높음 (293줄)
- useState 과다
- 에러 처리 미비
- 접근성 완전히 누락 (키보드 네비게이션 불가)
- 시간대 강조, 현재 시간 표시선, 작업 충돌 감지 없음

### 4.4 ConfirmedPlanView.tsx (174줄)
- 읽기 쉬운 깔끔한 레이아웃
- 완료 토글 기능 제한적

### 4.5 AddTaskModal.tsx (237줄)
- **코드베이스에서 사용되지 않음** - DailyPlanPage의 인라인 폼이 대신함
- 중복 코드

### 4.6 TimelineItem.tsx (116줄)
- **사용되지 않는 컴포넌트**
- 코드 중복 (ConfirmedPlanView와 유사)

### 4.7 TaskCategoryBadge.tsx (36줄)
- 간결하고 재사용 가능
- dark 모드 지원
- 카테고리 확장 어려움 (하드코딩)

---

## 5. 상태 관리 분석

**파일:** `frontend/src/stores/useRoutineStore.ts`
**라이브러리:** Zustand

### 상태 구조
```typescript
{
  today: DailyPlan | null,
  reflections: Reflection[],
  weeklyStats: WeeklyStats,
  isLoading: boolean,
  error: string | null
}
```

### 액션 목록

| 액션 | 용도 | API 호출 |
|------|------|---------|
| `loadToday()` | 오늘 계획 로드 | GET /daily-plans/today |
| `loadPlan(date)` | 특정일 계획 로드 | GET /daily-plans/{date} |
| `addTask()` | 작업 추가 | POST /daily-plans/{planId}/tasks |
| `updateTask()` | 작업 수정 | PUT /tasks/{id} |
| `toggleTask()` | 작업 완료 토글 | PATCH /tasks/{id}/toggle |
| `deleteTask()` | 작업 삭제 | DELETE /tasks/{id} |
| `saveReflection()` | 회고 저장 | POST /reflections |
| `loadArchive()` | 회고 목록 로드 | GET /reflections/archive |
| `loadWeeklyStats()` | 주간 통계 로드 | GET /stats/weekly |
| `confirmPlan()` | 계획 확정 | POST /daily-plans/{date}/confirm |

### 문제점
- 타입 안정성 부족: `updateTask: (taskId: number, data: any)`
- 에러 처리 불완전: `loadWeeklyStats`의 Silent fail
- 로딩 상태 관리 불완전
- 에러 자동 제거 로직 없음

### 미제공 기능
- 낙관적 업데이트 (Optimistic Updates)
- 재시도 로직
- 캐시 무효화 전략

---

## 6. API 서비스 분석

**파일:** `frontend/src/services/routine/api.ts`

### 엔드포인트 목록

| 메서드 | 엔드포인트 | 용도 |
|--------|-----------|------|
| GET | `/daily-plans/today` | 오늘 계획 조회 |
| GET | `/daily-plans/{date}` | 특정일 계획 조회 |
| POST | `/daily-plans` | 계획 생성 |
| POST | `/daily-plans/{date}/confirm` | 계획 확정 |
| POST | `/daily-plans/{planId}/tasks` | 작업 추가 |
| PUT | `/tasks/{id}` | 작업 수정 |
| DELETE | `/tasks/{id}` | 작업 삭제 |
| PATCH | `/tasks/{id}/toggle` | 작업 완료 토글 |
| POST | `/reflections` | 회고 저장 |
| GET | `/reflections/archive` | 회고 목록 |
| GET | `/stats/weekly` | 주간 통계 |

### 문제점
- 응답 타입 불일치: `any` 사용
- 에러 응답 타입 미정의
- 타임아웃 설정 없음

### 미제공 엔드포인트
- 계획 수정 (PATCH)
- 계획 삭제 (DELETE)
- 회고 수정/삭제
- 배치 작업 관리

---

## 7. 주요 문제점 및 개선 사항 종합

### 긴급 수정 필요

1. **WeeklyReviewPage - Save 버튼 미작동**
   - 주간 회고 저장 불가능

2. **DailyPlanPage - 중복 loadPlan 호출**
   - 불필요한 네트워크 요청

3. **ReflectionPage - 성공 피드백 부재**
   - 사용자가 저장 여부 확인 불가능

4. **타입 안정성**
   - `any` 타입 남용

### 높은 우선순위

5. **접근성 개선:** 키보드 네비게이션, ARIA 레이블
6. **에러 처리:** 재시도 로직, 사용자 친화적 에러 메시지
7. **상태 관리 개선:** 각 비동기 작업별 로딩 상태

### 중간 우선순위

8. **코드 중복:** AddTaskModal과 DailyPlanPage 폼 로직 동일
9. **성능 최적화:** useMemo 활용
10. **기능 누락:** 회고 수정/삭제, 주간 회고 저장

### 낮은 우선순위

11. **UX 개선:** Help 버튼, 로그아웃, dark 모드
12. **데이터 하드코딩 제거**

---

## 8. 미완성/미구현 기능

| 기능 | 현재 상태 | 영향도 |
|------|---------|--------|
| 회고 수정 | 덮어쓰기만 가능 | 중간 |
| 회고 삭제 | 미구현 | 낮음 |
| 주간 회고 저장 | 폼만 있고 미작동 | **높음** |
| 에너지 레벨 입력 | 타입만 정의됨 | 낮음 |
| 계획 수정 (확정 후) | 완전 불가능 | 중간 |
| 키보드 네비게이션 | 미구현 | 중간 |
| 현재 시간 표시선 | 미구현 | 낮음 |

---

## 9. 코드 품질 지표

| 지표 | 상태 | 비고 |
|------|------|------|
| 타입 안정성 | 중간 | 'any' 사용, Optional 필드 과다 |
| 에러 처리 | **낮음** | Silent fail, 재시도 없음 |
| 테스트 가능성 | 중간 | 컴포넌트 크기 과대 |
| 코드 재사용성 | 중간 | 중복 로직 존재 |
| 접근성 | **낮음** | ARIA, 키보드 미지원 |
| 성능 | 중간 | 복잡한 렌더링, 최적화 가능 |

---

## 10. 리팩토링 제안

### 우선순위 1: 즉시 수정
```typescript
// WeeklyReviewPage - Save 버튼에 핸들러 추가
const handleSaveWeeklyReview = async () => {
  // 백엔드 엔드포인트 필요: POST /v1/routine/reviews/weekly
};

// ReflectionPage - 성공 메시지 추가
showSuccess('회고가 저장되었습니다');
```

### 우선순위 2: 컴포넌트 분할
```
DailyPlanPage (407줄) →
  ├─ DailyPlanHeader
  ├─ PlanningView
  ├─ ConfirmedView
  └─ QuickAddForm

KineticTimeline (293줄) →
  ├─ TimelineGrid
  ├─ TimelineTask
  ├─ GhostElement
  └─ useTimelineInteractions (커스텀 훅)
```

### 우선순위 3: 타입 강화
```typescript
// 'any' 대신 명확한 타입 사용
updateTask: (taskId: number, data: Partial<Task>) => Promise<void>;
```

---

## 11. 최종 평가

**종합 점수: 7.5/10**

### 강점
- 명확한 관심사의 분리 (Pages, Components, Services, Types)
- Zustand로 간단한 상태 관리
- RESTful API 설계
- Kinetic 시스템의 혁신적인 UX
- 일관된 디자인 시스템 (Tailwind, 색상 체계)

### 약점
- 컴포넌트 크기 과대
- 로컬 상태와 전역 상태 혼재
- 에러 처리 전략 부재
- 테스트 불가능한 구조
- TypeScript의 이점 미활용

### 권장사항
1. **즉시:** WeeklyReviewPage 저장 기능 완성
2. **1주일:** 컴포넌트 분할 및 코드 정리
3. **2주일:** 테스트 작성 (특히 KineticTimeline)
4. **3주일:** 접근성 및 에러 처리 개선
