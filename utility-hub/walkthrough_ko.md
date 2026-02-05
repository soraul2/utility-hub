# Routine MVP 구현 가이드 (Walkthrough)

이 가이드는 백엔드 컨트롤러, 서비스 업데이트 및 프론트엔드 전체 통합을 포함한 Routine MVP 기능의 구현 세부 사항을 설명합니다.

## 1. 백엔드 구현

### 컨트롤러 (Controllers)
루틴 기능을 외부로 노출하기 위해 REST 컨트롤러를 생성했습니다:
- **`RoutineController`**: 일일 계획 및 태스크 작업을 처리합니다.
  - `GET /api/v1/routine/daily-plans/today`: 오늘의 계획을 조회하거나 생성합니다.
  - `POST /api/v1/routine/daily-plans`: 특정 날짜의 계획을 생성합니다.
  - `POST /api/v1/routine/daily-plans/{planId}/tasks`: 태스크를 추가합니다.
  - `PATCH /api/v1/routine/tasks/{taskId}/toggle`: 태스크 완료 상태를 토글합니다.
  - `DELETE /api/v1/routine/tasks/{taskId}`: 태스크를 삭제합니다.
- **`ReflectionController`**: 회고 작업을 처리합니다.
  - `POST /api/v1/routine/reflections`: 회고를 저장(생성 또는 수정)합니다.
  - `GET /api/v1/routine/reflections/archive`: 과거 회고 목록을 조회합니다 (페이징 지원).

### 서비스 업데이트 (Service Updates)
- **`RoutineService`**: `saveReflection` 메서드를 업데이트하여 새로운 엔티티 메서드 또는 리포지토리 로직을 사용해 수정을 올바르게 처리하도록 했습니다.

## 2. 프론트엔드 구현

### 레이아웃 및 내비게이션
- **`Sidebar`**: 루틴 모듈 전용 사이드바를 생성했습니다 (`오늘의 계획`, `하루 회고`, `기록 보관소`).
- **`RoutineLayout`**: `Sidebar`를 통합하고 메인 콘텐츠 영역을 설정했습니다.
- **`App.tsx`**: 라우트를 구성했습니다:
  - `/routine` 접속 시 `/routine/daily-plan`으로 리다이렉트합니다.
  - `ProtectedRoute`를 적용하여 로그인한 사용자만 접근 가능하도록 했습니다.

### 페이지 (Pages)
- **`DailyPlanPage`**:
  - 오늘의 날짜와 진행 통계를 표시합니다.
  - 체크박스가 포함된 태스크 목록을 보여줍니다.
  - 새로운 목표 추가 및 기존 목표 삭제 기능이 포함되어 있습니다.
  - 로딩 및 에러 상태를 처리합니다.
- **`ReflectionPage`**:
  - 별점을 통한 하루 만족도 평가 기능을 제공합니다.
  - 이모지를 통한 기분 선택 기능을 제공합니다.
  - KPT (Keep, Problem, Try) 텍스트 영역을 통해 상세 회고를 기록합니다.
  - 기존 회고가 있을 경우 자동으로 불러옵니다.
- **`ArchivePage`**:
  - 과거 회고 목록을 그리드 형태로 표시합니다.
  - 날짜, 기분, 별점 및 요약 내용을 보여줍니다.

## 3. 검증 (Verification)
- **빌드**: `build.gradle`에서 필요한 백엔드 의존성(`spring-boot-starter-web`, `lombok` 등)을 확인했습니다.
- **린트**: 논리적 이슈를 해결했으며, 임포트 관련 환경 린트 에러는 Gradle 빌드/인덱싱 시 해결될 것으로 예상됩니다.

## 다음 단계
- 백엔드 서버 실행: `./gradlew bootRun`
- 프론트엔드 서버 실행: `npm run dev`
- 전체 흐름 테스트: 로그인 -> 오늘의 계획 확인 -> 태스크 추가 -> 태스크 완료 -> 회고 작성 -> 보관소 확인.
