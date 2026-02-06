# 인증(Authentication) 시스템 아키텍처 V2

이 문서는 **LottoLab & Utility Hub**의 보안이 강화된 백엔드 인증 시스템에 대한 기술 명세서입니다.
기존 `localStorage` 기반의 취약점을 해결하기 위해 **HttpOnly Cookie**와 **DB 기반 Refresh Token 저장** 방식을 도입했습니다.

---

## 1. 시스템 개요 (System Overview)

### 주요 변경 사항 (V2)
| 구분 | 기존 (V1) | **개선 (V2)** |
| :--- | :--- | :--- |
| **Refresh Token 저장** | JWT 자체 또는 메모리 (Stateless) | **MySQL DB (Persistence)** |
| **전달 방식** | URL Query Parameter -> Client localStorage | **HttpOnly, Secure Cookie** |
| **로그아웃** | 클라이언트 측 토큰 삭제 (서버 무효화 불가) | **DB 토큰 삭제 + 쿠키 만료 (서버 제어 가능)** |
| **XSS 방어** | 취약 (JS로 토큰 탈취 가능) | **강력 (JS 접근 불가)** |

### 기술 스택
- **Spring Security 6.x** + **OAuth2 Client**
- **JWT (JSON Web Token)**: Access Token (Stateless)
- **JPA**: Refresh Token (Stateful)
- **Cookie**: refreshToken 전달용 (HttpOnly)

---

## 2. 인증/인가 흐름 (Architecture Flow)

### 2.1 로그인 (Login)
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant OAuth_Provider as Naver/Google
    participant DB

    User->>Frontend: "로그인" 버튼 클릭
    Frontend->>Backend: GET /oauth2/authorization/{provider}
    Backend->>OAuth_Provider: 리다이렉트 (Client ID, Scope)
    User->>OAuth_Provider: 로그인 및 승인
    OAuth_Provider->>Backend: Authorization Code 전달
    Backend->>OAuth_Provider: Access Token 요청/수신
    Backend->>OAuth_Provider: 사용자 정보 (Profile) 요청/수신
    
    Backend->>DB: 사용자 정보 저장/갱신 (User)
    Backend->>DB: Refresh Token 저장 (기존 토큰 삭제 후 재생성)
    
    Backend->>Frontend: 리다이렉트 (Access Token은 URL 파라미터 or Body)
    Note right of Backend: Set-Cookie: refresh_token=...; HttpOnly; Secure
```

### 2.2 토큰 재발급 (Reissue)
- **Access Token**이 만료되었을 때, 프론트엔드는 **Cookie에 저장된 Refresh Token**을 사용하여 재발급을 요청합니다.

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant DB

    Frontend->>Backend: POST /api/auth/token/refresh (Cookie 포함)
    Backend->>Backend: Cookie에서 'refresh_token' 추출
    Backend->>DB: 토큰 조회 및 검증 (만료 여부, 존재 여부)
    
    alt 유효한 토큰
        Backend->>DB: 기존 토큰 삭제 (Rotation)
        Backend->>DB: 새 Refresh Token 저장
        Backend->>Frontend: 200 OK (새 Access Token Response)
        Note right of Backend: Set-Cookie: refresh_token={NEW}; HttpOnly
    else 유효하지 않음
        Backend->>Frontend: 401 Unauthorized (Msg: Invalid/Expired Token)
        Backend->>DB: (옵션) 해킹 의심 시 해당 유저의 모든 토큰 폐기
    end
```

---

## 3. 상세 구현 (Implementation)

### 3.1 토큰 저장소 (DB)
`refresh_tokens` 테이블을 사용하여 Refresh Token의 생명주기를 관리합니다.
- **Entity**: `RefreshToken`
- **Fields**:
  - `id`: PK
  - `userId`: 소유자 ID
  - `token`: 실제 토큰 값 (Index)
  - `expiryDate`: 만료 시간

### 3.2 보안 쿠키 설정 (HttpOnly Cookie)
Refresh Token은 브라우저의 JavaScript(`document.cookie`)가 절대 접근할 수 없도록 설정합니다.
- **HttpOnly**: `true` (XSS 방지)
- **Secure**: `true` (HTTPS에서만 전송, 로컬 개발 시에는 상황에 따라 조정)
- **SameSite**: `Strict` or `Lax` (CSRF 방지)
- **Max-Age**: 14일 (Refresh Token 만료 기간과 일치)

### 3.3 JWT 구조
- **Access Token**:
  - Header: `Auth Bearer ...` 로 전송
  - Payload: `sub`(userId), `email`, `role`, `exp`(1시간)
  - **Stateless Verification**: DB 조회 없이 서명(Signature)만으로 검증하여 성능 확보.

---

## 4. API 명세 (Authentication API)

### 4.1 로그인 시작
- **URL**: `/oauth2/authorization/naver` 또는 `/oauth2/authorization/google`
- **Method**: `GET`
- **설명**: 해당 소셜 로그인 페이지로 리다이렉트됩니다.

### 4.2 토큰 갱신 (Token Refresh)
- **URL**: `/api/auth/token/refresh`
- **Method**: `POST`
- **Headers**:
  - `Cookie`: `refresh_token=...` (브라우저가 자동 전송)
- **Response**:
  - **200 OK**:
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1...",
      "tokenType": "Bearer",
      "expiresIn": 3600
    }
    ```
  - **401 Unauthorized**: Refresh Token이 없거나 만료됨. (로그인 페이지로 이동 필요)

### 4.3 로그아웃 (Logout)
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Headers**:
  - `Cookie`: `refresh_token=...`
- **Action**:
  1.  DB에서 해당 Refresh Token 삭제.
  2.  Response Header에 `Set-Cookie: refresh_token=; Max-Age=0` 설정하여 클라이언트 쿠키 삭제.
- **Response**:
  - **200 OK**: 로그아웃 성공.

### 4.4 내 정보 조회 (Me)
- **URL**: `/api/user/me`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `Bearer {access_token}`
- **Response**:
  - **200 OK**:
    ```json
    {
      "email": "user@example.com",
      "nickname": "홍길동",
      "profileImage": "..."
    }
    ```

---

## 5. 프론트엔드 연동 가이드

1.  **Axios 설정**:
    `withCredentials: true` 옵션을 반드시 켜야 서버와 쿠키를 주고받을 수 있습니다.
    ```typescript
    const axiosInstance = axios.create({
        baseURL: KEY.API_URL,
        withCredentials: true // 필수!
    });
    ```

2.  **Access Token 저장**:
    기존처럼 메모리(React State) 또는 `localStorage`에 저장하여 API 호출 시 `Authorization` 헤더에 사용합니다. (Access Token은 탈취되어도 수명이 짧으므로 상대적으로 안전)

3.  **Refresh Token 처리**:
    프론트엔드 코드에서 Refresh Token을 **절대로** 직접 다루지 않습니다. (저장할 필요도, 읽을 필요도 없음). 서버가 알아서 쿠키로 심어주고, 가져갑니다.

4.  **401 에러 처리 (Interceptor)**:
    API 호출 중 `401 Unauthorized`가 발생하면, `POST /api/auth/token/refresh`를 시도하고, 성공 시 재시도, 실패 시 로그인 페이지로 이동시킵니다.
