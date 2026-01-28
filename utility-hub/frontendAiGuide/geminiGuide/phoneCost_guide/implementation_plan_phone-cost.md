# 구현 계획서 - 휴대폰 비용 계산기 (Phone Cost Calculator)

## 1. 목표 설명
통신사 약정 플랜(Contract)과 자급제+알뜰폰 플랜(MVNO)의 24개월 총 비용을 비교하는 프론트엔드 전용 "휴대폰 비용 계산기"를 구현합니다.
이 도구는 사용자가 직관적인 비용 비교를 통해 합리적인 결정을 내릴 수 있도록 돕는 것을 목표로 합니다.
`perplexityGuide/phoneCost_guide/design_spec_phone-cost.md`에 명시된 설계 사양을 엄격히 준수합니다.

## 2. 사용자 검토 필요 사항
> [!NOTE]
> **상태 관리 전략**: 제안드린 대로, 통신사 플랜의 복잡한 상태(특히 동적인 부가서비스 리스트)를 효과적으로 관리하기 위해 `useReducer`를 사용할 것입니다.
> **유효성 검사 UX**: "계산" 버튼 클릭 시 검증 요구사항에 더해, 더 즉각적인 피드백을 제공하기 위해 **`onBlur` 시점의 유효성 검사**도 함께 구현하겠습니다.

## 3. 변경 제안

### 컴포넌트 구조
`frontend/src/pages/tools/PhoneCost/` 디렉토리를 생성하고 다음과 같이 구성합니다:

- `PhoneCost.tsx` (메인 페이지 컴포넌트)
- `components/`
    - `CarrierPlanForm.tsx` (좌측 카드: 통신사 입력 폼)
    - `MvnoPlanForm.tsx` (우측 카드: 알뜰폰 입력 폼)
    - `AddonList.tsx` (통신사 부가서비스 관리를 위한 서브 컴포넌트)
    - `ComparisonResult.tsx` (하단 카드: 결과 표시)
- `hooks/`
    - `usePhoneCost.ts` (메인 로직 훅: `useReducer` 및 계산 함수 포함)
- `types.ts` (설계서 기반 타입 정의)
- `constants.ts` (초기값, 유효성 검사 제한값 등)

### 상태 관리 (`usePhoneCost.ts`)
다음과 같은 액션을 처리하는 리듀서를 정의합니다:
- `SET_CARRIER_FIELD`: 단순 필드 업데이트 (개월 수, 요금 등)
- `ADD_ADDON`: 새 빈 부가서비스 추가
- `REMOVE_ADDON`: 인덱스로 부가서비스 제거
- `UPDATE_ADDON`: 특정 부가서비스 필드 업데이트
- `SET_MVNO_FIELD`: 알뜰폰 필드 업데이트
- `CALCULATE`: 계산 및 유효성 검사 트리거

### UI/UX 디자인
- **테마**: 기존 `Glass` 디자인 시스템(글래스모피즘)과 일관성 유지.
- **반응형**: 데스크탑에서는 2열 레이아웃, 모바일에서는 1열 레이아웃.
- **시각효과**: 더 저렴한 옵션은 녹색, 비싼 옵션은 회색/붉은색으로 강조.

### [Frontend] `frontend/src/pages/tools/PhoneCost/`
#### [NEW] [PhoneCost.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/PhoneCost.tsx)
- 메인 컨테이너, 레이아웃 정의.
- `CarrierPlanForm`, `MvnoPlanForm`, `ComparisonResult` 통합.

#### [NEW] [usePhoneCost.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/hooks/usePhoneCost.ts)
- `useReducer` 구현.
- `calculateCarrierTotal`, `calculateMvnoTotal` 함수.
- `validateInputs` 함수.

#### [NEW] [types.ts](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/pages/tools/PhoneCost/types.ts)
- 인터페이스: `CarrierPlanInput`, `MvnoPlanInput`, `CarrierAddon`, `PlanComparisonResult`.

#### [NEW] [components/*.tsx]
- 위에서 설명한 모듈식 UI 컴포넌트들.

### [Routing] `frontend/src/App.tsx`
#### [MODIFY] [App.tsx](file:///c:/AiProject/utility-hub/utility-hub/frontend/src/App.tsx)
- 라우트 추가: `/tools/phone-cost`.

## 4. 검증 계획

### 자동화 테스트
- `npm run dev`를 실행하여 UI 렌더링 확인.
- 보안 체크리스트에 요청된 10가지 테스트 케이스에 대해 계산 로직을 검증하는 간단한 유닛 테스트 파일 `PhoneCost.test.ts`를 추가합니다 (Vitest 사용 또는 간단한 스크립트).

### 수동 검증
1. **레이아웃 확인**: PC에서 2열, 모바일에서 1열 레이아웃 확인.
2. **계산 확인**:
    - 표준 통신사 데이터 입력 -> 총액 확인.
    - 표준 알뜰폰 데이터 입력 -> 총액 확인.
    - 부가서비스 3개 추가 -> 합산 정확성 확인.
3. **유효성 검사 확인**:
    - 음수 입력 -> 에러 메시지 확인.
    - 고가 요금제 기간 + 저가 요금제 기간 != 24 -> 유효성 에러 확인 (24개월 모드일 경우).
4. **복원력**: 페이지 새로고침 -> localStorage 복원 확인 (구현 시).
