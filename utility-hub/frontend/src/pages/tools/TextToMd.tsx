import React, { useState } from 'react';
import { useTextToMd } from '../../hooks/useTextToMd';
import { useTextToMdAi } from '../../hooks/useTextToMdAi';
import ModeToggle from '../../components/tools/text-to-md/ModeToggle';
import PersonaSelector from '../../components/tools/text-to-md/PersonaSelector';
import EditorLayout from '../../components/tools/text-to-md/EditorLayout';
import ThinkingIndicator from '../../components/tools/text-to-md/ThinkingIndicator';
import { GlassButton } from '../../components/ui/GlassButton';
import { Alert } from '../../components/ui/Alert';
import { mapErrorCodeToMessage, isInputError } from '../../lib/api/errorMapper';
import type { TextToMdMode, Persona } from '../../components/tools/text-to-md/types';

const TextToMd: React.FC = () => {
      const [mode, setMode] = useState<TextToMdMode>('local');
      const [persona, setPersona] = useState<Persona>('STANDARD');

      const localTool = useTextToMd();
      const aiTool = useTextToMdAi();

      const handleConvert = () => {
            if (mode === 'ai') {
                  aiTool.convert(
                        localTool.input,
                        persona,
                        localTool.options.autoHeading,
                        localTool.options.autoList
                  );
            }
      };

      const displayMarkdown = mode === 'ai' ? aiTool.markdownText : localTool.output;
      const isAiMode = mode === 'ai';

      // 상단 Alert 에러 메시지 (입력 오류 제외)
      const topErrorMessage = aiTool.errorCode && !isInputError(aiTool.errorCode)
            ? mapErrorCodeToMessage(aiTool.errorCode, aiTool.error || '')
            : aiTool.error && !aiTool.errorCode ? aiTool.error : null;

      // 입력 영역 아래 에러 메시지
      const inputErrorMessage = aiTool.errorCode && isInputError(aiTool.errorCode)
            ? mapErrorCodeToMessage(aiTool.errorCode, "")
            : null;

      return (
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                                    <i className="fa-brands fa-markdown text-blue-500"></i> 텍스트 변환기
                              </h1>
                              <p className="text-slate-500 dark:text-slate-400">
                                    {isAiMode ? 'AI가 문맥을 분석하여 완벽한 마크다운을 만듭니다.' : '간단한 규칙으로 빠르게 마크다운을 생성합니다.'}
                              </p>
                        </div>
                        <ModeToggle mode={mode} onModeChange={(m) => {
                              setMode(m);
                              aiTool.reset(); // 모드 변경 시 AI 상태 초기화
                        }} disabled={aiTool.isLoading} />
                  </div>

                  {/* Top Alert for errors */}
                  {topErrorMessage && (
                        <Alert variant="error" className="animate-in fade-in slide-in-from-top-2">
                              {topErrorMessage}
                        </Alert>
                  )}

                  {/* Persona Selector (AI Mode Only) */}
                  {isAiMode && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                              <PersonaSelector
                                    selectedPersona={persona}
                                    onSelect={setPersona}
                                    disabled={aiTool.isLoading}
                              />
                        </div>
                  )}

                  {/* Editor Layout */}
                  <EditorLayout
                        inputText={localTool.input}
                        onInputChange={localTool.setInput}
                        outputText={displayMarkdown}
                        isThinking={aiTool.isLoading}
                        ThinkingComponent={<ThinkingIndicator />}
                        inputHeader={
                              <div className="flex gap-4 text-xs">
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                          <input
                                                type="checkbox"
                                                checked={localTool.options.autoHeading}
                                                onChange={(e) => localTool.setOptions({ ...localTool.options, autoHeading: e.target.checked })}
                                                className="rounded-sm w-3.5 h-3.5 text-blue-500 focus:ring-blue-500"
                                          />
                                          <span>자동 제목</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                          <input
                                                type="checkbox"
                                                checked={localTool.options.autoList}
                                                onChange={(e) => localTool.setOptions({ ...localTool.options, autoList: e.target.checked })}
                                                className="rounded-sm w-3.5 h-3.5 text-blue-500 focus:ring-blue-500"
                                          />
                                          <span>자동 목록</span>
                                    </label>
                              </div>
                        }
                        outputHeader={
                              isAiMode && aiTool.model && (
                                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                          <span className="flex items-center gap-1">
                                                <i className="fa-solid fa-microchip"></i> {aiTool.model}
                                          </span>
                                          {aiTool.tokensUsed !== null && (
                                                <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                                                      {aiTool.tokensUsed.toLocaleString()} TOKENS
                                                </span>
                                          )}
                                    </div>
                              )
                        }
                        inputActions={
                              <>
                                    {inputErrorMessage && (
                                          <span className="text-xs text-red-500 font-medium mr-2 animate-pulse">{inputErrorMessage}</span>
                                    )}
                                    {isAiMode ? (
                                          <GlassButton
                                                variant="primary"
                                                size="sm"
                                                onClick={handleConvert}
                                                disabled={aiTool.isLoading || !localTool.input.trim()}
                                          >
                                                {aiTool.isLoading ? '변환 중...' : 'AI 변환 실행'}
                                          </GlassButton>
                                    ) : (
                                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2 py-1 border border-slate-200 dark:border-slate-800 rounded">
                                                Local Realtime
                                          </div>
                                    )}
                              </>
                        }
                        outputActions={
                              <div className="flex gap-2">
                                    <span className="text-emerald-500 text-xs self-center font-bold mr-2">{localTool.copySuccess}</span>
                                    <GlassButton variant="secondary" onClick={localTool.handleDownload} disabled={!displayMarkdown} size="sm">
                                          <i className="fa-solid fa-download"></i>
                                    </GlassButton>
                                    <GlassButton variant="primary" onClick={() => localTool.handleCopy()} disabled={!displayMarkdown} size="sm">
                                          <i className="fa-regular fa-copy"></i>
                                    </GlassButton>
                              </div>
                        }
                  />
            </div>
      );
};

export default TextToMd;
