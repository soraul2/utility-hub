import React from 'react';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { GlassInput } from '../../../../components/ui/GlassInput';
import type { MvnoPlanInput, ValidationErrors } from '../types';

interface MvnoPlanFormProps {
      input: MvnoPlanInput;
      errors: ValidationErrors;
      vatIncluded: boolean;
      onToggleVat: () => void;
      onFieldChange: (field: keyof MvnoPlanInput, value: number) => void;
}

export const MvnoPlanForm: React.FC<MvnoPlanFormProps> = ({ input, errors, vatIncluded, onToggleVat, onFieldChange }) => {
      return (
            <GlassCard className="p-6 space-y-6 h-full border-t-4 border-t-purple-500">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 flex justify-between items-start">
                        <div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    📱 자급제 + 알뜰폰
                              </h2>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    기계를 따로 사고 알뜰폰 유심을 쓰는 경우
                              </p>
                        </div>

                        {/* VAT Toggle Switch (MVNO) */}
                        <div
                              className="flex items-center gap-3 cursor-pointer group"
                              onClick={onToggleVat}
                              role="switch"
                              aria-checked={vatIncluded}
                              aria-label="알뜰폰 부가세 10% 포함 여부"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleVat(); } }}
                              title="클릭하면 알뜰폰 요금제에 10% 부가세를 더해서 계산합니다."
                        >
                              <span className={`text-sm font-bold transition-colors ${vatIncluded ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                    부가세 10%
                              </span>
                              <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${vatIncluded ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${vatIncluded ? 'translate-x-6' : 'translate-x-0'
                                          }`} />
                              </div>
                        </div>
                  </div>

                  <div className="space-y-6">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                              <GlassInput
                                    label="자급제 기기 구매가 (원)"
                                    type="number"
                                    value={input.deviceCostTotal}
                                    onChange={(e) => onFieldChange('deviceCostTotal', Number(e.target.value))}
                                    helperText="쿠팡, 오픈마켓 등에서의 최종 구매 가격"
                                    error={errors['mvnoDeviceCost']}
                              />
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-800/30">
                              <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                          알뜰폰 요금제 월 납부액 (원)
                                    </label>
                                    {vatIncluded && (
                                          <span className="text-xs text-purple-600 font-normal">
                                                (*계산 시 1.1배 적용)
                                          </span>
                                    )}
                              </div>
                              <GlassInput
                                    type="number"
                                    value={input.mvnoMonthly}
                                    onChange={(e) => onFieldChange('mvnoMonthly', Number(e.target.value))}
                                    helperText="프로모션 종료 후 정상 요금 기준으로 입력 권장"
                                    error={errors['mvnoMonthly']}
                              />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                              <GlassInput
                                    label="사용 기간 (개월)"
                                    type="number"
                                    value={input.months}
                                    onChange={(e) => onFieldChange('months', Number(e.target.value))}
                                    helperText="비교 기준 기간 (보통 24개월)"
                                    error={errors['mvnoMonths']}
                              />
                        </div>
                  </div>
            </GlassCard>
      );
};
