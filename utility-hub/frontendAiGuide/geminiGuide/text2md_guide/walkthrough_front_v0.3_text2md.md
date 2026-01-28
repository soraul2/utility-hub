# TextToMd Frontend v0.3.x Walkthrough (Updated with Refactoring)

## Overview
TextToMd 페이지가 **v0.3.x**로 업데이트되었습니다. 초기 구현 이후 **Claude 팀의 리팩토링**을 통해 백엔드 스펙 준수 및 코드 품질이 대폭 향상되었습니다.

## ✨ 주요 변경 사항 (Key Changes)

### 1. Refactored Architecture (New)
- **Error Mapping System**: `errorMapper.ts`를 도입하여 백엔드 에러 코드(`TEXT_001`)를 사용자 친화적 메시지로 변환합니다.
- **Utility Extraction**: `clipboard.ts`, `fileDownload.ts`로 공통 로직을 분리하여 코드 중복을 제거했습니다.
- **Smart Retry**: `useRef`를 사용하여 무한 루프 위험 없는 안정적인 재시도 로직을 구현했습니다.

### 2. Enhanced UX (Refactored)
- **Context-Aware Error**: 
  - 입력 오류(`TEXT_001`)는 **입력창 하단**에 표시.
  - 시스템 오류(`AI_001`)는 **상단 알림**으로 표시.
- **Metadata Display**: AI 변환 완료 시 사용된 **모델명(Running Model)**과 **토큰 사용량**을 출력창 상단에 표시합니다.

### 3. Core Features (Preserved)
- **Dual Mode**: 로컬(JS) / AI(LLM) 변환 모드 지원.
- **10 Persona Selectors**: AI 모드에서 10가지 스타일 선택 가능.
- **Glassmorphism UI**: 2열 레이아웃, Sync Scroll, Thinking Indicator 지원.

# 🔧 TroubleShooting & Resolutions

### 404 API Not Found (Proxy 설정)
- **증상**: 프론트엔드에서 `/api/text-to-md` 호출 시 404 에러.
- **해결**: `vite.config.ts`에 Proxy 설정을 추가하여 `http://localhost:8080` 포워딩 적용.

### Unused Variables Build Error
- **증상**: `handleCopy`, `handleDownload` 미사용으로 인한 빌드 실패.
- **해결**: 리팩토링 과정에서 통합 유틸리티(`clipboard.ts`)로 위임하여 해결.

## Verification
- **Build**: `npm run build` 성공 (All Types Checked).
- **Files**:
  - `src/lib/api/errorMapper.ts` (New)
  - `src/lib/utils/clipboard.ts` (New)
  - `src/hooks/useTextToMdAi.ts` (Optimized)
  - `src/pages/tools/TextToMd.tsx` (Integrated)

## Next Steps
- 프론트엔드 서버(`npm run dev`)를 실행하고 `http://localhost:5173/tools/text-to-md`에 접속하여 기능을 확인해 주세요.
- 백엔드 서버가 8080 포트에서 실행 중이어야 합니다.
