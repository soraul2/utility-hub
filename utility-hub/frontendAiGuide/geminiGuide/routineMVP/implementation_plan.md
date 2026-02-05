# 🚀 Routine MVP - Utility Hub 통합 최종 구현 계획

**기준**: 제미나이팀 문서 + Claude 검토/개선안 + 이전 보완 가이드 통합
**목표**: Utility Hub에 Routine 모듈을 완전 통합하여 운영 가능한 MVP 완성

---

## Phase 0️⃣: 사전 분석 (1-2일) ⭐ 필수

### 0-1. 기존 Utility Hub 구조 완전 파악

**Frontend 분석 항목**:
*   `src/` 폴더 내 `pages/`, `components/` 구조 확인
*   `App.tsx`에서 라우팅 패턴 (React Router v6 설정) 확인
*   상태 관리 방식 확인 (Context API? Zustand?)
*   API Base URL 및 호출 패턴 (`useTop` or `axios` 인스턴스 위치)
*   스타일 시스템 (Tailwind 설정, 공통 UI 컴포넌트)
*   로그인 및 사용자 세션 관리 방식

**Backend 분석 항목**:
*   `com.wootae.backend` 패키지 구조 및 User/Auth 패키지 위치
*   Spring Security 설정 및 CORS 설정 위치
*   Database 스키마 (User 테이블 구조)
*   JPA 설정 및 BaseEntity/BaseController 패턴 존재 여부
*   Exception Handling 및 ApiResponse 패턴

**산출물**: `UTILITY_HUB_STRUCTURE.md` (구조 분석 보고서)

---

## Phase 1️⃣: API 명세 작성 (1-2일)

### 1-1. REST API 완전 정의

**Daily Plan API**:
*   `GET /api/v1/routine/daily-plans/today`: 오늘 계획 조회 (없으면 생성)
*   `GET /api/v1/routine/daily-plans/{date}`: 특정 날짜 계획 조회
*   `POST /api/v1/routine/daily-plans`: 새 계획 생성
*   `PUT /api/v1/routine/daily-plans/{id}`: 계획 수정
*   `DELETE /api/v1/routine/daily-plans/{id}`: 계획 삭제

**Task API**:
*   `POST /api/v1/routine/daily-plans/{planId}/tasks`: 태스크 추가
*   `PUT /api/v1/routine/tasks/{id}`: 태스크 수정
*   `DELETE /api/v1/routine/tasks/{id}`: 태스크 삭제
*   `PATCH /api/v1/routine/tasks/{id}/toggle`: 태스크 완료 토글

**Reflection API**:
*   `POST /api/v1/routine/reflections`: 회고 저장
*   `GET /api/v1/routine/reflections/{planId}`: 회고 조회
*   `GET /api/v1/routine/reflections/archive`: 아카이브 조회 (페이징)

### 1-2. Swagger 설정
*   `springdoc-openapi-starter-webmvc-ui` 의존성 확인/추가
*   Routine API 그룹 설정

---

## Phase 2️⃣: Frontend 통합 설정 (1-2일)

### 2-1. 환경 구성
*   **디렉토리 생성**:
    *   `src/components/routine/{DailyPlan,Reflection,Layout}`
    *   `src/pages/routine`
    *   `src/stores`
    *   `src/services/routine`
    *   `src/types`
*   **의존성 설치**: `npm install zustand date-fns lucide-react` (axios는 기존 확인 후)

### 2-2. 라우팅 및 설정
*   `App.tsx`: `/routine` 라우트 및 하위 라우트(`daily`, `reflection`, `archive`) 추가
*   `src/services/api.ts`: Axios 인스턴스 및 Interceptor 설정 (Auth Token 처리)

### 2-3. 상태 관리 (Zustand)
*   `src/stores/useRoutineStore.ts` 구현
    *   State: `today`, `reflections`, `isLoading`, `error`
    *   Actions: `loadToday`, `addTask`, `toggleTask`, `saveReflection` 등
    *   Persist Middleware 활용 고려

---

## Phase 3️⃣: Backend 도메인 구현 (2-3일)

### 3-1. Entity 구현 (`com.wootae.backend.routine.domain`)
*   `DailyPlan`: User(ManyToOne), planDate, keyTasks, timeBlocks
*   `Task`: DailyPlan(ManyToOne), title, completed, order
*   `TimeBlock`: DailyPlan(ManyToOne), period, label, timeRange
*   `Reflection`: DailyPlan(OneToOne), rating, mood, questions

### 3-2. Repository 구현 (`com.wootae.backend.routine.repository`)
*   `DailyPlanRepository`: `findByUserIdAndPlanDate`, `findByUserIdOrderByPlanDateDesc`
*   `TaskRepository`, `ReflectionRepository`, `TimeBlockRepository`

### 3-3. Service 구현 (`com.wootae.backend.routine.service`)
*   `DailyPlanService`: 오늘 계획 조회(없으면 생성 로직), 계획 수정
*   `RoutineTaskService`: 태스크 추가/삭제/토글
*   `ReflectionService`: 회고 저장, 아카이브 조회

---

## Phase 4️⃣: API 구현 및 통합 (2-3일)

### 4-1. Controller 및 DTO
*   `RoutineController`: DailyPlan/Task 관련 엔드포인트 구현
*   `ReflectionController`: Reflection 관련 엔드포인트 구현
*   DTO (`DailyPlanDto`, `TaskDto`, `ReflectionDto`) 및 Mapper 구현

### 4-2. Frontend-Backend 연동
*   Frontend `useRoutineStore`에서 Mock Data 대신 실제 API 호출로 전환
*   CORS 설정 및 인증 토큰 전달 확인

---

## Phase 5️⃣: UI 고도화 및 테스트 (2-3일)

### 5-1. UI Polish
*   **Glassmorphism**: 투명도, 블러 효과 적용 (`backdrop-blur-md`, `bg-white/10`)
*   **Animation**: 태스크 완료 시 마이크로 인터랙션
*   **Mobile Response**: 모바일 뷰 최적화 (타임라인 스크롤 등)

### 5-2. 테스트
*   **Frontend**: Daily Plan 생성 -> Task 추가 -> Reflection 작성 -> Archive 확인 흐름 검증
*   **Backend**: Service 단위 테스트 및 API 통합 테스트
*   **데이터 검증**: User별 데이터 격리 확인

---

## 6. 📂 디렉토리 구조 (최종)

### Frontend
```
src/
├── components/
│   ├── common/ (기존)
│   └── routine/
│       ├── DailyPlan/ (KeyTaskInput, TimeBlockSection)
│       ├── Reflection/ (ReflectionForm, ReflectionCard)
│       └── Layout/ (RoutineLayout)
├── pages/
│   └── routine/ (DailyPlanPage, ReflectionPage, ArchivePage)
├── stores/
│   └── useRoutineStore.ts
├── services/
│   └── routine/ (api calls)
└── types/
    └── routine.d.ts
```

### Backend
```
com.wootae.backend.routine/
├── controller/
├── service/
├── repository/
├── domain/ (Entity)
└── dto/
```
