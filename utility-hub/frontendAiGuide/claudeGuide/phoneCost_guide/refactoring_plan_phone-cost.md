# 리팩터링 계획 - Phone Cost Calculator v0.1

## 목표 설명
Gemini 팀이 구현한 Phone Cost Calculator의 **코드 품질, 타입 안전성, 유지보수성**을 개선합니다.
**Safe Refactoring 원칙**을 준수하여 외부 동작(UI/UX, 계산 결과)은 변경하지 않고 내부 구조만 개선합니다.

## 사용자 검토 필요

> [!IMPORTANT]
> **Safe Refactoring 원칙**:
> - 기존 기능 동작은 **절대 변경하지 않습니다**
> - 사용자가 확인한 UI/UX는 그대로 유지합니다
> - 계산 로직의 결과값은 동일하게 유지합니다
> - 내부 구조만 개선합니다

> [!WARNING]
> **Breaking Changes 없음**:
> - 컴포넌트 Props API는 변경하지 않습니다
> - LocalStorage 키/구조는 호환성 유지합니다
> - 계산 공식은 수학적으로 동일한 결과를 보장합니다

## 변경 제안

### Phase 1: 타입 안전성 & 상수 정리

#### [NEW] [constants.ts 확장](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/constants.ts)
**목적**: Magic numbers 제거 및 중앙 집중식 상수 관리

**추가할 상수**:
```typescript
export const VALIDATION_RULES = {
  CONTRACT_MONTHS: 24,
  MAX_ADDON_MONTHS: 36,
  MIN_VALUE: 0,
  MIN_MONTHS: 1,
} as const;

export const VAT_MULTIPLIER = 1.1;

export const ERROR_MESSAGES = {
  NEGATIVE_VALUE: '0 이상의 값을 입력해주세요.',
  CONTRACT_PERIOD_MISMATCH: '총 약정 기간(고가+저가)은 24개월이어야 합니다.',
  ADDON_MONTHS_EXCEEDED: '최대 36개월까지만 가능합니다.',
  MIN_MONTHS_REQUIRED: '1 이상의 값을 입력해주세요.',
  ADDON_FEE_NEGATIVE: '0 이상 입력',
  ADDON_MONTHS_NEGATIVE: '0 이상 입력',
} as const;
```

**변경 이유**:
- 하드코딩된 숫자(24, 36, 1.1)를 상수로 추출하여 유지보수성 향상
- 에러 메시지 중복 제거 및 일관성 확보

---

#### [MODIFY] [types.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/types.ts)
**목적**: 타입 안전성 강화

**변경 사항**:
```typescript
// Before: 너무 느슨한 타입
export interface ValidationErrors {
  [key: string]: string;
}

// After: 명시적인 키 타입
export type ValidationErrorKey =
  | 'highPlanMonths'
  | 'highPlanMonthly'
  | 'lowPlanMonths'
  | 'lowPlanMonthly'
  | 'deviceCostTotal'
  | 'mvnoDeviceCost'
  | 'mvnoMonthly'
  | 'mvnoMonths'
  | `addon_${number}_fee`
  | `addon_${number}_months`;

export type ValidationErrors = Partial<Record<ValidationErrorKey, string>>;
```

**변경 이유**:
- 타입 체크 시점에 오타 방지
- IDE 자동완성 지원 향상

---

### Phase 2: 유틸리티 함수 분리

#### [NEW] [utils/formatters.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/utils/formatters.ts)
**목적**: 포맷팅 로직 재사용 및 테스트 용이성 향상

**구현 내용**:
```typescript
/**
 * 숫자를 한국어 금액 형식으로 변환
 * @example formatToKoreanWon(12071200) => "1,207만 1,200원"
 */
export function formatToKoreanWon(value: number): string;

/**
 * 숫자를 천 단위 구분 기호로 포맷팅
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(value: number): string;
```

**변경 이유**:
- `ComparisonResult.tsx`에만 있던 `formatToKoreanWon`을 재사용 가능하게 분리
- 계산 로직 내부의 `fmt` 함수 중복 제거

---

#### [NEW] [utils/calculators.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/utils/calculators.ts)
**목적**: 계산 로직의 순수 함수화 및 테스트 용이성 향상

**구현 내용**:
```typescript
/**
 * VAT 적용 금액 계산
 */
export function applyVat(amount: number, vatIncluded: boolean): number;

/**
 * 통신사 플랜 총액 계산
 */
export function calculateCarrierTotal(
  input: CarrierPlanInput,
  vatIncluded: boolean
): { total: number; formula: string };

/**
 * 알뜰폰 플랜 총액 계산
 */
export function calculateMvnoTotal(
  input: MvnoPlanInput,
  vatIncluded: boolean
): { total: number; formula: string };
```

**변경 이유**:
- `usePhoneCost.ts`에서 계산 로직을 분리하여 훅의 책임 축소
- 순수 함수로 분리하여 단위 테스트 작성 용이

---

#### [NEW] [utils/validators.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/utils/validators.ts)
**목적**: 검증 로직 분리 및 재사용성 향상

**구현 내용**:
```typescript
/**
 * 입력값 검증
 */
export function validateInputs(
  carrier: CarrierPlanInput,
  mvno: MvnoPlanInput
): ValidationErrors;

/**
 * 개별 필드 검증 헬퍼
 */
export function validatePositiveNumber(value: number, fieldName: string): string | null;
export function validateContractPeriod(high: number, low: number): string | null;
```

**변경 이유**:
- 검증 로직을 훅에서 분리하여 재사용 가능
- 개별 필드 검증 시 즉각적인 피드백 제공 가능

---

### Phase 3: 접근성 개선

#### [MODIFY] [components/CarrierPlanForm.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/components/CarrierPlanForm.tsx)
**목적**: WCAG 2.1 AA 준수

**추가할 ARIA 속성**:
```typescript
<GlassInput
  label="고가 요금제 유지 개월"
  type="number"
  value={input.highPlanMonths}
  onChange={(e) => onFieldChange('highPlanMonths', Number(e.target.value))}
  // 추가
  aria-label="고가 요금제 유지 개월 수"
  aria-required="true"
  aria-invalid={!!errors['highPlanMonths']}
  aria-describedby={errors['highPlanMonths'] ? 'error-highPlanMonths' : undefined}
/>
{errors['highPlanMonths'] && (
  <p id="error-highPlanMonths" className="text-red-500 text-xs mt-1" role="alert">
    {errors['highPlanMonths']}
  </p>
)}
```

**변경 이유**:
- 스크린 리더 사용자 지원
- 에러 메시지와 입력 필드 명시적 연결

---

#### [MODIFY] [components/MvnoPlanForm.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/components/MvnoPlanForm.tsx)
**목적**: 동일한 접근성 개선 적용

---

### Phase 4: 코드 품질 개선

#### [MODIFY] [hooks/usePhoneCost.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/hooks/usePhoneCost.ts)
**목적**: 훅의 책임 축소 및 가독성 향상

**변경 사항**:
1. 계산 로직을 `utils/calculators.ts`로 이동
2. 검증 로직을 `utils/validators.ts`로 이동
3. 상수를 `constants.ts`에서 import
4. 주석 개선 (Why 중심)

**Before**:
```typescript
// 145줄짜리 계산 함수가 훅 내부에 존재
export function calculateCarrierTotal(...) { ... }
```

**After**:
```typescript
import { calculateCarrierTotal, calculateMvnoTotal } from '../utils/calculators';
import { validateInputs } from '../utils/validators';
import { ERROR_MESSAGES, VALIDATION_RULES } from '../constants';
```

---

## 검증 계획

### 자동화된 검증
- **빌드 테스트**: `npm run build` 성공 확인
- **타입 체크**: TypeScript 에러 0개 확인
- **기존 테스트**: `PhoneCost.test.ts`의 모든 테스트 통과 확인

### 수동 검증
1. **계산 정확성**:
   - 리팩터링 전후 동일한 입력에 대해 동일한 결과 확인
   - 10가지 테스트 케이스 재검증

2. **UI/UX 회귀 테스트**:
   - 모든 입력 필드 동작 확인
   - 부가서비스 추가/삭제 동작 확인
   - VAT 토글 동작 확인
   - 에러 메시지 표시 확인

3. **접근성 테스트**:
   - 키보드만으로 모든 기능 접근 가능 확인
   - 스크린 리더 테스트 (NVDA/JAWS)

4. **LocalStorage 호환성**:
   - 기존 저장된 데이터 정상 로드 확인
   - 새로운 데이터 저장/복원 확인

### 체크리스트 준수 확인
- **checklist_security_phone-cost.md** 모든 항목 재검증
- **design_spec_phone-cost.md** 요구사항 준수 확인
- **collaborations_rule_phone-cost.md** 원칙 준수 확인

---

## 리팩터링 후 기대 효과

### 코드 품질
- ✅ 타입 안전성 향상 (런타임 에러 감소)
- ✅ 코드 중복 제거 (DRY 원칙 준수)
- ✅ 테스트 용이성 향상 (순수 함수 분리)

### 유지보수성
- ✅ 상수 중앙 관리 (변경 포인트 단일화)
- ✅ 관심사 분리 (계산/검증/포맷팅 로직 독립)
- ✅ 명확한 책임 분담 (훅은 상태 관리만)

### 접근성
- ✅ WCAG 2.1 AA 준수
- ✅ 스크린 리더 지원 강화
- ✅ 키보드 네비게이션 최적화

### 개발자 경험
- ✅ IDE 자동완성 개선
- ✅ 타입 체크 시점 오류 발견
- ✅ 코드 가독성 향상
