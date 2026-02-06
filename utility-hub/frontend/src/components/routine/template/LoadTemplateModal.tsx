import React, { useEffect, useState } from 'react';
import { X, Download, Trash2, Clock, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { useRoutineStore } from '../../../stores/useRoutineStore';
import type { RoutineTemplate, Priority, Category } from '../../../types/routine';

const PRIORITY_CONFIG: Record<Priority, { dotColor: string }> = {
      HIGH: { dotColor: 'bg-red-500' },
      MEDIUM: { dotColor: 'bg-yellow-500' },
      LOW: { dotColor: 'bg-green-500' },
};

const CATEGORY_CONFIG: Record<Category, { emoji: string }> = {
      WORK: { emoji: '💼' },
      HEALTH: { emoji: '💪' },
      STUDY: { emoji: '📚' },
      PERSONAL: { emoji: '🏠' },
};

interface LoadTemplateModalProps {
      onClose: () => void;
}

export const LoadTemplateModal: React.FC<LoadTemplateModalProps> = ({ onClose }) => {
      const { templates, templatesLoading, loadTemplates, applyTemplate, deleteTemplate } = useRoutineStore();
      const [expandedId, setExpandedId] = useState<number | null>(null);
      const [applying, setApplying] = useState<number | null>(null);
      const [deletingId, setDeletingId] = useState<number | null>(null);

      useEffect(() => {
            loadTemplates();
      }, [loadTemplates]);

      const handleApply = async (templateId: number) => {
            setApplying(templateId);
            try {
                  await applyTemplate(templateId);
                  onClose();
            } catch {
                  setApplying(null);
            }
      };

      const handleDelete = async (templateId: number) => {
            setDeletingId(templateId);
            await deleteTemplate(templateId);
            setDeletingId(null);
      };

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
                  <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                              <div>
                                    <h2 className="text-lg font-black text-gray-900 dark:text-white">
                                          템플릿 불러오기
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                          저장된 템플릿을 선택하여 적용하세요
                                    </p>
                              </div>
                              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                              </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                              {templatesLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    </div>
                              ) : templates.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                          <Layers className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                                          <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                                저장된 템플릿이 없습니다
                                          </p>
                                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                계획 모드에서 "템플릿 저장" 버튼으로 만들 수 있습니다
                                          </p>
                                    </div>
                              ) : (
                                    <div className="space-y-3">
                                          {templates.map(template => (
                                                <TemplateCard
                                                      key={template.id}
                                                      template={template}
                                                      isExpanded={expandedId === template.id}
                                                      isApplying={applying === template.id}
                                                      isDeleting={deletingId === template.id}
                                                      onToggle={() => setExpandedId(expandedId === template.id ? null : template.id)}
                                                      onApply={() => handleApply(template.id)}
                                                      onDelete={() => handleDelete(template.id)}
                                                />
                                          ))}
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
};

interface TemplateCardProps {
      template: RoutineTemplate;
      isExpanded: boolean;
      isApplying: boolean;
      isDeleting: boolean;
      onToggle: () => void;
      onApply: () => void;
      onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
      template, isExpanded, isApplying, isDeleting, onToggle, onApply, onDelete
}) => {
      const assignedCount = template.tasks.filter(t => t.startTime).length;

      return (
            <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
                  {/* Card Header */}
                  <div className="p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
                              <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">
                                          {template.name}
                                    </h3>
                                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full">
                                          {template.tasks.length}개
                                    </span>
                                    {assignedCount > 0 && (
                                          <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full">
                                                {assignedCount}개 배치됨
                                          </span>
                                    )}
                              </div>
                              {template.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{template.description}</p>
                              )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                    onClick={onToggle}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button
                                    onClick={onDelete}
                                    disabled={isDeleting}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    title="삭제"
                              >
                                    <Trash2 className="w-4 h-4" />
                              </button>
                              <button
                                    onClick={onApply}
                                    disabled={isApplying}
                                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                    <Download className="w-3.5 h-3.5" />
                                    {isApplying ? '적용중...' : '적용'}
                              </button>
                        </div>
                  </div>

                  {/* Expanded Task List */}
                  {isExpanded && (
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 space-y-2">
                              {template.tasks.map(task => {
                                    const priorityConfig = PRIORITY_CONFIG[task.priority || 'MEDIUM'];
                                    const categoryConfig = CATEGORY_CONFIG[task.category || 'WORK'];
                                    return (
                                          <div key={task.id} className="flex items-center gap-3 p-2.5 bg-white dark:bg-gray-900 rounded-xl">
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${priorityConfig.dotColor}`} />
                                                <div className="flex-1 min-w-0">
                                                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{task.title}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 shrink-0">
                                                      <span>{categoryConfig.emoji}</span>
                                                      {task.startTime && (
                                                            <span className="flex items-center gap-0.5">
                                                                  <Clock className="w-3 h-3" />
                                                                  {task.startTime.substring(0, 5)}
                                                            </span>
                                                      )}
                                                      {task.durationMinutes && <span>{task.durationMinutes}분</span>}
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}
            </div>
      );
};
