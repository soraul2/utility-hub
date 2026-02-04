/**
 * JWT 토큰 관리를 위한 유틸리티
 * 
 * v1: localStorage를 사용하여 토큰을 저장합니다.
 * 보안 강화를 위해 추후 HttpOnly 쿠키 방식으로 리팩토링 예정입니다.
 */

const ACCESS_TOKEN_KEY = 'lm_access_token';
const REFRESH_TOKEN_KEY = 'lm_refresh_token';

/**
 * 액세스 토큰 및 리프레시 토큰을 저장합니다.
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * 저장된 액세스 토큰을 가져옵니다.
 */
export const getAccessToken = (): string | null => {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * 저장된 리프레시 토큰을 가져옵니다.
 */
export const getRefreshToken = (): string | null => {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * 모든 인증 관련 토큰을 삭제합니다. (로그아웃 시 사용)
 */
export const clearTokens = (): void => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
};
