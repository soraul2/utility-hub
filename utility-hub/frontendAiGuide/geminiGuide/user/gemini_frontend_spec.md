# 제미나이 프론트엔드 인증 기술 명세서 (`gemini_frontend_spec.md`)

이 문서는 프론트엔드 인증 시스템 구현에 필요한 기술적 세부 명세와 데이터 모델을 정의합니다.

## 1. 데이터 모델 (TypeScript)

### 1.1 인증 사용자 (`AuthUser`)
```typescript
export type AuthProvider = 'NAVER' | 'GOOGLE';
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

export interface AuthUser {
  id: number;
  email: string | null;
  nickname: string;
  provider: AuthProvider;
  role: UserRole;
}
```

### 1.2 인증 상태 (`AuthState`)
```typescript
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  accessToken: string | null;
}
```

## 2. API 연동 명세

### 2.1 토큰 재발급 (Refresh)
- **Endpoint**: `POST /api/auth/token/refresh`
- **Request Body**: `{ "refreshToken": "string" }`
- **Response**: `AuthDto.TokenResponse` (accessToken, refreshToken 포함)

### 2.2 내 정보 조회
- **Endpoint**: `GET /api/user/me`
- **Header**: `Authorization: Bearer {accessToken}`
- **Success**: `AuthUser` 데이터 반환

## 3. 에러 처리 가이드

인증 관련 에러는 다음 코드를 기반으로 사용자에게 알림을 제공합니다.

| 에러 코드 | 의미 | 프론트엔드 대응 |
| :--- | :--- | :--- |
| `AUTH_UNAUTHORIZED` | 인증 정보 없음 | 로그인 페이지로 이동 |
| `EXPIRED_TOKEN` | 액세스 토큰 만료 | 자동 갱신(Refresh) 시도 |
| `INVALID_TOKEN` | 유효하지 않은 토큰 | 세션 초기화 및 로그인 이동 |
| `OAUTH2_FAILED` | 소셜 로그인 실패 | 로그인 실패 메시지 출력 |

## 4. 컴포넌트 사용 가이드

### 4.1 로그인 보호 (`ProtectedRoute`)
로그인이 필요한 페이지 라우트를 이 컴포넌트로 감싸 관리합니다.
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/mypage" element={<MyPage />} />
</Route>
```

### 4.2 인증 훅 (`useAuth`)
전역 어디서든 사용자 정보와 로그인 상태를 가져옵니다.
```tsx
const { user, isAuthenticated, logout } = useAuth();
```

---
본 명세는 개발 진행 과정에서 업데이트될 수 있으며, 모든 구현은 이 명세를 기준으로 수행됩니다.
