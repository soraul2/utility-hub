import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar, StickyNote, Layers, Save, ArrowRight } from 'lucide-react';
import type { DailySummary, RoutineTemplate } from '@/types/routine';
import { routineApi } from '@/services/routine/api';
import { Link } from 'react-router-dom';

interface DayDetailPanelProps {
      date: Date | null;
      dayData?: DailySummary;
      templates: RoutineTemplate[];
      onUpdateMemo: (date: string, memo: string) => Promise<void>;
      onApplyTemplate: (date: string, templateId: number) => Promise<void>;
}

const DayDetailPanel: React.FC<DayDetailPanelProps> = ({
      date,
      dayData,
      templates,
      onUpdateMemo,
      onApplyTemplate,
}) => {
      const [memo, setMemo] = useState('');
      const [selectedTemplateId, setSelectedTemplateId] = useState<number | ''>('');
      const [isSaving, setIsSaving] = useState(false);

      useEffect(() => {
            if (dayData?.memoSnippet) {
                  setMemo(dayData.memoSnippet);
            } else {
                  setMemo('');
            }
            setSelectedTemplateId('');
      }, [date, dayData]);

      if (!date) {
            return (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4 min-h-[400px]">
                        <Calendar className="w-12 h-12 opacity-20" />
                        <p>날짜를 선택하여<br />상세 내용을 확인하세요</p>
                  </div>
            );
      }

      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'M월 d일 (EEE)', { locale: ko });

      const handleSaveMemo = async () => {
            setIsSaving(true);
            try {
                  await onUpdateMemo(dateStr, memo);
                  setMemo(''); // Clear or Keep? Maybe keep to show it saved.
                  alert('메모가 저장되었습니다.');
            } catch (error) {
                  console.error(error);
                  alert('저장 실패');
            } finally {
                  setIsSaving(false);
            }
      };

      const handleApplyTemplate = async () => {
            if (!selectedTemplateId) return;
            if (!confirm('해당 템플릿을 적용하시겠습니까? 기존 계획이 있다면 덮어씌워질 수 있습니다.')) return;

            try {
                  await onApplyTemplate(dateStr, Number(selectedTemplateId));
                  alert('템플릿이 적용되었습니다.');
                  setSelectedTemplateId('');
            } catch (error) {
                  console.error(error);
                  alert('템플릿 적용 실패');
            }
      };

      return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                  <div className="flex flex-col lg:flex-row gap-6 h-full">
                        {/* 1. Date & Status Section (Left) */}
                        <div className="lg:w-1/4 space-y-6">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    {displayDate}
                              </h3>

                              <div className="space-y-3">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                          상태
                                    </label>
                                    <div className="flex flex-col gap-3">
                                          {dayData?.isRest ? (
                                                <span className="self-start px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-bold">
                                                      💤 휴식
                                                </span>
                                          ) : dayData?.hasPlan ? (
                                                <span className="self-start px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-bold">
                                                      ✅ 계획 있음 ({Math.round(dayData.completionRate)}%)
                                                </span>
                                          ) : (
                                                <span className="self-start px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-lg text-sm font-bold">
                                                      ⚪ 계획 없음
                                                </span>
                                          )}

                                          <Link
                                                to={`/routine/daily-plan/${dateStr}`}
                                                className="text-sm text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1"
                                          >
                                                상세 보기 <ArrowRight className="w-3 h-3" />
                                          </Link>
                                    </div>
                              </div>
                        </div>

                        {/* 2. Memo Section (Center/Wide) */}
                        <div className="lg:w-1/2 space-y-3">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <StickyNote className="w-3 h-3" /> 메모
                              </label>
                              <div className="relative h-full min-h-[120px]">
                                    <textarea
                                          value={memo}
                                          onChange={(e) => setMemo(e.target.value)}
                                          placeholder={dayData?.memoSnippet ? "새로운 메모를 입력하여 수정하거나 추가하세요..." : "이 날의 메모를 남겨보세요..."}
                                          className="w-full h-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm transition-all text-base"
                                    />
                                    <button
                                          onClick={handleSaveMemo}
                                          disabled={isSaving || !memo.trim()}
                                          className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
                                    >
                                          <Save className="w-4 h-4" />
                                    </button>
                              </div>
                        </div>

                        {/* 3. Template Application (Right) */}
                        <div className="lg:w-1/4 space-y-3">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> 템플릿 적용
                              </label>
                              <div className="flex flex-col gap-2">
                                    <select
                                          value={selectedTemplateId}
                                          onChange={(e) => {
                                                const val = e.target.value;
                                                setSelectedTemplateId(val === '' ? '' : Number(val));
                                          }}
                                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                                    >
                                          <option value="">템플릿 선택...</option>
                                          {templates.map(t => (
                                                <option key={t.id} value={t.id}>
                                                      {t.name} {t.type === 'REST' ? '(휴식)' : ''}
                                                </option>
                                          ))}
                                    </select>
                                    <button
                                          onClick={handleApplyTemplate}
                                          disabled={!selectedTemplateId}
                                          className="w-full px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                                    >
                                          적용
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default DayDetailPanel;
