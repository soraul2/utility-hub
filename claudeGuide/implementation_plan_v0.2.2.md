# 멀칭 비닐 계산기 안전 리팩터링 계획 (Claude Team)

## 목표 설명

Gemini 팀이 구현한 멀칭 비닐 계산기(`MulchingFilm.tsx`)의 **내부 코드 품질을 개선**합니다.

> [!IMPORTANT]
> **핵심 원칙: UI/UX 구조 절대 변경 금지**
> 
> 이전 리팩터링에서 UI/UX 구조 변경으로 인한 문제가 발생했습니다. 이번 리팩터링은 **사용자가 보는 화면과 사용 흐름을 100% 동일하게 유지**하면서, **내부 코드의 가독성과 유지보수성만 개선**합니다.

---

## 사용자 검토 필요 사항

> [!WARNING]
> **리팩터링 범위 확인 필수**
> 
> 다음 사항들이 **절대 변경되지 않음**을 확인해 주세요:
> - ✅ 레이아웃 구조 (상단 결과 → 상세 → 입력 → 버튼 → 기록)
> - ✅ 컴포넌트 배치 순서
> - ✅ 사용자 인터랙션 플로우 (입력 → 계산하기 → 결과 표시)
> - ✅ 스타일링 (폰트 크기, 색상, 간격 등)
> - ✅ 반응형 레이아웃 (모바일/데스크톱)

**변경되는 것:**
- 🔧 내부 코드 구조 (서브 컴포넌트 분리)
- 🔧 타입 안전성 강화
- 🔧 에러 처리 개선
- 🔧 접근성 속성 추가
- 🔧 코드 주석 및 문서화

---

## 제안 변경 사항

### 1. 코드 구조 개선 (UI Layer)

#### [MODIFY] [MulchingFilm.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/MulchingFilm.tsx)

**변경 전략: 서브 컴포넌트 추출 (렌더링 결과 100% 동일 유지)**

현재 267줄의 단일 컴포넌트를 다음과 같이 분리합니다:

```typescript
// 메인 컴포넌트 (MulchingFilm.tsx)
// ├── ResultDisplay (결과 표시 섹션)
// ├── DetailSection (계산 상세 내역)
// ├── InputForm (입력 폼)
// └── HistoryTable (최근 계산 기록)
```

**주요 개선 사항:**

1. **서브 컴포넌트 분리**
   - `ResultDisplay`: 필요 수량 및 예상 금액 표시 (라인 74-96)
   - `DetailSection`: 계산 상세 내역 카드 (라인 99-143)
   - `InputForm`: 4개 입력 필드 (라인 146-206)
   - `HistoryTable`: 최근 계산 기록 테이블 (라인 218-259)
   
   > **중요**: 각 서브 컴포넌트는 **동일한 JSX 구조와 클래스명**을 유지하여 렌더링 결과가 완전히 동일합니다.

2. **상수 정의**
   ```typescript
   const CONTAINER_MAX_WIDTH = 'max-w-[480px]';
   const HISTORY_LIMIT = 5;
   const INPUT_PLACEHOLDER = {
     areaPyeong: '100',
     widthCm: '90',
     lengthM: '500',
     pricePerRoll: '25000'
   };
   ```

3. **타입 안전성 강화**
   ```typescript
   interface InputFieldConfig {
     name: keyof MulchingState;
     label: string;
     placeholder: string;
     unit: string;
   }
   
   interface ValidationError {
     field: keyof MulchingState;
     message: string;
   }
   ```

4. **입력 검증 개선**
   - 현재: 정규식 검증만 (`/^\d*\.?\d*$/`)
   - 개선: 필드별 구체적 에러 메시지 제공
   ```typescript
   const validateInput = (name: string, value: string): string | null => {
     if (!value) return '값을 입력해 주세요';
     const num = parseFloat(value);
     if (isNaN(num)) return '숫자만 입력 가능합니다';
     if (num <= 0) return '0보다 큰 값을 입력해 주세요';
     return null;
   };
   ```

5. **접근성 개선**
   - ARIA 레이블 추가
   ```typescript
   <input
     aria-label="밭의 면적 (평)"
     aria-required="true"
     aria-invalid={!!errors.areaPyeong}
     aria-describedby={errors.areaPyeong ? 'area-error' : undefined}
     // ... 기존 속성 유지
   />
   ```

6. **성능 최적화**
   - `useMemo`로 계산 결과 메모이제이션
   - `useCallback`으로 이벤트 핸들러 최적화
   ```typescript
   const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     // ... 기존 로직 동일
   }, []);
   ```

---

### 2. 새로운 파일 생성

#### [NEW] [MulchingFilm/components/ResultDisplay.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/MulchingFilm/components/ResultDisplay.tsx)

**목적**: 결과 표시 로직 분리 (라인 74-96 추출)

```typescript
interface ResultDisplayProps {
  result: CalculationResult | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  // 기존 JSX 구조 100% 동일하게 유지
  // 클래스명, 구조, 애니메이션 모두 동일
};
```

#### [NEW] [MulchingFilm/components/DetailSection.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/MulchingFilm/components/DetailSection.tsx)

**목적**: 계산 상세 내역 로직 분리 (라인 99-143 추출)

#### [NEW] [MulchingFilm/components/InputForm.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/MulchingFilm/components/InputForm.tsx)

**목적**: 입력 폼 로직 분리 (라인 146-206 추출)

#### [NEW] [MulchingFilm/components/HistoryTable.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/MulchingFilm/components/HistoryTable.tsx)

**목적**: 기록 테이블 로직 분리 (라인 218-259 추출)

#### [NEW] [MulchingFilm/constants.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/MulchingFilm/constants.ts)

**목적**: 매직 넘버 및 설정값 중앙 관리

```typescript
export const MULCHING_CONSTANTS = {
  CONTAINER_MAX_WIDTH: 'max-w-[480px]',
  HISTORY_LIMIT: 5,
  INPUT_PLACEHOLDERS: {
    areaPyeong: '100',
    widthCm: '90',
    lengthM: '500',
    pricePerRoll: '25000'
  }
} as const;
```

#### [NEW] [MulchingFilm/types.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/MulchingFilm/types.ts)

**목적**: 타입 정의 중앙 관리

---

### 3. 기존 라이브러리 코드 개선

#### [MODIFY] [mulchingFilm.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/lib/mulchingFilm.ts)

**개선 사항:**

1. **에러 메시지 개선**
   ```typescript
   // Before
   throw new Error('Invalid input: All values must be positive numbers');
   
   // After
   export class MulchingValidationError extends Error {
     constructor(public field: string, message: string) {
       super(message);
       this.name = 'MulchingValidationError';
     }
   }
   
   // 필드별 구체적 에러
   if (fieldAreaPyeong <= 0) {
     throw new MulchingValidationError('fieldAreaPyeong', '밭의 면적은 0보다 커야 합니다');
   }
   ```

2. **입력 검증 함수 개선**
   ```typescript
   export interface ValidationResult {
     isValid: boolean;
     errors: Record<string, string>;
   }
   
   export function validateMulchingInputDetailed(
     input: Partial<MulchingInput>
   ): ValidationResult {
     // 필드별 상세 검증 로직
   }
   ```

---

## 폴더 구조 변경

```
src/pages/tools/
├── MulchingFilm.tsx (메인 컴포넌트, 267줄 → 약 100줄)
└── MulchingFilm/
    ├── components/
    │   ├── ResultDisplay.tsx
    │   ├── DetailSection.tsx
    │   ├── InputForm.tsx
    │   └── HistoryTable.tsx
    ├── constants.ts
    └── types.ts
```

---

## 검증 계획

### 자동 검증

1. **TypeScript 컴파일**
   ```bash
   npm run build
   ```
   - 타입 에러 없음 확인

2. **린트 검사**
   ```bash
   npm run lint
   ```
   - 코드 스타일 준수 확인

### 수동 검증

1. **시각적 회귀 테스트**
   - 리팩터링 전후 스크린샷 비교
   - 모든 픽셀이 동일해야 함

2. **기능 테스트**
   - [ ] 입력 필드에 값 입력 가능
   - [ ] 계산하기 버튼 클릭 시 결과 표시
   - [ ] 결과 카드 애니메이션 동작
   - [ ] 상세 내역 정확히 표시
   - [ ] 최근 기록에 추가됨
   - [ ] 다크모드 전환 시 스타일 유지
   - [ ] 모바일 반응형 레이아웃 동작

3. **접근성 테스트**
   - [ ] 키보드 네비게이션 (Tab 키로 이동)
   - [ ] 스크린 리더 호환성 (ARIA 레이블 읽힘)
   - [ ] 포커스 링 표시

4. **성능 테스트**
   - [ ] React DevTools로 불필요한 리렌더링 없음 확인
   - [ ] 입력 시 지연 없음

---

## 위험 요소 및 완화 전략

| 위험 요소 | 발생 가능성 | 영향도 | 완화 전략 |
|---------|----------|-------|---------|
| 서브 컴포넌트 분리 시 스타일 깨짐 | 낮음 | 높음 | JSX 구조와 클래스명 100% 동일하게 유지, 시각적 회귀 테스트 |
| Props 전달 누락으로 인한 버그 | 중간 | 높음 | TypeScript 타입 체크, 철저한 기능 테스트 |
| 성능 저하 | 낮음 | 중간 | React.memo, useMemo, useCallback 적용 |
| 접근성 속성 누락 | 낮음 | 낮음 | ARIA 속성 체크리스트 작성 |

---

## 타임라인

1. **1단계: 타입 및 상수 정의** (예상 시간: 20분)
   - `types.ts`, `constants.ts` 생성
   - 기존 코드에서 타입 추출

2. **2단계: 서브 컴포넌트 추출** (예상 시간: 40분)
   - `ResultDisplay`, `DetailSection`, `InputForm`, `HistoryTable` 생성
   - Props 인터페이스 정의
   - 기존 JSX 이동 (구조 변경 없음)

3. **3단계: 메인 컴포넌트 리팩터링** (예상 시간: 30분)
   - `MulchingFilm.tsx`에서 서브 컴포넌트 사용
   - 입력 검증 로직 개선
   - 접근성 속성 추가

4. **4단계: 라이브러리 코드 개선** (예상 시간: 20분)
   - `mulchingFilm.ts` 에러 처리 개선
   - 상세 검증 함수 추가

5. **5단계: 검증 및 테스트** (예상 시간: 30분)
   - 빌드 성공 확인
   - 시각적 회귀 테스트
   - 기능 테스트
   - 접근성 테스트

**총 예상 시간: 약 2시간 20분**

---

## 성공 기준

✅ **필수 조건 (모두 충족 필요)**

1. `npm run build` 성공
2. 시각적으로 리팩터링 전과 100% 동일
3. 모든 기능 테스트 통과
4. TypeScript 에러 없음
5. 사용자 플로우 변경 없음

✅ **추가 개선 (선택 사항)**

1. 코드 라인 수 30% 이상 감소
2. 컴포넌트 복잡도 감소 (Cyclomatic Complexity)
3. 접근성 점수 향상
4. 성능 개선 (리렌더링 최소화)

---

## 참고 문서

- [design_spec.md 5.x](file:///c:/AiProject/utility-hub/perplexityGuide/design_spec.md#L379-L451) - 멀칭 비닐 계산기 UX 상세 규칙
- [collaborations_rule.md](file:///c:/AiProject/utility-hub/perplexityGuide/collaborations_rule.md) - 협업 규칙 및 코드 스타일
- [checklist_security.md](file:///c:/AiProject/utility-hub/perplexityGuide/checklist_security.md) - 보안 체크리스트
- [이전 리팩터링 보고서](file:///c:/AiProject/utility-hub/claudeGuide/refactoring_report.md) - 참고용

---

**작성자**: Claude (Refiner & Documentation Team)  
**작성일**: 2026-01-23  
**버전**: v0.2.2 (Safe Refactoring)  
**상태**: 🔍 사용자 검토 대기
