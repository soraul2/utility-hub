import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * OAuth2 인증 성공 후 백엔드로부터 리다이렉트되는 콜백 페이지
 * 
 * URL 파라미터에서 accessToken, refreshToken을 추출하여 세션을 활성화합니다.
 */
const AuthCallbackPage: React.FC = () => {
      const navigate = useNavigate();
      const location = useLocation();
      const { login } = useAuth();

      useEffect(() => {
            const params = new URLSearchParams(location.search);
            const accessToken = params.get('accessToken');
            const refreshToken = params.get('refreshToken');

            // 백엔드가 JSON 기반의 사용자 정보를 쿼리 스트링으로 보내기엔 복잡하므로,
            // 여기서는 토큰만 먼저 저장하고 AuthContext의 세션 복원(GET /user/me)을 활용하거나
            // 필요 시 백엔드에서 추가 정보를 쿼리로 넘겨줄 수도 있습니다.

            if (accessToken && refreshToken) {
                  // 임시로 빈 사용자 객체를 넣고 세션 복원 시도 로직을 태울 수 있음
                  // 또는 백엔드 가이드에 따라 /user/me를 호출하여 정보를 채움

                  const initializeAuth = async () => {
                        try {
                              // 토큰을 먼저 저장 (login 함수 내에서 처리)
                              // 실제 사용자 정보는 AuthContext 내의 get /user/me 호출로 채워지도록 함
                              // 여기서는 flow만 완성함

                              // 백엔드 가이드: ?accessToken=...&refreshToken=... 로 리다이렉트됨
                              // authContext의 login은 (accessToken, refreshToken, user)를 기대하므로
                              // 간단히 처리하기 위해 빈 user를 넣고 즉시 세션 복원 유도 가능

                              // 우선 토큰을 로컬스토리지에 수동으로 박고 navigate 하거나 아예 login 함수를 호출함
                              // context에서 login을 호출하면 isAuthenticated가 true가 됨

                              // 실제 완성도를 위해 빈 user 객체 대신 세션 복원 로직을 타게 함
                              // (AuthContext의 login 수정 필요할 수도 있음)

                              // 여기서는 간단히:
                              localStorage.setItem('lm_access_token', accessToken);
                              localStorage.setItem('lm_refresh_token', refreshToken);

                              // 메인 페이지 또는 이전 페이지로 이동하면 AuthContext의 useEffect(['/'])가 돌면서 /user/me를 호출함
                              const from = (location.state as any)?.from?.pathname || '/';
                              navigate(from, { replace: true });
                        } catch (error) {
                              console.error('인증 처리 중 오류:', error);
                              navigate('/login', { replace: true });
                        }
                  };

                  initializeAuth();
            } else {
                  console.error('인증 토큰이 누락되었습니다.');
                  navigate('/login', { replace: true });
            }
      }, [location, navigate, login]);

      return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
                  <div className="text-center">
                        <div className="text-2xl font-bold mb-4">인증 처리 중</div>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-slate-400">잠시만 기다려 주세요...</p>
                  </div>
            </div>
      );
};

export default AuthCallbackPage;
