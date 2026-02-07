export type AuthProvider = 'NAVER' | 'GOOGLE';
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';

/**
 * 인증된 사용자 정보 인터페이스
 */
export interface AuthUser {
      id: number;
      email: string | null;
      nickname: string;
      provider: AuthProvider;
      role: UserRole;
      activeThemeKey: string | null;
      onboardingCompleted: boolean;
}

/**
 * 인증 상태 인터페이스
 */
export interface AuthState {
      isAuthenticated: boolean;
      isLoading: boolean;
      user: AuthUser | null;
      accessToken: string | null;
}

/**
 * 토큰 응답 인터페이스
 */
export interface TokenResponse {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      expiresIn: number;
}

/**
 * 인증 에러 인터페이스
 */
export interface AuthError {
      code: AuthErrorCode;
      message: string;
      timestamp?: number;
}

/**
 * 인증 에러 코드
 */
export type AuthErrorCode =
      | 'INVALID_TOKEN'
      | 'TOKEN_EXPIRED'
      | 'REFRESH_FAILED'
      | 'SESSION_RESTORE_FAILED'
      | 'NETWORK_ERROR'
      | 'UNAUTHORIZED'
      | 'UNKNOWN';

/**
 * 리다이렉트 위치 상태
 */
export interface LocationState {
      from?: {
            pathname: string;
      };
}
