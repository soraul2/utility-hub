import React, { useState, useCallback } from 'react';
import classNames from 'classnames';
import { calculateMulching } from '../../lib/mulchingFilm';
import { useMulchingHistory } from '../../hooks/useMulchingHistory';
import type { CalculationResult } from '../../hooks/useMulchingHistory';

// Sub-components
import { ResultDisplay } from './MulchingFilm/components/ResultDisplay';
import { DetailSection } from './MulchingFilm/components/DetailSection';
import { InputForm } from './MulchingFilm/components/InputForm';
import { HistoryTable } from './MulchingFilm/components/HistoryTable';

// Types and constants
import type { MulchingState, ValidationErrors } from './MulchingFilm/types';
import { LAYOUT } from './MulchingFilm/constants';

/**
 * 멀칭 비닐 계산기 메인 컴포넌트
 * 
 * 농업용 멀칭 비닐의 필요 수량과 예상 금액을 계산합니다.
 * UI/UX 구조는 기존과 100% 동일하게 유지됩니다.
 */
const MulchingFilm: React.FC = () => {
      const [inputs, setInputs] = useState<MulchingState>({
            areaPyeong: '',
            widthCm: '',
            lengthM: '',
            pricePerRoll: ''
      });

      const [result, setResult] = useState<CalculationResult | null>(null);
      const [errors, setErrors] = useState<ValidationErrors>({});
      const { history, addResult } = useMulchingHistory();

      /**
       * 입력값 변경 핸들러
       * 숫자와 소수점만 허용합니다.
       */
      const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;

            // 숫자와 소수점만 허용
            if (!/^\d*\.?\d*$/.test(value)) return;

            setInputs(prev => ({ ...prev, [name]: value }));

            // 입력 시 해당 필드의 에러 제거
            if (errors[name as keyof ValidationErrors]) {
                  setErrors(prev => ({ ...prev, [name]: undefined }));
            }
      }, [errors]);

      /**
       * 계산 실행
       * 입력값을 검증하고 계산 결과를 표시합니다.
       */
      const calculate = useCallback(() => {
            try {
                  const calculationResult = calculateMulching({
                        fieldAreaPyeong: parseFloat(inputs.areaPyeong),
                        mulchWidthCm: parseFloat(inputs.widthCm),
                        mulchLengthM: parseFloat(inputs.lengthM),
                        pricePerRollWon: parseFloat(inputs.pricePerRoll)
                  });

                  const newResult: CalculationResult = {
                        id: Date.now().toString(),
                        inputs: { ...inputs },
                        rolls: calculationResult.requiredRollsRounded,
                        cost: calculationResult.estimatedCostWon,
                        areaM2: calculationResult.fieldAreaM2,
                        rollAreaM2: calculationResult.areaPerRollM2,
                        timestamp: new Date()
                  };

                  setResult(newResult);
                  addResult(newResult);
                  setErrors({});
            } catch (error) {
                  console.error('Calculation error:', error);
                  // 에러 발생 시 사용자에게 알림 (필요시 추가)
            }
      }, [inputs, addResult]);

      return (
            <div className={`${LAYOUT.CONTAINER_MAX_WIDTH} mx-auto pb-10`}>
                  <div className={classNames(
                        'bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden transition-all duration-500',
                        'border border-gray-100 dark:border-gray-700'
                  )}>

                        {/* Header: Compact */}
                        <div className="pt-6 px-6 pb-2 text-center">
                              <h2 className="text-xl font-bold text-gray-900 dark:text-white">농업용 멀칭 비닐 계산기</h2>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    밭 면적(평)과 비닐 규격을 입력하면<br />필요한 롤 수와 비용을 즉시 계산해 드립니다.
                              </p>
                        </div>

                        <div className="p-6 pt-2 space-y-6">
                              {/* 1. Result Section */}
                              <ResultDisplay result={result} />

                              {/* 2. Detail Section */}
                              {result && <DetailSection result={result} />}

                              {/* 3. Input Form */}
                              <InputForm
                                    inputs={inputs}
                                    errors={errors}
                                    onInputChange={handleInputChange}
                                    onCalculate={calculate}
                              />

                              {/* 4. History Table */}
                              <HistoryTable history={history} />
                        </div>
                  </div>
            </div>
      );
};

export default MulchingFilm;
