3) collaborations_rule_phone-cost.md – Phone Cost Calculator v0.1
1. 협업 목표
Phone Cost Calculator v0.1에 대해, Safe Refactoring 원칙을 지키면서 코드 품질, 타입 안전성, 접근성, 유지보수성을 향상시키는 것을 목표로 한다.

Gemini 팀, Claude 팀, Perplexity 팀이 각각의 역할에 따라 산출물을 제공하되, 최종 결과물은 하나의 일관된 도구로 동작해야 한다.

2. 공통 원칙
 Safe Refactoring

기존 기능 동작, UI/UX, 계산 결과는 변경하지 않는다.

외부 API(컴포넌트 Props, LocalStorage 구조 등)는 그대로 유지한다.

 투명한 변경 범위

“무엇을 변경했는지 / 무엇을 절대 변경하지 않았는지”를 각 산출물(계획서, Walkthrough, 체크리스트)에 명시한다.

 타입·상수 중심 개발

Magic Numbers, 하드코딩된 에러 메시지를 상수로 추출한다.

Validation 에러 키를 명시적인 타입으로 관리해, 협업 시 오타/누락을 줄인다.

3. 역할 분담
Gemini 팀

초기 Phone Cost Calculator v0.1 구현.

리팩터링 이전의 기준 동작/UI/UX 제공.

Claude 팀

리팩터링 계획 수립(Phase 1~5).

Safe Refactoring 원칙에 맞춘 리팩터링 항목 제안 및 일부 구현.

Perplexity 팀

최종 리팩터링 결과 정리 및 Walkthrough 문서화.

design_spec, checklist_security, collaborations_rule 문서 업데이트.

외부 동작 불변성을 검증하는 관점에서 리뷰 지원.

4. 코드 구조 관련 규칙
상수 관리

constants.ts에서 VALIDATION_RULES, VAT_MULTIPLIER, ERROR_MESSAGES를 정의하고, 모든 계산/검증/에러 처리에서 이를 사용한다.

Magic Numbers(24, 36, 1.1 등)는 코드 내에 직접 쓰지 않는다.

타입 관리

Validation 에러 키는 ValidationErrorKey 유니온 타입으로만 사용한다.

ValidationErrors는 Partial<Record<ValidationErrorKey, string>>를 통일된 형태로 사용한다.

유틸리티 분리

utils/formatters.ts: 포맷팅 로직(숫자/금액)만 담당.

utils/calculators.ts: 계산 로직(통신사, MVNO, VAT)만 담당.

utils/validators.ts: 입력 검증 및 에러 생성만 담당.

hooks/usePhoneCost.ts: 상태 관리, 유틸 호출, UI와의 연결만 담당.

5. 접근성 및 UX 협업 규칙
접근성 개선은 UI/UX 변경을 수반하지 않는 범위에서만 진행한다.

ARIA 속성 추가, 키보드 인터랙션 보강 등은 디자인 스펙과 충돌하지 않는 선에서 자유롭게 제안·반영할 수 있다.

VAT 토글, 부가서비스 입력 필드 등 주요 인터랙션 요소에는 반드시 접근성 속성을 함께 설계·리뷰한다.

6. 검증 및 리뷰 프로세스
빌드 및 타입 체크

변경 후 항상 npm run build를 실행해 타입 에러 여부를 확인한다.

테스트

기존 테스트 케이스(10개 이상)를 리팩터링 전후로 동일 입력/동일 출력이 나오는지 확인한다.

필요 시 순수 함수 단위의 추가 테스트(계산/검증)를 Vitest 등으로 도입하되, 이는 별도 Phase(UX/테스트 강화)로 관리한다.

문서 동기화

리팩터링 또는 기능 변경이 완료되면,

design_spec_phone-cost.md (스펙),

checklist_security_phone-cost.md (안전·회귀 체크),

collaborations_rule_phone-cost.md (협업 규칙 정리),

walkthrough_refactor_phone-cost.md (구현 Walkthrough)
를 동시에 검토해 내용이 서로 모순되지 않도록 한다.

7. 버전 관리
본 문서는 Phone Cost Calculator v0.1 기준 리팩터링 결과를 반영한다.

v0.1에서 기능 추가(예: UX Enhancement, 성능 최적화, 테스트 프레임워크 도입)를 진행할 경우,

버전 넘버를 v0.2 이상으로 올리고,

변경 내역을 각 문서 상단에 “Change Log”로 명시한다.