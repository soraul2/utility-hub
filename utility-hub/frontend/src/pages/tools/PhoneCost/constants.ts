import type { CarrierPlanInput, MvnoPlanInput } from './types';

export const INITIAL_CARRIER_PLAN: CarrierPlanInput = {
      highPlanMonths: 6,
      highPlanMonthly: 109000,
      lowPlanMonths: 18,
      lowPlanMonthly: 69000,
      deviceCostTotal: 500000,
      addons: [],
};

export const INITIAL_MVNO_PLAN: MvnoPlanInput = {
      deviceCostTotal: 1200000,
      mvnoMonthly: 33000,
      months: 24,
};

export const VALIDATION_RULES = {
      CONTRACT_MONTHS: 24,
      MAX_ADDON_MONTHS: 36,
      MIN_VALUE: 0,
      MIN_MONTHS: 1,
} as const;

export const VAT_MULTIPLIER = 1.1;

export const ERROR_MESSAGES = {
      NEGATIVE_VALUE: '0 이상의 값을 입력해주세요.',
      CONTRACT_PERIOD_MISMATCH: '총 약정 기간(고가+저가)은 24개월이어야 합니다.',
      ADDON_MONTHS_EXCEEDED: '최대 36개월까지만 가능합니다.',
      MIN_MONTHS_REQUIRED: '1 이상의 값을 입력해주세요.',
      ADDON_FEE_NEGATIVE: '0 이상 입력',
      ADDON_MONTHS_NEGATIVE: '0 이상 입력',
} as const;

export const LAYOUT = {
      CONTAINER_MAX_WIDTH: 'max-w-7xl',
};
