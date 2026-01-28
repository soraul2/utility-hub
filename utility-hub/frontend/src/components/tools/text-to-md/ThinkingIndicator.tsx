import React, { useEffect, useState } from 'react';

const MESSAGES = [
      "문맥을 읽고 있어요... 🧐",
      "구조를 잡는 중입니다... 🏗️",
      "마크다운으로 변환하고 있어요... 📝",
      "결과를 다듬고 있습니다... ✨",
];

const ThinkingIndicator: React.FC = () => {
      const [index, setIndex] = useState(0);

      useEffect(() => {
            const interval = setInterval(() => {
                  setIndex((prev) => (prev + 1) % MESSAGES.length);
            }, 2000);
            return () => clearInterval(interval);
      }, []);

      return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in duration-500">
                  <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900" />
                        <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 animate-pulse">
                        {MESSAGES[index]}
                  </p>
            </div>
      );
};

export default ThinkingIndicator;
