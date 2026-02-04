import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 유틸리티 허브 프리미엄 로그인 페이지
 * 
 * - Glassmorphism UI 적용
 * - 네이버/구글 소셜 로그인 지원
 * - 반응형 디자인
 */
const LoginPage: React.FC = () => {
      const { isAuthenticated } = useAuth();
      const location = useLocation();
      const from = (location.state as any)?.from?.pathname || '/';

      // 이미 인증된 경우 요청했던 페이지로 리다이렉트
      if (isAuthenticated) {
            return <Navigate to={from} replace />;
      }

      /**
       * 소셜 로그인 핸들러
       * 백엔드의 OAuth2 시작 엔드포인트로 리다이렉트합니다.
       */
      const handleSocialLogin = (provider: 'naver' | 'google') => {
            window.location.href = `/api/oauth2/authorization/${provider}`;
      };

      return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
                  {/* 배경 장식 애니메이션 요소 */}
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

                  {/* 로그인 카드 */}
                  <div className="relative z-10 w-full max-w-md p-8 md:p-12 mx-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
                        <div className="text-center mb-10">
                              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg transform rotate-12">
                                    <i className="fas fa-rocket text-2xl text-white"></i>
                              </div>
                              <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">Utility Hub</h1>
                              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                    나만의 규칙과 기록을 <span className="text-blue-400 font-medium">안전하게</span> 관리하세요.
                              </p>
                        </div>

                        <div className="space-y-4">
                              {/* 네이버 로그인 버튼 */}
                              <button
                                    onClick={() => handleSocialLogin('naver')}
                                    className="group relative w-full flex items-center justify-center py-4 px-4 bg-[#03C75A] hover:bg-[#02b351] text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-[#03C75A]/20 active:scale-[0.98]"
                              >
                                    <span className="absolute left-6 flex items-center justify-center w-6 h-6 bg-white rounded-full">
                                          <span className="text-[#03C75A] font-black text-xs">N</span>
                                    </span>
                                    네이버로 로그인
                                    <i className="fas fa-chevron-right absolute right-6 text-white/50 group-hover:translate-x-1 transition-transform"></i>
                              </button>

                              {/* 구글 로그인 버튼 */}
                              <button
                                    onClick={() => handleSocialLogin('google')}
                                    className="group relative w-full flex items-center justify-center py-4 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-white/10 active:scale-[0.98] border border-slate-200"
                              >
                                    <img
                                          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                          alt="Google"
                                          className="absolute left-6 w-5 h-5"
                                    />
                                    Google로 로그인
                                    <i className="fas fa-chevron-right absolute right-6 text-slate-300 group-hover:translate-x-1 transition-transform"></i>
                              </button>
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 text-center px-4">
                              <p className="text-slate-500 text-xs leading-5">
                                    로그인 시 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
                              </p>
                        </div>
                  </div>

                  {/* 하단 푸터 느낌의 안내 */}
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                        <p className="text-slate-600 text-xs">© 2026 Utility Hub Project. All rights reserved.</p>
                  </div>
            </div>
      );
};

export default LoginPage;
