Phone Cost Calculator 통합 아키텍처 명세서
휴대폰 24개월 총 비용 비교 계산기 v0.1

1. 개요
도구 이름: 휴대폰 24개월 총 비용 비교 계산기 (Phone Cost Calculator) v0.1
​

목적: 통신사(고가/저가 요금제 + 단말기 + 부가서비스)와 알뜰폰(MVNO) 조합의 24개월 총 비용을 비교하여, 어떤 선택이 더 비용 효율적인지 사용자에게 직관적으로 제공한다.
​

특이 사항:

Safe Refactoring 완료 버전 (외부 동작·UI·계산 결과는 v0.1과 동일).

내부 구조는 타입·상수·유틸·접근성 기준으로 재설계됨.
​

2. 전체 구조 개요
2.1 레이어 구조
Presentation Layer (React 컴포넌트)

CarrierPlanForm.tsx

MvnoPlanForm.tsx

ComparisonResult.tsx

상위 페이지 컴포넌트(Phone Cost Calculator 화면).
​

State & Orchestration Layer

hooks/usePhoneCost.ts

입력 상태 관리, 유효성 검증 호출, 계산 함수 호출, 결과/에러 상태를 UI에 전달.
​

Domain Logic Layer (순수 유틸)

utils/calculators.ts (계산 로직)

utils/validators.ts (검증 로직)

utils/formatters.ts (표시용 포맷팅)
​

Shared Definitions Layer

constants.ts (상수, 검증 규칙, 에러 메시지)

types.ts (입력 타입, Validation 에러 타입 등)
​

Persistence Layer (프론트 기준)

LocalStorage를 통한 입력 상태 저장/복원 (키/구조는 v0.1과 동일, 하위 호환 보장).
​

3. 모듈별 역할과 의존 관계
3.1 constants.ts
역할

Magic Number, 에러 메시지, 검증 규칙을 중앙에서 관리하는 상수 모듈.
​

주요 상수

VALIDATION_RULES

CONTRACT_MONTHS = 24 (고가+저가 합)

MAX_ADDON_MONTHS = 36

MIN_VALUE = 0

MIN_MONTHS = 1
​

VAT_MULTIPLIER = 1.1 (부가세 10%)
​

ERROR_MESSAGES

NEGATIVE_VALUE: 0 이상의 값을 입력해주세요.

CONTRACT_PERIOD_MISMATCH: 총 약정 기간(고가+저가)은 24개월이어야 합니다.

ADDON_MONTHS_EXCEEDED: 최대 36개월까지만 가능합니다.

MIN_MONTHS_REQUIRED: 1 이상의 값을 입력해주세요.

ADDON_FEE_NEGATIVE: 0 이상 입력

ADDON_MONTHS_NEGATIVE: 0 이상 입력
​

의존 관계

참조됨: utils/validators.ts, utils/calculators.ts(VAT), hooks/usePhoneCost.ts 등.
​

3.2 types.ts
역할

도메인 입력·출력, 검증 에러 키를 타입 수준에서 정의해 타입 안전성을 확보.
​

주요 타입

요금제 입력 타입

CarrierPlanInput

MvnoPlanInput (필드: mvnoDeviceCost, mvnoMonthly, mvnoMonths 등)
​

Validation 에러 타입

ValidationErrorKey

'highPlanMonths' | 'highPlanMonthly' | 'lowPlanMonths' | 'lowPlanMonthly' | 'deviceCostTotal' | 'mvnoDeviceCost' | 'mvnoMonthly' | 'mvnoMonths' | \addon_${number}fee` | `addon${number}_months`` 
​

ValidationErrors = Partial<Record<ValidationErrorKey, string>>
​

의존 관계

참조됨: utils/validators.ts, hooks/usePhoneCost.ts, 폼 컴포넌트(에러 맵 사용).
​

3.3 utils/formatters.ts
역할

계산 결과 및 숫자 값을 UI에서 재사용 가능한 방식으로 포맷팅.
​

주요 함수

formatToKoreanWon(value: number): string

큰 금액을 한국어 금액 형식으로 포맷 (예: 12071200 → "1,207만 1,200원").
​

formatNumber(value: number): string

천 단위 구분 기호가 포함된 숫자 문자열 반환 (예: 1234567 → "1,234,567").
​

의존 관계

참조됨: ComparisonResult.tsx, 필요 시 훅 또는 다른 컴포넌트.

내부에서 비즈니스 로직은 가지지 않으며, 오직 표시용 책임만 가진다.
​

3.4 utils/calculators.ts
역할

VAT 적용, 통신사/알뜰폰 총 비용 계산을 담당하는 순수 함수 집합.
​

주요 함수

applyVat(amount: number, vatIncluded: boolean): number

vatIncluded === true → amount * VAT_MULTIPLIER

vatIncluded === false → amount
​

calculateCarrierTotal(input: CarrierPlanInput, vatIncluded: boolean): { total: number; formula: string }

고가/저가 요금제 + 단말기 + 부가서비스를 모두 합산한 뒤 VAT 적용.

formula는 사용자가 이해할 수 있는 문자열 표현(예: “고가 12개월 × 8만 + 저가 12개월 × 5만 + 단말기 60만 + 부가 3만 × 24개월 …”).
​

calculateMvnoTotal(input: MvnoPlanInput, vatIncluded: boolean): { total: number; formula: string }

알뜰폰 월 요금 × 개월 수 + 단말기 원금을 합산 후 VAT 적용.
​

의존 관계

참조됨: hooks/usePhoneCost.ts (계산 트리거 시 사용).

constants.ts의 VAT 관련 상수에 의존.
​

3.5 utils/validators.ts
역할

입력값 검증 및 ValidationErrors 맵 생성.

공통 헬퍼를 통해 재사용성 확보.
​

주요 함수

validateInputs(carrier: CarrierPlanInput, mvno: MvnoPlanInput): ValidationErrors

개별 필드 단위 양수·최소값 검증.

고가+저가 개월 수 24개월 검증.

부가서비스 개월 수 상한(36개월) 검증.
​

헬퍼

validatePositiveNumber(value: number, fieldName: string): string | null

validateContractPeriod(high: number, low: number): string | null 
​

의존 관계

참조됨: hooks/usePhoneCost.ts (폼 제출 또는 변경 시 검증).

constants.ts (VALIDATION_RULES, ERROR_MESSAGES)와 types.ts (ValidationErrors)에 의존.
​

3.6 hooks/usePhoneCost.ts
역할

단일 책임: 상태 관리와 도메인 유틸 호출.

폼 입력 상태, 에러 상태, 결과 상태, VAT 토글 상태 등을 관리하고, UI와 도메인 로직을 중개.
​

주요 책임

CarrierPlanInput, MvnoPlanInput 상태 관리.

부가서비스(addon) 리스트의 추가/삭제/수정.

VAT 포함 여부 토글 상태 (vatIncludedCarrier, vatIncludedMvno 등).

validateInputs 호출 → 에러가 없으면 calculateCarrierTotal, calculateMvnoTotal 호출.

계산 결과를 ComparisonResult 컴포넌트에 전달.

LocalStorage 저장/복원 로직 유지 (키/형식 v0.1과 동일).
​

의존 관계

의존: utils/calculators.ts, utils/validators.ts, constants.ts, types.ts, LocalStorage API.

참조됨: 페이지 컴포넌트(Phone Cost Calculator 화면 루트).
​

3.7 Presentational Components
3.7.1 CarrierPlanForm.tsx
역할

통신사(고가/저가 요금제, 단말기, 부가서비스) 입력 UI 담당.
​

특징

모든 입력 필드는 훅에서 내려주는 값과 onChange 핸들러를 사용.

VAT 토글 요소에 role="switch", aria-checked, aria-label, tabIndex={0}, onKeyDown(Enter/Space) 적용.

에러 메시지 존재 시, aria-invalid, aria-describedby를 통해 입력과 에러를 연결, 에러 <p>는 role="alert"를 사용.

부가서비스 입력 필드는 인덱스 기반 aria-label을 사용해 스크린 리더가 맥락을 이해 가능.
​

3.7.2 MvnoPlanForm.tsx
역할

알뜰폰 요금/단말기/개월 수 + VAT 토글 입력 UI 담당.
​

특징

VAT 토글에 Carrier와 동일한 접근성 패턴 적용.

검증 에러를 ValidationErrors에서 읽어와 시각적/스크린 리더 피드백 제공.
​

3.7.3 ComparisonResult.tsx
역할

통신사 vs 알뜰폰 총 비용 및 차액, 추천 방향을 시각적으로 표시.
​

특징

formatToKoreanWon, formatNumber를 사용해 일관된 숫자/금액 표기.

“어느 쪽이 더 비싼지/저렴한지”를 간단한 문장과 함께 표시.
​

4. 데이터 흐름 및 시퀀스
4.1 기본 시나리오
초기 로드

usePhoneCost가 LocalStorage에서 기존 입력값을 로드(있다면)하여 초기 상태 설정.
​

사용자 입력

사용자가 Carrier/Mvno 폼에 값을 입력하거나 수정.

onChange 핸들러가 훅의 상태를 업데이트.
​

검증

계산 버튼 클릭 또는 특정 트리거에서 validateInputs 실행.

에러가 있을 경우 ValidationErrors에 기록, 폼 컴포넌트에서 에러를 렌더링.
​

계산

에러가 없으면 calculateCarrierTotal, calculateMvnoTotal 호출.

VAT 토글 상태에 따라 applyVat 내부에서 VAT 포함 여부 결정.
​

결과 표시

훅이 계산 결과를 상태로 보관.

ComparisonResult에서 결과를 받아 포맷팅 후 화면에 표시.
​

저장

입력 상태는 적절한 시점에 LocalStorage에 저장, 재방문 시 복원.
​

5. 비기능 아키텍처 요구사항 정리
5.1 Safe Refactoring 기준
컴포넌트 Props API, LocalStorage 키/구조, 계산 공식은 리팩터링 전과 호환 유지.

외부에서 보는 UI/UX 및 결과는 동일해야 하며, 변경은 내부 구조(상수, 타입, 유틸, 접근성)에 한정.
​

5.2 타입/테스트/빌드
TypeScript 타입 에러 0 상태에서 npm run build 성공.

리팩터링 전후 10개 이상 테스트 케이스에서 결과 값이 동일함을 수동·테스트 코드로 검증.
​

5.3 접근성
WCAG 2.1 AA 수준을 목표로,

키보드만으로 모든 기능 사용 가능,

스크린 리더가 VAT 토글 상태·에러 상태를 즉시 인식 가능.
​

6. 문서·협업 기준과 Single Source of Truth
스펙 문서: design_spec_phone-cost.md

보안/안전 체크리스트: checklist_security_phone-cost.md

협업 규칙: collaborations_rule_phone-cost.md

리팩터링 Walkthrough: walkthrough_refactor_phone-cost.md
​

이 네 문서와 본 통합 아키텍처 명세서가 Phone Cost Calculator v0.1 프론트엔드 도메인의 Single Source of Truth이다.
향후 기능 추가나 버전 업(v0.2 이상)을 할 경우, 먼저 이 문서들을 갱신한 뒤 구현·리팩터링을 진행한다.