# 📝 작업 목록 - Routine MVP (Utility Hub 통합)

## Phase 0: 분석 및 준비 (완료)
- [x] **기존 Utility Hub 구조 분석** <!-- id: 0 -->
  - [x] 백엔드 통합 확인 (Security/User) <!-- id: 1 -->
  - [x] 프론트엔드 통합 포인트 확인 <!-- id: 2 -->

## Phase 1: API 명세
- [x] **API 및 계약 정의** <!-- id: 3 -->
  - [x] REST API 엔드포인트 정의 (일일 계획, 태스크, 회고) <!-- id: 4 -->
  - [x] DTO 구조 정의 (Routine 패키지) <!-- id: 5 -->

## Phase 2: 프론트엔드 설정 (통합)
- [x] **환경 및 도구** <!-- id: 6 -->
  - [x] `zustand`, `date-fns`, `lucide-react` 설치 <!-- id: 7 -->
  - [x] 디렉토리 구조 생성 (`components/routine`, `pages/routine`) <!-- id: 8 -->
  - [x] `App.tsx`에 `/routine` 라우트 업데이트 <!-- id: 9 -->
  - [x] `useRoutineStore.ts` 구현 (인증 연동) <!-- id: 10 -->

## Phase 3: 백엔드 도메인 (`com.wootae.backend.domain.routine`)
- [x] **도메인 구현** <!-- id: 11 -->
  - [x] 엔티티 생성 (`DailyPlan`, `Task`, `TimeBlock`, `Reflection`) <!-- id: 12 -->
  - [x] 리포지토리 생성 (`DailyPlanRepository` 등) <!-- id: 13 -->
  - [x] `RoutineService` 구현 (`SecurityContextHolder` 사용) <!-- id: 14 -->

## Phase 4: API 및 통합
- [x] **API 구현** <!-- id: 15 -->
  - [x] `RoutineController` 구현 (`/api/routine/**`) <!-- id: 16 -->
  - [x] 프론트엔드 `useRoutineStore`와 실제 API 연결 <!-- id: 17 -->
  - [x] JWT 전파 확인 <!-- id: 18 -->

## Phase 5: 마무리 및 검증
- [x] **UI 및 테스트** <!-- id: 19 -->
  - [x] Glassmorphism 및 애니메이션 적용 <!-- id: 20 -->
  - [x] 엔드투엔드 흐름 검증 (인증 상태) <!-- id: 21 -->
