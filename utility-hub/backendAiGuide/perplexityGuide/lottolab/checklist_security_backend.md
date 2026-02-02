아래를 Lotto Lab용 checklist_security_backend.md 초안으로 쓰면 된다.

Lotto Lab – Backend Security & Validation Checklist (MVP)
1. 인증/인가
   모든 민감 엔드포인트는 JWT 기반 인증을 요구한다.

보호 대상: /api/dashboard/**, /api/lotto/generate(선택), /api/presets/**, /api/recommend/**, /api/rules/stats

예외: /api/auth/**, 헬스체크 엔드포인트.

JWT 토큰은 Authorization: Bearer <token> 헤더로만 받는다.

토큰 만료 시간·리프레시 전략을 명확히 설정한다(예: 액세스 1h, 리프레시 14d – 추후 도입).

2. 입력 검증 (Validation)
   2-1. 공통
   모든 Request DTO에 Bean Validation 사용 (@NotNull, @Email, @Size, @Min, @Max 등).

컨트롤러에서 @Valid + BindingResult 또는 @Validated를 사용해 validation 에러를 COMMON_001로 통합.

2-2. 도메인별 규칙
Auth

이메일: 형식 검증, 최대 길이 제한 (예: 100자).

비밀번호: 최소 길이(8자 이상)·최대 길이(64자 등).

번호 생성 /api/lotto/generate

ruleCode는 LottoRule.code enum 중 하나인지 확인, 아니면 LOTTO_002.

sumMin, sumMax는 21~255 범위 내.

sumMin <= sumMax 만족하지 않으면 COMMON_001.

oddEven 값은 enum(ANY, BALANCE_3_3, FOUR_TWO) 중 하나.

allowConsecutive는 boolean.

규칙 통계 /api/rules/stats

period는 허용 값(50, 100)만 허용.

Preset

이름 길이 제한(예: 1~50자).

rulesConfig 내부도 번호 생성과 동일한 validation 적용.

사용자당 Preset 개수 3개 초과 시 PRESET_001.

3. 에러 처리
   모든 도메인 예외는 BusinessException 하위에서 발생하도록 통합.

GlobalExceptionHandler에서:

MethodArgumentNotValidException, ConstraintViolationException → COMMON_001.

BusinessException → 해당 ErrorCode와 메시지.

그 외 예외 → COMMON_002 일반 서버 오류.

에러 응답 JSON은 항상 { success: false, code, message } 형식을 따른다.

4. 데이터·비밀번호·시크릿 관리
   비밀번호는 BCrypt 등 강력한 해시 알고리즘으로 저장, 평문 저장 금지.

DB 접속 정보, JWT 시크릿 키, 향후 AI API 키 등은:

환경 변수 또는 외부 설정 서버로 관리.

Git 저장소에 커밋하지 않는다.

로또 번호(6개)와 같은 비민감 데이터라도, 로그에 과도하게 상세히 남기지 않는다(필요 시 일부 마스킹/샘플만).

5. 로깅 & 모니터링
   요청/응답 전체 바디를 디폴트로 로그에 남기지 않는다.

민감 정보(비밀번호, 토큰, 이메일)는 로그에 찍지 않는다.

주요 이벤트만 로깅:

로그인 시도 성공/실패(단, 비밀번호 제외)

시뮬레이션 배치 시작/종료/에러

Preset 생성/삭제 (userId, presetId 정도만)

오류 로그에는 ErrorCode, 요청 ID, 스택 트레이스 요약만 포함.

6. CORS & 네트워크
   SecurityConfig에서 허용 origin을 React 프런트엔드 도메인으로 제한(개발/운영 분리).

OPTIONS preflight 요청 허용, 필요한 메서드만 열기(예: GET, POST, PUT, DELETE).

HTTPS 환경을 기본 가정(운영).

7. 배치/시뮬레이션 안전성
   배치 시뮬(Job) 실행은 인증된 경로로만 트리거(스케줄 또는 내부 호출), 외부 공개 API로 노출하지 않는다.

시뮬 도중 예외 발생 시:

부분 데이터가 들어가지 않도록 트랜잭션 범위를 조정하거나, 완료된 rule 단위로 커밋.

실패 시 상태/원인을 로그에 기록하고, 알림(향후 Slack/메일) 채널로 보낼 수 있도록 훅 준비.

8. 권한·소유권 체크
   Preset 조회/수정/삭제 시 userId 소유권 검증 필수.

다른 사용자의 Preset ID로 접근 시 PRESET_002 또는 403을 반환.

추천 요약/대시보드 등 사용자별 데이터 조회 API는 항상 인증된 userId 기준으로 조회.

9. 테스트 관련 보안 체크
   단위테스트에서:

입력 검증 실패 시 올바른 ErrorCode와 400/422 상태가 나오는지 확인.

통합테스트에서:

인증 없이 보호 API 접근 시 401/403 응답 확인.

유저 A 토큰으로 유저 B의 Preset에 접근할 수 없는지 확인.

10. 변경 관리
    보안 관련 정책이 바뀌면 checklist_security_backend.md를 먼저 업데이트한다.

그 후 구현/테스트를 수정한다(코드부터 고치지 않는다).

보안 사고나 버그 발생 시:

원인/대응을 본 문서에 회고로 남기고(예: “Issue #12 – 로그에 과도한 데이터 노출”), 재발 방지 항목을 추가한다.

이 체크리스트를 레포에 그대로 두고, 구현/리뷰 때마다 “항목별로 지켰는지”를 확인하면 된다.