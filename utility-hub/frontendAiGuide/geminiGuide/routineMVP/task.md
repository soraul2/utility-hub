# 📝 Task List - Routine MVP V2 (Design Upgrade)

## Phase 1: 디자인 분석 및 계획 (Completed)
- [x] **디자인 요구사항 분석** <!-- id: 0 -->
  - [x] 이미지 분석 (Timeline, Weekly, Modal View) <!-- id: 1 -->
  - [x] `implementation_plan.md` 업데이트 (V2 스펙) <!-- id: 2 -->

## Phase 2: 백엔드 확장 (Backend)
- [ ] **도메인 모델 업데이트** <!-- id: 3 -->
  - [ ] **DB 마이그레이션 실행** (`ALTER TABLE routine_tasks`, `routine_reflections`) <!-- id: 22 -->
  - [ ] `Task` 엔티티 필드 추가 (Category, Time, Desc, Priority) <!-- id: 4 -->
  - [ ] `Reflection` 엔티티 필드 추가 (EnergyLevel, MorningGoal) <!-- id: 5 -->
  - [ ] DTO 업데이트 (JSON 구조 변경 반영) <!-- id: 6 -->
- [x] **통계 API 구현** <!-- id: 7 -->
  - [x] `WeeklyStats` 서비스 로직 구현 <!-- id: 8 -->
  - [x] `RoutineController`에 통계 엔드포인트 추가 <!-- id: 9 -->

## Phase 3: 프론트엔드 컴포넌트 (Frontend)
- [ ] **UI 컴포넌트 개발** <!-- id: 10 -->
  - [x] `TaskCategoryBadge` & `ValueTags` <!-- id: 11 -->
  - [x] `AddTaskModal` (복합 입력 폼) <!-- id: 12 -->
  - [x] `TimelineItem` & `TimeSlot` <!-- id: 13 -->
  - [ ] `WeekProgress` (차트/그래프) <!-- id: 14 -->

## Phase 4: 페이지 리뉴얼
- [ ] **페이지 구현** <!-- id: 15 -->
  - [x] `DailyPlanPage`: Timeline 뷰, Stats 위젯, AddTaskModal 연동 <!-- id: 16 -->
  - [x] `WeeklyReviewPage`: 신규 페이지, 주간 통계 및 회고 아카이브 <!-- id: 17 -->
  - [x] `ArchivePage`: 카드형 UI로 개선 <!-- id: 18 -->

## Phase 5: 통합 및 검증
- [ ] **Integration** <!-- id: 19 -->
  - [ ] **Zustand Store Refactoring** (State 확장: `categories`, `weeklyStats`) <!-- id: 23 -->
  - [x] `useRoutineStore` API 로직 연결 (신규 DTO 대응) <!-- id: 20 -->
  - [ ] 전체 플로우 테스트 (생성 -> 타임라인 확인 -> 완료 -> 주간 통계) <!-- id: 21 -->
