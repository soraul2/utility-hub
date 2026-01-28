/**
 * 검증 로직 유틸리티
 * - 입력값 검증 로직 중앙 관리
 * - 재사용 가능한 검증 함수 제공
 */

import type { CarrierPlanInput, MvnoPlanInput, ValidationErrors } from '../types';
import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants';

/**
 * 양수 검증 헬퍼
 * @param value - 검증할 값
 * @returns 에러 메시지 또는 null
 */
function validatePositiveNumber(value: number): string | null {
      return value < VALIDATION_RULES.MIN_VALUE ? ERROR_MESSAGES.NEGATIVE_VALUE : null;
}

/**
 * 최소값 검증 헬퍼
 * @param value - 검증할 값
 * @param min - 최소값
 * @returns 에러 메시지 또는 null
 */
function validateMinValue(value: number, min: number): string | null {
      return value < min ? ERROR_MESSAGES.MIN_MONTHS_REQUIRED : null;
}

/**
 * 약정 기간 검증 헬퍼
 * @param high - 고가 요금제 개월 수
 * @param low - 저가 요금제 개월 수
 * @returns 에러 메시지 또는 null
 */
function validateContractPeriod(high: number, low: number): string | null {
      return high + low !== VALIDATION_RULES.CONTRACT_MONTHS
            ? ERROR_MESSAGES.CONTRACT_PERIOD_MISMATCH
            : null;
}

/**
 * 통신사 및 알뜰폰 플랜 입력값 검증
 * @param carrier - 통신사 플랜 입력
 * @param mvno - 알뜰폰 플랜 입력
 * @returns 검증 에러 맵
 */
export function validateInputs(
      carrier: CarrierPlanInput,
      mvno: MvnoPlanInput
): ValidationErrors {
      const errors: ValidationErrors = {};

      // 통신사 플랜 검증
      const highMonthsError = validatePositiveNumber(carrier.highPlanMonths);
      if (highMonthsError) errors.highPlanMonths = highMonthsError;

      const highMonthlyError = validatePositiveNumber(carrier.highPlanMonthly);
      if (highMonthlyError) errors.highPlanMonthly = highMonthlyError;

      const lowMonthsError = validatePositiveNumber(carrier.lowPlanMonths);
      if (lowMonthsError) errors.lowPlanMonths = lowMonthsError;

      const lowMonthlyError = validatePositiveNumber(carrier.lowPlanMonthly);
      if (lowMonthlyError) errors.lowPlanMonthly = lowMonthlyError;

      const deviceCostError = validatePositiveNumber(carrier.deviceCostTotal);
      if (deviceCostError) errors.deviceCostTotal = deviceCostError;

      // 약정 기간 검증
      const contractPeriodError = validateContractPeriod(
            carrier.highPlanMonths,
            carrier.lowPlanMonths
      );
      if (contractPeriodError) {
            errors.highPlanMonths = contractPeriodError;
            errors.lowPlanMonths = contractPeriodError;
      }

      // 부가 서비스 검증
      carrier.addons.forEach((addon, index) => {
            if (addon.monthlyFee < VALIDATION_RULES.MIN_VALUE) {
                  errors[`addon_${index}_fee` as const] = ERROR_MESSAGES.ADDON_FEE_NEGATIVE;
            }
            if (addon.months < VALIDATION_RULES.MIN_VALUE) {
                  errors[`addon_${index}_months` as const] = ERROR_MESSAGES.ADDON_MONTHS_NEGATIVE;
            }
            if (addon.months > VALIDATION_RULES.MAX_ADDON_MONTHS) {
                  errors[`addon_${index}_months` as const] = ERROR_MESSAGES.ADDON_MONTHS_EXCEEDED;
            }
      });

      // 알뜰폰 플랜 검증
      const mvnoDeviceCostError = validatePositiveNumber(mvno.deviceCostTotal);
      if (mvnoDeviceCostError) errors.mvnoDeviceCost = mvnoDeviceCostError;

      const mvnoMonthlyError = validatePositiveNumber(mvno.mvnoMonthly);
      if (mvnoMonthlyError) errors.mvnoMonthly = mvnoMonthlyError;

      const mvnoMonthsError = validateMinValue(mvno.months, VALIDATION_RULES.MIN_MONTHS);
      if (mvnoMonthsError) errors.mvnoMonths = mvnoMonthsError;

      return errors;
}
