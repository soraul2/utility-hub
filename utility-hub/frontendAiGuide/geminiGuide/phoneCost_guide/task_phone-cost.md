# 작업 목록 - 휴대폰 비용 계산기 (Phone Cost Calculator)

## Phase 1: 설정 및 아키텍처
- [x] 디렉토리 구조 생성 `frontend/src/pages/tools/PhoneCost`
- [x] 설계서(Design Spec)에 기반한 `types.ts` 생성
- [x] `constants.ts` 생성 (초기 상태, 유효성 검사 규칙)
- [x] `useReducer` 스켈레톤을 포함한 `usePhoneCost` 훅 구현

## Phase 2: UI 구현 (스켈레톤)
- [x] `CarrierPlanForm.tsx` 생성 (레이아웃만)
- [x] `MvnoPlanForm.tsx` 생성 (레이아웃만)
- [x] `ComparisonResult.tsx` 생성 (레이아웃만)
- [x] `PhoneCost.tsx` 생성 (위 컴포넌트들을 조립하는 메인 페이지)
- [x] `App.tsx`에 새 라우트 등록

## Phase 3: 로직 및 상태 통합
- [x] `reducer` 로직 구현 (필드 업데이트, 부가서비스 추가/제거 처리)
- [x] `CarrierPlanForm`과 리듀서 연결
- [x] `MvnoPlanForm`과 리듀서 연결
- [x] 동적 필드 관리를 위한 `AddonList` 컴포넌트 구현 (CarrierPlanForm 내장으로 처리)

## Phase 4: 계산 및 유효성 검사
- [x] `calculateCarrierTotal` 로직 구현
- [x] `calculateMvnoTotal` 로직 구현
- [x] `validateInputs` 로직 구현
- [x] UI에 유효성 검사 에러 표시
- [x] `ComparisonResult` 로직 구현 (승자 표시)

## Phase 5: 검증 및 다듬기
- [x] `localStorage` 영구 저장 구현
- [x] 시각적 다듬기 (글래스모피즘, 반응형 확인)
- [x] 수동 테스트 스크립트 또는 유닛 테스트 파일 생성
- [x] `checklist_security_phone-cost.md`에 따른 검증 수행
- [x] `walkthrough_phone-cost.md` 작성
 
## Phase 6: 사용자 피드백 및 고도화 (완료)
- [x] **대시보드 연동**: 메인 화면에 바로가기 카드 추가
- [x] **부가세(VAT) 기능 고도화**:
  - [x] 토글 스위치 UI 적용
  - [x] 통신사/알뜰폰 개별 VAT 설정 기능 분리
  - [x] 계산 로직에 1.1배 적용 반영
- [x] **상세 결과 표시**:
  - [x] 계산식(Formula) 하단 노출
  - [x] 한글 금액 포맷팅 (예: 207만 원)
- [x] **UI/UX 개선**:
  - [x] 부가서비스 삭제 버튼 아이콘화 (`fa-trash-can`)
  - [x] 입력창 다크모드 가시성 수정
  - [x] 타이틀 아이콘 수정 (`fa-coins`)
  - [x] 설명 문구 레이아웃 정리

## Phase 7: 리팩토링 검토 및 동기화 (완료)
- [x] **Claude 팀 리팩토링 산출물 검토**:
  - [x] `walkthrough_refactor_phone-cost.md` 확인
  - [x] 변경된 파일 구조(`utils/`) 및 코드 개선 사항 파악
- [x] **문서 동기화**:
  - [x] `walkthrough_phone-cost.md`에 리팩토링 내용 반영 (파일 구조, 테스트 파일명 등)
