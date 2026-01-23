# 프로젝트 작업 목록 (Gemini 팀) - Utility Hub v0.2

## 0. 핸드오버 및 초기화 (Perplexity 대기 중)
- [x] **Perplexity로부터 산출물 수신**
    - [x] `design_spec.md` (DB 스키마, API 명세, 에러 규칙)
    - [x] `collaborations_rule.md` (프로젝트 헌법, 코딩 컨벤션)
    - [x] 도메인 체크리스트 (예: `checklist_security.md`)

## 1. 계획 수립 (Planning: 설계 분석)
- [x] **설계 명세 분석**
    - [x] 요구사항 대비 DB 스키마 및 API 엔드포인트 검토
    - [x] 에러 처리 규칙 확인
- [x] **구현 계획 수립** (`implementation_plan.md`)
    - [x] 레이어드 아키텍처 기반 파일 구조 정의
    - [x] 주요 컴포넌트 로직 설계
    - [x] 검증 절차(테스트) 정의
- [x] **승인 요청** (사용자 알림)

## 2. 실행 (Execution: Main Builder)
- [x] **프로젝트 스캐폴딩**
    - [x] 환경 초기화 / 의존성 설치 (Vite, Tailwind 등)
    - [x] `collaborations_rule.md` 적용 (Linter, Formatter 설정)
- [x] **한글화 (Localization)**
    - [x] 사이드바 -> 헤더/대시보드 번역
    - [x] 각 도구(뽀모도로, 멀칭, 마크다운) UI 번역
- [x] **디자인 시스템 개편 (Design System Overhaul)**
    - [x] Apple Style Glassmorphism 컴포넌트 (`GlassCard`, `GlassButton`, `GlassInput`) 제작
    - [x] MainLayout 및 Header 리디자인 (중앙 정렬, 플로팅 헤더)
    - [x] Global Typography 적용
- [x] **도구별 기능 개선**
    - [x] **멀칭 비닐 계산기 (v0.2)**:
        - [x] 비용 계산 로직 수정 (올림 → 반올림)
        - [x] 단일 페이지(Single Page) UI 리팩터링 (결과, 상세, 입력 동시 표시)
        - [x] 접근성 강화 (어르신용 초대형 폰트/굵기 적용)
        - [x] **레이아웃 최적화**: 스크롤 없이 한 눈에 들어오도록 폰트 크기 강약 조절 및 간격 축소 (User Feedback 반영)
        - [x] **금액 표기 개선**: '만, 억, 조, 경' 단위 지원 (`formatWonSimple` 개선)
        - [x] **기록 테이블 수정**: 금액 컬럼 추가(단위 포함) 및 가운데 정렬 적용
    - [x] **텍스트 마크다운 변환기**: 다크모드 가시성 수정, 자동 포맷팅 기능 확인.
    - [x] **뽀모도로 타이머**: 원형 타이머 UI 적용.

## 3. 검증 및 문서화 (Gemini -> Claude/Perplexity)
- [x] **워크스루 작성** (`walkthrough.md`)
    - [x] 한글로 번역 및 최신 변경사항 반영
    - [x] 변경 사항 문서화
- [x] **빌드 및 테스트**
    - [x] `npm run build` 성공 확인
    - [x] 로컬 동작 테스트 완료

## 4. 리팩터링 및 고도화 (Refactoring & Refinement - by Claude Team)
- [x] **비즈니스 로직 분리** (`src/lib`)
    - [x] `mulchingFilm.ts`, `pomodoro.ts`, `textToMd.ts` 모듈 생성
    - [x] 순수 함수로 로직 구현 및 JSDoc 주석 추가
- [x] **커스텀 훅 추출** (`src/hooks`)
    - [x] `usePomodoro`, `useMulchingHistory`, `useTextToMd` 훅 생성
    - [x] 상태 관리 및 사이드 이펙트(Audio, LocalStorage) 캡슐화
- [x] **컴포넌트 리팩터링**
    - [x] UI 컴포넌트에서 비즈니스 로직 제거 (Pure UI Component화)
    - [x] 타입 안정성 강화 및 코드 중복 제거
- [x] **문서화**
    - [x] 프로젝트 README.md 작성 (설치, 실행, 아키텍처 가이드)

---

## 5. 이관 완료 (Post-Handover)
- [x] **v0.2.1 (Gemini) -> v0.2.2 (Claude) 이관**
    - [x] Gemini 작업분(기능/UI 구현) 완료
    - [x] Claude 추가 리팩터링(컴포넌트 분리) 반영 확인
    - [x] 최종 운영 주체: Claude / Perplexity 팀으로 이관됨

## 6. Git 형상관리 (Version Control)
- [x] **Repository 초기화**
    - [x] Root Directory: `c:/AiProject/utility-hub`
    - [x] Remote URL: `https://github.com/soraul2/utility-hub.git`
    - [x] Initial Commit: v0.2.2 구조 (frontend/backend 분리) 및 문서 포함

*최종 상태: Gemini 팀 임무 완료 (Mission Complete)*
