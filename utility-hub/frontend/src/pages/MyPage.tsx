import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ConfirmModal } from '../components/ui/ConfirmModal';

/**
 * 사용자 프로필 및 계정 설정을 관리하는 페이지
 */
const MyPage: React.FC = () => {
      const { user, logout, withdraw } = useAuth();
      const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
      const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

      const handleWithdraw = async () => {
            try {
                  await withdraw();
                  alert('탈퇴 처리가 완료되었습니다. 이용해 주셔서 감사합니다.');
            } catch (error) {
                  alert('탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
      };

      return (
            <div className="p-6 max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-gray-800/50 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">마이페이지</h2>

                        {user ? (
                              <div className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                                                {user.nickname.charAt(0)}
                                          </div>
                                          <div>
                                                <p className="text-gray-500 dark:text-slate-400 text-sm">닉네임</p>
                                                <p className="text-xl text-gray-900 dark:text-white font-semibold">{user.nickname}</p>
                                          </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">이메일</p>
                                                <p className="text-gray-900 dark:text-white">{user.email || '연동된 이메일 없음'}</p>
                                          </div>
                                          <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5">
                                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-1">로그인 제공자</p>
                                                <p className="text-gray-900 dark:text-white">{user.provider}</p>
                                          </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                          <button
                                                onClick={() => setIsLogoutModalOpen(true)}
                                                className="px-6 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-600 dark:text-slate-400 border border-gray-500/50 rounded-lg transition-colors"
                                          >
                                                로그아웃
                                          </button>
                                          <button
                                                onClick={() => setIsWithdrawModalOpen(true)}
                                                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg transition-colors text-sm"
                                          >
                                                회원 탈퇴
                                          </button>
                                    </div>
                              </div>
                        ) : (
                              <p className="text-gray-500 dark:text-slate-400">사용자 정보를 불러올 수 없습니다.</p>
                        )}
                  </div>

                  {/* 로그아웃 확인 모달 */}
                  <ConfirmModal
                        isOpen={isLogoutModalOpen}
                        onClose={() => setIsLogoutModalOpen(false)}
                        onConfirm={logout}
                        title="로그아웃 확인"
                        message="정말로 로그아웃 하시겠습니까?"
                        confirmText="로그아웃"
                        cancelText="취소"
                        variant="warning"
                  />

                  {/* 회원 탈퇴 확인 모달 */}
                  <ConfirmModal
                        isOpen={isWithdrawModalOpen}
                        onClose={() => setIsWithdrawModalOpen(false)}
                        onConfirm={handleWithdraw}
                        title="회원 탈퇴 확인"
                        message="정말로 탈퇴하시겠습니까? 탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다."
                        confirmText="탈퇴하기"
                        cancelText="취소"
                        variant="danger"
                  />
            </div>
      );
};

export default MyPage;
