# 미스틱 타로 공유, 저장, 기록, 게스트 연동 및 제한 구현 계획

이 계획은 미스틱 타로의 **저장, 공유, 기록 관리, 게스트 연동**에 더해 **사용량 제한(Rate Limiting)** 기능을 구현하기 위한 최종 로드맵입니다.

## 분석 결과 (Analysis)

### 1. 인증 및 저장 (Auth & Persistence)
- **현황**: 타로 결과는 `TarotReadingSession`에 저장되지만, 회원(`Member`)과 연동되지 않아 '나의 기록'으로 관리되지 않습니다.
- **개선**: 로그인 시 `Session`에 `memberId`를 매핑하여 영구 보관합니다.

### 2. 게스트 경험 (Guest Experience)
- **현황**: 비로그인 상태의 결과는 일회성으로 휘발됩니다.
- **개선**: 게스트 상태의 리딩 결과를 `localStorage`에 임시 저장하고, 로그인 직후 계정으로 이관(Migration)합니다.

### 3. 공유 (Sharing)
- **현황**: 공유 불가.
- **개선**: UUID 기반의 공개 링크를 생성하여 결과를 공유할 수 있게 합니다.

### 4. 사용량 제한 (Rate Limiting)
- **목표**: 무분별한 사용 방지 및 안정성 확보.
- **정책**:
    - **일반 사용자**: 하루 **100회** 제한 (테스트 기간 고려).
    - **관리자(ROLE_ADMIN)**: 제한 없음.

## 변경 제안 (Proposed Changes)

### 백엔드 (Backend)

#### [수정] 도메인 모델 (`TarotReadingSession`)
- `memberId` 필드 추가 (Nullable).
- `shareUuid` 필드 추가 (공유 전용 식별자, 난수화).

#### [수정] 컨트롤러 & 서비스
- **저장**: 로그인 사용자라면 `memberId` 저장.
- **[NEW] 제한 로직**: 리딩 생성 전, `오늘 생성된 리딩 수` 체크.
    - `countByMemberIdAndCreatedAtBetween(...)`
    - 100회 초과 시 예외 발생. `ROLE_ADMIN`일 경우 검사 건너뜀.
- **공유**: `GET /api/tarot/share/{shareUuid}`.
- **기록**: `GET /api/tarot/history`.
- **삭제**: `DELETE /api/tarot/history/{sessionId}`.
- **연동**: `POST /api/tarot/migrate`.

### 프론트엔드 (Frontend)

#### [신규] 로직 및 페이지
- **게스트 연동 로직**: `useGuestTarot` 훅 및 `AuthCallbackPage` 이관 로직.
- **기록 페이지**: `/tarot/history`.
- **공유 페이지**: `/tarot/share/:shareUuid`.

#### [수정] 기존 UI
- **결과 화면**: '공유하기', '기록보기' 버튼 추가.
- **에러 핸들링**: 100회 초과 에러 시 안내 메시지 표시 ("일일 사용 한도를 초과했습니다").

## 작업 규모 추정 (Work Estimate)

### 백엔드 (Backend)
- **난이도**: 중 (Medium)
- **작업**: DB 컬럼 추가, API 3~4개, Rate Limit 로직 추가.

### 프론트엔드 (Frontend)
- **난이도**: 중 (Medium)
- **작업**: 신규 페이지 2개, 게스트 연동 훅, 이관 로직, 에러 UI 처리.

### 총평
- **예상 소요 시간**: 약 4~5 task blocks.

## 검증 계획

### 자동화 테스트
- **통합 테스트**:
    - 100회 제한 도달 시 차단되는지 확인.
    - Admin 계정으로 101번째 요청 성공 확인.
    - 게스트 세션 이관 확인.

### 수동 검증
1. **제한 테스트**: (DB 조작으로 카운트 증가 후) 리딩 시도 -> 차단 확인.
2. **이관 테스트**: 로그아웃 상태 점보기 -> 로그인 -> 기록 확인.
3. **공유 테스트**: 공유 링크 접속 확인.
