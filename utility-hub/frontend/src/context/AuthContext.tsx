import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, AuthUser, AuthError, AuthErrorCode } from '../types/auth';
import { getAccessToken, clearTokens, setTokens } from '../utils/tokenStorage';
import axiosInstance from '../api/axiosInstance';
import { AxiosError } from 'axios';

/**
 * 인증 관련 상태와 메서드를 제공하는 컨텍스트
 */
interface AuthContextType extends AuthState {
      error: AuthError | null;
      login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
      logout: () => void;
      withdraw: () => Promise<void>;
      restoreSession: () => Promise<void>;
      clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
      children: ReactNode;
}

/**
 * 에러 코드 매핑 헬퍼
 */
const mapErrorToAuthError = (error: unknown): AuthError => {
      if (error instanceof AxiosError) {
            const status = error.response?.status;
            let code: AuthErrorCode = 'UNKNOWN';
            let message = '알 수 없는 오류가 발생했습니다.';

            if (!error.response) {
                  code = 'NETWORK_ERROR';
                  message = '네트워크 연결을 확인해 주세요.';
            } else if (status === 401) {
                  code = 'UNAUTHORIZED';
                  message = '인증이 필요합니다.';
            } else if (status === 403) {
                  code = 'INVALID_TOKEN';
                  message = '유효하지 않은 토큰입니다.';
            }

            return { code, message, timestamp: Date.now() };
      }

      return {
            code: 'UNKNOWN',
            message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
            timestamp: Date.now(),
      };
};

/**
 * 인증 컨텍스트 프로바이더 컴포넌트
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
      const [state, setState] = useState<AuthState>({
            isAuthenticated: false,
            isLoading: true,
            user: null,
            accessToken: null,
      });
      const [error, setError] = useState<AuthError | null>(null);

      /**
       * 에러 상태 초기화
       */
      const clearError = useCallback(() => {
            setError(null);
      }, []);

      /**
       * 로그인 처리 (토큰 저장 및 상태 업데이트)
       */
      const login = useCallback((accessToken: string, _refreshToken: string, user: AuthUser) => {
            setTokens(accessToken, '');
            setError(null);
            setState({
                  isAuthenticated: true,
                  isLoading: false,
                  user,
                  accessToken,
            });
      }, []);

      /**
       * 로그아웃 처리 (서버 로그아웃 호출 및 토큰 삭제)
       */
      const logout = useCallback(async () => {
            try {
                  // 서버에 로그아웃 요청 (쿠키 삭제 및 DB 토큰 삭제)
                  await axiosInstance.post('/auth/logout');
            } catch (e) {
                  console.error('로그아웃 요청 실패 (무시됨)', e);
            } finally {
                  clearTokens();
                  setError(null);
                  setState({
                        isAuthenticated: false,
                        isLoading: false,
                        user: null,
                        accessToken: null,
                  });
            }
      }, []);

      /**
       * 회원 탈퇴 처리 (백엔드 요청 후 세션 초기화)
       */
      const withdraw = useCallback(async () => {
            try {
                  await axiosInstance.delete('/user/me');
                  logout();
            } catch (err) {
                  console.error('회원 탈퇴 실패:', err);
                  const authError = mapErrorToAuthError(err);
                  setError(authError);
                  throw err;
            }
      }, [logout]);

      /**
       * 저장된 토큰을 바탕으로 사용자 세션 복원
       */
      const restoreSession = useCallback(async () => {
            const token = getAccessToken();

            if (!token) {
                  setState((prev) => ({ ...prev, isLoading: false }));
                  return;
            }

            try {
                  const response = await axiosInstance.get<AuthUser>('/user/me');
                  setError(null);
                  setState({
                        isAuthenticated: true,
                        isLoading: false,
                        user: response.data,
                        accessToken: token,
                  });
            } catch (err) {
                  console.error('세션 복원 실패:', err);
                  const authError = mapErrorToAuthError(err);
                  authError.code = 'SESSION_RESTORE_FAILED';
                  authError.message = '세션 복원에 실패했습니다. 다시 로그인해 주세요.';
                  setError(authError);
                  logout();
            }
      }, [logout]);

      /**
       * 컴포넌트 최초 마운트 시 세션 복원 시도
       */
      useEffect(() => {
            restoreSession();
      }, [restoreSession]);

      const value = useMemo(
            () => ({
                  ...state,
                  error,
                  login,
                  logout,
                  withdraw,
                  restoreSession,
                  clearError,
            }),
            [state, error, login, logout, withdraw, restoreSession, clearError]
      );

      return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
