# 프론트엔드 인증 모듈 리팩토링 완료 보고서

> **작성자**: Claude (Refiner & Editor)
> **작성일**: 2026-02-04
> **버전**: v1.2

---

## 1. 개요

프론트엔드 인증 관련 12개 파일에 대한 코드 품질 개선, 타입 안전성 강화, 로그인 UX 개선 작업을 완료했습니다.

---

## 2. 수정된 파일 목록

| 파일 | 경로 | 주요 개선 |
|------|------|----------|
| auth.ts | `src/types/auth.ts` | 에러 타입 추가 |
| useAuth.ts | `src/hooks/useAuth.ts` | 오타 수정, 유틸 훅 추가 |
| axiosInstance.ts | `src/api/axiosInstance.ts` | 타입 안전성 강화 |
| ProtectedRoute.tsx | `src/components/auth/ProtectedRoute.tsx` | Role 기반 권한 추가 |
| AuthContext.tsx | `src/context/AuthContext.tsx` | 에러 상태 관리 추가 |
| LoginPage.tsx | `src/pages/LoginPage.tsx` | 타입 개선, 에러 UI, **이전 경로 저장** |
| AuthCallbackPage.tsx | `src/pages/AuthCallbackPage.tsx` | tokenStorage 통합, **이전 페이지 복원** |
| tokenStorage.ts | `src/utils/tokenStorage.ts` | 유틸리티 함수 추가 |
| App.tsx | `src/App.tsx` | 마이페이지 라우트 추가 |
| MyPage.tsx | `src/pages/MyPage.tsx` | 라이트/다크 모드 대응 |
| **Header.tsx** | `src/layouts/Header.tsx` | **로그인 시 현재 위치 전달** |
| **TarotLayout.tsx** | `src/layouts/TarotLayout.tsx` | **로그인 버튼 추가, 현재 위치 전달** |

---

## 3. 상세 변경 내역

### 3.1 auth.ts - 에러 타입 추가

```typescript
// 추가된 타입
export interface AuthError {
      code: AuthErrorCode;
      message: string;
      timestamp?: number;
}

export type AuthErrorCode =
      | 'INVALID_TOKEN'
      | 'TOKEN_EXPIRED'
      | 'REFRESH_FAILED'
      | 'SESSION_RESTORE_FAILED'
      | 'NETWORK_ERROR'
      | 'UNAUTHORIZED'
      | 'UNKNOWN';

export interface LocationState {
      from?: { pathname: string; };
}
```

### 3.2 useAuth.ts - 오타 수정 및 유틸 훅 추가

**변경 전:**
```typescript
throw new Error('useAuth는 AuthProvider 안환에서만 사용할 수 있습니다.');
```

**변경 후:**
```typescript
throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
```

**추가된 훅:**
```typescript
export const useAuthStatus = () => {
      // isAdmin, hasRole, nickname, provider 등 편의 속성 제공
};
```

### 3.3 axiosInstance.ts - 타입 안전성 강화

**변경 전:**
```typescript
let failedQueue: any[] = [];
const processQueue = (error: any, token: string | null = null) => { ... }
```

**변경 후:**
```typescript
interface QueueItem {
      resolve: (token: string) => void;
      reject: (error: unknown) => void;
}
let failedQueue: QueueItem[] = [];
const processQueue = (error: unknown, token: string | null = null) => { ... }
```

### 3.4 ProtectedRoute.tsx - Role 기반 권한 검증

```typescript
interface ProtectedRouteProps {
      allowedRoles?: UserRole[];  // 추가
}

// Role 기반 권한 검증 로직 추가
if (allowedRoles && allowedRoles.length > 0 && user) {
      const hasRequiredRole = allowedRoles.includes(user.role);
      if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" state={{ from: location }} replace />;
      }
}
```

**사용 예시:**
```tsx
// 관리자만 접근 가능
<Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
      <Route path="/admin" element={<AdminPage />} />
</Route>
```

### 3.5 AuthContext.tsx - 에러 상태 관리

```typescript
interface AuthContextType extends AuthState {
      error: AuthError | null;      // 추가
      clearError: () => void;       // 추가
      // ...기존 메서드
}

// AxiosError를 AuthError로 매핑하는 헬퍼 함수 추가
const mapErrorToAuthError = (error: unknown): AuthError => { ... }
```

### 3.6 LoginPage.tsx - 타입 개선 및 에러 UI

**변경 전:**
```typescript
const from = (location.state as any)?.from?.pathname || '/';
```

**변경 후:**
```typescript
const state = location.state as LocationState | null;
const from = state?.from?.pathname || '/';

// 에러 UI 표시
{error && (
      <div className="mb-6 p-4 bg-red-500/10 ...">
            {error.message}
      </div>
)}
```

### 3.7 AuthCallbackPage.tsx - tokenStorage 통합

**변경 전:**
```typescript
localStorage.setItem('lm_access_token', accessToken);
localStorage.setItem('lm_refresh_token', refreshToken);
```

**변경 후:**
```typescript
import { setTokens } from '../utils/tokenStorage';

setTokens(accessToken, refreshToken);
window.history.replaceState({}, document.title, location.pathname); // URL에서 토큰 제거
```

### 3.8 tokenStorage.ts - 유틸리티 함수 추가

```typescript
// 새로 추가된 함수들
export const hasTokens = (): boolean => { ... }
export const decodeTokenPayload = <T>(token: string): T | null => { ... }
export const isTokenExpired = (token: string): boolean => { ... }
```

### 3.9 App.tsx - 마이페이지 라우트 추가 (신규)

**문제**: Header에서 `/mypage` 링크가 있었으나 라우트 미등록으로 홈으로 리다이렉트됨

**해결**:
```tsx
import MyPage from './pages/MyPage';

// MainLayout 내부에 추가
<Route element={<ProtectedRoute />}>
      <Route path="mypage" element={<MyPage />} />
</Route>
```

### 3.10 MyPage.tsx - 라이트/다크 모드 대응 (신규)

**문제**: 다크 모드 전용 스타일로 작성되어 라이트 모드에서 텍스트 미표시

**변경 전:**
```tsx
<div className="bg-white/5 ...">
      <h2 className="text-white ...">마이페이지</h2>
      <p className="text-white">{user.nickname}</p>
</div>
```

**변경 후:**
```tsx
<div className="bg-white dark:bg-gray-800/50 border-gray-200 dark:border-white/10 ...">
      <h2 className="text-gray-900 dark:text-white ...">마이페이지</h2>
      <p className="text-gray-900 dark:text-white">{user.nickname}</p>
</div>
```

**적용된 클래스 변경:**
| 요소 | Before | After |
|------|--------|-------|
| 카드 배경 | `bg-white/5` | `bg-white dark:bg-gray-800/50` |
| 카드 테두리 | `border-white/10` | `border-gray-200 dark:border-white/10` |
| 제목/내용 텍스트 | `text-white` | `text-gray-900 dark:text-white` |
| 라벨 텍스트 | `text-slate-400` | `text-gray-500 dark:text-slate-400` |
| 내부 박스 배경 | `bg-white/5` | `bg-gray-100 dark:bg-white/5` |

---

## 4. 빌드 검증

```bash
$ npm run build
✓ 322 modules transformed.
✓ built in 4.03s
```

빌드 성공 확인.

---

## 5. 미완료 항목 (백엔드 협업 필요)

### HttpOnly 쿠키 전환

현재 localStorage에 토큰을 저장하는 방식은 XSS 공격에 취약합니다.

**완전한 HttpOnly 쿠키 구현을 위해 필요한 백엔드 변경:**

1. **OAuth2SuccessHandler 수정**
   - URL 파라미터 대신 `Set-Cookie` 헤더로 토큰 전달
   ```java
   response.addCookie(createHttpOnlyCookie("access_token", accessToken));
   response.addCookie(createHttpOnlyCookie("refresh_token", refreshToken));
   ```

2. **프론트엔드 axios 설정**
   ```typescript
   axios.defaults.withCredentials = true;
   ```

3. **CORS 설정**
   ```java
   configuration.setAllowCredentials(true);
   // allowedOriginPatterns에서 "*" 사용 불가, 명시적 도메인 필요
   ```

---

## 6. 로그인 후 이전 페이지 복원 기능 (신규)

OAuth2 로그인 후 사용자가 원래 있던 페이지로 돌아오는 기능을 구현했습니다.

### 6.1 문제점

OAuth2 플로우에서 외부 사이트(네이버/구글)로 이동하면 React Router의 `location.state`가 유실됨.

### 6.2 해결 방안: sessionStorage 활용

```
[플로우]
1. 도구 페이지에서 로그인 버튼 클릭
2. Header/TarotLayout → LoginPage로 이동 (state: { from: location })
3. LoginPage에서 sessionStorage에 경로 저장
4. OAuth 인증 (외부 사이트 이동)
5. AuthCallbackPage에서 sessionStorage 읽기 → 해당 페이지로 이동
```

### 6.3 수정 파일

**Header.tsx** - 로그인 링크에 현재 위치 전달
```tsx
<Link to="/login" state={{ from: location }}>
```

**TarotLayout.tsx** - 타로 페이지 전용 로그인 버튼 추가
```tsx
<Link to="/login" state={{ from: location }}>
```

**LoginPage.tsx** - sessionStorage에 경로 저장
```tsx
const handleSocialLogin = (provider: SocialProvider) => {
    sessionStorage.setItem('oauth_redirect_path', from);
    window.location.href = `/api/oauth2/authorization/${provider}`;
};
```

**AuthCallbackPage.tsx** - sessionStorage에서 읽기 + 보안 검증
```tsx
const isProcessed = useRef(false);

useEffect(() => {
    if (isProcessed.current) return;  // 중복 실행 방지
    isProcessed.current = true;

    const savedPath = sessionStorage.getItem('oauth_redirect_path');
    sessionStorage.removeItem('oauth_redirect_path');

    // Open Redirect 방지
    const isInternalPath = (path: string): boolean => {
        return path.startsWith('/') && !path.startsWith('//');
    };

    const redirectTo = savedPath && isInternalPath(savedPath) ? savedPath : '/';
    navigate(redirectTo, { replace: true });
}, []);
```

### 6.4 보안 고려사항

| 위험 | 대응 |
|------|------|
| Open Redirect | `isInternalPath()` 검증 함수로 내부 경로만 허용 |
| 중복 실행 | `useRef`로 React.StrictMode 중복 실행 방지 |

---

## 7. 파일 구조

```
frontend/src/
├── api/
│   └── axiosInstance.ts      ← 타입 안전성 강화
├── components/auth/
│   └── ProtectedRoute.tsx    ← Role 기반 권한 추가
├── context/
│   └── AuthContext.tsx       ← 에러 상태 관리 추가
├── hooks/
│   └── useAuth.ts            ← 오타 수정, useAuthStatus 추가
├── layouts/
│   ├── Header.tsx            ← 로그인 시 현재 위치 전달 (신규)
│   └── TarotLayout.tsx       ← 로그인 버튼, 현재 위치 전달 (신규)
├── pages/
│   ├── AuthCallbackPage.tsx  ← 이전 페이지 복원, 중복 실행 방지
│   ├── LoginPage.tsx         ← 타입 개선, 에러 UI, 경로 저장
│   └── MyPage.tsx            ← 라이트/다크 모드 대응
├── types/
│   └── auth.ts               ← 에러 타입 추가
├── utils/
│   └── tokenStorage.ts       ← 유틸리티 함수 추가
└── App.tsx                   ← 마이페이지 라우트, phone-cost 공개
```

---

*작성자: Claude (Refiner & Editor)*
*최종 업데이트: 2026-02-04*
