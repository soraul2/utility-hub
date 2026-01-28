import React, { useRef } from 'react';

interface EditorLayoutProps {
      inputText: string;
      onInputChange: (text: string) => void;
      outputText: string;
      isThinking: boolean;
      ThinkingComponent: React.ReactNode;
      placeholder?: string;
      inputHeader?: React.ReactNode;
      outputHeader?: React.ReactNode;
      inputActions?: React.ReactNode;
      outputActions?: React.ReactNode;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
      inputText,
      onInputChange,
      outputText,
      isThinking,
      ThinkingComponent,
      placeholder,
      inputHeader,
      outputHeader,
      inputActions,
      outputActions,
}) => {
      const inputRef = useRef<HTMLTextAreaElement>(null);
      const outputRef = useRef<HTMLDivElement>(null);

      // Sync Scroll Logic (Input -> Output)
      const handleInputScroll = () => {
            if (!inputRef.current || !outputRef.current) return;
            const input = inputRef.current;
            const output = outputRef.current;

            // Calculate percentage
            const percentage = input.scrollTop / (input.scrollHeight - input.clientHeight);
            if (!isNaN(percentage)) {
                  output.scrollTop = percentage * (output.scrollHeight - output.clientHeight);
            }
      };

      return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 min-h-[500px]">
                  {/* Input Area */}
                  <div className="flex flex-col h-full rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all focus-within:ring-2 ring-purple-500/20">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30">
                              <h3 className="font-semibold text-slate-700 dark:text-slate-200">입력 텍스트</h3>
                              {inputHeader}
                        </div>
                        <textarea
                              ref={inputRef}
                              value={inputText}
                              onChange={(e) => onInputChange(e.target.value)}
                              onScroll={handleInputScroll}
                              placeholder={placeholder || "여기에 변환할 텍스트를 입력하세요..."}
                              className="flex-1 w-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 custom-scrollbar"
                        />
                        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30">
                              <div className="text-xs text-slate-400 dark:text-slate-500">
                                    {inputText.length.toLocaleString()} 자
                              </div>
                              <div className="flex gap-2">
                                    {inputActions}
                              </div>
                        </div>
                  </div>

                  {/* Output Area */}
                  <div className="flex flex-col h-full rounded-2xl bg-slate-50/50 dark:bg-black/20 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30">
                              <h3 className="font-semibold text-slate-700 dark:text-slate-200">
                                    {isThinking ? 'AI 작성 중...' : '변환 결과'}
                              </h3>
                              {outputHeader}
                        </div>

                        <div className="relative flex-1 overflow-hidden">
                              {isThinking ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 transition-all">
                                          {ThinkingComponent}
                                    </div>
                              ) : null}

                              {outputText ? (
                                    <div
                                          ref={outputRef}
                                          className="w-full h-full p-4 overflow-auto custom-scrollbar bg-slate-50 dark:bg-[#0d1117]"
                                    >
                                          <pre className="font-mono text-sm leading-relaxed text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-words">
                                                {outputText}
                                          </pre>
                                    </div>
                              ) : (
                                    !isThinking && (
                                          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                                변환된 결과가 여기에 표시됩니다.
                                          </div>
                                    )
                              )}
                        </div>

                        {/* Output Actions Bar */}
                        {(outputText && !isThinking) && (
                              <div className="flex items-center justify-end px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/30 gap-2">
                                    {outputActions}
                              </div>
                        )}
                  </div>
            </div>
      );
};

export default EditorLayout;
