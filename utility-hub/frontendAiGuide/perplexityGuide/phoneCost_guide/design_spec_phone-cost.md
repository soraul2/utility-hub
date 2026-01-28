1) design_spec_phone-cost.md
휴대폰 24개월 총 비용 비교 계산기 v0.1
1. 개요
도구 이름: 휴대폰 24개월 총 비용 비교 계산기 (Phone Cost Calculator) v0.1

목적: 통신사(고가/저가 요금제 + 단말기)와 알뜰폰(MVNO) 조합의 24개월 총 비용을 비교해, 사용자가 더 유리한 선택을 할 수 있도록 돕는 도구.

대상 사용자: 휴대폰 요금제를 변경하거나 기기 변경을 고려하는 일반 사용자, 통신 요금 상담/컨설팅을 수행하는 실무자.

주요 특징:

24개월 기준 통신사 vs 알뜰폰 총 비용 비교.

부가서비스(부가 요금) 추가 지원.

부가세(VAT 10%) 포함/미포함 토글.

입력값 검증 및 에러 메시지 제공.

결과를 한국어 금액 형식으로 보기 쉽게 표시.

2. 주요 기능 요구사항
2.1 입력 영역 – 통신사(캐리어) 플랜
입력 필드

고가 요금제 유지 개월 수 (highPlanMonths, number)

고가 요금제 월 요금 (highPlanMonthly, number)

저가 요금제 유지 개월 수 (lowPlanMonths, number)

저가 요금제 월 요금 (lowPlanMonthly, number)

단말기 총 할부 원금 (deviceCostTotal, number)

부가서비스 목록:

각 부가서비스의 월 요금 (addon_{index}_fee, number)

각 부가서비스의 유지 개월 수 (addon_{index}_months, number)

VAT 토글

“부가세 10%” 토글 UI 제공.

토글 상태에 따라, 통신사 플랜 전체 금액에 VAT 10%를 포함/제외해서 계산.

검증 규칙

고가 + 저가 요금제 개월 수 합은 24개월이어야 함. (VALIDATION_RULES.CONTRACT_MONTHS = 24)

개월 수는 1 이상이어야 함. (VALIDATION_RULES.MIN_MONTHS = 1)

금액(요금/단말기/부가서비스)은 0 이상이어야 함. (VALIDATION_RULES.MIN_VALUE = 0)

부가서비스 개월 수는 최대 36개월까지 허용. (VALIDATION_RULES.MAX_ADDON_MONTHS = 36)

2.2 입력 영역 – 알뜰폰(MVNO) 플랜
입력 필드

알뜰폰 단말기 총 원금 (mvnoDeviceCost, number)

알뜰폰 월 요금 (mvnoMonthly, number)

알뜰폰 유지 개월 수 (mvnoMonths, number)

VAT 토글

“부가세 10%” 토글 UI 제공.

토글 상태에 따라, 알뜰폰 플랜 전체 금액에 VAT 10%를 포함/제외해서 계산.

검증 규칙

개월 수는 1 이상.

금액은 0 이상.

2.3 계산 로직
공통

VAT 배율: VAT_MULTIPLIER = 1.1 (VAT 포함 시), 1.0 (VAT 미포함 시).

계산은 모두 숫자 단위(원)로 수행 후, 화면에 표시할 때 포맷팅.

통신사 플랜 총액 (calculateCarrierTotal)

고가 요금제 구간 요금: highPlanMonths * highPlanMonthly

저가 요금제 구간 요금: lowPlanMonths * lowPlanMonthly

단말기 비용: deviceCostTotal

부가서비스 비용: 각 부가서비스에 대해 addon_fee * addon_months를 모두 합산.

통신사 총액(부가세 제외): 위 항목의 합.

부가세 반영: applyVat(total, vatIncluded) 사용.

알뜰폰 플랜 총액 (calculateMvnoTotal)

통신요금: mvnoMonthly * mvnoMonths

단말기 비용: mvnoDeviceCost

합산 후 applyVat(total, vatIncluded) 적용.

결과 포맷팅

숫자(원 단위)를 천 단위 콤마 포맷: formatNumber(value: number): string.

큰 금액을 한국어 금액 형식으로 표현: formatToKoreanWon(value: number): string

예: 12071200 → "1,207만 1,200원".

2.4 결과 표시
통신사 vs 알뜰폰 24개월 총 비용 비교.

어느 쪽이 더 저렴한지, 그리고 차액이 얼마인지 명시.

예시:

“통신사가 24개월 동안 32만 원 더 비쌉니다.”

“알뜰폰이 24개월 동안 18만 원 절감됩니다.”

결과 화면은 포맷팅 유틸리티를 사용해 일관된 숫자/금액 표현 유지.

3. 검증/에러 처리 요구사항
공통 에러 메시지는 ERROR_MESSAGES 상수에서 관리:

NEGATIVE_VALUE: 0 이상의 값을 입력해주세요.

CONTRACT_PERIOD_MISMATCH: 총 약정 기간(고가+저가)은 24개월이어야 합니다.

ADDON_MONTHS_EXCEEDED: 최대 36개월까지만 가능합니다.

MIN_MONTHS_REQUIRED: 1 이상의 값을 입력해주세요.

ADDON_FEE_NEGATIVE: 0 이상 입력

ADDON_MONTHS_NEGATIVE: 0 이상 입력

Validation 에러 구조

키 타입: ValidationErrorKey (명시적 문자열 리터럴 유니온 + addon_${number}_... 패턴).

에러 맵 타입: ValidationErrors = Partial<Record<ValidationErrorKey, string>>.

검증 로직

validateInputs(carrier: CarrierPlanInput, mvno: MvnoPlanInput): ValidationErrors

개별 필드 검증 헬퍼:

validatePositiveNumber(value: number, fieldName: string): string | null

validateContractPeriod(high: number, low: number): string | null

4. UI/UX 및 접근성 요구사항
공통 UI

기존 v0.1에서 검증된 레이아웃, 컴포넌트 구조, 레이블 텍스트를 유지 (Safe Refactoring).

VAT 토글 접근성

컨테이너 요소에 role="switch", aria-checked={vatIncluded}, aria-label="부가세 10% 포함 여부", tabIndex={0} 적용.

onKeyDown 핸들러에서 Enter 또는 Space 입력 시 토글 작동.

에러 메시지와 입력 필드 연결

입력 필드에 aria-invalid, aria-describedby 설정.

에러 메시지 요소에 id와 role="alert" 부여.

부가서비스 필드의 aria-label에 인덱스를 반영(예: 부가서비스 1 월 요금).

키보드 네비게이션

모든 상호작용 요소는 키보드(Tab/Shift+Tab, Enter/Space)만으로 접근·조작 가능해야 함.

5. 비기능 요구사항
타입 안전성

TypeScript로 구현하며, npm run build 시 타입 에러 0개를 목표로 한다.

접근성

WCAG 2.1 AA 수준을 목표로 하고, 스크린 리더·키보드 사용자에 대한 배려를 포함한다.

유지보수성

상수, 계산 로직, 검증 로직, 포맷팅 로직을 별도의 모듈로 분리하여 재사용성과 테스트 용이성을 확보한다.