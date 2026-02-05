# 📋 Implementation Plan - Routine MVP (최종 수정판)

## 1. 🎯 목표 (Goal)
Perplexity 팀의 `design_spec.md`를 바탕으로 "하루 5분 루틴 관리"를 위한 **Routine MVP** 웹 애플리케이션을 구현합니다.
사용자가 직관적으로 하루를 계획하고 회고할 수 있는 **React 기반의 Single Page Application(SPA)**을 구축하며, 세션 내 데이터 관리 및 향후 확장성을 고려한 구조로 설계합니다.

---

## 2. 🏗️ 기술 스택 및 아키텍처 (Tech Stack)

### Frontend (React)
**핵심 프레임워크**
*   **Core**: React 18, TypeScript, Vite
*   **Styling**: TailwindCSS (Design System & Utils)
*   **Routing**: React Router v6
*   **State Management**: React Context API + useReducer (간결성) 또는 **Zustand** (확장성 고려 시)
*   **HTTP Client**: Axios (Spring Boot API 통신)

**유틸리티 라이브러리 (최소화)**
*   **date-fns** (날짜 처리 및 포매팅)
*   **lucide-react** (아이콘)
*   **framer-motion** (Phase 2 이후, 애니메이션 추가용 - 현재는 선택 사항)

**제외된 라이브러리 (MVP 스코프 외)**
- ❌ `react-beautiful-dnd` / `@dnd-kit` (Drag & Drop은 Phase 2로 미연기)
- ❌ `framer-motion` (초기 배포 후 추가)

### Backend (Spring Boot)
**핵심 프레임워크**
*   **Framework**: Spring Boot 3.x (latest)
*   **Build Tool**: Maven 또는 Gradle
*   **Java Version**: JDK 17 LTS 이상
*   **API**: Spring Web MVC (REST)
*   **ORM**: Spring Data JPA + Hibernate
*   **Database**: MySQL 8.0+
*   **Validation**: Spring Validation (Bean Validation)
*   **Logging**: SLF4J + Logback

**부가 라이브러리**
*   **Lombok** (Boilerplate 코드 제거)
*   **MapStruct** (DTO ↔ Entity 변환)
*   **SpringDoc OpenAPI** (Swagger/OpenAPI 3.0)
*   **Spring Boot DevTools** (개발 시 Hot Reload)
*   **H2 Database** (테스트용)

**선택 라이브러리 (Phase 2+)**
*   **Spring Security + JWT** (인증/인가)
*   **Spring Data Redis** (캐싱, 세션)
*   **Querydsl** (동적 쿼리)

### 데이터 영속성
- ✅ **MySQL 8.0+** (메인 데이터베이스)
- ✅ **JPA Repository** (데이터 접근 계층)
- ✅ **Connection Pool**: HikariCP (기본값)
- ⚠️ **Frontend**: React state로 세션 내 임시 관리, 저장 시 API 호출

### 시스템 아키텍처
```
┌─────────────────────┐
│  Frontend (React)   │
│  - TypeScript       │
│  - TailwindCSS      │
│  - Axios HTTP       │
└──────────┬──────────┘
           │ REST API (JSON)
           │ (HTTP/HTTPS)
┌──────────▼──────────┐
│ Backend (Spring)    │
│ - Spring Boot 3.x   │
│ - REST Controller   │
│ - Service Layer     │
│ - JPA Repository    │
└──────────┬──────────┘
           │ JDBC/SQL
┌──────────▼──────────┐
│ Database (MySQL)    │
│ - InnoDB            │
│ - UTF-8mb4          │
└─────────────────────┘
```

---

## 3. 🧩 디렉토리 구조 (Directory Structure)

### Frontend 구조 (React)
```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                 # 네비게이션 메뉴
│   │   │   └── Layout.tsx                  # 페이지 레이아웃 스캐폴드
│   │   ├── common/
│   │   │   ├── Button.tsx                  # 공용 버튼
│   │   │   ├── Card.tsx                    # 공용 카드
│   │   │   └── Input.tsx                   # 공용 입력필드
│   │   └── domain/
│   │       ├── KeyTaskInput.tsx            # 3개 Key Task 입력 폼
│   │       ├── TimeBlockSection.tsx        # 4개 TimeBlock 섹션 (아침/낮/오후/저녁)
│   │       ├── ReflectionForm.tsx          # 회고 폼 (3개 질문 + 평점)
│   │       └── ReflectionCard.tsx          # 회고 카드 (Archive 뷰용)
│   ├── pages/
│   │   ├── HomePage.tsx                    # 일일 계획 페이지 (Core MVP)
│   │   ├── ReflectionPage.tsx              # 회고 페이지 (Core MVP)
│   │   └── ArchivePage.tsx                 # 회고 아카이브 조회 (Phase 3)
│   ├── context/
│   │   ├── RoutineContext.tsx              # Context 정의
│   │   └── routineReducer.ts               # Reducer 로직
│   ├── hooks/
│   │   ├── useRoutine.ts                   # Context 사용 커스텀 훅
│   │   └── useApi.ts                       # API 호출 커스텀 훅 (NEW)
│   ├── services/
│   │   └── api.ts                          # Axios 인스턴스 및 API 호출 함수 (NEW)
│   ├── types/
│   │   └── routine.d.ts                    # TypeScript 인터페이스
│   ├── utils/
│   │   ├── dateHelpers.ts                  # 날짜 유틸 함수
│   │   └── validators.ts                   # 입력값 검증
│   ├── styles/
│   │   └── index.css                       # TailwindCSS + 디자인 토큰
│   ├── App.tsx                             # 라우팅 설정
│   └── main.tsx                            # 진입점
├── .env.example                            # 환경변수 템플릿
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

### Backend 구조 (Spring Boot)
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/routine/
│   │   │   ├── RoutineMvpApplication.java  # Spring Boot 진입점
│   │   │   ├── config/
│   │   │   │   ├── JpaConfig.java          # JPA 설정
│   │   │   │   ├── CorsConfig.java         # CORS 설정 (Frontend 통신용)
│   │   │   │   └── OpenApiConfig.java      # Swagger 설정
│   │   │   ├── controller/
│   │   │   │   ├── DailyPlanController.java    # 일일 계획 API
│   │   │   │   ├── ReflectionController.java   # 회고 API
│   │   │   │   └── TaskController.java         # 태스크 API (Phase 2)
│   │   │   ├── service/
│   │   │   │   ├── DailyPlanService.java       # 일일 계획 비즈니스 로직
│   │   │   │   ├── ReflectionService.java      # 회고 비즈니스 로직
│   │   │   │   └── TaskService.java            # 태스크 비즈니스 로직
│   │   │   ├── repository/
│   │   │   │   ├── DailyPlanRepository.java    # JPA Repository
│   │   │   │   ├── ReflectionRepository.java   # JPA Repository
│   │   │   │   └── TaskRepository.java         # JPA Repository
│   │   │   ├── entity/
│   │   │   │   ├── DailyPlan.java              # JPA Entity
│   │   │   │   ├── Reflection.java             # JPA Entity
│   │   │   │   └── Task.java                   # JPA Entity
│   │   │   ├── dto/
│   │   │   │   ├── DailyPlanDto.java           # DTO
│   │   │   │   ├── ReflectionDto.java          # DTO
│   │   │   │   ├── TaskDto.java                # DTO
│   │   │   │   └── ApiResponse.java            # 공통 응답 DTO
│   │   │   ├── mapper/
│   │   │   │   ├── DailyPlanMapper.java        # Entity ↔ DTO 변환
│   │   │   │   ├── ReflectionMapper.java       # Entity ↔ DTO 변환
│   │   │   │   └── TaskMapper.java             # Entity ↔ DTO 변환
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java # 예외 처리
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── ValidationException.java
│   │   │   └── util/
│   │   │       └── DateUtil.java               # 날짜 유틸
│   │   └── resources/
│   │       ├── application.yml              # Spring Boot 설정 (공통)
│   │       ├── application-dev.yml          # 개발 환경 설정
│   │       ├── application-prod.yml         # 운영 환경 설정
│   │       └── db/
│   │           └── schema.sql               # 초기 DB 스키마
│   └── test/
│       └── java/com/routine/
│           ├── controller/
│           │   └── DailyPlanControllerTest.java
│           ├── service/
│           │   └── DailyPlanServiceTest.java
│           └── repository/
│               └── DailyPlanRepositoryTest.java
├── pom.xml                                 # Maven 설정 (또는 build.gradle)
├── .env.example                            # 환경변수 템플릿
├── docker-compose.yml                      # MySQL 컨테이너 설정 (선택)
└── README.md
```

### 프로젝트 루트 구조
```
routine-mvp/
├── frontend/                               # React 프로젝트
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/                                # Spring Boot 프로젝트
│   ├── src/
│   ├── pom.xml (또는 build.gradle)
│   └── README.md
├── docs/                                   # 문서
│   ├── API_SPEC.md                        # REST API 명세
│   ├── DATABASE_SCHEMA.md                 # DB 스키마
│   └── DEPLOYMENT.md                      # 배포 가이드
├── docker-compose.yml                      # 로컬 개발용 MySQL
├── .gitignore
└── README.md                               # 프로젝트 개요
```

---

## 4. 📊 데이터 모델 정의 (types/routine.d.ts)

```typescript
// ==================== Core Types ====================

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;  // ISO 8601
}

export interface TimeBlock {
  id: string;
  period: "morning" | "midday" | "afternoon" | "evening";
  label: string;              // "🌅 아침 (5-9am)"
  startHour: number;
  endHour: number;
  assignedTask?: Task;        // 선택적: 배치된 테스크
}

export interface DailyPlan {
  date: string;               // "2025-02-05"
  keyTasks: Task[];           // 최대 3개
  timeBlocks: TimeBlock[];    // 4개 고정
  createdAt: string;
  updatedAt: string;
}

export interface Reflection {
  id: string;
  date: string;               // "2025-02-05"
  rating: 1 | 2 | 3 | 4 | 5; // 오늘 만족도
  questions: {
    whatWentWell: string;           // "잘된 일"
    whatDidntGoWell: string;        // "아쉬운 일"
    tomorrowFocus: string;          // "내일 초점"
  };
  mood?: "😊" | "😐" | "😔";  // 선택적: 감정 기록
  createdAt: string;
}

export interface RoutineState {
  today: DailyPlan;
  reflections: Reflection[];  // 아카이브
  isLoading: boolean;
  error: string | null;
}

export type RoutineAction = 
  | { type: "SET_KEY_TASK"; payload: { task: Task; index: number } }
  | { type: "REMOVE_KEY_TASK"; payload: number }
  | { type: "ASSIGN_TASK_TO_BLOCK"; payload: { blockId: string; task: Task } }
  | { type: "UNASSIGN_TASK"; payload: string }
  | { type: "SAVE_REFLECTION"; payload: Reflection }
  | { type: "LOAD_TODAY" }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET_TODAY" };
```

---

## 5. 📅 구현 단계별 계획 (Phases) - 재정의

### **Phase 0: 백엔드 환경 설정 (병렬 진행, 1일)**

#### 0-1. Spring Boot 프로젝트 생성
- [ ] Spring Boot 3.x 프로젝트 생성 (Spring Initializr)
- [ ] 의존성 추가: Web, JPA, MySQL Driver, Lombok, OpenAPI, DevTools
- [ ] Gradle 또는 Maven 설정

#### 0-2. MySQL 설정
- [ ] MySQL 8.0+ 설치 (또는 Docker Compose로 구동)
  ```bash
  docker-compose up -d  # MySQL 5432 포트에서 실행
  ```
- [ ] `routine_db` 데이터베이스 생성
- [ ] `application.yml` 설정 (DB 연결 정보)

#### 0-3. 기본 프로젝트 구조 생성
- [ ] 폴더 구조 생성 (entity, dto, repository, service, controller 등)
- [ ] `application.yml`, `application-dev.yml` 작성

---

### **Phase 1: 프로젝트 셋업 및 기본 구조 (Frontend, 1-2일)**

#### 1-1. 프로젝트 초기화
- [ ] `npm create vite@latest routine-mvp -- --template react-ts`
- [ ] 의존성 설치: `react-router-dom`, `date-fns`, `lucide-react`, `tailwindcss`
- [ ] 폴더 구조 생성

#### 1-2. TailwindCSS 및 스타일 설정
- [ ] `tailwind.config.js` 설정
- [ ] `index.css`에 디자인 토큰 정의
  ```css
  @layer components {
    .btn-primary { @apply px-4 py-2 bg-blue-500 text-white rounded-lg; }
    .card-glassmorphic { @apply bg-white/10 backdrop-blur-md rounded-xl p-6; }
  }
  ```
- [ ] 색상 팔레트 (Primary, Secondary, Success, Warning, Error)

#### 1-3. 라우팅 및 Layout 구현
- [ ] `App.tsx`에 React Router 설정 (Home, Reflection, Archive)
- [ ] `Layout.tsx` 구현 (Sidebar 포함)
- [ ] `Sidebar.tsx` 네비게이션 컴포넌트

#### 1-4. 공용 컴포넌트
- [ ] `Button.tsx` (Primary, Secondary, Disabled 상태)
- [ ] `Card.tsx` (기본 카드 래퍼)
- [ ] `Input.tsx` (텍스트 입력, Textarea)

---

### **Phase 2: 핵심 데이터 모델 및 상태 관리 (Frontend, 2-3일)**

#### 2-1. 타입 정의
- [ ] `types/routine.d.ts` 작성 (위 데이터 모델 참고)
- [ ] TypeScript strict mode 활성화 (tsconfig.json)

#### 2-2. 상태 관리 구현
**선택지**: Context API vs Zustand

**A) Context API + useReducer (권장 - MVP 단계)**
```typescript
// context/RoutineContext.tsx
import { createContext, useReducer } from 'react';
import { RoutineState, RoutineAction } from '../types/routine';

export const RoutineContext = createContext<{
  state: RoutineState;
  dispatch: React.Dispatch<RoutineAction>;
} | undefined>(undefined);

// hooks/useRoutine.ts
export const useRoutine = () => {
  const context = useContext(RoutineContext);
  if (!context) throw new Error('useRoutine must be used within RoutineProvider');
  return context;
};
```

**B) Zustand (확장성 고려 시)**
```typescript
// store/useRoutineStore.ts
import { create } from 'zustand';

export const useRoutineStore = create((set) => ({
  today: initialDailyPlan,
  reflections: [],
  setKeyTask: (task, index) => set(/* ... */),
  saveReflection: (reflection) => set(/* ... */),
}));
```

#### 2-3. 유틸 함수
- [ ] `utils/dateHelpers.ts`
  - `getTodayString()` → "2025-02-05"
  - `formatDate(date)` → "Thursday, Feb 05"
  - `getDaysDifference(date1, date2)`

- [ ] `utils/validators.ts`
  - `validateKeyTask(title)` → 길이 검증 (1-100자)
  - `validateReflection(reflection)` → 필드 검증

---

### **Phase 3: 핵심 페이지 구현 (2-3일)**

#### 3-1. Home Page (Daily Plan)
**목표**: 일일 계획 수립 및 시각화

**컴포넌트 구성:**
```
HomePage
├── Header
│   └── 📅 오늘 날짜 표시
├── KeyTaskInput
│   ├── Task 1 입력 필드
│   ├── Task 2 입력 필드
│   └── Task 3 입력 필드
├── TimeBlockSection
│   ├── TimeBlock (Morning)
│   ├── TimeBlock (Midday)
│   ├── TimeBlock (Afternoon)
│   └── TimeBlock (Evening)
└── Action Button
    └── "Reflection으로 이동" (저장 자동)
```

**구현 요소:**
- [ ] `KeyTaskInput.tsx`
  - 3개 입력 필드 (최대 3개만 허용)
  - 실시간 상태 업데이트
  - "추가", "삭제" 버튼

- [ ] `TimeBlockSection.tsx`
  - 4개 고정 TimeBlock 렌더링
  - 각 TimeBlock은 다음 정보 표시:
    - 아이콘 + 레이블 (🌅 아침 (5-9am))
    - 배치된 Task 표시 (있을 경우)
    - "Task 할당" / "제거" 버튼 (Phase 2에서 Drag & Drop 추가)

**설계:**
```
┌─────────────────────────────────┐
│  📅 Thursday, Feb 05, 2025      │
├─────────────────────────────────┤
│  Key Tasks (최대 3개)            │
│  ☐ Task 1: ___________  [X]     │
│  ☐ Task 2: ___________  [X]     │
│  ☐ Task 3: ___________  [X]     │
├─────────────────────────────────┤
│  Daily Schedule                  │
│  ┌─────────────────────────────┐ │
│  │ 🌅 Morning (5-9am)          │ │
│  │ [Assign Task]               │ │
│  └─────────────────────────────┘ │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ ☀️  Midday (9am-12pm)       │ │
│  │ [Assign Task]               │ │
│  └─────────────────────────────┘ │
│  ... (Afternoon, Evening)        │
├─────────────────────────────────┤
│  [Reflection으로 이동 →]          │
└─────────────────────────────────┘
```

#### 3-2. Reflection Page (회고)
**목표**: 하루를 평가하고 내일 계획 세우기

**컴포넌트 구성:**
```
ReflectionPage
├── Header
│   └── "오늘의 회고" + 날짜
├── ReflectionForm
│   ├── 만족도 평점 (1-5 별점)
│   ├── 감정 이모지 선택 (😊 😐 😔)
│   ├── 질문 1: "오늘 잘된 일은?"
│   ├── 질문 2: "아쉬운 부분은?"
│   ├── 질문 3: "내일의 초점은?"
│   └── [저장] 버튼
└── Footer
    └── "아카이브 보기" 링크
```

**구현 요소:**
- [ ] `ReflectionForm.tsx`
  - 평점 입력 (StarRating 컴포넌트 또는 select)
  - 감정 이모지 선택 (3개 옵션)
  - 3개 Textarea 필드
  - 유효성 검증 (최소 1글자)
  - 저장 성공 메시지 표시

**설계:**
```
┌──────────────────────────────────┐
│  오늘의 회고                       │
│  Thursday, Feb 05               │
├──────────────────────────────────┤
│                                  │
│  📊 오늘 만족도는?                 │
│  ⭐⭐⭐⭐⭐                        │
│                                  │
│  😊 기분은 어땠나요?               │
│  [😊 😐 😔]                       │
│                                  │
│  ✨ 오늘 잘된 일:                  │
│  ┌──────────────────────────┐   │
│  │ ___________________      │   │
│  └──────────────────────────┘   │
│                                  │
│  ⚠️  아쉬운 부분:                  │
│  ┌──────────────────────────┐   │
│  │ ___________________      │   │
│  └──────────────────────────┘   │
│                                  │
│  🎯 내일의 초점:                   │
│  ┌──────────────────────────┐   │
│  │ ___________________      │   │
│  └──────────────────────────┘   │
│                                  │
│  [저장하기]  [아카이브 보기 →]     │
└──────────────────────────────────┘
```

#### 3-3. Archive Page (회고 아카이브)
**목표**: 과거 회고 기록 조회 및 분석

**컴포넌트 구성:**
```
ArchivePage
├── Header
│   ├── "회고 아카이브"
│   └── 필터 옵션 (날짜 범위, 평점)
├── ReflectionList
│   ├── ReflectionCard (최신 순서)
│   ├── ReflectionCard
│   └── ReflectionCard
└── Footer
    └── "홈으로 돌아가기"
```

**구현 요소:**
- [ ] `ReflectionCard.tsx`
  - 날짜, 평점, 감정, 3개 질문 요약 표시
  - 클릭 시 전체 내용 모달 또는 상세 뷰

**설계:**
```
┌──────────────────────────────────┐
│  회고 아카이브                     │
├──────────────────────────────────┤
│                                  │
│  📅 Feb 04, 2025  ⭐⭐⭐⭐☆  😊   │
│  ✨ 잘된 일: 타임블록 완료 83%    │
│  ⚠️  아쉬운 점: 저녁 산책 건너뜀  │
│  🎯 내일 초점: 운동 집중           │
│                                  │
│  📅 Feb 03, 2025  ⭐⭐⭐⭐⭐  😊   │
│  ...                             │
│                                  │
│  [← 홈으로]                       │
└──────────────────────────────────┘
```

---

### **Phase 4: UI/UX 고도화 및 검증 (1-2일)**

#### 4-1. 반응형 디자인
- [ ] Mobile 뷰 테스트 (375px, 768px, 1024px)
- [ ] 터치 우호적인 버튼 크기 (최소 44x44px)
- [ ] Sidebar 모바일 토글 (Hamburger 메뉴)

#### 4-2. 에러 핸들링 & UX
- [ ] 입력값 검증 에러 메시지
- [ ] 저장 성공 토스트 알림
- [ ] 로딩 상태 표시 (필요 시)
- [ ] 빈 상태 메시지 (Archive가 비었을 때)

#### 4-3. 접근성 (A11y)
- [ ] 시맨틱 HTML 사용
- [ ] ARIA 레이블 추가
- [ ] 키보드 네비게이션 지원
- [ ] 색상 대비 검사 (WCAG AA 이상)

#### 4-4. 성능 최적화
- [ ] 컴포넌트 메모이제이션 (React.memo)
- [ ] 불필요한 리렌더링 제거
- [ ] 번들 크기 검사 (`npm run build`)

#### 4-5. 최종 테스트
- [ ] 시나리오 A: Key Task 3개 입력 → 저장 확인
- [ ] 시나리오 B: Reflection 작성 → Archive에서 조회 확인
- [ ] 시나리오 C: 새로고침 후 데이터 유지 여부 (컨텍스트 기반 재초기화)
- [ ] 시나리오 D: 여러 날짜의 Reflection 추가 및 조회

#### 4-6. 빌드 및 배포
- [ ] `npm run build` 실행 및 번들 검사
- [ ] 빌드 산출물 최적화 확인
- [ ] 배포 플랫폼 선택 (Vercel, Netlify, GitHub Pages)

---

### **Phase 3 (Backend): 데이터베이스 및 Entity 구현 (Backend, 2-3일)**

#### 3-1. Database 스키마 구성
- [ ] MySQL 데이터베이스 생성 (`routine_db`)
- [ ] 테이블 생성 스크립트 작성 (위 스키마 참고)
  - `users` (향후 인증용)
  - `daily_plans` (일일 계획)
  - `tasks` (태스크)
  - `time_blocks` (시간 블록)
  - `reflections` (회고)
- [ ] 외래키, 인덱스, 제약조건 설정

#### 3-2. JPA Entity 구현
- [ ] `User.java` Entity
- [ ] `DailyPlan.java` Entity
- [ ] `Task.java` Entity (위 예시 참고)
- [ ] `TimeBlock.java` Entity
- [ ] `Reflection.java` Entity
- [ ] @ManyToOne, @OneToMany 관계 설정
- [ ] Lombok @Data, @Builder 적용

#### 3-3. Repository 구현
- [ ] `UserRepository` 인터페이스 (JpaRepository 상속)
- [ ] `DailyPlanRepository` 인터페이스
  - `findByPlanDate(LocalDate date)`
  - `findByUserIdOrderByPlanDateDesc(Long userId)`
- [ ] `TaskRepository` 인터페이스
- [ ] `ReflectionRepository` 인터페이스

#### 3-4. 설정 파일 작성
- [ ] `application.yml` (공통)
  - DB 연결 정보
  - JPA 설정 (show-sql, format-sql)
  - logging 레벨 설정
- [ ] `application-dev.yml` (개발 환경)
- [ ] `application-prod.yml` (운영 환경 - 선택)

---

### **Phase 4 (Backend): Service & Controller 구현 (Backend, 2-3일)**

#### 4-1. Service Layer 구현
- [ ] `DailyPlanService` (위 예시 참고)
  - `getDailyPlan(LocalDate date)`
  - `getTodayPlan()`
  - `createDailyPlan(DailyPlanDto dto)`
  - `updateDailyPlan(Long id, DailyPlanDto dto)`
  - `deleteDailyPlan(Long id)`

- [ ] `TaskService`
  - `addTask(Long planId, TaskDto dto)`
  - `updateTask(Long id, TaskDto dto)`
  - `toggleTask(Long id)` (완료 여부 토글)
  - `deleteTask(Long id)`

- [ ] `ReflectionService`
  - `getReflection(Long planId)`
  - `saveReflection(Long planId, ReflectionDto dto)`
  - `getArchive(Long userId, LocalDate from, LocalDate to)`
  - `deleteReflection(Long id)`

- [ ] `TimeBlockService`
  - `assignTask(Long blockId, Long taskId)`
  - `unassignTask(Long blockId)`

#### 4-2. Controller Layer 구현
- [ ] `DailyPlanController` (위 예시 참고)
  - GET `/api/daily-plans/today`
  - GET `/api/daily-plans/{date}`
  - POST `/api/daily-plans`
  - PUT `/api/daily-plans/{id}`
  - DELETE `/api/daily-plans/{id}`

- [ ] `TaskController`
  - POST `/api/daily-plans/{planId}/tasks`
  - PUT `/api/tasks/{id}`
  - PATCH `/api/tasks/{id}/toggle`
  - DELETE `/api/tasks/{id}`

- [ ] `ReflectionController`
  - GET `/api/reflections/{planId}`
  - POST `/api/reflections`
  - GET `/api/reflections/archive`
  - DELETE `/api/reflections/{id}`

#### 4-3. DTO & Mapper 구현
- [ ] `DailyPlanDto`, `TaskDto`, `ReflectionDto`, `TimeBlockDto` 클래스
- [ ] `ApiResponse<T>` 공통 응답 클래스 (위 예시 참고)
- [ ] MapStruct Mapper 인터페이스 (선택사항)

#### 4-4. 예외 처리
- [ ] `GlobalExceptionHandler` (위 예시 참고)
- [ ] `ResourceNotFoundException` 커스텀 예외
- [ ] `ValidationException` 커스텀 예외
- [ ] HTTP 상태 코드 매핑

#### 4-5. CORS 설정
- [ ] `CorsConfig` 클래스 (위 예시 참고)
- [ ] Frontend 도메인 허용 (`http://localhost:5173`)

---

### **Phase 5: Frontend-Backend 통합 (통합, 2-3일)**

#### 5-1. API 클라이언트 설정
- [ ] `services/api.ts` - Axios 인스턴스 생성
  ```typescript
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
    timeout: 5000,
  });
  ```

- [ ] `hooks/useApi.ts` - API 호출 커스텀 훅
  ```typescript
  const useFetch = (url, method = 'GET') => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // ...
  };
  ```

#### 5-2. Frontend State 업데이트
- [ ] Context에서 Axios API 호출로 변경
  ```typescript
  // Before: localStorage
  // After: API 호출 + Context state 동기화
  const getDailyPlan = async (date) => {
    const response = await api.get(`/daily-plans/${date}`);
    dispatch({ type: 'SET_DAILY_PLAN', payload: response.data });
  };
  ```

#### 5-3. 에러 처리
- [ ] API 오류 응답 처리
- [ ] 네트워크 오류 처리
- [ ] 사용자 피드백 (토스트 알림)

#### 5-4. 로딩 상태 표시
- [ ] 데이터 로딩 중 스피너 표시
- [ ] 저장 버튼 비활성화
- [ ] 낙관적 업데이트 (Optional)

#### 5-5. 인증 준비 (Optional - Phase 6+)
- [ ] JWT 토큰 저장 위치 (localStorage vs Memory)
- [ ] Authorization 헤더 설정
- [ ] 토큰 갱신 로직

---

### **Phase 6: 테스트 및 최적화 (통합, 1-2일)**

#### 6-1. Backend 단위 테스트
- [ ] `DailyPlanServiceTest` (JUnit5 + Mockito)
- [ ] `DailyPlanRepositoryTest` (H2 Database 사용)
- [ ] `DailyPlanControllerTest` (MockMvc)

#### 6-2. 통합 테스트
- [ ] Frontend-Backend API 통합 테스트
  - Scenario: Task 생성 → 저장 → 조회
  - Scenario: Reflection 작성 → Archive 조회

#### 6-3. 성능 최적화
- [ ] N+1 쿼리 문제 해결 (Fetch Join, @EntityGraph)
- [ ] 데이터베이스 인덱스 검증
- [ ] API 응답 시간 측정

#### 6-4. 배포 준비
- [ ] Backend: WAR/JAR 빌드
- [ ] Frontend: npm run build
- [ ] 환경변수 설정 (.env 파일)

---

### **Phase 7: 배포 및 모니터링 (배포, 1일)**

#### 7-1. Backend 배포
- [ ] AWS EC2 / Heroku / Railway 선택
- [ ] MySQL 호스팅 (AWS RDS / Heroku PostgreSQL)
- [ ] 애플리케이션 서버 설정 (Tomcat, Nginx)

#### 7-2. Frontend 배포
- [ ] Vercel / Netlify / GitHub Pages 선택
- [ ] 환경변수 설정 (API_URL)
- [ ] 자동 배포 파이프라인 설정

#### 7-3. 모니터링
- [ ] Backend 로그 수집 (ELK Stack, CloudWatch)
- [ ] Frontend 에러 추적 (Sentry)
- [ ] 성능 모니터링 (New Relic)

---

## 7. 🎨 디자인 제안 및 가이드라인 (Design Guidelines)

### 6-1. 데이터베이스 스키마 설계

#### Entity Relationship Diagram (ERD)
```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   User       │ 1───∞   │  DailyPlan   │ 1───∞   │    Task      │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ email        │         │ userId (FK)  │         │ planId (FK)  │
│ password     │         │ date         │         │ title        │
│ createdAt    │         │ createdAt    │         │ completed    │
└──────────────┘         │ updatedAt    │         │ createdAt    │
                         └──────────────┘         └──────────────┘
                                │
                                │ 1───∞
                         ┌──────▼──────────┐
                         │  Reflection     │
                         ├─────────────────┤
                         │ id (PK)         │
                         │ planId (FK)     │
                         │ rating (1-5)    │
                         │ mood            │
                         │ whatWentWell    │
                         │ whatDidntGoWell │
                         │ tomorrowFocus   │
                         │ createdAt       │
                         └─────────────────┘
```

#### MySQL 테이블 스키마
```sql
-- Users 테이블 (향후 인증 기능 추가 시)
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DailyPlans 테이블
CREATE TABLE daily_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  plan_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_date (user_id, plan_date),
  INDEX idx_user_date (user_id, plan_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks 테이블
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  plan_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  task_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES daily_plans(id) ON DELETE CASCADE,
  INDEX idx_plan_completed (plan_id, completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TimeBlocks 테이블
CREATE TABLE time_blocks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  plan_id BIGINT NOT NULL,
  period VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  start_hour INT NOT NULL,
  end_hour INT NOT NULL,
  assigned_task_id BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES daily_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_task_id) REFERENCES tasks(id) ON SET NULL,
  UNIQUE KEY unique_plan_period (plan_id, period),
  INDEX idx_plan_period (plan_id, period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reflections 테이블
CREATE TABLE reflections (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  plan_id BIGINT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  mood VARCHAR(10),
  what_went_well TEXT,
  what_didnt_go_well TEXT,
  tomorrow_focus TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES daily_plans(id) ON DELETE CASCADE,
  UNIQUE KEY unique_plan_reflection (plan_id),
  INDEX idx_plan_created (plan_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 6-2. Spring Boot 주요 구현 (Phase 3-4: Backend MVP)

#### Application.yml 설정
```yaml
# application.yml
spring:
  application:
    name: routine-mvp
  
  datasource:
    url: jdbc:mysql://localhost:3306/routine_db?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    
  jpa:
    hibernate:
      ddl-auto: validate  # Phase 1-2: create, Phase 3+: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
        use_sql_comments: true
    show-sql: false  # 개발 시 true로 변경
    
  jackson:
    serialization:
      write-dates-as-timestamps: false
    default-property-inclusion: non_null

server:
  port: 8080
  servlet:
    context-path: /api

logging:
  level:
    root: INFO
    com.routine: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

#### Entity 예시 (Task.java)
```java
package com.routine.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private DailyPlan dailyPlan;
    
    @Column(nullable = false, length = 255)
    private String title;
    
    @Column(nullable = false)
    private Boolean completed = false;
    
    @Column(name = "task_order")
    private Integer taskOrder = 0;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

#### Controller 예시 (DailyPlanController.java)
```java
package com.routine.controller;

import com.routine.dto.DailyPlanDto;
import com.routine.dto.ApiResponse;
import com.routine.service.DailyPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/daily-plans")
@RequiredArgsConstructor
public class DailyPlanController {
    
    private final DailyPlanService dailyPlanService;
    
    /**
     * GET /daily-plans/{date}
     * 특정 날짜의 일일 계획 조회
     */
    @GetMapping("/{date}")
    public ResponseEntity<ApiResponse<DailyPlanDto>> getDailyPlan(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        DailyPlanDto plan = dailyPlanService.getDailyPlan(localDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "일일 계획 조회 성공", plan));
    }
    
    /**
     * GET /daily-plans/today
     * 오늘 날짜의 일일 계획 조회
     */
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<DailyPlanDto>> getTodayPlan() {
        DailyPlanDto plan = dailyPlanService.getTodayPlan();
        return ResponseEntity.ok(new ApiResponse<>(true, "오늘 계획 조회 성공", plan));
    }
    
    /**
     * POST /daily-plans
     * 새로운 일일 계획 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DailyPlanDto>> createDailyPlan(
            @RequestBody DailyPlanDto dto) {
        DailyPlanDto created = dailyPlanService.createDailyPlan(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "일일 계획 생성 성공", created));
    }
    
    /**
     * PUT /daily-plans/{id}
     * 일일 계획 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DailyPlanDto>> updateDailyPlan(
            @PathVariable Long id,
            @RequestBody DailyPlanDto dto) {
        DailyPlanDto updated = dailyPlanService.updateDailyPlan(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "일일 계획 수정 성공", updated));
    }
}
```

#### Service 예시 (DailyPlanService.java)
```java
package com.routine.service;

import com.routine.dto.DailyPlanDto;
import com.routine.entity.DailyPlan;
import com.routine.mapper.DailyPlanMapper;
import com.routine.repository.DailyPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class DailyPlanService {
    
    private final DailyPlanRepository dailyPlanRepository;
    private final DailyPlanMapper dailyPlanMapper;
    
    @Transactional(readOnly = true)
    public DailyPlanDto getDailyPlan(LocalDate date) {
        DailyPlan plan = dailyPlanRepository.findByPlanDate(date)
            .orElseThrow(() -> new ResourceNotFoundException("일일 계획을 찾을 수 없습니다."));
        return dailyPlanMapper.toDto(plan);
    }
    
    @Transactional(readOnly = true)
    public DailyPlanDto getTodayPlan() {
        return getDailyPlan(LocalDate.now());
    }
    
    public DailyPlanDto createDailyPlan(DailyPlanDto dto) {
        DailyPlan plan = dailyPlanMapper.toEntity(dto);
        DailyPlan saved = dailyPlanRepository.save(plan);
        return dailyPlanMapper.toDto(saved);
    }
    
    public DailyPlanDto updateDailyPlan(Long id, DailyPlanDto dto) {
        DailyPlan plan = dailyPlanRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("일일 계획을 찾을 수 없습니다."));
        dailyPlanMapper.updateEntityFromDto(dto, plan);
        DailyPlan updated = dailyPlanRepository.save(plan);
        return dailyPlanMapper.toDto(updated);
    }
}
```

#### Repository 예시
```java
package com.routine.repository;

import com.routine.entity.DailyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyPlanRepository extends JpaRepository<DailyPlan, Long> {
    Optional<DailyPlan> findByPlanDate(LocalDate date);
    List<DailyPlan> findByUserIdOrderByPlanDateDesc(Long userId);
}
```

#### DTO 예시
```java
package com.routine.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPlanDto {
    private Long id;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate planDate;
    
    private List<TaskDto> keyTasks;
    private List<TimeBlockDto> timeBlocks;
    private ReflectionDto reflection;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}
```

### 6-3. REST API 명세

#### Endpoints 정의
```
┌─── Daily Plan API ───────────────────────┐
│ GET    /api/daily-plans/today            │ 오늘 계획 조회
│ GET    /api/daily-plans/{date}           │ 특정 날짜 계획 조회
│ POST   /api/daily-plans                  │ 계획 생성
│ PUT    /api/daily-plans/{id}             │ 계획 수정
│ DELETE /api/daily-plans/{id}             │ 계획 삭제
└──────────────────────────────────────────┘

┌─── Task API ────────────────────────────┐
│ POST   /api/daily-plans/{planId}/tasks   │ Task 추가
│ PUT    /api/tasks/{id}                   │ Task 수정
│ DELETE /api/tasks/{id}                   │ Task 삭제
│ PATCH  /api/tasks/{id}/toggle            │ Task 완료 토글
└─────────────────────────────────────────┘

┌─── TimeBlock API ───────────────────────┐
│ PUT    /api/timeblocks/{id}              │ TimeBlock 수정 (Task 할당)
│ DELETE /api/timeblocks/{id}/task         │ TimeBlock Task 제거
└─────────────────────────────────────────┘

┌─── Reflection API ──────────────────────┐
│ GET    /api/reflections/{planId}         │ 회고 조회
│ POST   /api/reflections                  │ 회고 생성/수정
│ GET    /api/reflections/archive?from=... │ 회고 아카이브 조회
│ DELETE /api/reflections/{id}             │ 회고 삭제
└─────────────────────────────────────────┘
```

#### API 응답 형식
```json
// 성공 응답
{
  "success": true,
  "message": "일일 계획 조회 성공",
  "data": {
    "id": 1,
    "planDate": "2025-02-05",
    "keyTasks": [...],
    "timeBlocks": [...],
    "createdAt": "2025-02-05T08:00:00"
  }
}

// 오류 응답
{
  "success": false,
  "message": "일일 계획을 찾을 수 없습니다.",
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "timestamp": "2025-02-05T08:00:00"
  }
}
```

### 6-4. CORS 설정 (Frontend 통신)
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:5173", "http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 6-5. Exception Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse<>(false, e.getMessage(), null));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse<>(false, message, null));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGlobalException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiResponse<>(false, "서버 오류가 발생했습니다.", null));
    }
}
```

---

## 7. 🎨 디자인 제안 및 가이드라인 (Design Guidelines)

### 디자인 언어
**Glassmorphism + Minimalism**
- 배경: 연한 그라데이션 또는 단색 (Light Mode: 흰색, Dark Mode: 진회색)
- 카드: 반투명 백그라운드 (`bg-white/10 backdrop-blur-md`)
- 텍스트: 고대비 (#1a1a1a on #ffffff)

### 색상 팔레트
```
Primary:    #3B82F6 (Blue - 행동 촉구)
Secondary:  #8B5CF6 (Purple - 보조)
Success:    #10B981 (Green - 완료)
Warning:    #F59E0B (Amber - 주의)
Error:      #EF4444 (Red - 오류)
Gray:       #6B7280 (모드 텍스트)
```

### 타이포그래피
- **Heading**: "Inter", "Segoe UI", sans-serif (Bold, 24px)
- **Body**: "Inter", "Segoe UI", sans-serif (Regular, 16px)
- **Caption**: "Inter", "Segoe UI", sans-serif (Regular, 12px)

### 마이크로 인터랙션
- ✅ **Task 완료**: 체크 애니메이션 + 순간적 피드백음 (선택)
- 📝 **텍스트 입력**: 포커스 시 아웃라인 색상 변경
- 💾 **저장 성공**: 토스트 알림 3초 유지

### Gamification (선택 - Phase 2+)
- 🔥 연속 달성일 (Streak) 표시
- 🏆 주간 만족도 그래프
- 🎯 주간 목표 완성도

---

## 7. 🔄 State Management 상세 구현 (Context API 기준)

### Context 구조
```typescript
// context/routineReducer.ts
export const initialState: RoutineState = {
  today: {
    date: getTodayString(),
    keyTasks: [],
    timeBlocks: [
      { id: 'morning', period: 'morning', label: '🌅 아침 (5-9am)', startHour: 5, endHour: 9 },
      { id: 'midday', period: 'midday', label: '☀️ 낮 (9am-12pm)', startHour: 9, endHour: 12 },
      { id: 'afternoon', period: 'afternoon', label: '🌤️ 오후 (12-5pm)', startHour: 12, endHour: 17 },
      { id: 'evening', period: 'evening', label: '🌙 저녁 (5-11pm)', startHour: 17, endHour: 23 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  reflections: [],
  isLoading: false,
  error: null,
};

export const routineReducer = (state: RoutineState, action: RoutineAction): RoutineState => {
  switch (action.type) {
    case 'SET_KEY_TASK':
      return {
        ...state,
        today: {
          ...state.today,
          keyTasks: state.today.keyTasks.map((task, i) =>
            i === action.payload.index ? action.payload.task : task
          ),
        },
      };
    
    case 'SAVE_REFLECTION':
      return {
        ...state,
        reflections: [action.payload, ...state.reflections],
      };
    
    // ... 다른 액션들
  }
};
```

---

## 8. 🧪 검증 계획 (Verification Plan)

### Manual Test Scenarios

**Scenario A: 아침 계획 수립**
```
1. Home 페이지 진입
2. Key Task 1: "팀 미팅 참석" 입력
3. Key Task 2: "리포트 작성" 입력
4. Key Task 3: "운동" 입력
✅ 3개 모두 저장되는지 확인
❌ 4번째 입력 필드 활성화 안 됨 확인
```

**Scenario B: 일일 회고 작성**
```
1. Home에서 "Reflection으로 이동" 클릭
2. 평점: 4점 선택
3. 감정: 😊 선택
4. 질문 1: "팀 미팅 성공적" 입력
5. 질문 2: "점심 시간 부족" 입력
6. 질문 3: "내일 운동 우선" 입력
7. [저장하기] 클릭
✅ 저장 성공 메시지 표시
✅ Archive에서 데이터 조회 가능
```

**Scenario C: Archive 조회**
```
1. Archive 페이지 진입
2. 과거 Reflection 목록 조회
✅ 최신순 정렬
✅ 평점, 감정, 요약 정보 표시
3. 특정 회고 클릭 → 상세 내용 확인
```

**Scenario D: 데이터 유지 검증**
```
1. Home에서 Key Task 작성
2. 브라우저 새로고침 (F5)
✅ Task 데이터 유지 (Context + localStorage 대체재)
```

### Test Coverage
- [ ] 모든 입력 필드 유효성 검증
- [ ] UI 레이아웃 반응형 확인 (Mobile, Tablet, Desktop)
- [ ] 라우팅 네비게이션 정상 작동
- [ ] 에러 메시지 표시 정상
- [ ] 토스트 알림 정상 작동

---

## 9. 🚀 배포 및 확장 로드맵 (Roadmap)

### Phases 1-5: Full Stack MVP (현재 계획)
✅ **Frontend**: Home (Daily Plan), Reflection, Archive
✅ **Backend**: REST API (Daily Plans, Tasks, Reflections)
✅ **Database**: MySQL with JPA

### Phase 6: 기능 확장
- [ ] **Front**: Drag & Drop (Task 배치)
- [ ] **Back**: 주간/월간 분석 API
- [ ] **Back**: 회고 검색 필터링
- [ ] **Back**: 배치 작업 (자동 아카이브)

### Phase 7: 인증 및 보안
- [ ] Spring Security + JWT 도입
- [ ] 사용자 가입/로그인 기능
- [ ] 비밀번호 암호화 (BCrypt)
- [ ] 토큰 갱신 메커니즘

### Phase 8: 고급 기능
- [ ] 스트릭 카운트 (연속 달성일)
- [ ] 주간/월간 대시보드
- [ ] 데이터 내보내기 (CSV, PDF)
- [ ] 알림 기능 (이메일 리마인더)

### Phase 9: 성능 및 확장성
- [ ] Redis 캐싱 도입
- [ ] Elasticsearch (검색 기능)
- [ ] 마이크로서비스 아키텍처 (선택)
- [ ] 쿠버네티스 배포 (선택)

---

## 10. 📌 주의사항 및 체크리스트

### 환경별 차이점
```
📍 로컬 개발 환경 (Local Development)
  ✅ Frontend: React 18 (localhost:5173)
  ✅ Backend: Spring Boot (localhost:8080)
  ✅ Database: MySQL (Docker, localhost:3306)
  ✅ CORS 허용: http://localhost:5173
  ⚠️ 환경변수: .env 파일로 관리

📍 Claude.ai 아티팩트 환경
  - ✅ React State, Context API
  - ✅ In-memory 데이터 관리 (세션 내)
  - ❌ localhost 백엔드 연동 불가
  - ❌ localStorage, sessionStorage
  - ❌ 외부 API 호출 제한

📍 프로덕션 환경 (Production)
  ✅ Frontend: Vercel / Netlify 배포
  ✅ Backend: AWS EC2 / Heroku / Railway 배포
  ✅ Database: AWS RDS MySQL / Managed Cloud DB
  ✅ CORS 허용: 프로덕션 도메인만
  ⚠️ 환경변수: 배포 플랫폼 환경변수로 관리
  🔒 HTTPS/SSL 필수
  🔒 JWT 토큰 기반 인증
```

### 개발 전 필수 확인
- [ ] Node.js 18+ 설치 확인
- [ ] `npm` vs `yarn` 선택 (통일)
- [ ] Git 레포지토리 초기화
- [ ] `.gitignore` 설정 (node_modules, .env 등)
- [ ] TypeScript strict mode 활성화

### 개발 중 모범 사례
- [ ] 커밋 메시지 규칙 통일 (feat:, fix:, refactor:)
- [ ] 컴포넌트 단위 테스트 (각 Phase 종료 후)
- [ ] 타입 안정성 우선 (any 사용 금지)
- [ ] 접근성 검사 (WAVE, axe DevTools)

### 배포 전 최종 체크
- [ ] 환경변수 설정 (.env.example 작성)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 번들 분석 (`npm run build --analyze`)
- [ ] Lighthouse 점수 확인 (Performance 90+)
- [ ] 브라우저 호환성 테스트 (Chrome, Safari, Firefox)

---

## 11. 📚 참고 자료 및 리소스

### 공식 문서
- [React 18 공식 문서](https://react.dev)
- [React Router v6](https://reactrouter.com)
- [TailwindCSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### 유틸리티 라이브러리
- [date-fns 문서](https://date-fns.org)
- [lucide-react 아이콘](https://lucide.dev)
- [Zustand (선택사항)](https://github.com/pmndrs/zustand)

### 디자인 리소스
- [Figma Community](https://www.figma.com/community)
- [Tailwind UI Components](https://tailwindui.com)
- [Material Design Icons](https://fonts.google.com/icons)

### 배포 플랫폼
- [Vercel](https://vercel.com) - React 최적화
- [Netlify](https://netlify.com) - 무료 호스팅
- [GitHub Pages](https://pages.github.com) - 정적 사이트

---

## 12. 요약 및 시작 가이드

### 빠른 시작 (Quick Start)

#### Frontend 셋업
```bash
# 1. React 프로젝트 생성
npm create vite@latest routine-mvp-frontend -- --template react-ts
cd routine-mvp-frontend

# 2. 의존성 설치
npm install react-router-dom date-fns lucide-react tailwindcss axios

# 3. 환경변수 설정
echo "VITE_API_URL=http://localhost:8080/api" > .env

# 4. 개발 서버 실행
npm run dev  # http://localhost:5173
```

#### Backend 셋업
```bash
# 1. Spring Boot 프로젝트 생성 (Spring Initializr 사용)
# https://start.spring.io/
# - Project: Maven / Gradle
# - Spring Boot: 3.x LTS
# - Dependencies: Web, JPA, MySQL Driver, Lombok, OpenAPI

# 2. 프로젝트 다운로드 및 압축 해제
unzip routine-mvp-backend.zip
cd routine-mvp-backend

# 3. application.yml 설정
# src/main/resources/application.yml 편집
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/routine_db?useSSL=false&serverTimezone=UTC
    username: root
    password: <YOUR_PASSWORD>

# 4. MySQL 실행 (Docker 사용 권장)
docker-compose up -d

# 5. 백엔드 실행
./mvnw spring-boot:run  # 또는 ./gradlew bootRun
# http://localhost:8080

# 6. Swagger API 문서
# http://localhost:8080/swagger-ui.html
```

#### Docker Compose (MySQL 로컬 실행)
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: routine_mysql
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: routine_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### 우선순위
**High**: Phase 0-4 (Frontend MVP + Backend MVP)
**Medium**: Phase 5 (Frontend-Backend 통합)
**Low**: Phase 6-7 (테스트, 배포, 고급 기능)

### 예상 개발 기간 (Frontend + Backend 병렬 진행)
| Phase | 담당 | 예상 기간 |
|-------|------|---------|
| Phase 0 | Backend | 1일 |
| Phase 1 | Frontend | 1-2일 |
| Phase 2 | Frontend | 2-3일 |
| Phase 3 (Front) | Frontend | 2-3일 |
| Phase 3 (Back) | Backend | 2-3일 |
| Phase 4 (Front) | Frontend | 1-2일 |
| Phase 4 (Back) | Backend | 2-3일 |
| **Phase 5 (통합)** | **Both** | **2-3일** |
| Phase 6 (테스트) | Both | 1-2일 |
| Phase 7 (배포) | Both | 1일 |
| **Total** | - | **15-22일** |

### 병렬 진행 권장 타임라인
```
Timeline (주 단위)

Week 1:
  Mon-Tue: Phase 0 (Backend 셋업) + Phase 1 (Frontend 셋업)
  Wed-Fri: Phase 2 (Frontend Context) + Phase 3-Back (Backend Entity)

Week 2:
  Mon-Wed: Phase 3 (Frontend Pages) + Phase 4-Back (Backend Controller)
  Thu-Fri: Frontend Phase 4 (UI/UX) + Backend 최적화

Week 3:
  Mon-Wed: Phase 5 (Frontend-Backend 통합)
  Thu-Fri: Phase 6 (테스트), Phase 7 (배포)
```

---

**최종 수정**: 2025-02-05
**작성자**: Gemini Team (수정 검수: Claude)
