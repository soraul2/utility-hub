import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, BookOpen } from 'lucide-react';

interface AllDoneCardProps {
  completedCount: number;
  totalScheduled: number;
}

export const AllDoneCard: React.FC<AllDoneCardProps> = ({ completedCount, totalScheduled }) => {
  const navigate = useNavigate();

  if (totalScheduled === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-4">
          <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">{'\uc2dc\uac04\uc774 \ubc30\uc815\ub41c \ud0dc\uc2a4\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200 dark:shadow-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-400/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 text-center py-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black mb-2">{'\uc624\ub298 \uc77c\uc815 \uc644\ub8cc!'}</h3>
          <p className="text-emerald-100 mb-1">
            {completedCount}/{totalScheduled} {'\ud0dc\uc2a4\ud06c\ub97c \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4'}
          </p>
          <p className="text-emerald-200/70 text-sm font-medium">
            {'\uc624\ub298 \ud558\ub8e8\ub3c4 \uc218\uace0 \ub9ce\uc558\uc5b4\uc694'}
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate('/routine/reflection')}
        className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl px-5 py-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group"
      >
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
          <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="text-sm font-black text-gray-900 dark:text-white">{'\ud558\ub8e8 \ud68c\uace0 \uc791\uc131\ud558\uae30'}</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500">{'\uc624\ub298\uc744 \ub3cc\uc544\ubcf4\uba70 \ub0b4\uc77c\uc744 \uc900\ube44\ud574\uc694'}</p>
        </div>
        <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
};
