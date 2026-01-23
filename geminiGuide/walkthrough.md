# 유틸리티 허브 v0.2 - 개발 완료 보고서 (Walkthrough)

## 요약
Antigravity 팀(Gemini)은 Perplexity에서 제공된 디자인 사양과 사용자의 추가 요청 사항을 바탕으로 **Utility Hub v0.2** 구현을 성공적으로 완료했습니다.
이 프로젝트는 **Vite + React + TypeScript**로 구축되었으며, **Tailwind CSS**를 사용하여 "애플(Apple) 스타일 글래스모피즘(Glassmorphism)" 디자인 언어가 적용되었습니다.

> [!IMPORTANT]
> **v0.2.2 업데이트 알림 (Handover)**
> 본 문서는 Gemini 팀이 작업한 v0.2.1까지의 내용을 담고 있습니다.
> 이후 Claude 팀에서 진행한 **컴포넌트 분리 및 안전 리팩터링(v0.2.2)** 내용은 `claudeGuide/walkthrough_v0.2.2.md`를 참고해 주십시오. 현재 코드베이스는 v0.2.2 상태입니다.

---

## 구현된 기능 (Features Implemented)

### 1. 디자인 시스템 개편 (Design System Overhaul)
- **애플 스타일 글래스모피즘**: `backdrop-blur-xl`, `bg-white/70`, `shadow-xl` 등을 활용한 투명하고 고급스러운 UI 컴포넌트(`GlassCard`, `GlassButton`, `GlassInput`) 제작 및 적용.
- **앱 스타일 레이아웃**: 웹페이지보다는 네이티브 앱 같은 느낌을 주기 위해 중앙 정렬된 최대 너비 레이아웃과 플로팅 헤더(Floating Glass Header) 적용.
- **비주얼 효과**: 매쉬 그라디언트 배경(Light/Dark dynamic), 부드러운 전환 효과(`duration-500`) 적용.

### 2. 메인 대시보드 (Main Dashboard)
- 도구 아이콘 중심의 심플한 그리드 레이아웃.
- 실시간 도구 검색 및 필터링 기능.
- 헤더에 통합된 다크모드 토글 스위치.

### 3. 멀칭 비닐 계산기 (Mulching Film Calculator)
- **UI 재설계 (Single Page & Compact)**: 사용자의 피드백을 반영하여 **스크롤이 필요 없는(Above the fold)** 단일 화면 레이아웃으로 최적화.
    - **레이아웃 압축**: 불필요한 패딩과 마진을 최소화하여 결과/상세/입력/버튼이 한눈에 들어오도록 배치.
    - **정보 위계 재정립**:
        - **필요 롤 수**: 화면의 핵심 정보로 가장 크게 강조(5xl).
        - **예상 금액**: 서브 정보로 적절한 크기(xl)로 조정.
        - **상세 내역**: 공간 절약을 위해 컴팩트한 사이즈(xs/sm)로 조정.
    - **접근성 유지**: 중요 입력 필드와 버튼은 여전히 크고 굵게 유지하여 터치 편의성 확보.
    - **테이블형 기록**: 하단 기록 섹션을 깔끔한 그리드/테이블 형태로 개선 (금액 단위 '원' 포함 및 가운데 정렬).
    - **비용 계산 로직**: `반올림(롤 수) * 가격` 적용 완료.
    - **금액 표기 개선**: 큰 액수도 쉽게 읽을 수 있도록 한국어 단위('만, 억, 조, 경') 자동 변환 로직(`formatWonSimple`) 업그레이드.

### 4. 텍스트 마크다운 변환기 (Text to Markdown Converter)
- 자동 소제목(Auto Heading) 및 자동 리스트(Auto List) 변환 옵션.
- 클립보드 복사 및 .md 파일 다운로드 기능.
- **버그 수정**: 다크모드에서 입력창(Textarea)의 글자가 검은색으로 보여 보이지 않던 문제를 해결 (`dark:text-white`, `dark:bg-gray-800` 적용).

### 5. 뽀모도로 타이머 (Pomodoro Timer)
- 애플 스타일의 원형 진행 바(Progress Ring) 타이머 구현.
- 집중, 짧은 휴식, 긴 휴식 모드 지원 및 설정 가능.

### 6. 한글화 (Localization)
- 전체 UI(메뉴, 도구 이름, 설명, 알림 등) 100% 한글화 적용 완료.

### 7. 리팩터링 및 아키텍처 개선 (Refactoring & Architecture)
- **비즈니스 로직 분리**: 핵심 로직을 `src/lib` 폴더로 분리하여 테스트 용이성 및 재사용성 확보.
- **커스텀 훅 패턴 도입**: `src/hooks` 폴더에 `usePomodoro`, `useMulchingHistory` 등을 구현하여 컴포넌트의 복잡도 감소.
- **코드 품질 향상**: 타입스크립트 타입 정의 강화 및 JSDoc 주석 추가로 유지보수성 증대.
- **문서화**: 프로젝트 루트에 상세한 `README.md`를 추가하여 온보딩 가이드 제공.

---

## 검증 (Verification)

### 빌드 상태 (Build Status)
> [!NOTE]
> `npm run build` 명령어가 성공적으로 실행되었습니다.

```bash
> tsc -b && vite build
vite v7.3.1 building client environment for production...
✓ 60 modules transformed.
✓ built in 2.24s
```

### 수동 테스트 가이드 (Manual Testing Guide)
로컬 환경에서 테스트하려면 다음 단계를 따르십시오:

1.  `utility-hub` 터미널 열기.
2.  `npm run dev` 실행.
3.  http://localhost:5173 접속.

**체크리스트:**
- [x] 우측 상단 다크모드 토글 정상 작동 확인.
- [x] **멀칭 비닐 계산기**: 면적 100, 폭 90, 길이 1000 입력 -> [계산하기] -> 결과 및 상세 내역 확인. 다크모드 시 입력값 보이는지 확인.
- [x] **텍스트 마크다운 변환기**: 텍스트 입력창에 글자 입력 시 다크모드에서 흰색 글자로 잘 보이는지 확인.
- [x] **뽀모도로**: 타이머 시작/정지 및 모드 변경 확인.
