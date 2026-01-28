# 리팩토링 계획 - TextToMd 프론트엔드 v0.3.x

## 목표 설명

Gemini 팀이 구현한 TextToMd v0.3.x 프론트엔드를 **백엔드 스펙 및 체크리스트 준수**를 위해 리팩토링합니다. 기존 기능은 모두 유지하면서, 에러 처리 개선, 코드 품질 향상, UX 개선을 진행합니다.

## 사용자 검토 필요

> [!IMPORTANT]
> **리팩토링 원칙**:
> - 기존 기능 동작은 **절대 변경하지 않습니다** (Safe Refactoring)
> - 백엔드 API 계약을 **완벽히 준수**합니다
> - Perplexity 팀의 체크리스트 요구사항을 **모두 충족**합니다

> [!WARNING]
> **Breaking Changes 없음**:
> - 컴포넌트 외부 API는 변경하지 않습니다
> - 사용자가 확인한 동작 방식은 그대로 유지합니다
> - 내부 구조만 개선합니다

## 변경 제안

### Phase 1: 백엔드 계약 준수 (필수)

#### [NEW] [errorMapper.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/api/errorMapper.ts)
- 백엔드 에러 코드를 사용자 친화적 메시지로 매핑
- `TEXT_001`, `AI_001`, `AI_002`, `PERSONA_001` 처리
- 프론트 체크리스트 요구사항 준수

**구현 내용**:
```typescript
export const mapErrorCodeToMessage = (code: string, defaultMessage: string): string => {
  const errorMap: Record<string, string> = {
    'TEXT_001': '입력 텍스트가 비어 있거나 너무 깁니다. (최대 10,000자)',
    'AI_001': 'AI 서비스 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    'AI_002': 'AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
    'PERSONA_001': '지원하지 않는 페르소나입니다.',
  };
  return errorMap[code] || defaultMessage;
};
```

---

#### [MODIFY] [textToMdApi.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/api/textToMdApi.ts)
- 백엔드 응답 타입 정의 추가 (`TextToMdResponse`)
- 에러 코드 매핑 로직 통합
- `code` 필드 파싱 및 활용

**변경 사항**:
1. Response 인터페이스에 `model`, `tokensUsed` 추가
2. 에러 응답에서 `code` 필드 추출
3. `mapErrorCodeToMessage` 사용

---

#### [MODIFY] [TextToMd.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/TextToMd.tsx)
- TEXT_001 에러 특별 처리 UX 추가
- 입력 영역 아래에 에러 메시지 표시
- 모델/토큰 정보 표시 영역 추가

**변경 사항**:
1. `aiError`가 `TEXT_001`일 때 입력 영역 아래에 표시
2. 출력 영역 헤더에 모델 정보 표시 (`model`, `tokensUsed`)
3. 기존 Alert은 `AI_001`, `AI_002` 등에만 사용

---

### Phase 2: 코드 품질 개선 (권장)

#### [NEW] [clipboard.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/utils/clipboard.ts)
- 통합 클립보드 복사 유틸리티
- 성공/실패 상태 반환
- `useTextToMd.ts`와 `TextToMd.tsx`의 중복 제거

**구현 내용**:
```typescript
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
```

---

#### [NEW] [fileDownload.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/utils/fileDownload.ts)
- 통합 파일 다운로드 유틸리티
- Markdown 파일 다운로드 전용
- `textToMd.ts`와 `TextToMd.tsx`의 중복 제거

**구현 내용**:
```typescript
export const downloadMarkdown = (content: string, filename?: string): void => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `converted_${new Date().getTime()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
```

---

#### [MODIFY] [useTextToMdAi.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/hooks/useTextToMdAi.ts)
- Smart Retry 로직 개선
- 재귀 호출 대신 명시적 상태 관리
- `retryCount`를 dependency에서 제거하여 무한 리렌더링 방지

**변경 사항**:
1. `useRef`로 재시도 카운트 관리
2. `setTimeout` 재귀 호출 제거
3. 명시적 재시도 플래그 사용

---

#### [MODIFY] [useTextToMd.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/hooks/useTextToMd.ts)
- 통합 유틸리티 사용
- `copyToClipboard`, `downloadMarkdown` import
- 중복 코드 제거

---

#### [MODIFY] [TextToMd.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/TextToMd.tsx)
- 통합 유틸리티 사용
- `copyStatus` 상태 관리 단순화
- `handleCopyWrapper`, `handleDownloadWrapper` 간소화

---

### Phase 3: UX 개선 (선택)

#### [NEW] [useLocalStorage.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/hooks/useLocalStorage.ts)
- 로컬스토리지 저장/불러오기 커스텀 훅
- 마지막 모드, 페르소나, 옵션 저장
- 프론트 체크리스트 요구사항 준수 (비민감 정보만 저장)

**구현 내용**:
```typescript
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  // useState + localStorage 통합
};
```

---

#### [MODIFY] [PersonaSelector.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/components/tools/text-to-md/PersonaSelector.tsx)
- ARIA 속성 추가
- `aria-label`, `aria-pressed` 추가
- 스크린 리더 접근성 개선

**변경 사항**:
1. 각 버튼에 `aria-label` 추가
2. 선택된 페르소나에 `aria-pressed="true"` 추가
3. 키보드 네비게이션 힌트 추가

---

## 검증 계획

### 자동화된 검증
- **빌드 테스트**:
    - `npm run build` 성공 확인
    - TypeScript 타입 에러 없음
- **타입 체크**:
    - 백엔드 응답 타입과 프론트 타입 일치 확인

### 수동 검증
- **백엔드 연동 테스트**:
    1. 백엔드 서버 실행 상태에서 테스트
    2. 10개 페르소나 모두 테스트
    3. 에러 시나리오 테스트:
        - 빈 텍스트 입력 → TEXT_001 에러 확인
        - 네트워크 오류 시뮬레이션 → 재시도 동작 확인
        - AI 서비스 오류 → AI_001 에러 메시지 확인
    4. 모델/토큰 정보 표시 확인

- **기능 회귀 테스트**:
    1. Local 모드 동작 확인 (기존과 동일)
    2. AI 모드 동작 확인 (기존과 동일)
    3. 복사/다운로드 기능 확인
    4. Sync Scroll 동작 확인
    5. Thinking Indicator 동작 확인

### 체크리스트 준수 확인
- **checklist_security_front_v0.3_text2md.md** 모든 항목 체크
- **design_spec_front_text2md.md** 요구사항 준수 확인
- **collaborations_rule_front_v0.3_text2md.md** 원칙 준수 확인
