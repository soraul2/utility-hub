import { useContext } from 'react';
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
            throw new Error('useAuth는 AuthProvider 안환에서만 사용할 수 있습니다.');
      }

      return context;
};
