# 구현 계획 - TextToMd 프론트엔드 v0.3.x (with Refactoring)

## 목표 설명
AI 기반 Markdown 변환 및 10가지 페르소나를 지원하는 TextToMd v0.3.x 프론트엔드를 구현합니다. 이 업데이트는 기존 로컬 도구를 하이브리드(로컬 + AI) 솔루션으로 변환하며, 프리미엄 글래스모피즘 UI, "생각하는(Thinking)" 상태 표시, 스마트 에러 복구 기능을 포함합니다.
또한, **Claude 팀의 리팩토링**을 반영하여 백엔드 스펙 준수 및 코드 품질을 강화합니다.

## 사용자 검토 필요
> [!IMPORTANT]
> **UX 개선 사항**:
> - **생각하는(Thinking) 상태**: "구조 분석 중...", "다듬는 중..."과 같은 텍스트 업데이트.
> - **싱크 스크롤(Sync Scroll)**: 입력창과 출력창 동기화.
> - **에러 피드백**: `TEXT_001` (입력 오류)는 입력창 하단에, 시스템 오류는 상단 알림으로 구분 표시.

## 변경 제안

### 프론트엔드 컴포넌트 (`src/components/tools/text-to-md`)
#### [NEW] [ModeToggle.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/components/tools/text-to-md/ModeToggle.tsx)
- `Local`과 `AI` 모드 간 전환을 위한 세그먼트 컨트롤.

#### [NEW] [PersonaSelector.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/components/tools/text-to-md/PersonaSelector.tsx)
- 10개의 페르소나 카드 (아이콘 + 설명).

#### [NEW] [EditorLayout.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/components/tools/text-to-md/EditorLayout.tsx)
- 2열 레이아웃, Sync Scroll, GlassCard 디자인.

#### [NEW] [ThinkingIndicator.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/components/tools/text-to-md/ThinkingIndicator.tsx)
- 순환 메시지 로딩 인디케이터.

### 프론트엔드 로직 & 유틸리티 (Refactored)
#### [NEW] [errorMapper.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/api/errorMapper.ts)
- 백엔드 에러 코드(`TEXT_001` 등)를 사용자 친화적 메시지로 변환.

#### [NEW] [clipboard.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/utils/clipboard.ts)
- 통합 클립보드 복사 유틸리티 (성공/실패 반환).

#### [NEW] [fileDownload.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/utils/fileDownload.ts)
- 통합 마크다운 다운로드 유틸리티.

#### [MODIFY] [textToMdApi.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/api/textToMdApi.ts)
- 백엔드 응답 타입(`model`, `tokensUsed`) 정의 추가.
- `code` 필드 파싱 및 `errorMapper` 적용.

#### [MODIFY] [useTextToMdAi.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/hooks/useTextToMdAi.ts)
- `useRef`를 사용한 안정적인 재시도 로직.
- 메타데이터(`model`, `tokensUsed`) 상태 관리 추가.

#### [MODIFY] [TextToMd.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/TextToMd.tsx)
- 통합된 유틸리티 적용.
- 에러 코드 기반의 분기된 UI 표시 (`TEXT_001` vs `AI_ERROR`).
- 출력 헤더에 사용된 모델 및 토큰 정보 표시.

## 검증 계획

### 자동화된 검증
- **유닛 테스트**:
    - `useTextToMdAi` 상태 전환 검증.
    - `errorMapper`가 백엔드 코드를 올바른 메시지로 변환하는지 확인.
- **빌드 테스트**: `npm run build` 성공 확인.

### 수동 검증
- **흐름 테스트**:
    1. AI 모드 변환 (페르소나 변경).
    2. 결과창의 모델/토큰 정보 확인.
- **에러 처리**:
    - 빈 값 입력 -> 입력창 하단 `TEXT_001` 경고 확인.
    - 네트워크 차단 -> 재시도 로직 동작 확인.
