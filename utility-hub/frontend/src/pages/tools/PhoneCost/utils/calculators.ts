/**
 * 계산 로직 유틸리티
 * - 순수 함수로 분리하여 테스트 용이성 향상
 * - 비즈니스 로직과 상태 관리 분리
 */

import type { CarrierPlanInput, MvnoPlanInput } from '../types';
import { VAT_MULTIPLIER } from '../constants';
import { formatNumber } from './formatters';

/**
 * VAT 적용 금액 계산
 * @param amount - 원본 금액
 * @param vatIncluded - VAT 포함 여부
 * @returns VAT 적용된 금액
 */
export function applyVat(amount: number, vatIncluded: boolean): number {
      return vatIncluded ? amount * VAT_MULTIPLIER : amount;
}

/**
 * 통신사 약정 플랜 총액 계산
 * @param input - 통신사 플랜 입력 데이터
 * @param vatIncluded - VAT 포함 여부 (요금제에만 적용)
 * @returns 총액 및 계산 공식
 */
export function calculateCarrierTotal(
      input: CarrierPlanInput,
      vatIncluded: boolean = false
): { total: number; formula: string } {
      // 고가 요금제 비용
      const highPlanPrice = applyVat(input.highPlanMonthly, vatIncluded);
      const highCost = highPlanPrice * input.highPlanMonths;

      // 저가 요금제 비용
      const lowPlanPrice = applyVat(input.lowPlanMonthly, vatIncluded);
      const lowCost = lowPlanPrice * input.lowPlanMonths;

      // 기기 비용 (VAT 미적용 - 이미 포함된 것으로 간주)
      const deviceCost = input.deviceCostTotal;

      // 부가 서비스 비용
      let addonsCost = 0;
      let addonsFormula = '';

      if (input.addons.length > 0) {
            addonsCost = input.addons.reduce((sum, addon) => {
                  return sum + applyVat(addon.monthlyFee, vatIncluded) * addon.months;
            }, 0);
            addonsFormula = ` + 부가서비스(${formatNumber(addonsCost)}원)`;
      }

      const total = deviceCost + highCost + lowCost + addonsCost;

      const formula = `기기값(${formatNumber(deviceCost)}) + 고가요금(${formatNumber(highPlanPrice)}×${input.highPlanMonths}) + 저가요금(${formatNumber(lowPlanPrice)}×${input.lowPlanMonths})${addonsFormula}`;

      return { total, formula };
}

/**
 * 자급제 + 알뜰폰 플랜 총액 계산
 * @param input - 알뜰폰 플랜 입력 데이터
 * @param vatIncluded - VAT 포함 여부 (요금제에만 적용)
 * @returns 총액 및 계산 공식
 */
export function calculateMvnoTotal(
      input: MvnoPlanInput,
      vatIncluded: boolean = false
): { total: number; formula: string } {
      // 알뜰폰 요금제 비용
      const mvnoPrice = applyVat(input.mvnoMonthly, vatIncluded);
      const planCost = mvnoPrice * input.months;

      // 기기 비용 (VAT 미적용)
      const deviceCost = input.deviceCostTotal;

      const total = deviceCost + planCost;

      const formula = `자급제기기(${formatNumber(deviceCost)}) + 알뜰요금(${formatNumber(mvnoPrice)}×${input.months})`;

      return { total, formula };
}
