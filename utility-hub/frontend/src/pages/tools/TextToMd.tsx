import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { useTextToMd } from '../../hooks/useTextToMd';

const TextToMd: React.FC = () => {
      const {
            input,
            output,
            options,
            copySuccess,
            setInput,
            setOptions,
            handleCopy,
            handleDownload,
      } = useTextToMd();

      return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
                  {/* Input Side */}
                  <GlassCard title="입력 텍스트" className="flex flex-col h-full">
                        <div className="flex gap-4 mb-4 text-sm">
                              <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    <input
                                          type="checkbox"
                                          checked={options.autoHeading}
                                          onChange={(e) => setOptions({ ...options, autoHeading: e.target.checked })}
                                          className="rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">자동 제목 (첫 줄)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    <input
                                          type="checkbox"
                                          checked={options.autoList}
                                          onChange={(e) => setOptions({ ...options, autoList: e.target.checked })}
                                          className="rounded text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">자동 목록 변환</span>
                              </label>
                        </div>
                        <textarea
                              className="flex-1 w-full p-4 rounded-xl border-2 border-transparent bg-gray-50 dark:bg-gray-800 font-mono text-sm resize-none focus:bg-white focus:border-blue-500/50 dark:focus:bg-gray-700 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                              placeholder="여기에 텍스트를 붙여넣으세요..."
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                        ></textarea>
                  </GlassCard>

                  {/* Output Side */}
                  <GlassCard title="마크다운 결과" className="flex flex-col h-full"
                        footer={
                              <div className="flex justify-end gap-3 pt-4">
                                    <span className="text-emerald-500 text-sm self-center font-bold animate-pulse">{copySuccess}</span>
                                    <GlassButton variant="secondary" onClick={handleDownload} disabled={!output} size="sm">
                                          <i className="fa-solid fa-download"></i> 다운로드
                                    </GlassButton>
                                    <GlassButton variant="primary" onClick={handleCopy} disabled={!output} size="sm">
                                          <i className="fa-regular fa-copy"></i> 복사
                                    </GlassButton>
                              </div>
                        }>
                        <textarea
                              readOnly
                              className="flex-1 w-full p-4 rounded-xl border-2 border-transparent bg-gray-100 dark:bg-gray-800 font-mono text-sm text-gray-700 dark:text-gray-300 resize-none outline-none"
                              value={output}
                              placeholder="변환된 마크다운이 여기에 표시됩니다..."
                        ></textarea>
                  </GlassCard>
            </div>
      );
};

export default TextToMd;
