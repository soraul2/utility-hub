import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Palette, Tag } from 'lucide-react';
import type { CalendarEvent, CalendarEventCreateRequest } from '@/types/routine';

const EVENT_COLORS = [
      { value: '#6366f1', label: '인디고' },
      { value: '#ec4899', label: '핑크' },
      { value: '#10b981', label: '그린' },
      { value: '#f59e0b', label: '앰버' },
      { value: '#ef4444', label: '레드' },
      { value: '#8b5cf6', label: '퍼플' },
      { value: '#06b6d4', label: '시안' },
      { value: '#64748b', label: '슬레이트' },
];

const EVENT_TYPES = [
      { value: 'MEMO', label: '메모' },
      { value: 'PLAN', label: '일정' },
      { value: 'HOLIDAY', label: '휴일' },
] as const;

interface CalendarEventModalProps {
      isOpen: boolean;
      onClose: () => void;
      onSave: (data: CalendarEventCreateRequest) => Promise<void>;
      onDelete?: (eventId: number) => Promise<void>;
      editEvent?: CalendarEvent | null;
      defaultDate?: string;
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
      isOpen,
      onClose,
      onSave,
      onDelete,
      editEvent,
      defaultDate,
}) => {
      const [title, setTitle] = useState('');
      const [description, setDescription] = useState('');
      const [startDate, setStartDate] = useState('');
      const [endDate, setEndDate] = useState('');
      const [color, setColor] = useState('#6366f1');
      const [type, setType] = useState<'MEMO' | 'PLAN' | 'HOLIDAY'>('MEMO');
      const [isSaving, setIsSaving] = useState(false);

      useEffect(() => {
            if (editEvent) {
                  setTitle(editEvent.title);
                  setDescription(editEvent.description || '');
                  setStartDate(editEvent.startDate);
                  setEndDate(editEvent.endDate);
                  setColor(editEvent.color);
                  setType(editEvent.type);
            } else {
                  setTitle('');
                  setDescription('');
                  setStartDate(defaultDate || '');
                  setEndDate(defaultDate || '');
                  setColor('#6366f1');
                  setType('MEMO');
            }
      }, [editEvent, defaultDate, isOpen]);

      if (!isOpen) return null;

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!title.trim() || !startDate || !endDate) return;

            setIsSaving(true);
            try {
                  await onSave({ title, description, startDate, endDate, color, type });
                  onClose();
            } catch {
                  // Error handled by parent
            } finally {
                  setIsSaving(false);
            }
      };

      const handleDelete = async () => {
            if (!editEvent || !onDelete) return;
            setIsSaving(true);
            try {
                  await onDelete(editEvent.id);
                  onClose();
            } catch {
                  // Error handled by parent
            } finally {
                  setIsSaving(false);
            }
      };

      return createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                  <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white">
                                          {editEvent ? '이벤트 수정' : '이벤트 추가'}
                                    </h3>
                              </div>
                              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                              </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                              {/* Title */}
                              <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                          제목
                                    </label>
                                    <input
                                          type="text"
                                          value={title}
                                          onChange={(e) => setTitle(e.target.value)}
                                          placeholder="이벤트 제목"
                                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          autoFocus
                                    />
                              </div>

                              {/* Date Range */}
                              <div className="grid grid-cols-2 gap-3">
                                    <div>
                                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                시작일
                                          </label>
                                          <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => {
                                                      setStartDate(e.target.value);
                                                      if (!endDate || e.target.value > endDate) {
                                                            setEndDate(e.target.value);
                                                      }
                                                }}
                                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>
                                    <div>
                                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                                종료일
                                          </label>
                                          <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                min={startDate}
                                                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                          />
                                    </div>
                              </div>

                              {/* Description */}
                              <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                          설명 (선택)
                                    </label>
                                    <textarea
                                          value={description}
                                          onChange={(e) => setDescription(e.target.value)}
                                          placeholder="이벤트 설명..."
                                          rows={2}
                                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    />
                              </div>

                              {/* Type */}
                              <div>
                                    <label className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                          <Tag className="w-3 h-3" /> 유형
                                    </label>
                                    <div className="flex gap-2">
                                          {EVENT_TYPES.map(t => (
                                                <button
                                                      key={t.value}
                                                      type="button"
                                                      onClick={() => setType(t.value)}
                                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                            type === t.value
                                                                  ? 'mystic-solid text-white'
                                                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                      }`}
                                                >
                                                      {t.label}
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              {/* Color */}
                              <div>
                                    <label className="flex items-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                          <Palette className="w-3 h-3" /> 색상
                                    </label>
                                    <div className="flex gap-2">
                                          {EVENT_COLORS.map(c => (
                                                <button
                                                      key={c.value}
                                                      type="button"
                                                      onClick={() => setColor(c.value)}
                                                      className={`w-7 h-7 rounded-full transition-all ${
                                                            color === c.value
                                                                  ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110'
                                                                  : 'hover:scale-110'
                                                      }`}
                                                      style={{ backgroundColor: c.value }}
                                                      title={c.label}
                                                />
                                          ))}
                                    </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3 pt-2">
                                    {editEvent && onDelete && (
                                          <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={isSaving}
                                                className="px-4 py-2.5 text-rose-600 dark:text-rose-400 text-sm font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-50"
                                          >
                                                삭제
                                          </button>
                                    )}
                                    <div className="flex-1" />
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="px-4 py-2.5 text-gray-600 dark:text-gray-400 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    >
                                          취소
                                    </button>
                                    <button
                                          type="submit"
                                          disabled={isSaving || !title.trim() || !startDate || !endDate}
                                          className="px-6 py-2.5 mystic-solid text-white text-sm font-bold rounded-xl mystic-solid-hover disabled:opacity-50 transition-colors"
                                    >
                                          {isSaving ? '저장 중...' : (editEvent ? '수정' : '추가')}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>,
            document.body
      );
};

export default CalendarEventModal;
