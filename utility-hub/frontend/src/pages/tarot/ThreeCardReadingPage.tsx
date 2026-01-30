import React, { useState } from 'react';
import { useThreeCardReading } from '../../hooks/useThreeCardReading';
import { ASSISTANTS, HIDDEN_ASSISTANT, type AssistantInfo } from '../../lib/tarot-assistants';
import type { TarotTopic, UserGender, TarotAssistantType } from '../../lib/tarot';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorBanner from '../../components/common/ErrorBanner';
import InputFormStep from './components/InputFormStep';
import CardSelectionStep from './components/CardSelectionStep';
import LeaderSelectionStep from './components/LeaderSelectionStep';
import ResultStep from './components/ResultStep';
import confetti from 'canvas-confetti';

const ThreeCardReadingPage: React.FC = () => {
  const { data, loading, error, createReading, reset } = useThreeCardReading();
  const [step, setStep] = useState<'input' | 'selection' | 'leader' | 'result'>('input');
  const [selectedLeader, setSelectedLeader] = useState<TarotAssistantType | null>(null);

  // Assistant State
  const [assistants, setAssistants] = useState<AssistantInfo[]>([]);

  // Form State
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState<TarotTopic>('GENERAL');
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userGender, setUserGender] = useState<UserGender | ''>('');

  // Selection State
  const [selectedSlots, setSelectedSlots] = useState<(number | null)[]>([null, null, null]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showInputConfirmModal, setShowInputConfirmModal] = useState(false);

  // Leader Selection State
  const [leaderPending, setLeaderPending] = useState<AssistantInfo | null>(null);
  const [showLeaderConfirmModal, setShowLeaderConfirmModal] = useState(false);

  const triggerFortunaEffect = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const shuffleAssistants = () => {
    const shuffled = [...ASSISTANTS].sort(() => 0.5 - Math.random()).slice(0, 3);
    if (Math.random() < 0.01) {
      const replaceIdx = Math.floor(Math.random() * 3);
      shuffled[replaceIdx] = HIDDEN_ASSISTANT;
      triggerFortunaEffect();
    }
    setAssistants(shuffled);
  };

  const handleProceedToSelection = () => {
    setShowInputConfirmModal(false);
    setStep('selection');
  };

  const handleCardSelect = (index: number) => {
    if (selectedSlots.includes(index)) return;
    const firstEmptyIndex = selectedSlots.indexOf(null);
    if (firstEmptyIndex === -1) return;

    const newSlots = [...selectedSlots];
    newSlots[firstEmptyIndex] = index;
    setSelectedSlots(newSlots);
  };

  const handleCardDeselect = (slotIndex: number) => {
    const newSlots = [...selectedSlots];
    newSlots[slotIndex] = null;
    setSelectedSlots(newSlots);
  };

  const handleReveal = () => {
    if (selectedSlots.includes(null)) return;
    setShowConfirmModal(true);
  };

  const handleMoveToLeaderSelection = () => {
    setShowConfirmModal(false);
    shuffleAssistants();
    setStep('leader');
  };

  const handleCreateReading = (leaderType?: TarotAssistantType) => {
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
  };

  const handleConfirmLeader = async () => {
    if (!leaderPending) return;
    setShowLeaderConfirmModal(false);

    const leaderType = leaderPending.type === 'MYSTIC' ? undefined : (leaderPending.type as TarotAssistantType);

    setSelectedLeader(leaderType || null);
    if (leaderType === 'FORTUNA') triggerFortunaEffect();

    await createReading({
      question,
      topic,
      userName: userName || undefined,
      userAge: userAge ? parseInt(userAge, 10) : undefined,
      userGender: userGender || undefined,
      assistantType: leaderType
    });
    setStep('result');
  };

  const handleReset = () => {
    reset();
    setStep('input');
    setQuestion('');
    setSelectedSlots([null, null, null]);
    setSelectedLeader(null);
  };

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
            <div className="absolute inset-4 border-4 border-amber-200/20 border-b-amber-200 rounded-full animate-spin-reverse" />
            <div className="absolute w-48 h-48 border border-purple-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="relative z-10 w-24 h-36 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-lg border border-purple-400/30 shadow-[0_0_50px_rgba(168,85,247,0.6)] animate-pulse flex items-center justify-center">
              <i className="fas fa-eye text-4xl text-purple-200/80 animate-pulse"></i>
            </div>
          </div>
        )}

        <LoadingSpinner message={isFortuna ? "FATE REWRITING..." : "Reading the stars..."} />

        {isFortuna ? (
          <p className="mt-8 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 font-bold text-lg md:text-xl tracking-widest animate-pulse text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif leading-relaxed">
            "마스터 포르투나가 기존 운명을 뒤틀어버리고<br />새롭게 바꿔버립니다."
          </p>
        ) : (
          <p className="mt-6 text-purple-200/50 text-xs font-light tracking-wider animate-pulse">
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
        question={question}
        setQuestion={setQuestion}
        topic={topic}
        setTopic={setTopic}
        userName={userName}
        setUserName={setUserName}
        userAge={userAge}
        setUserAge={setUserAge}
        userGender={userGender}
        setUserGender={setUserGender}
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
        question={question}
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
    />
  );
};

export default ThreeCardReadingPage;
