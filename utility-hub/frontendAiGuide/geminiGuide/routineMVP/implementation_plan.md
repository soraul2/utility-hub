# 📋 Implementation Plan - Routine MVP (Utility Hub Integration)

## 1. 🎯 목표 (Goal)
기존 **Utility Hub** 프로젝트에 **Routine MVP (하루 5분 루틴 관리)** 기능을 통합 구현합니다.
기존 Frontend(React)와 Backend(Spring Boot) 아키텍처를 준수하며, 새로운 기능 모듈로써 `Routine` 기능을 추가합니다.

## 2. 🏗️ 기술 스택 및 아키텍처 (Tech Stack)

### Frontend (`utility-hub/frontend`)
*   **Core**: React 18, TypeScript, Vite
*   **Styling**: TailwindCSS (기존 설정 활용)
*   **Routing**: React Router v6 (`App.tsx`에 하위 라우트 추가)
*   **State Management**: **Zustand** (신규 도입 - `routine` 전용 스토어)
*   **Dependencies to Add**:
    *   `zustand`: 전역 상태 관리
    *   `date-fns`: 날짜 처리
    *   `lucide-react`: 아이콘 (또는 기존 FontAwesome 사용 고려, 하지만 lucide 권장)
    *   `clsx`, `tailwind-merge`: 스타일 유틸리티

### Backend (`utility-hub/backend`)
*   **Framework**: Spring Boot 3.x
*   **Package Base**: `com.wootae.backend`
*   **Module**: `com.wootae.backend.routine` (신규 패키지)
*   **Persistence**: MySQL + Spring Data JPA
*   **API**: REST Controller

## 3. 🧩 디렉토리 구조 및 통합 전략

### Frontend 통합 (`frontend/src`)
```
src/
├── components/
│   └── routine/                    # [NEW] 루틴 전용 컴포넌트
│       ├── DailyPlan/
│       │   ├── KeyTaskInput.tsx
│       │   └── TimeBlockSection.tsx
│       ├── Reflection/
│       │   ├── ReflectionForm.tsx
│       │   └── ReflectionCard.tsx
│       └── common/                 # 루틴 모듈 내 공통 (버튼 등)
├── pages/
│   └── routine/                    # [NEW] 루틴 페이지
│       ├── RoutineLayout.tsx       # 루틴 공통 레이아웃 (사이드바 등)
│       ├── HomePage.tsx            # /routine (Daily Plan)
│       ├── ReflectionPage.tsx      # /routine/reflection
│       └── ArchivePage.tsx         # /routine/archive
├── stores/                         # [NEW/Check] 상태 관리
│   └── useRoutineStore.ts
├── types/
│   └── routine.d.ts
└── App.tsx                         # 라우팅 라우트 추가
```

### Backend 통합 (`backend/src/main/java/com/wootae/backend`)
```
com.wootae.backend.routine/         # [NEW] 루틴 도메인 패키지
├── controller/
│   ├── RoutineController.java      # 통합 Controller 또는 기능별 분리
│   └── ReflectionController.java
├── service/
│   ├── RoutineService.java
│   └── ReflectionService.java
├── repository/
│   ├── DailyPlanRepository.java
│   └── ReflectionRepository.java
├── domain/ (or entity/)
│   ├── DailyPlan.java
│   ├── TimeBlock.java
│   ├── Task.java
│   └── Reflection.java
└── dto/
    ├── DailyPlanDto.java
    └── ReflectionDto.java
```

## 4. 📅 구현 단계별 계획 (Phases)

### Phase 1: Frontend 통합 환경 설정 (Integration Setup)
*   [ ] **디펜던시 설치**: `npm install zustand date-fns lucide-react`
*   [ ] **라우팅 구성**: `App.tsx`에 `/routine` 경로 및 `RoutineLayout` 추가
*   [ ] **디렉토리 생성**: `components/routine`, `pages/routine` 구조 잡기
*   [ ] **타입 정의**: `types/routine.d.ts`에 핵심 데이터 모델 정의

### Phase 2: Frontend 핵심 기능 구현 (MVP Core)
*   **2-1. Daily Plan (Home)**
    *   [ ] `useRoutineStore` 구현 (DailyPlan 상태 관리)
    *   [ ] `KeyTaskInput` 컴포넌트 (3개 태스크 입력)
    *   [ ] `TimeBlockSection` 컴포넌트 (시간표 렌더링)
    *   [ ] 로컬 스토리지 연동 (API 연동 전 임시 영속성)
*   **2-2. Reflection (회고)**
    *   [ ] `ReflectionForm` 구현 (회고 작성)
    *   [ ] 아카이빙 로직 구현 (완료된 루틴 저장)
*   **2-3. UI Polish**
    *   [ ] Glassmorphism 스타일 적용
    *   [ ] `RoutineLayout` 사이드바/헤더 디자인

### Phase 3: Backend 도메인 구현 (Domain Setup)
*   [ ] **Entity 설계**: `DailyPlan`, `Task`, `TimeBlock`, `Reflection` JPA Entity 작성
*   [ ] **Repository**: JpaRepository 인터페이스 생성
*   [ ] **Database Schema**: MySQL 테이블 생성 쿼리 작성 (또는 JPA ddl-auto 활용)
    *   기존 `application.properties` 설정 확인 및 필요 시 조정

### Phase 4: Backend API 구현 & 연동 (API Implementation)
*   [ ] **DTO & Mapper**: Frontend 데이터 구조와 매핑
*   [ ] **Service Logic**: 루틴 생성, 수정, 회고 저장 로직 구현
*   [ ] **Controller**: REST API 엔드포인트 개설 (`/api/routine/...`)
*   [ ] **Integration**: Frontend `useRoutineStore` 또는 별도 API hook에서 백엔드 호출로 전환

## 5. 🧪 검증 계획 (Verification)
1.  **Frontend 단독 테스트**: 로컬 스토리지 모드로 루틴 생성 -> 회고 -> 저장 사이클 확인.
2.  **API 연동 테스트**: Swagger/Postman으로 백엔드 API 검증.
3.  **통합 테스트**: 실제 앱에서 DB 저장 및 조회 확인.
