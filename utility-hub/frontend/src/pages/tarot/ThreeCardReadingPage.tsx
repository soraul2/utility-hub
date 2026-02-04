import React, { useState, useCallback, useEffect } from 'react';
import { useThreeCardReading } from '../../hooks/useThreeCardReading';
import { useGuestTarot } from '../../hooks/useGuestTarot';
import { useAuthStatus } from '../../hooks/useAuth';
import { useThreeCardForm } from '../../hooks/useThreeCardForm';
import { useConfetti } from '../../hooks/useConfetti';
import { ASSISTANTS, HIDDEN_ASSISTANT, type AssistantInfo } from '../../lib/tarot-assistants';
import { FORTUNA_PROBABILITY } from '../../lib/constants/tarot';
import type { TarotAssistantType } from '../../lib/tarot';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import InputFormStep from './components/InputFormStep';
import CardSelectionStep from './components/CardSelectionStep';
import LeaderSelectionStep from './components/LeaderSelectionStep';
import ResultStep from './components/ResultStep';

const ThreeCardReadingPage: React.FC = () => {
  const { data, loading, error, createReading, reset } = useThreeCardReading();
  const { saveGuestSession } = useGuestTarot();
  const { isAuthenticated } = useAuthStatus();
  const { triggerFortunaEffect } = useConfetti();
  const form = useThreeCardForm();

  const [step, setStep] = useState<'input' | 'selection' | 'leader' | 'result'>('input');
  const [selectedLeader, setSelectedLeader] = useState<TarotAssistantType | null>(null);

  // 리딩 성공 시 게스트라면 세션 ID 저장
  useEffect(() => {
    if (data?.sessionId && !isAuthenticated) {
      saveGuestSession(data.sessionId);
    }
  }, [data?.sessionId, isAuthenticated, saveGuestSession]);

  // Assistant State
  const [assistants, setAssistants] = useState<AssistantInfo[]>([]);

  // Selection State
  const [selectedSlots, setSelectedSlots] = useState<(number | null)[]>([null, null, null]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInputConfirmModal, setShowInputConfirmModal] = useState(false);

  // Leader Selection State
  const [leaderPending, setLeaderPending] = useState<AssistantInfo | null>(null);
  const [showLeaderConfirmModal, setShowLeaderConfirmModal] = useState(false);

  const shuffleAssistants = useCallback(() => {
    const shuffled = [...ASSISTANTS].sort(() => 0.5 - Math.random()).slice(0, 3);
    if (Math.random() < FORTUNA_PROBABILITY) {
      const replaceIdx = Math.floor(Math.random() * 3);
      shuffled[replaceIdx] = HIDDEN_ASSISTANT;
      triggerFortunaEffect();
    }
    setAssistants(shuffled);
  }, [triggerFortunaEffect]);

  const handleProceedToSelection = useCallback(() => {
    setShowInputConfirmModal(false);
    setStep('selection');
  }, []);

  const handleCardSelect = useCallback((index: number) => {
    if (selectedSlots.includes(index)) return;
    const firstEmptyIndex = selectedSlots.indexOf(null);
    if (firstEmptyIndex === -1) return;

    const newSlots = [...selectedSlots];
    newSlots[firstEmptyIndex] = index;
    setSelectedSlots(newSlots);
  }, [selectedSlots]);

  const handleCardDeselect = useCallback((slotIndex: number) => {
    const newSlots = [...selectedSlots];
    newSlots[slotIndex] = null;
    setSelectedSlots(newSlots);
  }, [selectedSlots]);

  const handleReveal = useCallback(() => {
    if (selectedSlots.includes(null)) return;
    setShowConfirmModal(true);
  }, [selectedSlots]);

  const handleMoveToLeaderSelection = useCallback(() => {
    setShowConfirmModal(false);
    shuffleAssistants();
    setStep('leader');
  }, [shuffleAssistants]);

  const handleCreateReading = useCallback((leaderType?: TarotAssistantType) => {
    let leaderData: AssistantInfo | undefined;
    if (!leaderType) {
      leaderData = {
        type: 'MYSTIC',
        name: 'Mystic',
        title: '운명의 관찰자',
        desc: '정석적인 타로 리딩',
        image: '/assets/tarot/assistants/mystic.png',
        introQuote: "운명의 흐름을 읽는 자로서, 당신의 질문에 담긴 진실만을 전하겠습니다. 허상 없는 가장 투명한 거울을 마주할 준비가 되셨습니까?",
        confirmBtn: "진실을 보여줘",
        cancelBtn: "아직 준비 안 됐어"
      };
    } else if (leaderType === 'FORTUNA') {
      leaderData = HIDDEN_ASSISTANT;
      triggerFortunaEffect();
    } else {
      leaderData = assistants.find(a => a.type === leaderType) || ASSISTANTS.find(a => a.type === leaderType);
    }

    if (leaderData) {
      setLeaderPending(leaderData);
      setShowLeaderConfirmModal(true);
    }
  }, [assistants]);

  const handleConfirmLeader = useCallback(async () => {
    if (!leaderPending) return;
    setShowLeaderConfirmModal(false);

    const leaderType = leaderPending.type === 'MYSTIC' ? undefined : (leaderPending.type as TarotAssistantType);

    setSelectedLeader(leaderType || null);
    if (leaderType === 'FORTUNA') triggerFortunaEffect();

    await createReading({
      question: form.question,
      topic: form.topic,
      userName: form.userName || undefined,
      userAge: form.userAge ? parseInt(form.userAge, 10) : undefined,
      userGender: form.userGender || undefined,
      assistantType: leaderType
    });
    setStep('result');
  }, [leaderPending, form.question, form.topic, form.userName, form.userAge, form.userGender, createReading, triggerFortunaEffect]);

  const handleReset = useCallback(() => {
    reset();
    setStep('input');
    form.resetForm();
    setSelectedSlots([null, null, null]);
    setSelectedLeader(null);
  }, [reset, form]);

  if (loading) {
    const isFortuna = selectedLeader === 'FORTUNA';

    return (
      <div className="flex flex-col items-center justify-center p-20">
        {isFortuna ? (
          <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-amber-400 rounded-full animate-spin shadow-[0_0_50px_rgba(251,191,36,0.6)]" />
            <div className="absolute inset-4 border-4 border-purple-500 rounded-full animate-spin-reverse opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 blur-xl animate-pulse" />
              <span className="text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">✨</span>
            </div>
          </div>
        ) : (
          <div className="relative w-64 h-64 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <div className="absolute inset-4 border-4 border-amber-600/20 dark:border-amber-200/20 border-b-amber-600 dark:border-b-amber-200 rounded-full animate-spin-reverse" />
            <div className="absolute w-48 h-48 border border-amber-500/30 dark:border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="relative z-10 w-24 h-36 bg-gradient-to-br from-white/90 to-amber-100/90 dark:from-purple-900/50 dark:to-indigo-900/50 rounded-lg border border-amber-400/30 dark:border-purple-400/30 shadow-[0_0_50px_rgba(245,158,11,0.4)] dark:shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-pulse flex items-center justify-center">
              <i className="fas fa-eye text-4xl text-amber-600 dark:text-purple-200/80 animate-pulse"></i>
            </div>
          </div>
        )}

        <LoadingSpinner message={isFortuna ? "FATE REWRITING..." : "Reading the stars..."} />

        {isFortuna ? (
          <p className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 dark:from-amber-200 dark:via-yellow-400 dark:to-amber-200 font-bold text-lg md:text-xl tracking-widest animate-pulse text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif leading-relaxed transition-all duration-500">
            "마스터 포르투나가 기존 운명을 뒤틀어버리고<br />새롭게 바꿔버립니다."
          </p>
        ) : (
          <p className="mt-6 text-slate-500 dark:text-purple-200/50 text-xs font-light tracking-wider animate-pulse transition-colors duration-500">
            "같은 질문을 반복하면 카드의 목소리가 흐려집니다."
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20">
        <ErrorBanner message={error} onRetry={() => { reset(); setStep('input'); }} />
      </div>
    );
  }

  if (step === 'input') {
    return (
      <InputFormStep
        question={form.question}
        setQuestion={form.setQuestion}
        topic={form.topic}
        setTopic={form.setTopic}
        userName={form.userName}
        setUserName={form.setUserName}
        userAge={form.userAge}
        setUserAge={form.setUserAge}
        userGender={form.userGender}
        setUserGender={form.setUserGender}
        onProceed={handleProceedToSelection}
        showConfirmModal={showInputConfirmModal}
        setShowConfirmModal={setShowInputConfirmModal}
      />
    );
  }

  if (step === 'selection') {
    return (
      <CardSelectionStep
        selectedSlots={selectedSlots}
        onCardSelect={handleCardSelect}
        onCardDeselect={handleCardDeselect}
        onConfirm={handleReveal}
        onBack={() => setStep('input')}
        question={form.question}
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        onConfirmProceed={handleMoveToLeaderSelection}
      />
    );
  }

  if (step === 'leader') {
    return (
      <LeaderSelectionStep
        assistants={assistants}
        onShuffle={shuffleAssistants}
        onSelectLeader={handleCreateReading}
        leaderPending={leaderPending}
        showLeaderConfirmModal={showLeaderConfirmModal}
        setShowLeaderConfirmModal={setShowLeaderConfirmModal}
        onConfirmLeader={handleConfirmLeader}
      />
    );
  }

  return (
    <ResultStep
      data={data}
      selectedLeader={selectedLeader}
      assistants={assistants}
      onReset={handleReset}
      userName={form.userName}
    />
  );
};

export default ThreeCardReadingPage;
