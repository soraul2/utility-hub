import React from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * 사용자 프로필 및 계정 설정을 관리하는 페이지 (샘플)
 */
const MyPage: React.FC = () => {
      const { user, logout } = useAuth();

      return (
            <div className="p-6 max-w-4xl mx-auto">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-white mb-6">마이페이지</h2>

                        {user ? (
                              <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                                {user.nickname.charAt(0)}
                                          </div>
                                          <div>
                                                <p className="text-slate-400 text-sm">닉네임</p>
                                                <p className="text-xl text-white font-semibold">{user.nickname}</p>
                                          </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <p className="text-slate-400 text-sm mb-1">이메일</p>
                                                <p className="text-white">{user.email || '연동된 이메일 없음'}</p>
                                          </div>
                                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                <p className="text-slate-400 text-sm mb-1">로그인 제공자</p>
                                                <p className="text-white">{user.provider}</p>
                                          </div>
                                    </div>

                                    <button
                                          onClick={logout}
                                          className="mt-8 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg transition-colors"
                                    >
                                          로그아웃
                                    </button>
                              </div>
                        ) : (
                              <p className="text-slate-400">사용자 정보를 불러올 수 없습니다.</p>
                        )}
                  </div>
            </div>
      );
};

export default MyPage;
