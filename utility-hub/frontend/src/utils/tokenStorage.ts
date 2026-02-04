/**
 * JWT 토큰 관리를 위한 유틸리티
 *
 * 현재: localStorage 기반 (XSS 취약)
 * TODO: 백엔드와 협업하여 HttpOnly 쿠키 방식으로 전환 필요
 *   - 백엔드: Set-Cookie 헤더로 토큰 전달
 *   - 프론트: withCredentials: true 설정
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

/**
 * 토큰 존재 여부 확인
 */
export const hasTokens = (): boolean => {
      return !!getAccessToken() && !!getRefreshToken();
};

/**
 * JWT 페이로드 디코딩 (검증 없이 디코딩만)
 * 주의: 서버에서 검증된 토큰에만 사용
 */
export const decodeTokenPayload = <T = Record<string, unknown>>(token: string): T | null => {
      try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                  atob(base64)
                        .split('')
                        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                        .join('')
            );
            return JSON.parse(jsonPayload) as T;
      } catch {
            return null;
      }
};

/**
 * 토큰 만료 여부 확인 (클라이언트 측 사전 체크)
 */
export const isTokenExpired = (token: string): boolean => {
      const payload = decodeTokenPayload<{ exp?: number }>(token);
      if (!payload?.exp) return true;
      return Date.now() >= payload.exp * 1000;
};
