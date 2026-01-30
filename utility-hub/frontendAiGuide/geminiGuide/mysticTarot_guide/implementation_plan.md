# 미스틱 타로 프론트엔드 구현 계획 (Mystic Tarot Implementation Plan)

**작성자:** Gemini (Antigravity)
**기반 문서:** Perplexity Guide v0.1 (`frontend_design_tarot.md`, `frontend_api_usage_tarot.md`)

## 1. 개요 (Goal)
Perplexity 팀이 설계한 **Mystic Tarot**의 v0.1 프론트엔드를 구현합니다.
사용자는 '오늘의 카드'를 확인하고, '3카드 스프레드'를 통해 고민을 상담할 수 있습니다.
밤하늘의 신비로운 분위기(Dark Theme + Glassmorphism)를 연출하며, AI의 리딩 결과는 마크다운으로 깔끔하게 렌더링합니다.

## 2. 사용자 리뷰 요청 사항 (User Review Required)
> [!IMPORTANT]
> *   **테마 적용**: 기존 `index.css`의 Glassmorphism 스타일을 유지하되, 타로 전용의 `Dark/Purple` 무드를 추가합니다.
> *   **이미지 경로**: API가 반환하는 이미지 경로가 `http://localhost:8080`을 포함하고 있는지, 프론트에서 붙여야 하는지 확인 필요 (설계서상 프론트에서 호스트 추가 필요).

## 3. 변경 제안 (Proposed Changes)

### A. 패키지 및 환경 설정
#### [NEW] `package.json`
*   `react-markdown`: AI 리딩 텍스트 렌더링용
*   `rehype-sanitize`: (Optional) 보안 강화

### B. 라우팅 및 레이아웃
#### [MODIFY] `src/App.tsx`
*   신규 라우트 추가:
    *   `/daily`: 오늘의 카드
    *   `/three-cards`: 3카드 스프레드
*   기존 `/` 홈 화면에 타로 진입점 버튼 추가

#### [NEW] `src/components/layout/AppLayout.tsx`
*   헤더, 푸터, 백그라운드(별빛/밤하늘 효과) 래퍼 컴포넌트

### C. 공통 컴포넌트
#### [NEW] `src/components/common/`
*   `MarkdownViewer.tsx`: 마크다운 렌더링 및 스타일링
*   `TarotCardView.tsx`: 카드 이미지 앞/뒤면, 정/역방향(`transform: rotate(180deg)`) 처리
*   `ErrorBanner.tsx`, `LoadingSpinner.tsx`: 로딩/에러 상태 표시

### D. 기능별 구현
#### [NEW] `src/pages/tarot/`
*   **DailyCardPage.tsx**:
    *   `useEffect`로 진입 시 API 호출
    *   **확정 리추얼**: 카드 선택 후 '운명 확정 모달'을 통한 몰입감 강화
    *   단일 카드 표시 및 **Mystic Scattering** 보랏빛 산란 이펙트 적용
*   **ThreeCardReadingPage.tsx**:
    *   **Phase 1 (Input)**: 질문, 토픽 선택 및 **상세 사용자 정보(이름, 나이, 성별)** 입력 폼
    *   **Phase 2 (Selection)**: 카드 셔플 애니메이션 및 드래그 인터랙션
    *   **Phase 3 (Leader Selection)**: 7인의 조수 및 **1% 확률의 히든 마스터 '포르투나(Fortuna)'** 시스템
    *   **Phase 4 (Result)**: **서사적 리추얼(Narrative Ritual)** 기반의 단계적 오픈 및 **앤티크 편지 봉투(Seal of Destiny)** 연출

#### [NEW] `src/api/tarotApi.ts`
*   `fetchDailyCard(userName?)`
*   `createThreeCardReading(payload)` (userName, userAge, userGender 포함)
*   DTO 타입 정의 (`DailyCardResponse`, `ThreeCardRequest` 등)

## 4. 검증 계획 (Verification Plan)

### Automated Tests
*   `npm run build`로 빌드 오류 확인
*   (시간 허용 시) `tarotApi`에 대한 단위 테스트 작성

### Manual Verification
1.  **오늘의 카드**: `/daily` 진입 시 카드가 정상적으로 뜨는지, '다시 뽑기' 동작 확인.
2.  **3카드 리딩**:
    *   필수값(질문) 미입력 시 전송 불가 확인.
    *   API 응답(카드 3장 + AI 메시지)이 화면에 올바른 순서로 렌더링되는지 확인.
3.  **에러 처리**: 서버 종료 후 요청 시 `ErrorBanner`가 뜨는지 확인.
