import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * 인증된 사용자만 접근할 수 있도록 보호하는 라우트 컴포넌트
 * 
 * - 미인증 사용자: /login으로 리다이렉트 (현재 위치 저장)
 * - 로딩 중: 기본 로딩 스피너/메시지 표시
 * - 인증 사용자: 하위 라우트(Outlet) 렌더링
 */
const ProtectedRoute: React.FC = () => {
      const { isAuthenticated, isLoading } = useAuth();
      const location = useLocation() as Location;

      if (isLoading) {
            // 로딩 중일 때 표시할 UI (추후 스피너 등으로 개선 가능)
            return (
                  <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
                        <div className="text-xl font-semibold animate-pulse">인증 확인 중...</div>
                  </div>
            );
      }

      if (!isAuthenticated) {
            // 인증되지 않은 경우 로그인 페이지로 이동, 현재 위치를 state로 전달
            return <Navigate to="/login" state={{ from: location }} replace />;
      }

      return <Outlet />;
};

export default ProtectedRoute;
