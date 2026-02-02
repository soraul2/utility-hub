1. Overview
   서비스: Lotto Lab – 로또 번호 연구·시뮬레이션 플랫폼 (한국 로또 6/45 대상)

백엔드 스택: Spring Boot (부분형 모놀리식), MySQL, JPA, 스케줄링

프론트: React(CSR)에서 REST API 호출

목표:

번호 생성, 규칙별 시뮬레이션 통계 조회, 전략 Preset 관리, 간단 추천(준-AI) 지원

향후 Spring AI/LLM 연동이 가능하도록 도메인·API를 안정적으로 설계

2. 패키지 구조 (도메인 기준)
   com.lottolab

user

controller, service, dto, entity, repository

lotto

회차/당첨번호, 규칙, 시뮬레이션 요약, 번호 생성

controller, service, dto, entity, repository, batch

strategy

Preset / 사용자 전략

controller, service, dto, entity, repository

recommend

간단 추천(룰 기반 AI 요약)

controller, service, dto

global

error (ErrorCode, BusinessException, GlobalExceptionHandler)

config (SecurityConfig, WebConfig, SchedulerConfig 등)

3. 공통 응답/에러 포맷
   3-1. 성공 응답 (기본 형태)
   json
   {
   "success": true,
   "data": { ... }
   }
   필요 시 페이징 등은 data 안에서 처리.

3-2. 에러 응답
json
{
"success": false,
"code": "LOTTO_001",
"message": "존재하지 않는 회차입니다."
}
code: ErrorCode enum 값

message: 사용자에게 바로 보여줄 수 있는 한글 메시지(혹은 i18n 키)

3-3. ErrorCode 예시
공통

COMMON_001 잘못된 요청 파라미터 (validation error)

COMMON_002 서버 내부 오류

Auth

AUTH_001 잘못된 로그인 정보

AUTH_002 인증 필요

Lotto

LOTTO_001 회차 정보 없음

LOTTO_002 지원하지 않는 규칙 코드

Strategy

PRESET_001 Preset 최대 개수 초과

PRESET_002 Preset을 찾을 수 없음

Recommend/AI

AI_001 추천 요약 생성 실패

모든 예외는 BusinessException으로 래핑 후 GlobalExceptionHandler에서 JSON으로 변환.

4. 도메인 모델 (요약)
   4-1. Lotto 관련
   LottoDraw

id(PK), roundNo(int), drawDate(LocalDate), n1..n6(int), bonus(int)

LottoRule

id, code(enum: RANDOM, HOT, COLD, TENS), name, description, active(boolean)

LottoSimulationSummary

id

rule (ManyToOne LottoRule)

roundStart(int), roundEnd(int) // 예: 최근 50회면 1160~1209

testCount(long)

hit1, hit2, hit3, hit4, hit5(long)

createdAt(timestamp)

개별 시뮬 조합은 저장하지 않고 요약 통계만 저장.

4-2. User / Strategy
User

id, email, passwordHash, nickname, createdAt

StrategyPreset

id, user(ManyToOne), name

rulesJson(TEXT) – 선택 규칙과 옵션(합계 범위, 홀짝, 연속 여부 등)을 JSON으로 저장

createdAt, updatedAt

UserActivity (선택)

id, user, type(enum: GENERATE, USE_PRESET, VIEW_RULE 등), payload(TEXT), createdAt

5. API 스펙
   5-1. 인증
   POST /api/auth/signup
   Request

json
{
"email": "user@example.com",
"password": "plainPassword",
"nickname": "닉네임"
}
Response (201)

json
{
"success": true,
"data": {
"userId": 1,
"email": "user@example.com",
"nickname": "닉네임"
}
}
에러

COMMON_001 유효성 실패

AUTH_003 이미 존재하는 이메일(필요 시)

POST /api/auth/login
Request

json
{
"email": "user@example.com",
"password": "plainPassword"
}
Response (200)

json
{
"success": true,
"data": {
"accessToken": "jwt-token-string",
"user": {
"userId": 1,
"email": "user@example.com",
"nickname": "닉네임"
}
}
}
에러: AUTH_001

5-2. 대시보드 요약
GET /api/dashboard/summary (Auth 필요)
Query: period (optional, default 100) – 최근 회차 개수

Response

json
{
"success": true,
"data": {
"latestDraw": {
"roundNo": 1209,
"drawDate": "2026-01-31"
},
"simulationSummary": {
"period": 100,
"totalTestCount": 4000000,
"rules": [
{
"ruleCode": "RANDOM",
"hit5Rate": 0.00012
},
{
"ruleCode": "HOT",
"hit5Rate": 0.00016
}
]
},
"recommendation": {
"topUsedRuleCode": "HOT",
"bestHitRuleCode": "TENS",
"messageLines": [
"최근 4주 동안 가장 자주 사용한 규칙은 HOT 입니다.",
"최근 50회 기준 5등 이상 적중률이 가장 높은 규칙은 TENS 입니다."
]
}
}
}
에러: COMMON_001 잘못된 period 등

5-3. 번호 생성
POST /api/lotto/generate (Auth 선택, 있어도 됨)
Request

json
{
"ruleCode": "HOT",
"options": {
"sumMin": 90,
"sumMax": 190,
"oddEven": "BALANCE_3_3", // 또는 "ANY", "FOUR_TWO"
"allowConsecutive": true
}
}
유효성

ruleCode는 LottoRule.code 중 하나

sumMin <= sumMax, 범위 21~255 내

oddEven은 enum 값 중 하나

Response

json
{
"success": true,
"data": {
"numbers": [3, 15, 24, 33, 41, 44],
"ruleCode": "HOT",
"optionsApplied": { ... }
}
}
에러

LOTTO_002 : 지원하지 않는 규칙

COMMON_001 : 옵션 범위 오류

5-4. 규칙별 통계
GET /api/rules/stats
Query:

period (50 또는 100, default 50)

Response

json
{
"success": true,
"data": {
"period": 50,
"rules": [
{
"ruleCode": "RANDOM",
"testCount": 5000000,
"hit3": 1200,
"hit4": 200,
"hit5": 20,
"hit5Rate": 0.0004
},
{
"ruleCode": "HOT",
"testCount": 5000000,
"hit3": 1400,
"hit4": 230,
"hit5": 25,
"hit5Rate": 0.0005
}
]
}
}
에러: COMMON_001

5-5. 전략 Preset
GET /api/presets (Auth 필요)
Response

json
{
"success": true,
"data": [
{
"presetId": 1,
"name": "고정수 포함 전략 A",
"rulesJson": {
"baseRule": "HOT",
"options": {
"sumMin": 100,
"sumMax": 170,
"oddEven": "BALANCE_3_3"
}
}
}
]
}
POST /api/presets (Auth 필요)
Request

json
{
"name": "합계 120-150 전략",
"rulesConfig": {
"ruleCode": "HOT",
"options": {
"sumMin": 120,
"sumMax": 150,
"oddEven": "ANY",
"allowConsecutive": false
}
}
}
Response (201)

json
{
"success": true,
"data": {
"presetId": 2
}
}
제약

사용자당 Preset 최대 3개

에러

PRESET_001 최대 개수 초과

COMMON_001 값 검증 실패

PUT /api/presets/{id} / DELETE /api/presets/{id}
표준 CRUD, 해당 userId 소유권 확인

못 찾으면 PRESET_002

5-6. 추천 요약 (가짜 AI)
GET /api/recommend/summary (Auth 필요)
내부에서 UserActivity, LottoSimulationSummary를 읽어 간단한 추천 계산

Response 예시는 대시보드 recommendation과 동일 포맷:

json
{
"success": true,
"data": {
"topUsedRuleCode": "HOT",
"bestHitRuleCode": "TENS",
"messageLines": [
"최근 4주 동안 가장 자주 사용한 규칙은 HOT 입니다.",
"최근 50회 기준 5등 이상 적중률이 가장 높은 규칙은 TENS 입니다."
]
}
}
6. Validation & Security (요약)
   모든 요청 DTO에 Bean Validation 적용 (@NotNull, @Email, @Size, 커스텀 범위 검증)

JWT 기반 인증 필터에서 /api/auth/**만 제외

로깅 시: 번호 생성 요청의 옵션 정도만 기록, 실제 생성된 6개 번호는 로그에 풀로 남기지 않거나 일부 마스킹

Secret/DB 비밀번호는 외부 설정 (환경 변수, config 서버 등)으로 관리

7. 배치/시뮬레이션 설계 (요약)
   스케줄: 주 1회(추첨 후) 또는 수동 호출

작업:

동행복권 API/페이지에서 최신 회차 당첨번호 수집 → LottoDraw insert
​

규칙별로 10만건 조합 생성 → 당첨번호와 매칭 → 등수별 카운트

각 규칙 + 기간(50,100)에 대해 LottoSimulationSummary upsert

배치는 같은 Spring Boot 앱에서 @Scheduled 또는 별 Command로 구현