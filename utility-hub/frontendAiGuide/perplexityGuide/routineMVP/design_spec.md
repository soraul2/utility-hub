📋 Routine MVP - Frontend Design Spec
프로젝트명: Routine MVP (Daily Routine Planner)
버전: v1.0.0 (컴팩트 5개 화면 MVP)
작성일: 2026.02.05
작성자: Perplexity (Architect & QA)

1. 🎯 프로젝트 목표 & 핵심 가치
   비즈니스 목표
   사용자 습관 형성: 매일 5분 루틴으로 생산성 향상

MVP 검증: 1주 사용 후 "계속 쓰고 싶은가?" 확인

확장 기반: Calendar/Tasks 등 추가 기능 준비

핵심 가치 (User Value)
text
1. 아침 3분: 하루 3개 핵심 Task + 타임라인 배치
2. 낮 실행: 진행도 체크
3. 저녁 3분: Reflection → Archive 자동 저장
2. 🏗️ 시스템 아키텍처 (Phase 1: Frontend MVP)
   text
   Frontend: React 18 + TypeScript + Vite + TailwindCSS + React Router
   State: localStorage (JSON) → 나중 API 전환
   Routing: 5개 페이지 (Home/Tasks/Calendar/Reflection/Archive)
   Responsive: Desktop First → Mobile OK
   text
   데이터 모델 (localStorage 기준):
- dailyPlans: { date: string, keyTasks: string[], timeBlocks: TimeBlock[], reflection?: Reflection }
- archive: dailyPlans[] (지난 30일)
3. 🎨 UI/UX 설계 (5개 화면 상세)
   화면 1: Home (Daily Plan) /
   text
   Layout:
   [Sidebar] | [Header: 날짜]
   | [Key Tasks 3개: input + drag]
   | [Timeline: 6AM~11PM + [+]버튼]
   | [Quick Reflection 버튼]

Key Components:
- KeyTaskInput: dashed border, drag handle
- TimeBlock: clickable, + icon, category tag
  화면 2: Tasks /tasks
  text
  Layout:
  [Sidebar] | [Pending Tasks (이번 주)]
  | [날짜별 그룹: 02.05 (2/3)]
  | [Task: 제목 + "→ 일정 추가" 버튼]
  화면 3: Calendar /calendar
  text
  Layout:
  [Sidebar] | [이번 주: 02.02~02.08]
  | [7열 그리드: Mon~Sun]
  | [각 셀: "5일 | 12/15 완료"]
  화면 4: Reflection /reflection
  text
  Layout:
  [Sidebar] | [오늘 요약: 2/3 완료]
  | [✅ 잘된 점 | ⚠️ 개선점 | 📝 내일 계획]
  | [저장 → Home 버튼]
  화면 5: Archive /archive
  text
  Layout:
  [Sidebar] | [과거 기록 리스트]
  | [02.05: 2/3 | Reflection 미리보기]
4. 💾 데이터 스키마 (localStorage → API 준비)
   TypeScript 인터페이스
   typescript
   interface TimeBlock {
   id: string;
   startHour: number;
   endHour: number;
   task?: string;
   category?: 'Work' | 'Health' | 'Study' | 'Personal';
   completed?: boolean;
   }

interface DailyPlan {
date: string; // "2026-02-05"
keyTasks: string[]; // 최대 3개
timeBlocks: TimeBlock[];
reflection?: {
good: string;
improve: string;
tomorrow: string;
};
}
localStorage 키
text
"routine-daily": DailyPlan (오늘)
"routine-archive": DailyPlan[] (30일)
5. 🚀 API 명세 (Phase 2 백엔드용)
   text
   POST /api/daily-plan
   Body: DailyPlan
   Response: { success: true, data: DailyPlan }

GET /api/daily-plan?date=2026-02-05
Response: DailyPlan | null

GET /api/archive?days=30
Response: DailyPlan[]

Error Response (공통):
{
"success": false,
"error": {
"code": "VALIDATION_ERROR",
"message": "Key tasks must be 3 or less"
}
}
6. 🎯 구현 우선순위 & 태스크 분할
   Week 1: Frontend MVP
   text
   Day 1: App.jsx + Sidebar + Home (타임라인)
   Day 2: Reflection + Tasks
   Day 3: Calendar + Archive + localStorage
   Day 4: 반응형 + 테스트 + 1일 사용
   Week 2: 백엔드 (필요시)
   text
   Spring Boot + MySQL 최소 API 3개
   localStorage → API 전환
7. 🛡️ 검증 체크리스트
   기능 체크리스트
   text
   [ ] Home: Key Tasks 3개 입력 → 타임라인 [+] 추가
   [ ] Reflection: 3문항 작성 → localStorage 저장
   [ ] Tasks: 미완료 Task 리스트 표시
   [ ] Calendar: 주간 완료율 그리드
   [ ] Archive: 지난 날짜 Reflection 미리보기
   사용자 체험 체크리스트
   text
   [ ] 30초 내 첫 Task 작성 완료
   [ ] 드래그/클릭 둘 다 직관적
   [ ] 모바일에서 타임라인 스크롤 OK
   [ ] 온보딩 3초 내 이해