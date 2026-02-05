# Routine Hub 백엔드 분석 보고서

## 1. 프로젝트 구조 개요

Routine Hub는 일일 계획, 태스크, 시간 블록, 그리고 회고(Reflection)를 관리하는 Daily Planning 서비스입니다. 모든 기능은 사용자별로 격리되며 JWT 인증이 필요합니다.

### 디렉토리 구조
```
backend/src/main/java/com/wootae/backend/domain/routine/
├── entity/
│   ├── DailyPlan.java
│   ├── Task.java
│   ├── TimeBlock.java
│   ├── Reflection.java
│   └── PlanStatus.java
├── repository/
│   ├── DailyPlanRepository.java
│   ├── TaskRepository.java
│   ├── TimeBlockRepository.java
│   └── ReflectionRepository.java
├── service/
│   └── RoutineService.java (310줄)
├── controller/
│   ├── RoutineController.java (95줄)
│   └── ReflectionController.java (36줄)
└── dto/
    ├── DailyPlanDto.java (154줄)
    ├── TaskDto.java (207줄)
    ├── TimeBlockDto.java (133줄)
    ├── ReflectionDto.java (186줄)
    ├── DailyPlanCreateRequest.java (13줄)
    ├── TaskCreateRequest.java (18줄)
    ├── ReflectionRequest.java (18줄)
    └── WeeklyStatsResponse.java (14줄)
```

---

## 2. 엔티티 분석

### 2.1 DailyPlan Entity

**파일:** `entity/DailyPlan.java`

| 항목 | 상세 |
|------|------|
| **목적** | 사용자의 일일 계획 데이터 관리 |
| **주요 필드** | `id`, `user` (ManyToOne), `planDate` (LocalDate), `status` (PlanStatus enum), `keyTasks` (OneToMany), `timeBlocks` (OneToMany), `reflection` (OneToOne), `createdAt`, `updatedAt` |
| **Audit** | 자동 createdAt, updatedAt 관리 |

**관계:**
- User와 ManyToOne (LAZY 로딩)
- Task와 OneToMany (CASCADE, orphanRemoval)
- TimeBlock과 OneToMany (CASCADE, orphanRemoval)
- Reflection과 OneToOne (CASCADE, orphanRemoval)

**주요 메서드:** `addTask()`, `setTimeBlocks()`

**문제점:** 중복된 getter 정의 (Lombok @Getter와 수동 getters)

---

### 2.2 Task Entity

**파일:** `entity/Task.java`

| 항목 | 상세 |
|------|------|
| **목적** | 일일 계획 내 키 태스크 데이터 관리 |
| **주요 필드** | `id`, `dailyPlan` (ManyToOne), `title`, `completed`, `taskOrder`, `category`, `startTime`, `endTime`, `durationMinutes`, `description`, `priority` |
| **관계** | DailyPlan과 ManyToOne (LAZY) |
| **주요 메서드** | `update()` (전체 업데이트), `toggleComplete()` (완료 상태 토글) |

**문제점:** priority와 category가 String 타입 (Enum으로 변경 권장)

---

### 2.3 TimeBlock Entity

**파일:** `entity/TimeBlock.java`

| 항목 | 상세 |
|------|------|
| **목적** | 시간대별 활동 블록 관리 (예: 아침 루틴 5-9am) |
| **주요 필드** | `id`, `dailyPlan` (ManyToOne), `period`, `label`, `startHour`, `endHour`, `assignedTask` (OneToOne) |
| **관계** | DailyPlan과 ManyToOne (LAZY), Task와 OneToOne (LAZY, 선택적) |
| **주요 메서드** | `assignTask()` (task 할당) |

**기본 초기화 (Service에서):**
- Morning: 6-9am "Morning Routine"
- Midday: 10-14 "Deep Work"
- Evening: 19-22 "Evening Wind Down"

**문제점:** period와 label이 String (Enum 권장), Setter가 없어서 생성 후 수정 불가능

---

### 2.4 Reflection Entity

**파일:** `entity/Reflection.java`

| 항목 | 상세 |
|------|------|
| **목적** | 일일 계획 완료 후 회고 데이터 저장 |
| **주요 필드** | `id`, `dailyPlan` (OneToOne), `rating` (1-5), `mood`, `whatWentWell`, `whatDidntGoWell`, `tomorrowFocus`, `energyLevel`, `morningGoal` |
| **관계** | DailyPlan과 OneToOne (LAZY, UNIQUE 제약) |
| **주요 메서드** | `update()` (전체 필드 업데이트) |

**제약사항:** DailyPlan당 하나의 Reflection만 가능

---

### 2.5 PlanStatus Enum

**파일:** `entity/PlanStatus.java`

| 상태 | 설명 |
|------|------|
| `PLANNING` | 초기 상태, 계획 수정 가능 |
| `CONFIRMED` | 계획 확정, 수정 제한 가능 |

---

## 3. Repository 분석

### 3.1 DailyPlanRepository

```java
Optional<DailyPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);
List<DailyPlan> findByUserIdOrderByPlanDateDesc(Long userId);
List<DailyPlan> findByUserIdAndPlanDateBetween(Long userId, LocalDate start, LocalDate end);
```

### 3.2 TaskRepository

```java
List<Task> findByDailyPlanIdOrderByTaskOrder(Long dailyPlanId);
```

**문제점:** Task 완료율 조회 쿼리 없음 (통계용 쿼리 추가 필요)

### 3.3 TimeBlockRepository

```java
List<TimeBlock> findByDailyPlanId(Long dailyPlanId);
```

### 3.4 ReflectionRepository

```java
Optional<Reflection> findByDailyPlanId(Long dailyPlanId);
Page<Reflection> findByDailyPlan_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
```

---

## 4. DTO 분석

### 4.1 DailyPlanDto

| 필드 | 타입 |
|------|------|
| `id` | Long |
| `planDate` | String |
| `keyTasks` | List<TaskDto> |
| `timeBlocks` | List<TimeBlockDto> |
| `reflection` | ReflectionDto |
| `status` | String |

**특징:** `from()` 정적 메서드로 Entity 변환, 내부 builder 패턴
**문제점:** Lombok 미사용으로 인한 코드 중복 (100+ 줄)

### 4.2 TaskDto

| 필드 | 타입 |
|------|------|
| `id` | Long |
| `title` | String |
| `description` | String |
| `completed` | Boolean |
| `taskOrder` | Integer |
| `category` | String |
| `startTime` | String (HH:mm:ss) |
| `endTime` | String (HH:mm:ss) |
| `durationMinutes` | Integer |
| `priority` | String |

### 4.3 TimeBlockDto

| 필드 | 타입 |
|------|------|
| `id` | Long |
| `period` | String |
| `label` | String |
| `startHour` | Integer |
| `endHour` | Integer |
| `assignedTaskId` | Long (Task ID만 전달) |

### 4.4 ReflectionDto

모든 Reflection 필드 + dailyPlanId 포함

### 4.5 WeeklyStatsResponse

```java
{
  "weeklyRate": 75.5,           // 주간 전체 달성률 (0~100%)
  "dailyCompletion": {          // 요일별 완료율
    "MON": 100.0,
    "TUE": 50.0,
    ...
  }
}
```

---

## 5. Service 분석

**파일:** `service/RoutineService.java` (310줄)

### 5.1 핵심 기능

| 메서드 | 기능 | 권한 검사 |
|--------|------|---------|
| `getOrCreateTodayPlan()` | 오늘 계획 조회 또는 자동 생성 | O |
| `createDailyPlan()` | 계획 생성 + 기본 TimeBlock 초기화 | - |
| `initTimeBlocks()` | 3개 기본 시간 블록 생성 | - |
| `getPlan(date)` | 특정 날짜 계획 조회 | O |
| `confirmPlan(date)` | 계획 상태를 CONFIRMED로 변경 | O |
| `unconfirmPlan(date)` | 계획 상태를 PLANNING으로 변경 | O |
| `createPlan(request)` | 새 계획 명시적 생성 (중복 체크) | O |
| `addTask(planId, request)` | 태스크 추가 | O |
| `updateTask(taskId, request)` | 태스크 업데이트 + unassign 지원 | O |
| `toggleTask(taskId)` | 태스크 완료 상태 토글 | O |
| `deleteTask(taskId)` | 태스크 삭제 | O |
| `saveReflection(request)` | 회고 생성/수정 (upsert) | O |
| `getArchive(pageable)` | 회고 아카이브 페이징 조회 | O |
| `getWeeklyStats(date)` | 주간 통계 계산 | O |

### 5.2 인증 및 권한 검사

```java
getCurrentUserId()  // SecurityContext에서 사용자 ID 추출
getCurrentUser()    // DB에서 사용자 조회
// 모든 변경 작업에서 사용자 소유권 검증
```

### 에러 코드

| 에러 | 설명 |
|------|------|
| `AUTH_UNAUTHORIZED` | 인증 정보 없음 |
| `USER_NOT_FOUND` | 사용자 조회 실패 |
| `PLAN_NOT_FOUND` | 계획 미존재 |
| `TASK_NOT_FOUND` | 태스크 미존재 |
| `UNAUTHORIZED_ACCESS` | 소유권 없음 |
| `INVALID_INPUT_VALUE` | 중복된 계획 생성 시도 |

### 5.3 initTimeBlocks 로직 (하드코딩됨)

```
Morning:    6am-9am   "Morning Routine"
Midday:    10am-2pm   "Deep Work"
Evening:    7pm-10pm  "Evening Wind Down"
```

### 5.4 getWeeklyStats 로직

- 월요일 기준 주간 계산
- 일별 완료율 계산 및 소수점 첫째 자리 반올림
- 주간 전체 완료율 계산
- 요일명 3글자 축약 (MON, TUE, ...)

### 5.5 문제점 및 개선 필요 사항

| 문제점 | 영향도 | 해결방안 |
|--------|--------|---------|
| 하드코딩된 TimeBlock 초기화 | 중 | 설정 파일이나 DB에서 로드 |
| TaskOrder가 size()로만 계산 | 중 | 삭제 후 재정렬 로직 추가 필요 |
| 태스크 최대 개수 제한 없음 | 중 | Service 로직에서 검증 추가 |
| 시간 충돌 검증 없음 | 중 | TimeBlock 시간대 충돌 체크 추가 |
| Reflection 선택적 필드 미처리 | 낮 | null 체크 추가 |

---

## 6. Controller 분석

### 6.1 RoutineController

**Base URL:** `/api/v1/routine`

| 엔드포인트 | 메서드 | 기능 | 요청 본문 | 응답 |
|----------|--------|------|---------|------|
| `/daily-plans/today` | GET | 오늘 계획 조회 | - | DailyPlanDto |
| `/daily-plans/{date}` | GET | 특정 날짜 계획 | - | DailyPlanDto |
| `/daily-plans` | POST | 계획 생성 | DailyPlanCreateRequest | DailyPlanDto |
| `/daily-plans/{date}/confirm` | POST | 계획 확정 | - | DailyPlanDto |
| `/daily-plans/{date}/unconfirm` | POST | 계획 확정 취소 | - | DailyPlanDto |
| `/daily-plans/{planId}/tasks` | POST | 태스크 추가 | TaskCreateRequest | TaskDto |
| `/tasks/{taskId}/toggle` | PATCH | 태스크 완료 토글 | - | TaskDto |
| `/tasks/{taskId}` | PUT | 태스크 수정 | TaskCreateRequest | TaskDto |
| `/tasks/{taskId}` | DELETE | 태스크 삭제 | - | success |
| `/stats/weekly` | GET | 주간 통계 | ?date=YYYY-MM-DD | WeeklyStatsResponse |

### 6.2 ReflectionController

**Base URL:** `/api/v1/routine/reflections`

| 엔드포인트 | 메서드 | 기능 | 요청 본문 | 응답 |
|----------|--------|------|---------|------|
| `/` | POST | 회고 저장/수정 | ReflectionRequest | ReflectionDto |
| `/archive` | GET | 회고 아카이브 | ?page=0&size=10 | Page<ReflectionDto> |

### 응답 형식
```json
{ "success": true, "data": {...} }
```

---

## 7. API 엔드포인트 최종 정리

**총 12개 엔드포인트**

### Daily Plan (5개)
1. `GET /api/v1/routine/daily-plans/today` - 오늘 계획 조회/자동 생성
2. `GET /api/v1/routine/daily-plans/{date}` - 특정 날짜 계획 조회
3. `POST /api/v1/routine/daily-plans` - 새 계획 생성
4. `POST /api/v1/routine/daily-plans/{date}/confirm` - 계획 확정
5. `POST /api/v1/routine/daily-plans/{date}/unconfirm` - 계획 확정 취소

### Task (4개)
6. `POST /api/v1/routine/daily-plans/{planId}/tasks` - 태스크 추가
7. `PATCH /api/v1/routine/tasks/{taskId}/toggle` - 완료 상태 토글
8. `PUT /api/v1/routine/tasks/{taskId}` - 태스크 수정
9. `DELETE /api/v1/routine/tasks/{taskId}` - 태스크 삭제

### Reflection (2개)
10. `POST /api/v1/routine/reflections` - 회고 저장/수정
11. `GET /api/v1/routine/reflections/archive` - 회고 아카이브 조회

### Statistics (1개)
12. `GET /api/v1/routine/stats/weekly` - 주간 통계

---

## 8. 누락된 기능 및 미완성 코드

| 기능 | 상태 | 영향도 |
|------|------|--------|
| 태스크 최대 개수(3개) 제한 | TODO (주석) | 높음 |
| TimeBlock 설정 기반 초기화 | TODO (주석) | 중 |
| TimeBlock 시간 충돌 검증 | 미구현 | 중 |
| 태스크 시간 제약 검증 | 미구현 | 낮 |
| 계획 상태별 기능 제한 | 미구현 | 중 |
| Batch 업데이트 | 미구현 | 낮 |
| 태스크 순서 변경 API | 미구현 | 중 |
| 태스크 복사 (이전 일 계획) | 미구현 | 낮 |
| 주간 회고 저장 API | **미구현** | **높음** |

---

## 9. 코드 품질 및 개선사항

### 9.1 코드 스타일

| 항목 | 현황 | 개선안 |
|------|------|--------|
| Lombok 사용 | 불일관 (Entity는 @Builder, DTO는 수동) | DTO에도 Lombok 적용 |
| null 체크 | 기본적 수준 | 선택적 필드 명시적 처리 |
| 상수화 | 미흡 (하드코딩) | 상수로 분리 필요 |

### 9.2 데이터 타입 개선 권장

| 필드 | 현재 타입 | 권장 타입 |
|------|---------|---------|
| Task.priority | String | Enum (HIGH, MEDIUM, LOW) |
| Task.category | String | Enum (WORK, HEALTH, PERSONAL, STUDY) |
| TimeBlock.period | String | Enum (MORNING, MIDDAY, EVENING) |
| Reflection.mood | String | Enum (HAPPY, NEUTRAL, SAD) |

### 9.3 보안

| 항목 | 평가 | 상세 |
|------|------|------|
| 인증 검증 | O | 모든 엔드포인트에서 SecurityContext 사용 |
| 권한 검증 | O | 사용자 소유권 검사 |
| SQL Injection | O | JPA 사용으로 안전 |
| Rate Limiting | X | 구현 안 됨 |

---

## 10. 성능 분석

### 10.1 조회 성능

| 쿼리 | 최적화 상태 | 개선안 |
|------|-----------|--------|
| findByUserIdAndPlanDate | 적절 | 인덱스 필요 (user_id, plan_date) |
| getWeeklyStats | **비효율** | 주간 계획 로드 후 메모리 처리 → 쿼리로 이동 권장 |

### 10.2 N+1 Problem

```
문제점: getWeeklyStats에서 dailyPlanRepository.findByUserIdAndPlanDateBetween()
후 plan.getKeyTasks() 접근 시 각 Task마다 쿼리 발생

해결: @Query + fetch join 사용
```

### 10.3 캐싱 권장

| 데이터 | 캐싱 여부 | 권장 |
|--------|---------|------|
| WeeklyStats | X | 일 내 캐싱 가능 |
| DailyPlan | X | 자주 변경되므로 부분 캐싱만 권장 |

---

## 11. 테스트 필요 영역

| 영역 | 우선순위 | 테스트 케이스 |
|------|---------|-------------|
| Task 토글 동작 | 높음 | completed ↔ !completed |
| WeeklyStats 계산 | 높음 | 다양한 완료율 시나리오 |
| Reflection upsert | 중 | 신규 생성 vs 기존 수정 |
| 권한 검증 | 높음 | 다른 사용자 접근 시도 |
| TimeBlock 초기화 | 중 | 중복 생성 방지 |

---

## 12. 의존성 관계도

```
User (entity)
  ↓
DailyPlan ←─→ Task, TimeBlock, Reflection
  ↓
RoutineService
  ├─ DailyPlanRepository
  ├─ TaskRepository
  ├─ TimeBlockRepository
  ├─ ReflectionRepository
  └─ UserRepository
  ↓
RoutineController / ReflectionController
```

**데이터 흐름:**
```
Request → Controller → Service → Repository → Entity → DTO → Response
```

---

## 13. 최종 평가

### 강점
- 명확한 아키텍처 (Entity → Repository → Service → Controller → DTO)
- 체계적인 권한 검증
- 포괄적인 데이터 모델링
- 기본 CRUD 기능 완료

### 약점
- String 타입 필드들 (Enum으로 변경 권장)
- 하드코딩된 설정값
- 태스크 순서 관리 미흡
- 시간대 충돌 검증 없음
- N+1 쿼리 문제 가능성
- **주간 회고 저장 API 없음**

### 우선 개선 항목
1. **주간 회고 저장 API 추가** (프론트엔드 WeeklyReviewPage 지원)
2. TaskCreateRequest의 선택적 필드 null 처리 개선
3. TaskOrder 재정렬 로직 추가
4. TimeBlock 초기화 설정화
5. Enum 타입 도입 (Priority, Category, Period, Mood)
6. WeeklyStats 쿼리 최적화
