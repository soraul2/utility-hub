Mulching Film Calculator Full Spec – Utility Hub v0.2
0. Overview
도메인 이름: 농업용 멀칭 비닐 계산기 (Mulching Film Calculator)

목표

밭 면적과 비닐 규격, 롤당 가격을 입력하면 필요 롤 수와 총 비용을 계산하고, 상세 계산 과정과 최근 기록을 제공한다.
​

Utility Hub v0.2의 Glassmorphism UI, 라이트/다크 모드, 공통 레이아웃 규칙을 그대로 따른다.
​

버전: mulching-film-frontend v0.2.2

v0.2: 기본 기능/UX 구현

v0.2.2: 구조 유지 + 컴포넌트 분리 + ARIA/타입/상수 정리(안전 리팩터링).
​

라우트: /tools/mulching-film

1. 아키텍처 & 폴더 구조
1.1 라우팅
/tools/mulching-film

MainLayout 하위 도구 페이지로 동작, 브라우저 뒤로가기 없이 한 화면에서 입력·결과·기록을 모두 처리.
​

1.2 관련 파일 (예시)
src/pages/tools/MulchingFilm.tsx

메인 컨테이너, 페이지 구조 및 도메인 컴포넌트 조합 담당.
​

src/lib/mulchingFilm.ts

순수 계산 로직 및 타입 정의.
​

src/hooks/useMulchingHistory.ts

최근 계산 기록 관리 훅 (localStorage 연동).
​

v0.2.2 리팩터링 이후 서브 컴포넌트 예시:
​

ResultDisplay – 상단 결과 요약 카드

DetailSection – 계산 상세 내역 카드

InputForm – 입력 폼 + 검증

HistoryTable – 최근 계산 기록 리스트

공통 UI

GlassCard, GlassButton, GlassInput, Alert 등.
​

2. 데이터 모델 & 계산 로직
2.1 입력/출력 데이터 모델
ts
interface MulchingFilmInput {
  fieldAreaPyeong: number;    // 발의 면적(평)
  mulchWidthCm: number;       // 비닐 폭(cm)
  mulchLengthM: number;       // 비닐 길이(m)
  pricePerRollWon: number;    // 롤당 가격(원)
}

interface MulchingFilmResult {
  requiredRolls: number;         // 원값 (계산 전 원시 롤 수)
  requiredRollsRounded: number;  // 소수 둘째 자리 반올림 롤 수
  estimatedCostWon: number;      // 예상 금액(원)
  fieldAreaM2: number;           // 밭 전체 면적(㎡)
  areaPerRollM2: number;         // 한 롤당 멀칭 면적(㎡)
  createdAt: string;             // ISO 문자열 (기록용 타임스탬프)
}
2.2 상수 및 계산식
상수

ts
const PYEONG_TO_M2 = 3.305785; // 평 → ㎡ 변환, 정밀 값 사용
계산 로직
​

ts
const fieldAreaM2      = fieldAreaPyeong * PYEONG_TO_M2;
const mulchWidthM      = mulchWidthCm / 100;
const areaPerRollM2    = mulchWidthM * mulchLengthM;
const requiredRolls    = fieldAreaM2 / areaPerRollM2;
const requiredRollsRounded = Math.round(requiredRolls * 100) / 100;
const estimatedCostWon = requiredRollsRounded * pricePerRollWon;
requiredRollsRounded 기준으로 비용 계산 (소수 둘째 자리 반올림 후 곱셈).
​

3. UI / UX 스펙
3.1 페이지 구조 원칙
멀칭 비닐 계산기는 단일 페이지에서 다음 요소를 모두 제공한다:
​

상단 결과 요약 (필요 수량, 예상 금액)

계산 상세 내역 (면적, 롤당 면적, 계산식)

입력 폼

최근 계산 기록

결과 확인을 위해 별도 페이지나 모달로 이동하지 않는다.

브라우저 뒤로가기 없이 **“입력 수정 → 재계산”**을 자연스럽게 반복할 수 있어야 한다.
​

3.2 상단 결과 영역 (ResultDisplay)
GlassCard 상단에 크게 표시:
​

“필요 수량: X.XX 롤”

“예상 금액: NN,NNN 원”

스타일

필요 수량/금액은 대형 숫자(text-3xl 이상) + 강조 색상.

라이트/다크 모드 모두에서 가독성 확보.

3.3 계산 상세 영역 (DetailSection)
결과 바로 아래 GlassCard에 다음 정보 표시:
​

밭 전체 면적: 평 → ㎡ 변환 값 (fieldAreaM2)

한 롤당 멀칭 가능 면적: areaPerRollM2 = mulchWidthM * mulchLengthM

최종 계산식 예:

330.58 ÷ 90.00 = 3.67 롤

사용자는 항상 최신 계산 기준 상세 내역을 한눈에 확인할 수 있어야 한다.

3.4 입력 폼 영역 (InputForm)
위치: 결과/상세 카드 아래.

입력 필드 (GlassInput 4개)
​

발의 면적(평) – suffix: “평”

비닐 폭(cm) – suffix: “cm”

비닐 길이(m) – suffix: “m”

롤당 가격(원) – suffix: “원”

버튼

“계산하기” 버튼:

클릭 시에만 계산 수행.

입력 검증 실패 시 결과 영역 업데이트하지 않음.
​

입력값 유지

계산 후에도 입력값은 폼에 그대로 유지되어, 일부만 수정 후 재계산 가능.

3.5 최근 계산 기록 영역 (HistoryTable)
위치: 페이지 하단 또는 데스크톱에서 우측 영역.

구성
​

“최근 계산 기록” GlassCard

최대 5건의 기록:

각 항목에: 면적(평/㎡), 비닐 규격(폭×길이), 수량(롤), 금액(원)

동작

새 계산 시 맨 위에 추가.

6건째부터는 가장 오래된 항목 제거(최대 5건 유지).

기록 초기화(전체 삭제) 버튼:

클릭 시 간단한 안내 또는 확인 후 삭제.
​

4. 입력 검증 & 에러 처리
4.1 Validation 규칙 (도메인별)
멀칭 입력 필드

fieldAreaPyeong > 0

mulchWidthCm > 0

mulchLengthM > 0

pricePerRollWon ≥ 0

잘못된 입력(0 이하, NaN, 비어 있음 등):

해당 GlassInput 아래에 에러 메시지 표시.

결과/상세/기록 영역은 갱신하지 않는다.

4.2 에러 메시지 UX
각 필드 아래

text-xs text-red-500 mt-1 형태의 한국어 짧은 메시지.
​

Input 테두리: border-red-500.

공통 규칙

에러 메시지는 도메인에 맞게 명확하게 작성 (예: “발의 면적은 0보다 큰 값을 입력해 주세요.”).

에러가 있는 상태에서는 “계산하기” 버튼을 눌러도 결과가 갱신되지 않음.
​

5. 라이트/다크 모드 & 접근성
5.1 테마
ThemeContext에 의해 theme = "light" | "dark" 전역 관리.
​

GlassCard 배경

라이트: bg-white/60

다크: bg-slate-900/40

입력 필드

다크 모드에서 dark:bg-slate-900/60, dark:text-white로 가독성 확보.
​

5.2 접근성 & ARIA (v0.2.2 리팩터링)
입력 필드에 다음 ARIA 속성 적용:
​

aria-label

aria-required

aria-invalid

aria-describedby (에러 텍스트와 연결)

금액 표시는:

내부 계산식은 그대로 유지.

UI 레이어에서 한국어 단위 포맷터(예: formatWonSimple)로 “만/억” 단위 가독성을 향상시킬 수 있음.
​

6. 저장소 & 프라이버시
6.1 로컬스토리지
저장 대상 (비민감 정보만)
​

최근 5건 계산 기록 (MulchingFilmResult 배열)

동작

새 계산 → 새 결과를 기록 배열 앞에 추가.

6번째부터는 뒤에서 제거하여 최대 5건 유지.

초기화 시 localStorage 항목 제거 + UI 갱신.

파싱 실패/형식 오류 시:

안전한 기본값(빈 배열)로 되돌린다.

7. 비기능 요구사항 (NFR)
7.1 성능
계산 로직은 O(1) 수준이며, 입력값 변경 후 “계산하기” 클릭 시에만 실행.
​

최근 기록 렌더링도 최대 5건으로 제한해 부담을 줄인다.

7.2 빌드 & 의존성
전체 프로젝트 기준:

npm run build 성공, 콘솔 경고/에러 없음.
​

npm audit 또는 동등 도구로 취약점 점검 수행.

8. 테스트 & 검증
8.1 유닛 테스트
src/lib/mulchingFilm.ts

입력 → 롤 수/금액 계산 정확성 검증:

평→㎡ 변환

한 롤당 면적

requiredRolls, requiredRollsRounded, estimatedCostWon.
​

8.2 통합 테스트
MulchingFilm.tsx 페이지

정상 입력 → “계산하기” → 상단 결과·상세 카드 업데이트 + 기록 추가.

잘못된 입력 → 에러 메시지 표시, 결과 영역 유지.

최근 기록 초기화 동작 확인.
​

8.3 체크리스트 연계
checklist_security.md v0.2 기준 확인:

숫자 입력 필드가 숫자만 허용/필터링되는지.

잘못된 입력 시 결과 미갱신 + 에러 메시지 표시 여부.

최근 기록이 브라우저 로컬 저장소에만 저장되고, 민감 정보 포함 없이 관리되는지.
​

9. 리팩터링 원칙 (v0.2.2 이후)
Safe Refactoring
​

상단 결과 → 상세 → 입력 → 기록 구조와 사용자 플로우는 그대로 유지.

외부 동작(입력/출력/계산식/기록 수, Flow)을 바꾸지 않는다.

개선 대상

컴포넌트 분리 (ResultDisplay, DetailSection, InputForm, HistoryTable).

ARIA, 타입/상수 정리.

리팩터링 후 조건

npm run build 성공.

기존 수동 테스트 시나리오(결과·상세·기록·다크모드·접근성)가 모두 통과.
​