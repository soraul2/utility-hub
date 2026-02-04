import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
      /** 허용된 역할 목록. 미지정 시 인증만 확인 */
      allowedRoles?: UserRole[];
}

/**
 * 인증된 사용자만 접근할 수 있도록 보호하는 라우트 컴포넌트
 *
 * - 미인증 사용자: /login으로 리다이렉트 (현재 위치 저장)
 * - 권한 부족: /unauthorized로 리다이렉트
 * - 로딩 중: 기본 로딩 스피너/메시지 표시
 * - 인증 사용자: 하위 라우트(Outlet) 렌더링
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
      const { isAuthenticated, isLoading, user } = useAuth();
      const location = useLocation() as Location;

      if (isLoading) {
            return (
                  <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
                        <div className="text-xl font-semibold animate-pulse">인증 확인 중...</div>
                  </div>
            );
      }

      if (!isAuthenticated) {
            return <Navigate to="/login" state={{ from: location }} replace />;
      }

      // Role 기반 권한 검증
      if (allowedRoles && allowedRoles.length > 0 && user) {
            const hasRequiredRole = allowedRoles.includes(user.role);
            if (!hasRequiredRole) {
                  return <Navigate to="/unauthorized" state={{ from: location }} replace />;
            }
      }

      return <Outlet />;
};

export default ProtectedRoute;
