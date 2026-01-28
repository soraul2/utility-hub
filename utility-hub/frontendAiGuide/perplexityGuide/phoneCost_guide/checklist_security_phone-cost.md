2) checklist_security_phone-cost.md – Phone Cost Calculator v0.1
목적
Phone Cost Calculator v0.1 기능이 보안·안전·회귀 방지 관점에서 안전하게 동작하는지 확인하기 위한 체크리스트다. 아래 항목은 v0.1 리팩터링 후 최종 상태를 기준으로 한다.

1. 입력 검증 및 에러 처리
 모든 숫자 입력 필드는 최소값(0 또는 1) 검증을 수행한다.

 고가/저가 요금제 개월 수 합이 24개월이 아닌 경우, 명확한 에러 메시지를 보여준다.

 부가서비스 개월 수가 36개월을 초과하는 경우, 에러 메시지를 보여주고 계산을 막는다.

 음수 값 입력 시 0 이상의 값을 입력해주세요. 등의 안내 문구로 사용자에게 피드백한다.

 Validation 에러는 ValidationErrors 타입(명시적 키 + Partial<Record>)으로 관리되어, 오타나 누락을 컴파일 타임에 최대한 방지한다.

2. 계산 로직 안전성
 계산 로직(calculateCarrierTotal, calculateMvnoTotal, applyVat)은 순수 함수로 구현되어, 동일 입력에 대해 항상 동일 결과를 반환한다.

 VAT 적용 여부에 따른 금액 차이가 수학적으로 일관되게 유지된다 (VAT_MULTIPLIER = 1.1).

 리팩터링 전후 동일 입력에 대해 총 비용 결과가 동일함을 10개 이상의 테스트 케이스로 검증했다.

 NaN, Infinity 등의 값이 UI로 그대로 노출되지 않도록, 입력 검증과 타입을 통해 방지한다.

3. LocalStorage 및 데이터 보존
 기존 LocalStorage 키/구조를 변경하지 않아, 리팩터링 전 저장된 데이터가 정상적으로 로드된다.

 새로운 입력을 저장/복원하는 동작이 리팩터링 전과 동일하게 동작함을 수동 검증했다.

 민감 정보(비밀번호, 개인정보 등)는 저장하지 않으며, 오직 요금·개월 수와 같은 비식별 데이터만 저장한다.

4. UI/UX 회귀 방지
 리팩터링 과정에서 컴포넌트 Props API를 변경하지 않았다.

 기존에 사용자와 합의된 UI/UX(레이블, 버튼 위치, 흐름)를 변경하지 않았다.

 부가서비스 추가/삭제, VAT 토글, 입력 필드 포커스 이동 등 주요 상호작용이 리팩터링 전과 동일하게 동작함을 수동 테스트로 확인했다.

5. 접근성 및 알림
 VAT 토글에 role="switch", aria-checked, aria-label, 키보드 지원(Enter/Space)이 적용되어 있다.

 에러가 발생한 필드에는 aria-invalid, aria-describedby가 연결되어 있고, 스크린 리더에서 에러를 바로 인지할 수 있다.

 에러 메시지 요소에 role="alert"를 사용해, 상태 변화를 사용자에게 즉시 전달한다.

 모든 상호작용 요소는 키보드만으로 접근 및 조작이 가능하다.

6. 빌드 및 타입 안전성
 npm run build 실행 시 TypeScript 에러가 0개임을 확인했다.

 새로운 타입(ValidationErrorKey, ValidationErrors)과 상수(VALIDATION_RULES, ERROR_MESSAGES, VAT_MULTIPLIER)가 전체 코드베이스에서 일관되게 사용된다.

7. Safe Refactoring 원칙 준수
 기능 동작, UI/UX, 계산 결과는 리팩터링 전과 수학적으로 완전히 동일하다.

 Breaking Changes(Props API 변경, LocalStorage 구조 변경 등)를 도입하지 않았다.

 refactor 범위는 내부 구조(상수/유틸/타입/접근성) 개선에 한정했다.