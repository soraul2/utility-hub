import React, { useState, useCallback } from 'react';
import { useDailyCard } from '../../hooks/useDailyCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import DailyCardSelectionView from './components/DailyCardSelectionView';
import DailyCardResultView from './components/DailyCardResultView';

const DailyCardPage: React.FC = () => {
  const { data, loading, error, loadDailyCard } = useDailyCard();
  const [step, setStep] = useState<'selection' | 'result'>('selection');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCardSelect = useCallback((index: number) => {
    if (loading || step === 'result' || selectedCardIndex !== null) return;
    setSelectedCardIndex(index);
  }, [loading, step, selectedCardIndex]);

  const handleCardDeselect = useCallback(() => {
    if (loading || step === 'result') return;
    setSelectedCardIndex(null);
  }, [loading, step]);

  const handleConfirm = useCallback(() => {
    if (loading || selectedCardIndex === null) return;
    setShowConfirmModal(true);
  }, [loading, selectedCardIndex]);

  const handleFinalConfirm = useCallback(async () => {
    setShowConfirmModal(false);
    await loadDailyCard();
    setStep('result');
  }, [loadDailyCard]);

  const handleRetry = useCallback(() => {
    setStep('selection');
    setSelectedCardIndex(null);
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="mystic-bg" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-amber-200/20 border-b-amber-200 rounded-full animate-spin-reverse" />
            <div className="absolute w-48 h-48 border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="relative z-10 w-24 h-36 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg border border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-pulse flex items-center justify-center">
              <i className="fas fa-eye text-4xl text-purple-200/80 animate-bounce"></i>
            </div>
          </div>
          <LoadingSpinner message="Reading the stars..." />
          <p className="mt-6 text-purple-200/50 text-xs font-light tracking-wider animate-pulse">
            "같은 질문을 반복하면 카드의 목소리가 흐려집니다."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Mystic Background */}
      <div className="mystic-bg" />

      {step === 'selection' ? (
        <DailyCardSelectionView
          selectedCardIndex={selectedCardIndex}
          onCardSelect={handleCardSelect}
          onCardDeselect={handleCardDeselect}
          onConfirm={handleConfirm}
          showConfirmModal={showConfirmModal}
          setShowConfirmModal={setShowConfirmModal}
          onFinalConfirm={handleFinalConfirm}
        />
      ) : (
        <>
          <div className="relative z-10 flex flex-col items-center justify-start min-h-[80vh] space-y-2 pt-0 pb-4 px-4 animate-fade-in-up">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold font-chakra tracking-tighter drop-shadow-sm py-2 leading-relaxed">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-blue-100 to-purple-200">오늘의 카드</span>
                </h1>
                <p className="text-slate-400 font-light tracking-widest uppercase text-xs md:text-sm">
                  우주가 당신에게 전하는 메시지
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="w-full max-w-md animate-fade-in">
                <ErrorBanner message={error} onRetry={handleRetry} />
              </div>
            )}

            <DailyCardResultView data={data} onRetry={handleRetry} />
          </div>
        </>
      )}
    </div>
  );
};

export default DailyCardPage;
