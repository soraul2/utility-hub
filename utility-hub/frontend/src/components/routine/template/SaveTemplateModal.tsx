import React, { useState } from 'react';
import { X, Save, Clock } from 'lucide-react';
import type { DailyPlan } from '../../../types/routine';
import { useRoutineStore } from '../../../stores/useRoutineStore';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../../../lib/constants/routine';

interface SaveTemplateModalProps {
      plan: DailyPlan;
      onClose: () => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ plan, onClose }) => {
      const { createTemplate } = useRoutineStore();
      const [name, setName] = useState('');
      const [description, setDescription] = useState('');
      const [saving, setSaving] = useState(false);

      const tasks = plan.keyTasks;

      const handleSave = async () => {
            if (!name.trim() || saving) return;
            setSaving(true);
            try {
                  await createTemplate({
                        name: name.trim(),
                        description: description.trim() || undefined,
                        sourcePlanId: plan.id
                  });
                  onClose();
            } catch {
                  setSaving(false);
            }
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                  <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                              <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                          템플릿으로 저장
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                          현재 {tasks.length}개의 태스크를 템플릿으로 저장합니다
                                    </p>
                              </div>
                              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                              </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-4">
                              <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                          템플릿 이름 *
                                    </label>
                                    <input
                                          type="text"
                                          value={name}
                                          onChange={e => setName(e.target.value)}
                                          placeholder="예: 평일 루틴, 주말 계획"
                                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                          autoFocus
                                    />
                              </div>
                              <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                          설명 (선택)
                                    </label>
                                    <input
                                          type="text"
                                          value={description}
                                          onChange={e => setDescription(e.target.value)}
                                          placeholder="이 템플릿에 대한 간단한 설명"
                                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                              </div>

                              {/* Task Preview */}
                              <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                          포함될 태스크
                                    </label>
                                    <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar">
                                          {tasks.map(task => {
                                                const priorityConfig = PRIORITY_CONFIG[task.priority || 'MEDIUM'];
                                                const categoryConfig = CATEGORY_CONFIG[task.category || 'WORK'];
                                                return (
                                                      <div key={task.id} className={`flex items-center gap-3 p-3 rounded-xl ${priorityConfig.bgColor} border ${priorityConfig.borderColor}`}>
                                                            <div className="flex-1 min-w-0">
                                                                  <p className={`text-sm font-bold truncate ${priorityConfig.textColor}`}>{task.title}</p>
                                                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                        <span>{categoryConfig.emoji} {categoryConfig.label}</span>
                                                                        {task.startTime && (
                                                                              <>
                                                                                    <span>·</span>
                                                                                    <Clock className="w-3 h-3" />
                                                                                    <span>{task.startTime.substring(0, 5)}</span>
                                                                              </>
                                                                        )}
                                                                        {task.durationMinutes && (
                                                                              <>
                                                                                    <span>·</span>
                                                                                    <span>{task.durationMinutes}분</span>
                                                                              </>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                              <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                              >
                                    취소
                              </button>
                              <button
                                    onClick={handleSave}
                                    disabled={!name.trim() || saving}
                                    className="px-5 py-2.5 text-sm font-bold text-white mystic-solid mystic-solid-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-2"
                              >
                                    <Save className="w-4 h-4" />
                                    {saving ? '저장 중...' : '저장'}
                              </button>
                        </div>
                  </div>
            </div>
      );
};
