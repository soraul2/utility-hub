import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * 인증 컨텍스트를 편리하게 사용하기 위한 커스텀 훅
 *
 * @returns AuthContext의 상태와 메서드
 * @throws {Error} AuthProvider 외부에서 사용 시 에러 발생
 */
export const useAuth = () => {
      const context = useContext(AuthContext);

      if (context === undefined) {
            throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
      }

      return context;
};

/**
 * 인증 상태 확인 유틸리티 훅
 * 인증 여부와 권한 체크 헬퍼 제공
 */
export const useAuthStatus = () => {
      const { isAuthenticated, isLoading, user, error } = useAuth();

      const status = useMemo(
            () => ({
                  isAuthenticated,
                  isLoading,
                  hasError: !!error,
                  errorCode: error?.code ?? null,

                  /** 특정 역할을 가지고 있는지 확인 */
                  hasRole: (role: string) => user?.role === role,

                  /** 관리자 여부 */
                  isAdmin: user?.role === 'ROLE_ADMIN',

                  /** 사용자 닉네임 (미인증 시 null) */
                  nickname: user?.nickname ?? null,

                  /** 인증 제공자 (NAVER | GOOGLE) */
                  provider: user?.provider ?? null,
            }),
            [isAuthenticated, isLoading, user, error]
      );

      return status;
};
