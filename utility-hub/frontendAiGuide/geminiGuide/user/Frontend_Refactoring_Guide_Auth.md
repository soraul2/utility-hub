# 프론트엔드 인증(Auth) 리팩토링 가이드 - Gemini Team

본 가이드는 백엔드의 보안 강화 조치(HttpOnly Cookie 도입, Refresh Token DB 저장)에 맞춰, 프론트엔드(`React`) 코드를 어떻게 수정해야 하는지 설명합니다.

## 🎯 목표 (Goal)
'보안이 취약한 localStorage 저장 방식'에서 **'브라우저가 자동으로 관리하는 HttpOnly Cookie 방식'**으로 전환하여 XSS 공격으로부터 Refresh Token을 완벽하게 보호합니다.

---

## 📊 변경 전후 비교 (Before vs After)

| 항목 | 기존 (AS-IS) | 변경 후 (TO-BE) |
|------|-------------|-----------------|
| **Refresh Token 위치** | URL 파라미터 -> `localStorage` | **HttpOnly Cookie** (JavaScript 접근 불가) |
| **로그인 콜백** | URL에서 `refreshToken` 추출 파싱 | URL에 `refreshToken` 없음 (쿠키로 자동 설정됨) |
| **토큰 갱신 요청** | `POST body { refreshToken: ... }` | `POST body` 비움 + **Cookie 자동 전송** |
| **로그아웃** | `localStorage.clear()` (클라이언트만) | **`POST /api/auth/logout`** (서버 DB 삭제 + 쿠키 삭제) |

---

## 🛠️ 단계별 구현 가이드 (Step-by-Step Implementation)

### 1단계: Axios 설정 변경 (`src/api/axiosInstance.ts`)
쿠키를 주고받기 위해서는 `withCredentials: true` 설정이 필수입니다.

```typescript
// 변경 전
const axiosInstance: AxiosInstance = axios.create({
      baseURL: '/api',
      headers: { 'Content-Type': 'application/json' },
});

// 변경 후 [User]
const axiosInstance: AxiosInstance = axios.create({
      baseURL: '/api',
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true, // ✅ 핵심: 쿠키 송수신 허용
});
```

### 2단계: 토큰 스토리지 수정 (`src/utils/tokenStorage.ts`)
Refresh Token은 이제 브라우저 쿠키 영역에 있으므로, 클라이언트 코드에서 직접 다룰 필요가 없습니다.

```typescript
// [DELETE] getRefreshToken, setRefreshToken 관련 코드 삭제 또는 미사용 처리
// Access Token은 여전히 메모리나 localStorage에 유지할 수 있습니다 (API 통신용).

export const setTokens = (accessToken: string, refreshToken: string): void => {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      // localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken); // ❌ 삭제: 쿠키로 대체됨
};

export const getRefreshToken = (): string | null => {
      return null; // ❌ 더 이상 클라이언트가 직접 읽을 수 없음
};
```

### 3단계: 로그인 콜백 수정 (`src/pages/AuthCallbackPage.tsx`)
백엔드는 이제 리다이렉트 URL 쿼리 파라미터로 `accessToken`만 전달합니다. `refreshToken`을 찾으려 하면 에러가 발생하거나 null이 되므로 로직을 수정해야 합니다.

```typescript
// ...
const accessToken = params.get('accessToken');
// const refreshToken = params.get('refreshToken'); // ❌ 제거: URL에 없음

if (accessToken) { // refreshToken 조건 제거
      // setTokens(accessToken, refreshToken); // ❌ 변경 필요
      setTokens(accessToken, ''); // AccessToken만 저장
      
      // ... 이후 로직 동일
}
// ...
```

### 4단계: 토큰 갱신 인터셉터 수정 (`src/api/axiosInstance.ts`)
401 에러 발생 시 토큰을 갱신하는 로직에서, Body에 토큰을 실어 보낼 필요가 없습니다.

```typescript
// ... response interceptor 내부 ...

// 변경 전
const response = await axios.post<TokenResponse>('/api/auth/token/refresh', {
      refreshToken: refreshToken, // Body 전송
});

// 변경 후 [User]
// Body 없이 요청해도, withCredentials=true 덕분에 'refresh_token' 쿠키가 자동 전송됨
const response = await axios.post<TokenResponse>(
      '/api/auth/token/refresh', 
      {}, // 빈 Body
      { withCredentials: true } // 명시적 설정 (Instance가 아닌 axios 직접 사용 시)
);

// 응답 처리
const { accessToken } = response.data; // refreshToken은 응답 Body에 없을 수 있음 (Set-Cookie로 옴)
setTokens(accessToken, ''); // Access Token 갱신
// ...
```

### 5단계: 로그아웃 로직 수정 (`src/context/AuthContext.tsx`)
단순히 로컬 스토리지를 비우는 것만으로는 쿠키가 삭제되지 않습니다. 서버에 로그아웃 요청을 보내야 합니다.

```typescript
const logout = useCallback(async () => {
      try {
            // 서버에 로그아웃 요청 (쿠키 삭제 및 DB 토큰 삭제)
            await axiosInstance.post('/auth/logout'); 
      } catch (e) {
            console.error('로그아웃 요청 실패 (무시됨)', e);
      } finally {
            clearTokens(); // 클라이언트 Access Token 삭제
            // 상태 초기화
            setState({ ... });
      }
}, []);
```

---

## ⚠️ 주의사항 (Checklist)
1.  **CORS 설정**: 개발 환경(localhost:3000 -> localhost:8080)에서 쿠키를 주고받으려면 백엔드 CORS 설정에서 `allowCredentials(true)`와 구체적인 `allowedOrigins`가 설정되어 있어야 합니다. (백엔드 팀 확인 완료)
2.  **HTTPS**: `Secure` 쿠키는 HTTPS(또는 localhost)에서만 동작합니다. 배포 환경에서는 반드시 HTTPS를 적용해야 합니다.
3.  **Proxy**: Vite Proxy 설정(`vite.config.ts`)을 사용하는 경우, 프록시가 `set-cookie` 헤더를 잘 전달하는지 확인해야 합니다. (일반적으로 기본 설정으로 동작함)

작성자: **Gemini Team (Antigravity)**
작성일: 2026.02.06
