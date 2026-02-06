import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setTokens } from '../utils/tokenStorage';
import { useGuestTarot } from '../hooks/useGuestTarot';
import { migrateSessions } from '../lib/api/tarotApi';

/**
 * OAuth2 인증 성공 후 백엔드로부터 리다이렉트되는 콜백 페이지
 *
 * URL 파라미터에서 accessToken, refreshToken을 추출하여 세션을 활성화합니다.
 */
const AuthCallbackPage: React.FC = () => {
      const navigate = useNavigate();
      const location = useLocation();
      const [errorMessage, setErrorMessage] = useState<string | null>(null);
      const isProcessed = useRef(false);
      const { guestSessions, clearGuestSessions } = useGuestTarot();

      useEffect(() => {
            // 중복 실행 방지
            if (isProcessed.current) return;
            isProcessed.current = true;

            const params = new URLSearchParams(location.search);
            const accessToken = params.get('accessToken');
            const error = params.get('error');

            // OAuth 에러 처리
            if (error) {
                  console.error('OAuth 인증 실패:', error);
                  setErrorMessage('소셜 로그인에 실패했습니다. 다시 시도해 주세요.');
                  setTimeout(() => navigate('/login', { replace: true }), 2000);
                  return;
            }

            if (accessToken) {
                  // tokenStorage 유틸 사용 (Refresh Token은 쿠키로 자동 설정됨)
                  setTokens(accessToken, '');

                  // 이관 로직
                  const handleMigration = async () => {
                        if (guestSessions.length > 0) {
                              try {
                                    await migrateSessions(guestSessions);
                                    clearGuestSessions();
                                    console.log('Guest sessions migrated successfully');
                              } catch (error) {
                                    console.error('Failed to migrate guest sessions', error);
                              }
                        }
                  };

                  handleMigration().then(() => {
                        // URL에서 토큰 제거 (보안)
                        window.history.replaceState({}, document.title, location.pathname);

                        // sessionStorage에서 리다이렉트 경로 가져오기
                        const savedPath = sessionStorage.getItem('oauth_redirect_path');
                        console.log('[AuthCallback] savedPath:', savedPath);
                        sessionStorage.removeItem('oauth_redirect_path');

                        // 등급 페이지 리다이렉트 방지
                        // 내부 경로 검증 (Open Redirect 방지)
                        const isInternalPath = (path: string): boolean => {
                              return path.startsWith('/') && !path.startsWith('//');
                        };

                        const redirectTo = savedPath && isInternalPath(savedPath) ? savedPath : '/';
                        console.log('[AuthCallback] redirectTo:', redirectTo);
                        navigate(redirectTo, { replace: true });
                  });
            } else {
                  console.error('인증 토큰이 누락되었습니다.');
                  setErrorMessage('인증 토큰이 누락되었습니다.');
                  setTimeout(() => navigate('/login', { replace: true }), 2000);
            }
      }, [location, navigate, guestSessions, clearGuestSessions]);

      return (
            <div className="flex items-center justify-center min-h-screen bg-[#0f172a] text-white">
                  <div className="text-center">
                        {errorMessage ? (
                              <>
                                    <div className="text-2xl font-bold mb-4 text-red-400">인증 실패</div>
                                    <p className="mt-4 text-slate-400">{errorMessage}</p>
                              </>
                        ) : (
                              <>
                                    <div className="text-2xl font-bold mb-4">인증 처리 중</div>
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-4 text-slate-400">잠시만 기다려 주세요...</p>
                              </>
                        )}
                  </div>
            </div>
      );
};

export default AuthCallbackPage;
