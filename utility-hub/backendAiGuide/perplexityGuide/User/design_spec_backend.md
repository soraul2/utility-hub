design_spec_backend.md (v1 – Auth 중심)
text
# lotto-market-v2 Backend Design Spec (Auth v1)

## 1. Overview

- Frontend: React CSR
- Backend: Spring Boot (Java), Spring Security, Spring Data JPA, Spring Validation
- Auth: OAuth2 Login (NAVER, GOOGLE) + JWT (Access / Refresh)
- DB: MySQL
- 목표: v1에서 소셜 로그인 기반 회원 도메인(User)과 JWT 발급/재발급까지 구현

---

## 2. Domain Model

### 2.1 User

```java
User {
  Long id;
  String email;          // 소셜에서 제공하는 이메일 (nullable 허용 여부는 provider 정책에 따름)
  String nickname;       // 서비스 내 표시 이름
  AuthProvider provider; // NAVER, GOOGLE
  String providerId;     // 소셜 프로필 고유 식별자
  UserRole role;         // ROLE_USER, ROLE_ADMIN 등

  boolean premium;             // 프리미엄 유저 여부
  LocalDateTime premiumUntil;  // 프리미엄 만료 시각 (null 이면 일반 유저)

  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
제약

(provider, providerId) 유니크 인덱스

email 유니크는 강제하지 않고, nullable 허용 가능 (NAVER 설정에 따라)

nickname 기본값은 provider 프로필 이름 기반으로 설정

2.2 Enum
java
enum AuthProvider { NAVER, GOOGLE }

enum UserRole { ROLE_USER, ROLE_ADMIN }
3. API Spec
3.1 OAuth2 로그인 플로우
프론트는 백엔드가 제공하는 OAuth2 로그인 엔드포인트로 리다이렉트하고, 로그인 성공 후 백엔드가 JWT(Access/Refresh)를 발급하여 프론트에 전달한다.

3.1.1 POST /api/auth/oauth2/{provider}/login
설명: 소셜 로그인 성공 후, 프론트가 전달한 인가 코드/토큰을 사용해 백엔드에서 사용자 정보를 확인하고 User를 생성/갱신한 뒤 JWT 발급.

Path Variable

provider: "naver" | "google"

Request (예시 – 실제 구현 시 Spring Security OAuth2 Client를 통해 자동 처리할 수도 있음)

json
{
  "authorizationCode": "string",
  "redirectUri": "https://frontend.app/auth/callback/naver"
}
Response (성공 – HTTP 200)

json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "provider": "NAVER",
    "role": "ROLE_USER",
    "premium": false,
    "premiumUntil": null
  }
}
에러

AUTH_001: 지원하지 않는 provider

OAUTH2_001: OAuth2 인증 실패 (토큰 검증 실패, provider 응답 오류 등)

AUTH_002: 유저 생성/갱신 중 내부 오류

3.1.2 GET /api/auth/me
설명: 현재 인증된 사용자 정보 조회.

Security: Access Token 필수 (Authorization: Bearer {accessToken})

Response (성공 – HTTP 200)

json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "홍길동",
  "provider": "NAVER",
  "role": "ROLE_USER",
  "premium": false,
  "premiumUntil": null
}
에러

AUTH_003: 인증되지 않은 요청 (JWT 없음/유효하지 않음)

3.1.3 POST /api/auth/token/refresh
설명: Refresh Token을 사용하여 새로운 Access Token 발급.

Request

json
{
  "refreshToken": "jwt-refresh-token"
}
Response (성공 – HTTP 200)

json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "same-or-rotated-refresh-token",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
에러

TOKEN_001: 유효하지 않은 리프레시 토큰

TOKEN_002: 만료된 리프레시 토큰

4. Common Error Response Format
모든 에러 응답은 다음 JSON 형식을 사용한다.

json
{
  "code": "AUTH_001",
  "message": "지원하지 않는 인증 공급자입니다.",
  "details": null
}
code: 사전에 정의된 에러 코드

message: 사용자/프론트가 볼 수 있는 한글 메시지

details: 디버깅용 추가 정보(필요 시), 기본은 null 또는 생략

5. ErrorCode 설계 (Auth 영역 예시)
java
enum ErrorCode {
  AUTH_UNSUPPORTED_PROVIDER("AUTH_001", "지원하지 않는 인증 공급자입니다."),
  AUTH_USER_CREATE_FAILED("AUTH_002", "사용자 생성 중 오류가 발생했습니다."),
  AUTH_UNAUTHORIZED("AUTH_003", "인증이 필요합니다."),

  OAUTH2_FAILED("OAUTH2_001", "소셜 로그인 중 오류가 발생했습니다."),

  TOKEN_INVALID("TOKEN_001", "유효하지 않은 토큰입니다."),
  TOKEN_EXPIRED("TOKEN_002", "만료된 토큰입니다."),

  INTERNAL_SERVER_ERROR("COMMON_500", "서버 내부 오류가 발생했습니다.");
}
BusinessException + GlobalExceptionHandler에서 이 ErrorCode를 사용해 공통 에러 응답 생성.

6. Package Structure
text
com.lottomarket.auth
  ├─ controller
  │    └─ AuthController
  ├─ service
  │    ├─ AuthService
  │    ├─ JwtTokenService
  │    └─ CustomOAuth2UserService
  ├─ dto
  │    ├─ OAuthLoginRequest
  │    ├─ AuthResponse
  │    └─ TokenRefreshRequest
  ├─ domain
  │    └─ User, AuthProvider, UserRole
  └─ config
       └─ SecurityConfig, JwtSecurityConfig, OAuth2Config

com.lottomarket.global.error
  ├─ ErrorCode
  ├─ BusinessException
  └─ GlobalExceptionHandler
7. Security & JWT 기본 규칙 (요약)
JWT

Access Token: 짧은 만료 시간 (예: 1h)

Refresh Token: 긴 만료 시간 (예: 14d 또는 30d)

서명 키는 환경 변수/외부 설정으로 관리

Spring Security

stateless 세션 정책

JWT 인증 필터 → SecurityContext

/api/auth/token/refresh, /api/auth/oauth2/** 는 permitAll

기타 API는 인증 필요 (추후 도메인별로 조정)

text

***

## checklist_security_backend.md

```md
# checklist_security_backend.md

## 1. 환경 변수 / 설정

- [ ] OAuth2 Client ID/Secret(NAVER, GOOGLE)를 application.yml 이나 환경 변수로 분리
- [ ] JWT 서명 키를 코드에 하드코딩하지 않고, 환경 변수 또는 외부 설정으로 주입
- [ ] 프로덕션/로컬 프로파일별 OAuth2 리다이렉트 URI 명확히 분리

## 2. OAuth2 보안

- [ ] 지원 provider: NAVER, GOOGLE 이외는 거부 (AUTH_001)
- [ ] state 파라미터 검증 (CSRF 방지) 또는 Spring Security 기본 메커니즘 활용
- [ ] providerId, email 등은 provider 응답에서 신뢰 가능한 필드만 사용
- [ ] OAuth2 실패 시 OAUTH2_001 에러 코드로 공통 응답 반환

## 3. JWT / 토큰 관리

- [ ] Access Token 만료 시간(예: 1시간), Refresh Token 만료 시간(예: 14일 이상) 명시
- [ ] 만료된 토큰 요청 시 TOKEN_002, 변조/형식 오류 시 TOKEN_001 반환
- [ ] 토큰 파싱/검증 로직에서 예외를 그대로 노출하지 않고, 공통 예외로 변환
- [ ] Authorization 헤더 포맷: "Bearer {accessToken}" 고정

## 4. User 도메인 / 권한

- [ ] User에 provider + providerId 유니크 인덱스 설정
- [ ] 기본 role은 ROLE_USER, 관리자만 ROLE_ADMIN
- [ ] premium, premiumUntil 필드는 v1에서 read-only 처럼 사용 (서버 내부 로직으로만 변경)

## 5. 로깅 / 개인정보

- [ ] 액세스/리프레시 토큰 전체 문자열을 로그에 남기지 않는다.
- [ ] OAuth2 provider의 raw 응답(body 전체)을 로그로 남기지 않는다.
- [ ] 에러 로그에는 요청 ID, 사용자 ID 정도만 남기고, 민감 정보(email 등)는 최소화
- [ ] 로그인/토큰 관련 보안 이벤트는 audit 로그 수준으로 남길지 정책 결정

## 6. CORS / CSRF

- [ ] React 프론트 도메인만 CORS 허용 (origin 화이트리스트)
- [ ] stateless + JWT 구조이므로, CSRF는 disable 또는 별도 정책 정의
- [ ] OPTIONS preflight 요청에 대해 정상 응답 확인

## 7. Global Error Handling

- [ ] 모든 예외에 대해 공통 JSON 포맷 {code, message, details}를 사용
- [ ] 예상 가능한 비즈니스 예외는 BusinessException + ErrorCode로 정의
- [ ] 예측 불가 예외는 COMMON_500 으로 묶고, 내부 스택트레이스는 외부로 노출하지 않음