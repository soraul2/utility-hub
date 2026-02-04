import React, { createContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, AuthUser } from '../types/auth';
import { getAccessToken, clearTokens, setTokens } from '../utils/tokenStorage';
import axiosInstance from '../api/axiosInstance';

/**
 * 인증 관련 상태와 메서드를 제공하는 컨텍스트
 */
interface AuthContextType extends AuthState {
      login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
      logout: () => void;
      restoreSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
      children: ReactNode;
}

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

      /**
       * 로그인 처리 (토큰 저장 및 상태 업데이트)
       */
      const login = (accessToken: string, refreshToken: string, user: AuthUser) => {
            setTokens(accessToken, refreshToken);
            setState({
                  isAuthenticated: true,
                  isLoading: false,
                  user,
                  accessToken,
            });
      };

      /**
       * 로그아웃 처리 (토큰 삭제 및 상태 초기화)
       */
      const logout = () => {
            clearTokens();
            setState({
                  isAuthenticated: false,
                  isLoading: false,
                  user: null,
                  accessToken: null,
            });
      };

      /**
       * 저장된 토큰을 바탕으로 사용자 세션 복원
       */
      const restoreSession = async () => {
            const token = getAccessToken();

            if (!token) {
                  setState(prev => ({ ...prev, isLoading: false }));
                  return;
            }

            try {
                  // /api/user/me 호출하여 사용자 정보 확인
                  const response = await axiosInstance.get<AuthUser>('/user/me');
                  setState({
                        isAuthenticated: true,
                        isLoading: false,
                        user: response.data,
                        accessToken: token,
                  });
            } catch (error) {
                  // 세션 복원 실패 (만료 등) 시 로그아웃 처리
                  console.error('세션 복원 실패:', error);
                  logout();
            }
      };

      /**
       * 컴포넌트 최초 마운트 시 세션 복원 시도
       */
      useEffect(() => {
            restoreSession();
      }, []);

      const value = useMemo(() => ({
            ...state,
            login,
            logout,
            restoreSession,
      }), [state]);

      return (
            <AuthContext.Provider value={value}>
                  {children}
            </AuthContext.Provider>
      );
};
