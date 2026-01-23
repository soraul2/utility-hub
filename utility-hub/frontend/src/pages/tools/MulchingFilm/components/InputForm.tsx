/**
 * 입력 폼 컴포넌트
 * 
 * 4개의 입력 필드(면적, 폭, 길이, 가격)와 계산 버튼을 포함합니다.
 * UI/UX 구조는 기존과 100% 동일하게 유지됩니다.
 */

import React from 'react';
import type { InputFormProps } from '../types';

export const InputForm: React.FC<InputFormProps> = ({
      inputs,
      errors,
      onInputChange,
      onCalculate,
}) => {
      const isDisabled = !inputs.areaPyeong || !inputs.widthCm || !inputs.lengthM;

      return (
            <div className="space-y-3">
                  {/* Row 1: Area */}
                  <div>
                        <label
                              className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1"
                              htmlFor="areaPyeong"
                        >
                              밭의 면적 (평)
                        </label>
                        <input
                              id="areaPyeong"
                              type="text"
                              name="areaPyeong"
                              value={inputs.areaPyeong}
                              onChange={onInputChange}
                              placeholder="100"
                              aria-label="밭의 면적 (평)"
                              aria-required="true"
                              aria-invalid={!!errors.areaPyeong}
                              aria-describedby={errors.areaPyeong ? 'area-error' : undefined}
                              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg font-normal text-gray-900 dark:text-white placeholder:font-normal"
                        />
                        {errors.areaPyeong && (
                              <p id="area-error" className="text-xs text-red-500 mt-1 ml-1">
                                    {errors.areaPyeong}
                              </p>
                        )}
                  </div>

                  {/* Row 2: Width & Length */}
                  <div className="grid grid-cols-2 gap-3">
                        <div>
                              <label
                                    className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1"
                                    htmlFor="widthCm"
                              >
                                    비닐 폭 (cm)
                              </label>
                              <input
                                    id="widthCm"
                                    type="text"
                                    name="widthCm"
                                    value={inputs.widthCm}
                                    onChange={onInputChange}
                                    placeholder="90"
                                    aria-label="비닐 폭 (cm)"
                                    aria-required="true"
                                    aria-invalid={!!errors.widthCm}
                                    aria-describedby={errors.widthCm ? 'width-error' : undefined}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg font-normal text-gray-900 dark:text-white placeholder:font-normal"
                              />
                              {errors.widthCm && (
                                    <p id="width-error" className="text-xs text-red-500 mt-1 ml-1">
                                          {errors.widthCm}
                                    </p>
                              )}
                        </div>
                        <div>
                              <label
                                    className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1"
                                    htmlFor="lengthM"
                              >
                                    비닐 길이 (m)
                              </label>
                              <input
                                    id="lengthM"
                                    type="text"
                                    name="lengthM"
                                    value={inputs.lengthM}
                                    onChange={onInputChange}
                                    placeholder="500"
                                    aria-label="비닐 길이 (m)"
                                    aria-required="true"
                                    aria-invalid={!!errors.lengthM}
                                    aria-describedby={errors.lengthM ? 'length-error' : undefined}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg font-normal text-gray-900 dark:text-white placeholder:font-normal"
                              />
                              {errors.lengthM && (
                                    <p id="length-error" className="text-xs text-red-500 mt-1 ml-1">
                                          {errors.lengthM}
                                    </p>
                              )}
                        </div>
                  </div>

                  {/* Row 3: Price */}
                  <div>
                        <label
                              className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 ml-1"
                              htmlFor="pricePerRoll"
                        >
                              롤당 가격 (원)
                        </label>
                        <input
                              id="pricePerRoll"
                              type="text"
                              name="pricePerRoll"
                              value={inputs.pricePerRoll}
                              onChange={onInputChange}
                              placeholder="25000"
                              aria-label="롤당 가격 (원)"
                              aria-required="false"
                              aria-invalid={!!errors.pricePerRoll}
                              aria-describedby={errors.pricePerRoll ? 'price-error' : undefined}
                              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg font-normal text-gray-900 dark:text-white placeholder:font-normal"
                        />
                        {errors.pricePerRoll && (
                              <p id="price-error" className="text-xs text-red-500 mt-1 ml-1">
                                    {errors.pricePerRoll}
                              </p>
                        )}
                  </div>

                  {/* Calculate Button */}
                  <button
                        onClick={onCalculate}
                        disabled={isDisabled}
                        aria-label="계산하기"
                        className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white disabled:text-gray-400 font-bold text-lg shadow-lg shadow-blue-500/30 disabled:shadow-none transition-all active:scale-95"
                  >
                        계산하기
                  </button>
            </div>
      );
};
