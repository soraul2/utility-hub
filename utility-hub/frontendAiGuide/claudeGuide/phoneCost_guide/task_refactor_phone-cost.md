# 리팩터링 작업 목록 - Phone Cost Calculator v0.1

## Phase 1: 타입 안전성 & 상수 정리
- [x] `constants.ts` 확장
  - [x] `VALIDATION_RULES` 상수 추가
  - [x] `VAT_MULTIPLIER` 상수 추가
  - [x] `ERROR_MESSAGES` 상수 추가
- [x] `types.ts` 타입 강화
  - [x] `ValidationErrorKey` 타입 정의
  - [x] `ValidationErrors` 타입 개선

## Phase 2: 유틸리티 함수 분리
- [x] `utils/` 디렉토리 생성
- [x] `utils/formatters.ts` 생성
  - [x] `formatToKoreanWon` 함수 이동
  - [x] `formatNumber` 함수 추가
  - [x] JSDoc 주석 작성
- [x] `utils/calculators.ts` 생성
  - [x] `applyVat` 함수 추출
  - [x] `calculateCarrierTotal` 함수 이동
  - [x] `calculateMvnoTotal` 함수 이동
  - [x] JSDoc 주석 작성
- [x] `utils/validators.ts` 생성
  - [x] `validateInputs` 함수 이동
  - [x] 헬퍼 함수 추가
  - [x] JSDoc 주석 작성

## Phase 3: 기존 코드 리팩터링
- [x] `hooks/usePhoneCost.ts` 수정
  - [x] 유틸리티 함수 import
  - [x] 상수 import
  - [x] 중복 코드 제거
  - [x] 주석 개선 (Why 중심)
- [x] `components/ComparisonResult.tsx` 수정
  - [x] `formatToKoreanWon` import로 변경
  - [x] 중복 함수 제거

## Phase 4: 접근성 개선
- [x] `components/CarrierPlanForm.tsx` 수정
  - [x] VAT 토글에 ARIA 속성 추가 (role, aria-checked, aria-label)
  - [x] 키보드 지원 추가 (Enter, Space)
  - [x] 부가서비스 입력 필드 aria-label 추가
  - [x] 에러 메시지 aria-describedby 연결
  - [x] role="alert" 추가
- [x] `components/MvnoPlanForm.tsx` 수정
  - [x] VAT 토글에 ARIA 속성 추가

## Phase 5: 검증 및 문서화
- [x] 빌드 테스트 (`npm run build`)
- [x] 테스트 파일 import 경로 수정
- [x] `walkthrough_refactor_phone-cost.md` 작성
- [x] `task_refactor_phone-cost.md` 업데이트

## 완료 ✅
모든 리팩터링 작업이 성공적으로 완료되었습니다!
