design_spec_backend.md (v1.1 – Auth 중심)

# Utility Hub Backend Design Spec (Auth v1)

## 1. Overview

- Frontend: React CSR
- Backend: Spring Boot (Java), Spring Security, Spring Data JPA, Spring Validation
- Auth: OAuth2 Login (NAVER, GOOGLE) + JWT (Access / Refresh)
- DB: MySQL
- 목표: v1에서 소셜 로그인 기반 회원 도메인(User)과 JWT 발급/재발급까지 구현

---

## 2. Domain Model

### 2.1 User
*Package: `com.wootae.backend.domain.user.entity`*

```java
User {
  Long id;
  String email;          // 소셜에서 제공하는 이메일
  String nickname;       // 서비스 내 표시 이름
  AuthProvider provider; // NAVER, GOOGLE
  String providerId;     // 소셜 프로필 고유 식별자
  UserRole role;         // ROLE_USER, ROLE_ADMIN 등

  boolean premium;             // 프리미엄 유저 여부 (추후 확장용)
  LocalDateTime premiumUntil;  // 프리미엄 만료 시각

  LocalDateTime createdAt;
  LocalDateTime updatedAt;
}
```
**제약**
- `(provider, providerId)` 유니크 인덱스
- `email` 유니크는 강제하지 않고, nullable 허용 가능 (Provider 정책에 따라)
- `nickname` 기본값은 provider 프로필 이름 기반으로 설정

### 2.2 Enum
```java
enum AuthProvider { NAVER, GOOGLE }
enum UserRole { ROLE_USER, ROLE_ADMIN }
```

---

## 3. API Spec

### 3.1 OAuth2 로그인 플로우
프론트는 백엔드가 제공하는 OAuth2 로그인 엔드포인트로 리다이렉트하고, 로그인 성공 후 백엔드가 JWT(Access/Refresh)를 발급하여 프론트에 전달한다.

### 3.1.1 POST /api/auth/oauth2/{provider}/login
**설명**: 소셜 로그인 성공 후, 프론트가 전달한 인가 코드/토큰을 사용해 백엔드에서 사용자 정보를 확인하고 User를 생성/갱신한 뒤 JWT 발급.

**Path Variable**
- `provider`: "naver" | "google"

**Request**
```json
{
  "authorizationCode": "string",
  "redirectUri": "https://frontend.app/auth/callback/naver"
}
```

**Response (성공 – HTTP 200)**
```json
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
    "role": "ROLE_USER"
  }
}
```

**에러**
- `AUTH_001`: 지원하지 않는 provider
- `OAUTH2_001`: OAuth2 인증 실패
- `AUTH_002`: 유저 생성/갱신 중 내부 오류

### 3.1.2 GET /api/user/me
**설명**: 현재 인증된 사용자 정보 조회.

**Security**: Access Token 필수 (`Authorization: Bearer {accessToken}`)

**Response (성공 – HTTP 200)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "홍길동",
  "provider": "NAVER",
  "role": "ROLE_USER"
}
```

**에러**
- `AUTH_003`: 인증되지 않은 요청

### 3.1.3 POST /api/auth/token/refresh
**설명**: Refresh Token을 사용하여 새로운 Access Token 발급.

**Request**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response (성공 – HTTP 200)**
```json
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "same-or-rotated-refresh-token",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**에러**
- `TOKEN_001`: 유효하지 않은 리프레시 토큰
- `TOKEN_002`: 만료된 리프레시 토큰

---

## 4. Common Error Response Format

```json
{
  "code": "AUTH_001",
  "message": "지원하지 않는 인증 공급자입니다.",
  "details": null
}
```

---

## 5. ErrorCode 설계 (Auth 영역 예시)

```java
enum ErrorCode {
  AUTH_UNSUPPORTED_PROVIDER("AUTH_001", "지원하지 않는 인증 공급자입니다."),
  AUTH_USER_CREATE_FAILED("AUTH_002", "사용자 생성 중 오류가 발생했습니다."),
  AUTH_UNAUTHORIZED("AUTH_003", "인증이 필요합니다."),

  OAUTH2_FAILED("OAUTH2_001", "소셜 로그인 중 오류가 발생했습니다."),

  TOKEN_INVALID("TOKEN_001", "유효하지 않은 토큰입니다."),
  TOKEN_EXPIRED("TOKEN_002", "만료된 토큰입니다."),

  INTERNAL_SERVER_ERROR("COMMON_500", "서버 내부 오류가 발생했습니다.");
}
```

---

## 6. Package Structure
**Base Package**: `com.wootae.backend`

```text
com.wootae.backend
  ├─ domain
  │    └─ user
  │         ├─ controller   (UserController, AuthController)
  │         ├─ service      (UserService, AuthService, CustomOAuth2UserService)
  │         ├─ repository   (UserRepository)
  │         ├─ entity       (User, AuthProvider, UserRole)
  │         └─ dto          (AuthRequest, AuthResponse, UserDto)
  ├─ global
  │    ├─ auth              (JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig)
  │    └─ error             (ErrorCode, GlobalExceptionHandler, BusinessException)
```

---

## 7. Security & JWT 기본 규칙
- **JWT**: Access Token(1h), Refresh Token(14d or 30d)
- **Security**: Stateless, JWT Filter
- **Paths**: `/api/auth/**` (permitAll), `/api/user/**` (Authenticated)

---

## checklist_security_backend.md

### 1. 환경 변수 / 설정
- [ ] OAuth2 Client ID/Secret 환경 변수 분리
- [ ] JWT Secret Key 환경 변수 분리

### 2. OAuth2 보안
- [ ] 지원하지 않는 Provider 거부 로직
- [ ] State 검증 (필요 시)

### 3. JWT / 토큰 관리
- [ ] 토큰 만료 및 위변조 검증 철저
- [ ] Bearer 헤더 포맷 준수

### 4. User 도메인
- [ ] Provider + ProviderId 유니크 제약
- [ ] 민감 정보(Password 등)는 저장하지 않음 (소셜 로그인 전용)

### 5. 로깅 / 개인정보
- [ ] 토큰 및 민감 정보 로그 남기지 않기
