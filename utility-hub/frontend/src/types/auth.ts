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
