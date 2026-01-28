import React from 'react';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { GlassInput } from '../../../../components/ui/GlassInput';
import { GlassButton } from '../../../../components/ui/GlassButton';
import type { CarrierPlanInput, CarrierAddon, ValidationErrors } from '../types';

interface CarrierPlanFormProps {
      input: CarrierPlanInput;
      errors: ValidationErrors;
      vatIncluded: boolean;
      onToggleVat: () => void;
      onFieldChange: (field: keyof CarrierPlanInput, value: number) => void;
      onAddAddon: () => void;
      onRemoveAddon: (index: number) => void;
      onUpdateAddon: (index: number, field: keyof CarrierAddon, value: string | number) => void;
}

export const CarrierPlanForm: React.FC<CarrierPlanFormProps> = ({
      input,
      errors,
      vatIncluded,
      onToggleVat,
      onFieldChange,
      onAddAddon,
      onRemoveAddon,
      onUpdateAddon,
}) => {
      return (
            <GlassCard className="p-6 space-y-6 h-full">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 flex justify-between items-start">
                        <div>
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    🏢 통신사 약정 플랜
                              </h2>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    공시지원금 또는 선택약정 할인을 받는 경우
                              </p>
                        </div>

                        {/* VAT Toggle Switch */}
                        <div
                              className="flex items-center gap-3 cursor-pointer group"
                              onClick={onToggleVat}
                              role="switch"
                              aria-checked={vatIncluded}
                              aria-label="부가세 10% 포함 여부"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleVat(); } }}
                              title="클릭하면 모든 요금제/부가서비스 금액에 10% 부가세를 더해서 계산합니다."
                        >
                              <span className={`text-sm font-bold transition-colors ${vatIncluded ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-500'}`}>
                                    부가세 10%
                              </span>
                              <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${vatIncluded ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}>
                                    <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${vatIncluded ? 'translate-x-6' : 'translate-x-0'
                                          }`} />
                              </div>
                        </div>
                  </div>

                  <div className="space-y-4">
                        {/* 고가 요금제 구간 */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex justify-between">
                                    <span>1단계: 고가 요금제 유지 (보통 6개월)</span>
                                    {vatIncluded && <span className="text-xs text-blue-500 font-normal">(*계산 시 1.1배 적용)</span>}
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                    <GlassInput
                                          label="유지 기간 (개월)"
                                          type="number"
                                          value={input.highPlanMonths}
                                          onChange={(e) => onFieldChange('highPlanMonths', Number(e.target.value))}
                                          error={errors['highPlanMonths']}
                                    />
                                    <GlassInput
                                          label="월 기본료 (원)"
                                          type="number"
                                          value={input.highPlanMonthly}
                                          onChange={(e) => onFieldChange('highPlanMonthly', Number(e.target.value))}
                                          error={errors['highPlanMonthly']}
                                    />
                              </div>
                        </div>

                        {/* 저가 요금제 구간 */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex justify-between">
                                    <span>2단계: 저가 요금제 변경 (나머지 기간)</span>
                                    {vatIncluded && <span className="text-xs text-blue-500 font-normal">(*계산 시 1.1배 적용)</span>}
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                    <GlassInput
                                          label="유지 기간 (개월)"
                                          type="number"
                                          value={input.lowPlanMonths}
                                          onChange={(e) => onFieldChange('lowPlanMonths', Number(e.target.value))}
                                          error={errors['lowPlanMonths']}
                                    />
                                    <GlassInput
                                          label="월 기본료 (원)"
                                          type="number"
                                          value={input.lowPlanMonthly}
                                          onChange={(e) => onFieldChange('lowPlanMonthly', Number(e.target.value))}
                                          error={errors['lowPlanMonthly']}
                                    />
                              </div>
                        </div>

                        {/* 기기값 */}
                        <GlassInput
                              label="단말기 할부원금 (완납 기준)"
                              type="number"
                              value={input.deviceCostTotal}
                              onChange={(e) => onFieldChange('deviceCostTotal', Number(e.target.value))}
                              helperText="공시지원금/페이백을 제외하고 실제 내야 할 기기값 총액"
                              error={errors['deviceCostTotal']}
                        />

                        {/* 부가서비스 */}
                        <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                          부가서비스 ({input.addons.length})
                                    </label>
                                    <GlassButton size="sm" variant="secondary" onClick={onAddAddon}>
                                          + 추가
                                    </GlassButton>
                              </div>

                              <div className="space-y-2">
                                    {input.addons.map((addon, index) => (
                                          <div key={addon.id} className="flex gap-2 items-start p-2 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                                                <div className="flex-1 space-y-2">
                                                      <input
                                                            type="text"
                                                            placeholder="이름 (예: OTT팩)"
                                                            className="w-full text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none p-1 text-gray-900 dark:text-gray-100"
                                                            value={addon.name}
                                                            onChange={(e) => onUpdateAddon(index, 'name', e.target.value)}
                                                            aria-label={`부가서비스 ${index + 1} 이름`}
                                                      />
                                                      <div className="flex gap-2">
                                                            <input
                                                                  type="number"
                                                                  placeholder="월 요금"
                                                                  className="w-1/2 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none p-1 text-gray-900 dark:text-gray-100"
                                                                  value={addon.monthlyFee || ''}
                                                                  onChange={(e) => onUpdateAddon(index, 'monthlyFee', Number(e.target.value))}
                                                                  aria-label={`부가서비스 ${index + 1} 월 요금`}
                                                                  aria-invalid={!!errors[`addon_${index}_fee`]}
                                                                  aria-describedby={errors[`addon_${index}_fee`] ? `error-addon-${index}-fee` : undefined}
                                                            />
                                                            {errors[`addon_${index}_fee`] && (
                                                                  <p id={`error-addon-${index}-fee`} className="text-red-500 text-xs mt-1" role="alert">
                                                                        {errors[`addon_${index}_fee`]}
                                                                  </p>
                                                            )}
                                                            <input
                                                                  type="number"
                                                                  placeholder="개월"
                                                                  className="w-1/2 text-sm bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none p-1 text-gray-900 dark:text-gray-100"
                                                                  value={addon.months || ''}
                                                                  onChange={(e) => onUpdateAddon(index, 'months', Number(e.target.value))}
                                                                  aria-label={`부가서비스 ${index + 1} 유지 개월 수`}
                                                                  aria-invalid={!!errors[`addon_${index}_months`]}
                                                                  aria-describedby={errors[`addon_${index}_months`] ? `error-addon-${index}-months` : undefined}
                                                            />
                                                            {errors[`addon_${index}_months`] && (
                                                                  <p id={`error-addon-${index}-months`} className="text-red-500 text-xs mt-1" role="alert">
                                                                        {errors[`addon_${index}_months`]}
                                                                  </p>
                                                            )}
                                                      </div>
                                                </div>
                                                <button
                                                      onClick={() => onRemoveAddon(index)}
                                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                      aria-label={`부가서비스 ${index + 1} 삭제`}
                                                      title="삭제"
                                                >
                                                      <i className="fa-solid fa-trash-can"></i>
                                                </button>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </div>
            </GlassCard>
      );
};
