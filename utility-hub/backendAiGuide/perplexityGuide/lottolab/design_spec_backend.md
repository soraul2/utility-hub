design_spec_backend.md – Lotto Market v2 Backend API + Domain Design
문서 버전: v1.0
작성자: Perplexity (Backend Architect & QA)
프로젝트: lotto-market-v2 (Spring Boot + Spring Security + OAuth2 + JWT + Spring AI)

1. 서비스 개요
서비스 이름: Lotto Market v2

목표:

데이터 기반 로또 규칙 상점 + 연구소형 분석 앱

규칙별 시뮬/성과를 보여주며, 규칙을 “상품”처럼 구매/사용

백엔드 스택

Spring Boot 3.2.x

Spring Security 6.x + Spring Security OAuth2 Client

Spring Data JPA (MySQL / Cloud SQL)

JWT (io.jsonwebtoken:jjwt)

React + CSR (클라이언트), localStorage 또는 HttpOnly 쿠키 기반 토큰 저장

Spring AI (ChatClient + Anthropic/Vertex 등)

역할

Perplexity: 설계·검수·규칙 관리

Gemini: Spring Boot + Spring AI 구현

Claude: 리팩터링·문서화

2. 인증/인가 및 보안 방침
2.1 인증 방식
OAuth2 + JWT + Spring Security

Social 로그인: Naver, Google

소셜 로그인 후 JWT Access Token (1시간) + Refresh Token (14일) 발급

상태 비저장 인증

서버 측에 세션을 저장하지 않고, 토큰만으로 모든 인증 수행

토큰 전달

모든 API 요청은 Authorization: Bearer <JWT> 헤더에 토큰 포함

클라이언트: React CSR

토큰은 localStorage 또는 HttpOnly 쿠키에 저장

기본 권장: HttpOnly + Secure Cookie

2.2 권한 및 역할
ROLE_USER, ROLE_PREMIUM, ROLE_ADMIN

일반 사용자: ROLE_USER

프리미엄 구독: ROLE_PREMIUM

관리자: ROLE_ADMIN

권한 제어

@PreAuthorize("hasRole('ROLE_USER')") 등으로 엔드포인트 보호

관리 API(/admin/...)는 ROLE_ADMIN 전용

3. 공통 에러 응답 포맷
모든 API 응답은 JSON 형식이고,
에러 응답은 아래 형식을 따른다.

json
{
  "status": 401,
  "errorCode": "AUTH_UNAUTHORIZED",
  "message": "인증 정보가 없습니다",
  "timestamp": "2026-02-06T13:00:00Z"
}
status: HTTP 상태 코드

errorCode: 문자열 오류 코드 (AUTH_UNAUTHORIZED, EXPIRED_TOKEN, INVALID_REFRESH_TOKEN 등)

message: 사용자에게 보여주는 메시지

timestamp: ISO 8601 형식

4. API 스펙 (Lotto Market v2)
4.1 OAuth2 로그인 및 토큰 관련
1) OAuth2 로그인 시작
엔드포인트: POST /oauth2/authorization/{provider}

역할: OAuth2 로그인 흐름을 시작

경로 변수:

provider: naver | google

요청 예시:

bash
POST /oauth2/authorization/naver
응답:

HTTP 302 Redirect

Location: https://nid.naver.com/oauth2.0/authorize?...

설명:

사용자를 OAuth2 제공자 인증 페이지로 리다이렉트

인증 후 콜백 URL로 돌아오며 JWT 발급

2) 사용자 정보 조회
엔드포인트: GET /api/user/me

요청 헤더:

text
Authorization: Bearer {accessToken}
응답 (200 OK):

json
{
  "id": 1,
  "email": "user@naver.com",
  "nickname": "사용자명",
  "provider": "NAVER",
  "role": "ROLE_USER"
}
오류 응답:

401: 인증되지 않음 (토큰 없음 또는 유효하지 않음)

404: 사용자를 찾을 수 없음

3) 토큰 갱신
엔드포인트: POST /api/auth/token/refresh

요청 본문:

json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
요청 필드:

refreshToken: Refresh Token 값

응답 (200 OK):

json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
오류 응답:

400: INVALID_REFRESH_TOKEN

401: EXPIRED_REFRESH_TOKEN

401: INVALID_SIGNATURE

4) 회원 탈퇴
엔드포인트: DELETE /api/user/me

요청 헤더:

text
Authorization: Bearer {accessToken}
응답 (204 No Content):

성공적으로 탈퇴 처리됨 (응답 본문 없음)

오류 응답:

401: AUTH_UNAUTHORIZED

4.2 규칙 목록 / 랭킹 (Lotto)
1) 규칙 목록 조회
엔드포인트: GET /api/rules

요청 헤더: Authorization: Bearer {token}

쿼리 파라미터:

type (옵션): ATTACK, STABLE, BALANCE, LAB

sort (옵션): RANK, POPULARITY, USAGE

응답:

json
{
  "rules": [
    {
      "ruleId": 1,
      "name": "공격형 고급 규칙",
      "type": "ATTACK",
      "popularity": 0.8,
      "rank": 1,
      "recentForm": 0.7
    }
  ]
}
2) TOP 5 규칙 조회
엔드포인트: GET /api/rules/top

요청 헤더: Authorization: Bearer {token}

응답:

json
{
  "topRules": [
    {
      "ruleId": 1,
      "name": "공격형 고급 규칙",
      "rank": 1,
      "badge": "이번 주 2등 배출",
      "attack": 0.9,
      "stability": 0.6,
      "volatility": 0.4,
      "popularity": 0.8
    }
  ]
}
4.3 규칙 상세 / 통계
1) 규칙 상세 조회
엔드포인트: GET /api/rules/{ruleId}

요청 헤더: Authorization: Bearer {token}

경로 변수: ruleId

응답:

json
{
  "ruleId": 1,
  "name": "공격형 고급 규칙",
  "type": "ATTACK",
  "attack": 0.9,
  "stability": 0.6,
  "volatility": 0.4,
  "popularity": 0.8,
  "recentForm": 0.7,
  "badge": "이번 주 2등 배출",
  "description": "공격형 고급 규칙 설명",
  "stats": {
    "wins": {
      "1": 10,
      "2": 20,
      "3": 30,
      "4": 40,
      "5": 50
    },
    "recent5Weeks": [1, 2, 3, 4, 5]
  }
}
2) 규칙 기간별 통계
엔드포인트: GET /api/rules/{ruleId}/stats/period

요청 헤더: Authorization: Bearer {token}

쿼리 파라미터:

period: RECENT_4_WEEKS, RECENT_8_WEEKS, ALL_TIME

응답:

json
{
  "ruleId": 1,
  "period": "RECENT_4_WEEKS",
  "stats": {
    "1st": 2,
    "2nd": 3,
    "3rd": 5,
    "4th": 10,
    "5th": 15
  }
}
3) 규칙 분포 통계
엔드포인트: GET /api/rules/{ruleId}/stats/distribution

요청 헤더: Authorization: Bearer {token}

응답:

json
{
  "ruleId": 1,
  "distribution": {
    "1": 10,
    "2": 20,
    "3": 30,
    "4": 40,
    "5": 50
  }
}
4.4 번호 생성 / AI 연동
1) 규칙 기반 번호 생성
엔드포인트: POST /api/rules/{ruleId}/generate

요청 헤더: Authorization: Bearer {token}

요청 본문:

json
{
  "count": 5
}
응답:

json
{
  "ruleId": 1,
  "tickets": [
    [1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30]
  ]
}
2) Spring AI를 통한 규칙 설명 생성
엔드포인트: POST /api/ai/rule-explain

요청 헤더: Authorization: Bearer {token}

요청 본문:

json
{
  "ruleId": 1
}
응답:

json
{
  "ruleId": 1,
  "explanation": "공격형 고급 규칙에 대한 설명..."
}
4.5 사용자 기록 / 마이페이지
1) 사용자 당첨 히스토리
엔드포인트: GET /api/me/history

요청 헤더: Authorization: Bearer {token}

응답:

json
{
  "history": [
    {
      "date": "2026-02-06",
      "drawId": 1000,
      "ticket": [1, 2, 3, 4, 5, 6],
      "rank": 3,
      "prize": 1000000
    }
  ]
}
2) 사용자 통계
엔드포인트: GET /api/me/stats

요청 헤더: Authorization: Bearer {token}

응답:

json
{
  "totalTickets": 100,
  "totalWins": 10,
  "bestRank": 1,
  "totalPrize": 100000000
}
5. 요청/응답 스키마
5.1 인증/토큰
AuthDto.TokenRefreshRequest:

json
{
  "refreshToken": "string"
}
AuthDto.TokenResponse:

json
{
  "accessToken": "string",
  "refreshToken": "string",
  "tokenType": "string",
  "expiresIn": "number"
}
AuthDto.UserResponse:

json
{
  "id": "number",
  "email": "string",
  "nickname": "string",
  "provider": "string",
  "role": "string"
}
5.2 에러 응답
ErrorResponse:

json
{
  "status": "number",
  "errorCode": "string",
  "message": "string",
  "timestamp": "string (ISO 8601)"
}
6. OAuth2 + JWT 보안 및 토큰 관리
6.1 보안 원칙
최소 권한: 사용자에게 필요한 최소 권한만 부여

심층 방어: 여러 계층으로 보안 메커니즘 적용

감사 로깅: 로그인/토큰/에러 시도를 모두 로깅

정기 검토: 주기적으로 보안 업데이트 및 취약점 점검

6.2 토큰 저장 및 만료
Refresh Token 저장:

가능하면 HttpOnly + Secure 쿠키로 저장

XSS 공격 방어

Access Token 만료: 1시간 (3600000ms)

Refresh Token 만료: 14일 (1209600000ms)

토큰 갱신: 만료 시 POST /api/auth/token/refresh 호출

6.3 CORS 및 CSRF 방어
CORS:

환경별로 cors.allowed-origins 설정

프로덕션에서는 명시적으로 허용된 도메인만 허용

CSRF:

HttpOnly/Secure 쿠키로 대체

필요 시 CSRF 토큰 기반 추가 보안 적용

7. Spring Boot 패키지 구조
text
com.wootae.backend
├── lotto
│   ├── controller
│   │   ├── LottoRuleController
│   │   ├── LottoGenerateController
│   │   ├── LottoAiController
│   │   └── UserController
│   ├── service
│   │   ├── LottoRuleService
│   │   ├── LottoGenerateService
│   │   ├── LottoAiService
│   │   └── AuthService
│   ├── dto
│   │   ├── AuthDto
│   │   ├── RuleDto
│   │   ├── GenerateRequestDto
│   │   └── AiRequestDto
│   ├── entity
│   │   ├── LottoRule
│   │   ├── LottoSimulationStats
│   │   ├── LottoDraw
│   │   └── User
│   └── repository
│       ├── LottoRuleRepository
│       ├── LottoSimulationStatsRepository
│       ├── LottoDrawRepository
│       └── UserRepository
├── global
│   ├── error
│   │   ├── GlobalExceptionHandler
│   │   ├── ErrorCode
│   │   └── ErrorResponse
│   ├── auth
│   │   ├── JwtAuthenticationFilter
│   │   ├── JwtTokenService
│   │   ├── CustomOAuth2UserService
│   │   ├── OAuthAttributesExtractor
│   │   └── OAuth2AuthenticationSuccessHandler
│   └── config
│       ├── SecurityConfig
│       └── SwaggerConfig
└── application
    └── LottoMarketApplication (main 클래스)
8. Spring AI 연동 설계
Spring AI 구현 위치

LottoAiService

LottoAiController

ChatClient 설정

application.yml에서 프로바이더 설정

ChatClient Bean 생성

프롬프트 템플릿

규칙 설명 생성용

규칙 ID, 타입, 파라미터를 입력으로 사용