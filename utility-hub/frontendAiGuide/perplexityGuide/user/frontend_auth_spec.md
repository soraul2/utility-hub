# frontend_auth_spec.md (Auth v1 – Utility Hub)

## 1. 개요

- 기술 스택
  - React CSR
  - React Router (SPA 라우팅)
  - 상태 관리: AuthContext + Reducer (또는 React Query 기반 전역 상태)
  - HTTP: fetch 또는 axios

- 인증 방식
  - Naver / Google 소셜 로그인(OAuth2) + JWT (Access / Refresh)
  - 백엔드 스펙: `design_spec_backend.md`의 Auth v1 기준
    - `POST /api/auth/oauth2/{provider}/login`
    - `POST /api/auth/token/refresh`
    - `GET /api/auth/me`[web:46][web:52]

- 토큰 저장 전략 (v1)
  - `accessToken`: 메모리 + 필요 시 localStorage
  - `refreshToken`: localStorage (v1 간단 구현용, 이후 HttpOnly 쿠키로 리팩터링 예정)[web:45][web:54]
  - key 예시:
    - `lm_access_token`
    - `lm_refresh_token`

---

## 2. 라우팅 & 페이지 구조

### 2.1 주요 라우트

- `/login`
  - Naver/Google 소셜 로그인 버튼 제공
  - 이미 로그인된 상태면 `/` 또는 직전 페이지로 리다이렉트

- `/auth/callback/:provider`
  - OAuth2 인증 후 돌아오는 콜백 페이지
  - URL 쿼리/해시에서 `code` (또는 provider별 토큰) 및 `state` 파싱
  - 백엔드 `POST /api/auth/oauth2/{provider}/login` 호출 후 토큰 저장 및 리다이렉트[web:40][web:41]

- 보호 라우트 예시
  - `/mypage`, `/rules`, `/history` 등
  - 로그인 필요, 미인증 시 `/login`으로 이동

### 2.2 컴포넌트/폴더 구조 예시

```text
src/
  components/
    auth/
      SocialLoginButtons.tsx
  pages/
    LoginPage.tsx
    AuthCallbackPage.tsx
    MyPage.tsx
  routes/
    ProtectedRoute.tsx
  auth/
    AuthContext.tsx
    useAuth.ts
    tokenStorage.ts
3. Auth 도메인 모델 (프론트 기준)
3.1 타입 정의
ts
export type AuthProvider = 'NAVER' | 'GOOGLE';

export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export type AuthUser = {
  id: number;
  email: string | null;
  nickname: string;
  provider: AuthProvider;
  role: UserRole;
  premium: boolean;
  premiumUntil: string | null; // ISO8601 문자열
};

export type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
};

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { accessToken: string; user: AuthUser } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: { user: AuthUser } };
3.2 AuthContext / Hook
AuthContext에서 AuthState와 액션(login, logout, refreshTokenAndRetry 등)을 제공

useAuth() 훅으로 전역 어디서나 접근

4. 로그인 플로우 명세
4.1 소셜 로그인 시작 (로그인 페이지)
UI 요구사항
/login 페이지

Naver 버튼, Google 버튼 각각 배치

버튼 클릭 시 해당 provider로 OAuth2 플로우 시작

간단한 안내 문구:

“로그인을 하면 내 규칙/기록을 안전하게 저장할 수 있어요.”

새로고침해도 동작이 이상하지 않도록 단순한 구조 유지[web:43][web:50]

동작 규칙 (리다이렉트 방식)
버튼 클릭 시:

ts
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

const handleOAuthLogin = (provider: 'naver' | 'google') => {
  window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/${provider}`;
};
백엔드가 /oauth2/authorization/{provider} → provider 로그인 페이지로 리다이렉트 처리[web:41][web:52]

(만약 백엔드에서 authorizationUrl을 내려주는 구조로 바뀌면, GET /api/auth/oauth2/{provider}/url → authorizationUrl로 이동하는 형태로 동일한 레이어에서 처리.)

4.2 콜백 처리 → 백엔드 로그인 API 호출
콜백 페이지 동작 (/auth/callback/:provider)
URL에서 code, state, 에러 여부 파싱 (provider별로 쿼리/해시 차이 있음)[web:40][web:53]

에러/거절 시:

/login으로 리다이렉트하고, “소셜 로그인에 실패했어요. 다시 시도해 주세요.” 메시지 표출

정상 code 수신 시:

백엔드 POST /api/auth/oauth2/{provider}/login 호출

백엔드 요청/응답 계약
Request:

text
POST /api/auth/oauth2/{provider}/login
Content-Type: application/json

{
  "authorizationCode": "string",
  "redirectUri": "https://frontend.app/auth/callback/naver"
}
Response (성공):

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
프론트 처리 규칙
accessToken, refreshToken을 tokenStorage 유틸을 통해 저장

ts
// tokenStorage.ts
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('lm_access_token', accessToken);
  localStorage.setItem('lm_refresh_token', refreshToken);
};

export const getAccessToken = () => localStorage.getItem('lm_access_token');
export const getRefreshToken = () => localStorage.getItem('lm_refresh_token');
export const clearTokens = () => {
  localStorage.removeItem('lm_access_token');
  localStorage.removeItem('lm_refresh_token');
};
AuthContext에 LOGIN_SUCCESS 디스패치

로그인 성공 후:

기본: /로 네비게이션

가능하면 직전 접근 시도 페이지(redirectTo state)로 복귀

5. 인증 상태 복원 & 보호 라우트
5.1 초기 상태 복원 (GET /api/auth/me)
앱 로드 시 / 페이지 새로고침 시:

getAccessToken()으로 토큰 존재 여부 확인

있으면 GET /api/auth/me 호출:

text
GET /api/auth/me
Authorization: Bearer {accessToken}
성공 시:

응답 User로 AuthState.user 채우고 isAuthenticated = true

실패(401/403/토큰 만료 등) 시:

이후 5.2의 토큰 재발급 로직 시도 또는 로그아웃[web:45][web:52]

5.2 토큰 재발급 (Refresh Flow)
보호 API 401 응답 시 처리 규칙:

refreshToken 존재 여부 확인

있으면:

text
POST /api/auth/token/refresh
Content-Type: application/json

{
  "refreshToken": "jwt-refresh-token"
}
성공 시:

새 accessToken (및 필요 시 refreshToken) 저장

원래 실패했던 API를 새 토큰으로 한 번만 재시도

실패 시:

clearTokens(), AuthState 초기화

/login으로 이동[web:45][web:48]

5.3 ProtectedRoute 동작
의사 코드:

tsx
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
/mypage, /rules 등 민감 라우트에서 사용

6. HTTP 클라이언트 규칙 (axios/fetch)
6.1 Authorization 헤더 주입
axios 예시:

ts
axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
6.2 401 응답 처리 (인터셉터)
간단한 패턴:

ts
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (error.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      const newAccessToken = await refreshToken(); // /api/auth/token/refresh 호출
      if (newAccessToken) {
        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalConfig);
      }
    }

    return Promise.reject(error);
  }
);
refreshToken() 실패 시 전역 로그아웃 + /login 이동[web:45][web:52]

7. 에러 처리 & UX 규칙
7.1 공통 에러 포맷 처리
백엔드 에러 응답:

json
{
  "code": "AUTH_003",
  "message": "인증이 필요합니다.",
  "details": null
}
프론트 처리 방침:

code 기반으로 사용자 친화적인 메시지 매핑 테이블 정의

ts
const ERROR_MESSAGE_MAP: Record<string, string> = {
  AUTH_UNSUPPORTED_PROVIDER: '지원하지 않는 로그인 방식입니다.',
  OAUTH2_FAILED: '소셜 로그인에 실패했어요. 다시 시도해 주세요.',
  TOKEN_INVALID: '세션이 유효하지 않습니다. 다시 로그인해 주세요.',
  TOKEN_EXPIRED: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
};
/auth/callback/:provider:

실패 시 /login으로 되돌리면서 상단에 배너/토스트로 메시지 노출

7.2 UX 기본 규칙
로그인/콜백 화면에서는:

로딩 상태 스피너 명확히 보여주기

에러 발생 시 재시도 버튼 제공

로그아웃 시:

토큰 삭제 후 /login으로 이동

“성공적으로 로그아웃되었습니다.” 간단 안내

8. 저장/보안 전략 (v1 전제)
v1 단순 버전:

accessToken, refreshToken 모두 localStorage 사용

운영 단계 진입 전:

refreshToken을 HttpOnly Secure 쿠키로 이전

accessToken을 메모리 + 짧은 수명으로 운영하는 리팩터링 계획 수립[web:48][web:54]

개발자가 반드시 인지해야 할 메모:

localStorage는 XSS에 취약하므로, 추후 보안 강화 스프린트에서 토큰 저장 방식 변경이 예정되어 있음

9. 프론트엔드 구현 체크리스트
 /login 페이지 구현 (Naver/Google 버튼 + 상태 안내)

 /auth/callback/:provider 라우트 및 콜백 처리 로직 구현

 AuthContext + useAuth 훅 구현 (AuthState/Action 포함)

 tokenStorage 유틸 구현 (set/get/clear)

 앱 시작 시 GET /api/auth/me로 로그인 상태 복원 로직 구현

 axios/fetch 인터셉터에 Authorization 헤더 주입

 401 응답 시 refresh 플로우 + 재시도/로그아웃 로직 구현

 ProtectedRoute 적용 (마이페이지 등 민감 라우트 보호)

 에러 코드별 사용자 메시지 매핑 테이블 정의 및 UI 연결

 로그인 실패/만료/로그아웃 UX (배너/토스트/모달 등) 구현