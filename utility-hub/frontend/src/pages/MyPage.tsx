import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, Link2, Link2Off } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { calendarApi } from '../services/calendar/api';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast from '../components/common/Toast';

/**
 * 사용자 프로필 및 계정 설정을 관리하는 페이지
 */
const MyPage: React.FC = () => {
      const { user, logout, withdraw } = useAuth();
      const [searchParams, setSearchParams] = useSearchParams();
      const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
      const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
      const [gcalConnected, setGcalConnected] = useState<boolean | null>(null);
      const [gcalLoading, setGcalLoading] = useState(false);
      const [gcalConfirmOpen, setGcalConfirmOpen] = useState(false);
      const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

      useEffect(() => {
            calendarApi.getGoogleStatus()
                  .then(res => setGcalConnected(res.data.connected))
                  .catch(() => setGcalConnected(false));
      }, []);

      useEffect(() => {
            const gcalParam = searchParams.get('gcal');
            if (gcalParam) {
                  if (gcalParam === 'connected') {
                        setGcalConnected(true);
                        setToast({ text: 'Google Calendar이 연동되었습니다!', type: 'success' });
                  } else if (gcalParam === 'denied') {
                        setToast({ text: 'Google Calendar 연동이 취소되었습니다.', type: 'error' });
                  } else if (gcalParam === 'error') {
                        setToast({ text: 'Google Calendar 연동 중 오류가 발생했습니다. 다시 시도해 주세요.', type: 'error' });
                  }
                  searchParams.delete('gcal');
                  setSearchParams(searchParams, { replace: true });
            }
      }, [searchParams, setSearchParams]);

      const handleWithdraw = async () => {
            try {
                  await withdraw();
                  alert('탈퇴 처리가 완료되었습니다. 이용해 주셔서 감사합니다.');
            } catch (error) {
                  alert('탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
      };

      const handleConnectGoogle = () => {
            setGcalConfirmOpen(true);
      };

      const handleConfirmConnect = async () => {
            setGcalConfirmOpen(false);
            try {
                  const res = await calendarApi.getGoogleAuthUrl();
                  window.location.href = res.data.authUrl;
            } catch {
                  setToast({ text: 'Google Calendar 연동을 시작할 수 없습니다. 다시 시도해 주세요.', type: 'error' });
            }
      };

      const handleDisconnectGoogle = async () => {
            setGcalLoading(true);
            try {
                  await calendarApi.disconnectGoogle();
                  setGcalConnected(false);
                  setToast({ text: 'Google Calendar 연동이 해제되었습니다.', type: 'success' });
            } catch {
                  setToast({ text: '연동 해제에 실패했습니다.', type: 'error' });
            } finally {
                  setGcalLoading(false);
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

                                    {/* Google Calendar Integration */}
                                    <div className="bg-gray-100 dark:bg-white/5 p-5 rounded-xl border border-gray-200 dark:border-white/5">
                                          <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                                      <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                      <p className="text-sm font-bold text-gray-900 dark:text-white">Google Calendar 연동</p>
                                                      <p className="text-xs text-gray-400">계획 확정 시 Google Calendar에 일정이 자동 추가됩니다</p>
                                                      {user.provider !== 'GOOGLE' && !gcalConnected && (
                                                            <p className="text-[10px] text-amber-500 dark:text-amber-400 mt-0.5">
                                                                  별도의 Google 계정이 필요합니다 (로그인 계정과 무관)
                                                            </p>
                                                      )}
                                                </div>
                                          </div>

                                          {gcalConnected === null ? (
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                      <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                                                      상태 확인 중...
                                                </div>
                                          ) : gcalConnected ? (
                                                <div className="flex items-center justify-between">
                                                      <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                            <span className="text-sm text-green-600 dark:text-green-400 font-bold">연동됨</span>
                                                      </div>
                                                      <button
                                                            onClick={handleDisconnectGoogle}
                                                            disabled={gcalLoading}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                                                      >
                                                            <Link2Off className="w-3.5 h-3.5" />
                                                            {gcalLoading ? '해제 중...' : '연동 해제'}
                                                      </button>
                                                </div>
                                          ) : (
                                                <button
                                                      onClick={handleConnectGoogle}
                                                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                                                >
                                                      <Link2 className="w-4 h-4" />
                                                      Google Calendar 연동하기
                                                </button>
                                          )}
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

                  {/* Google Calendar 연동 확인 모달 */}
                  <ConfirmModal
                        isOpen={gcalConfirmOpen}
                        onClose={() => setGcalConfirmOpen(false)}
                        onConfirm={handleConfirmConnect}
                        title="Google Calendar 연동"
                        message="Google 계정의 캘린더 일정 쓰기 권한을 요청합니다. 연동하면 계획 확정 시 시간이 설정된 태스크가 Google Calendar에 자동으로 추가됩니다. Google 동의 화면으로 이동합니다."
                        confirmLabel="연동하기"
                        cancelLabel="취소"
                  />

                  {toast && (
                        <Toast
                              message={toast.text}
                              type={toast.type}
                              onClose={() => setToast(null)}
                        />
                  )}
            </div>
      );
};

export default MyPage;
