# OAuth2+JWT 인증 API 명세서

## 목차
1. [개요](#개요)
2. [엔드포인트](#엔드포인트)
3. [요청/응답 스키마](#요청응답-스키마)
4. [오류 코드](#오류-코드)
5. [예제](#예제)

---

## 개요

### 기본 정보
- **Base URL**: `http://localhost:8080` (개발) / `https://api.yourdomain.com` (운영)
- **Protocol**: HTTP/HTTPS
- **Content-Type**: `application/json`
- **인증**: JWT Bearer Token

### 토큰 포맷
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0...
```

### 토큰 유효 기간
- **Access Token**: 1시간
- **Refresh Token**: 14일

---

## 엔드포인트

### 1. OAuth2 로그인 시작

#### POST /oauth2/authorization/{provider}

OAuth2 로그인 흐름을 시작합니다.

**경로 파라미터**:
| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| provider | string | ✅ | OAuth2 제공자 (`naver`, `google`) |

**요청 예**:
```bash
POST /oauth2/authorization/naver
```

**응답**:
- HTTP 302 Redirect
- Location: `https://nid.naver.com/oauth2.0/authorize?...`

**설명**:
- 사용자를 OAuth2 제공자의 인증 페이지로 리다이렉트
- 사용자 인증 및 동의 후 콜백 URL로 복귀
- 콜백 URL: `oauth2.frontend-callback-url` 설정값

---

### 2. 사용자 정보 조회

#### GET /api/user/me

인증된 사용자의 정보를 조회합니다.

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**응답 (200 OK)**:
```json
{
  "id": 1,
  "email": "user@naver.com",
  "nickname": "사용자명",
  "provider": "NAVER",
  "role": "ROLE_USER"
}
```

**응답 필드**:
| 필드 | 타입 | 설명 |
|------|------|------|
| id | number | 사용자 고유 ID |
| email | string | 사용자 이메일 |
| nickname | string | 사용자 닉네임 |
| provider | string | OAuth2 제공자 (NAVER, GOOGLE) |
| role | string | 사용자 권한 (ROLE_USER, ROLE_ADMIN) |

**오류 응답**:
| 상태 | 설명 |
|------|------|
| 401 | 인증되지 않음 (토큰 없음 또는 유효하지 않음) |
| 404 | 사용자를 찾을 수 없음 |

**예**:
```bash
curl -H "Authorization: Bearer {accessToken}" \
     http://localhost:8080/api/user/me
```

---

### 3. 토큰 갱신

#### POST /api/auth/token/refresh

만료된 Access Token을 갱신합니다.

**요청 본문**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**요청 필드**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| refreshToken | string | ✅ | Refresh Token 값 |

**응답 (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

**응답 필드**:
| 필드 | 타입 | 설명 |
|------|------|------|
| accessToken | string | 새로운 Access Token |
| refreshToken | string | 새로운 Refresh Token |
| tokenType | string | 토큰 타입 (항상 "Bearer") |
| expiresIn | number | Access Token 만료 시간 (초 단위) |

**오류 응답**:
| 상태 | 오류 코드 | 설명 |
|------|---------|------|
| 400 | INVALID_REFRESH_TOKEN | Refresh Token 형식 오류 |
| 401 | EXPIRED_REFRESH_TOKEN | Refresh Token 만료됨 |
| 401 | INVALID_SIGNATURE | 토큰 서명 검증 실패 |

     -d '{"refreshToken":"eyJ..."}'
```

---

### 4. 회원 탈퇴 (Account Withdrawal)

#### DELETE /api/user/me

현재 인증된 사용자의 계정을 삭제하고 모든 정보를 폐기합니다.

**요청 헤더**:
```
Authorization: Bearer {accessToken}
```

**응답 (204 No Content)**:
- 성공적으로 탈퇴 처리됨. 응답 본문 없음.

**오류 응답**:
| 상태 | 오류 코드 | 설명 |
|------|---------|------|
| 401 | AUTH_UNAUTHORIZED | 인증 정보 없음 또는 유효하지 않은 토큰 |

**예**:
```bash
curl -X DELETE http://localhost:8080/api/user/me \
     -H "Authorization: Bearer {accessToken}"
```

---

## 요청/응답 스키마

### AuthDto.TokenRefreshRequest
```json
{
  "refreshToken": "string"
}
```

### AuthDto.TokenResponse
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "tokenType": "string",
  "expiresIn": "number"
}
```

### AuthDto.UserResponse
```json
{
  "id": "number",
  "email": "string",
  "nickname": "string",
  "provider": "string",
  "role": "string"
}
```

### ErrorResponse
```json
{
  "status": "number",
  "errorCode": "string",
  "message": "string",
  "timestamp": "string (ISO 8601)"
}
```

---

## 오류 코드

### 인증 관련
| 코드 | HTTP | 설명 |
|------|------|------|
| AUTH_UNAUTHORIZED | 401 | 인증 정보 없음 |
| INVALID_TOKEN | 401 | 토큰 형식 오류 |
| EXPIRED_TOKEN | 401 | 토큰 만료됨 |
| INVALID_SIGNATURE | 401 | 토큰 서명 검증 실패 |

### OAuth2 관련
| 코드 | HTTP | 설명 |
|------|------|------|
| OAUTH2_AUTHENTICATION_FAILURE | 401 | OAuth2 인증 실패 |
| INVALID_PROVIDER | 400 | 지원하지 않는 제공자 |
| MISSING_PROVIDER_ID | 400 | 제공자 ID 누락 |

### 사용자 관련
| 코드 | HTTP | 설명 |
|------|------|------|
| USER_NOT_FOUND | 404 | 사용자를 찾을 수 없음 |
| DUPLICATE_USER | 409 | 중복된 사용자 |

### 일반 오류
| 코드 | HTTP | 설명 |
|------|------|------|
| INTERNAL_SERVER_ERROR | 500 | 서버 내부 오류 |
| INVALID_REQUEST | 400 | 요청 형식 오류 |

---

## 예제

### 예제 1: 네이버 OAuth2 로그인 흐름

#### Step 1: 로그인 시작
```bash
curl -X GET http://localhost:8080/oauth2/authorization/naver
```

**응답**:
```
HTTP/1.1 302 Found
Location: https://nid.naver.com/oauth2.0/authorize?client_id=...&redirect_uri=...&state=...
```

#### Step 2: 사용자 인증 및 동의
- 사용자가 네이버 로그인 페이지에서 인증
- 앱 접근 권한 동의
- 서버로 콜백 (`http://localhost:3000/auth/callback?accessToken=...&refreshToken=...`)

#### Step 3: 사용자 정보 조회
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:8080/api/user/me
```

**응답**:
```json
HTTP/1.1 200 OK
{
  "id": 1,
  "email": "user@naver.com",
  "nickname": "naverId",
  "provider": "NAVER",
  "role": "ROLE_USER"
}
```

---

### 예제 2: 토큰 갱신

#### Access Token 만료 시
```bash
curl -X POST http://localhost:8080/api/auth/token/refresh \
     -H "Content-Type: application/json" \
     -d '{
       "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjA0NDM0MzAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
     }'
```

**응답**:
```json
HTTP/1.1 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

---

### 예제 3: 오류 처리

#### 인증되지 않은 요청
```bash
curl -X GET http://localhost:8080/api/user/me
```

**응답**:
```json
HTTP/1.1 401 Unauthorized
{
  "status": 401,
  "errorCode": "AUTH_UNAUTHORIZED",
  "message": "인증 정보가 없습니다",
  "timestamp": "2026-02-04T10:30:00Z"
}
```

#### 만료된 토큰
```bash
curl -H "Authorization: Bearer expired_token..." \
     http://localhost:8080/api/user/me
```

**응답**:
```json
HTTP/1.1 401 Unauthorized
{
  "status": 401,
  "errorCode": "EXPIRED_TOKEN",
  "message": "토큰이 만료되었습니다",
  "timestamp": "2026-02-04T10:30:00Z"
}
```

---

### 예제 4: JavaScript/Fetch API 사용

#### 로그인 후 토큰 저장
```javascript
// OAuth2 콜백에서 URL 파라미터 추출
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('accessToken');
const refreshToken = urlParams.get('refreshToken');

// localStorage에 저장
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

#### API 호출
```javascript
const response = await fetch('http://localhost:8080/api/user/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});

const user = await response.json();
console.log(user);
```

#### 토큰 갱신
```javascript
const refreshResponse = await fetch('http://localhost:8080/api/auth/token/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});

const { accessToken, refreshToken } = await refreshResponse.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

---

### 예제 5: React 훅을 이용한 인증

```typescript
// useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401) {
          // 토큰 갱신 시도
          await refreshToken();
        }
      } catch (error) {
        console.error('사용자 정보 조회 실패', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch('/api/auth/token/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    const { accessToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
  };

  return { user, loading, refreshToken };
};
```

---

## 주의사항

1. **토큰 저장**: localStorage는 XSS 공격에 취약하므로 프로덕션에서는 HttpOnly 쿠키 사용 고려
2. **토큰 갱신**: Access Token 만료 시 자동으로 갱신 구현 필요
3. **CORS**: 프론트엔드 도메인을 `cors.allowed-origins`에 추가 필요
4. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
5. **Rate Limiting**: API 엔드포인트에 Rate Limiting 적용 권장

---

## 호환성

- **클라이언트**: REST API 지원하는 모든 클라이언트 (웹, 모바일, 데스크톱)
- **SDK**: Spring Boot Client 사용 권장
- **브라우저**: ES6 이상 지원 브라우저
