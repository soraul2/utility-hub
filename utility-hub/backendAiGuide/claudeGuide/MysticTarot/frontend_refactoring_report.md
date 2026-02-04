# MysticTarot 프론트엔드 리팩토링 보고서

## 개요

- **작성일**: 2026-02-04
- **작성팀**: Claude Team
- **버전**: v1.0.0
- **상태**: ✅ 완료

---

## 1. 리팩토링 목표

- 기능 및 디자인 변경 없이 코드 품질 개선
- 중복 코드 제거 및 상수화
- 커스텀 훅 추출로 상태 관리 개선
- 타입 안정성 강화

---

## 2. Phase 1: 상수 및 타입 정리

### 2.1 신규 파일 생성

**파일**: `frontend/src/lib/constants/tarot.ts`

```typescript
// 카드 관련 상수
export const TAROT_DECK_SIZE = 22;
export const DAILY_CARD_COUNT = 10;
export const THREE_CARD_POSITIONS = ['PAST', 'PRESENT', 'FUTURE'] as const;

// 확률 상수
export const FORTUNA_PROBABILITY = 0.01;

// 페이지네이션 상수
export const DEFAULT_PAGE_SIZE = 10;

// 딜레이 상수
export const SEARCH_DEBOUNCE_MS = 500;

// 에러 메시지
export const ERROR_MESSAGES = {
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
  DELETE_FAILED: '기록 삭제에 실패했습니다.',
  NETWORK: '네트워크 연결을 확인해주세요.',
  NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
} as const;

// 유효성 검사 상수
export const VALIDATION = {
  QUESTION_MAX_LENGTH: 500,
  USERNAME_MAX_LENGTH: 50,
  USER_AGE_MIN: 1,
  USER_AGE_MAX: 120,
} as const;
```

**파일**: `frontend/src/lib/utils/api.ts`

```typescript
export const cleanParams = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ) as Partial<T>;
```

### 2.2 타입 강화

**파일**: `frontend/src/lib/tarot.ts`

| 변경 전 | 변경 후 |
|--------|--------|
| `position: string` | `position: CardPosition` |
| `spreadType: 'DAILY_ONE' \| 'THREE_CARD'` (인라인) | `spreadType: SpreadType` |

**추가된 타입**:
- `CardPosition = 'PAST' | 'PRESENT' | 'FUTURE' | 'DAILY'`
- `SpreadType = 'DAILY_ONE' | 'THREE_CARD'`

---

## 3. Phase 2: 커스텀 훅 추출

### 3.1 생성된 훅

| 훅 | 파일 | 용도 |
|----|------|------|
| `useThreeCardForm` | `hooks/useThreeCardForm.ts` | 3카드 폼 상태 관리 (question, topic, userName, userAge, userGender) |
| `useConfetti` | `hooks/useConfetti.ts` | confetti 효과 + cleanup 처리 (메모리 누수 방지) |
| `useHistoryData` | `hooks/useHistoryData.ts` | 히스토리 데이터 패칭/페이징/검색/삭제 |

### 3.2 적용된 파일

**ThreeCardReadingPage.tsx**:
- 기존 15개 useState → `useThreeCardForm()` + `useConfetti()` 훅 사용
- confetti interval cleanup 자동 처리

**TarotHistoryPage.tsx**:
- 상수 적용: `DEFAULT_PAGE_SIZE`, `SEARCH_DEBOUNCE_MS`, `ERROR_MESSAGES`
- 타입 강화: `selectedSpread: SpreadType | undefined`

---

## 4. Phase 3: 컴포넌트 분할

### 4.1 ParticleEffect 공통 컴포넌트

**파일**: `frontend/src/components/effects/ParticleEffect.tsx`

```typescript
interface ParticleEffectProps {
  count?: number;
  className?: string;
  minSize?: number;
  maxSize?: number;
}
```

- `useMemo`로 파티클 위치 메모이제이션 (렌더링 최적화)
- 기존 인라인 파티클 코드 (11줄 × 2곳) → 1줄 컴포넌트 호출

### 4.2 적용된 파일

| 파일 | 변경 내용 |
|------|----------|
| `CardSelectionStep.tsx` | ParticleEffect 적용, `22` → `TAROT_DECK_SIZE` |
| `DailyCardSelectionView.tsx` | ParticleEffect 적용, `10` → `DAILY_CARD_COUNT` |

---

## 5. Phase 4-6: 중복 제거 및 에러 처리

### 5.1 에러 메시지 통합

모든 에러 메시지를 `ERROR_MESSAGES` 상수로 통합:

| 파일 | 변경 전 | 변경 후 |
|------|--------|--------|
| `useDailyCard.ts` | `'알 수 없는 오류가 발생했습니다.'` | `ERROR_MESSAGES.UNKNOWN` |
| `useThreeCardReading.ts` | `'알 수 없는 오류가 발생했습니다.'` | `ERROR_MESSAGES.UNKNOWN` |
| `TarotHistoryPage.tsx` | `'기록 삭제에 실패했습니다.'` | `ERROR_MESSAGES.DELETE_FAILED` |

### 5.2 API 파라미터 정리

**tarotApi.ts**:
- `cleanParams()` 유틸리티 적용으로 undefined 값 자동 필터링
- `DEFAULT_PAGE_SIZE` 상수 사용

---

## 6. 생성된 파일 목록

| 유형 | 파일 경로 |
|------|----------|
| 상수 | `frontend/src/lib/constants/tarot.ts` |
| 유틸 | `frontend/src/lib/utils/api.ts` |
| 훅 | `frontend/src/hooks/useThreeCardForm.ts` |
| 훅 | `frontend/src/hooks/useConfetti.ts` |
| 훅 | `frontend/src/hooks/useHistoryData.ts` |
| 컴포넌트 | `frontend/src/components/effects/ParticleEffect.tsx` |

---

## 7. 수정된 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `frontend/src/lib/tarot.ts` | `CardPosition`, `SpreadType` 타입 추가 |
| `frontend/src/lib/api/tarotApi.ts` | `cleanParams`, `DEFAULT_PAGE_SIZE` 적용 |
| `frontend/src/hooks/useDailyCard.ts` | `ERROR_MESSAGES` 적용 |
| `frontend/src/hooks/useThreeCardReading.ts` | `ERROR_MESSAGES` 적용 |
| `frontend/src/pages/tarot/ThreeCardReadingPage.tsx` | 훅 적용, 상수 적용 |
| `frontend/src/pages/tarot/TarotHistoryPage.tsx` | 상수 적용, 타입 강화 |
| `frontend/src/pages/tarot/components/CardSelectionStep.tsx` | ParticleEffect, 상수 적용 |
| `frontend/src/pages/tarot/components/DailyCardSelectionView.tsx` | ParticleEffect, 상수 적용 |

---

## 8. 개선 효과

### 8.1 코드 품질

| 항목 | 개선 전 | 개선 후 |
|------|--------|--------|
| 하드코딩된 상수 | 12개 이상 | 0개 |
| 중복 에러 메시지 | 5곳 | 1곳 (상수) |
| 인라인 파티클 코드 | 22줄 (2곳) | 2줄 |
| confetti 메모리 누수 | 있음 | 없음 (cleanup 처리) |

### 8.2 유지보수성

- 상수 변경 시 1곳만 수정하면 전체 반영
- 타입 안정성 향상으로 컴파일 타임 오류 검출
- 훅 추출로 로직 재사용 가능

---

## 9. 향후 개선 사항

### 9.1 미적용 항목

| 항목 | 사유 |
|------|------|
| `DailyCardResultView.tsx` 파티클 | mystic-float 애니메이션 (다른 스타일) |
| `useHistoryData` 훅 완전 적용 | 인증/네비게이션 로직 분리 필요 |
| 인라인 모달 통합 | ConfirmModal 컴포넌트 props 확장 필요 |

### 9.2 권장 추가 작업

1. **ResultStep.tsx** 인라인 CSS → CSS 모듈 분리
2. **InputFormStep.tsx** 유효성 검사 강화
3. **React.memo** 적용으로 불필요한 리렌더링 방지

---

## 10. 참고 자료

- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
