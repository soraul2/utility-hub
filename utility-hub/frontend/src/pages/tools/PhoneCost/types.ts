export interface CarrierAddon {
      id: string; // for React key
      name: string;
      monthlyFee: number;
      months: number;
}

export interface CarrierPlanInput {
      highPlanMonths: number;
      highPlanMonthly: number;
      lowPlanMonths: number;
      lowPlanMonthly: number;
      deviceCostTotal: number;
      addons: CarrierAddon[];
}

export interface MvnoPlanInput {
      deviceCostTotal: number;
      mvnoMonthly: number;
      months: number;
}

export type PlanType = 'carrier' | 'mvno' | 'same';

export interface PlanComparisonResult {
      carrierTotal: number;
      mvnoTotal: number;
      difference: number;
      cheaper: PlanType;
      formula: {
            carrier: string;
            mvno: string;
      };
}

/**
 * 검증 에러 키 타입
 * - 명시적인 키 정의로 타입 안전성 향상
 * - IDE 자동완성 지원
 */
export type ValidationErrorKey =
      | 'highPlanMonths'
      | 'highPlanMonthly'
      | 'lowPlanMonths'
      | 'lowPlanMonthly'
      | 'deviceCostTotal'
      | 'mvnoDeviceCost'
      | 'mvnoMonthly'
      | 'mvnoMonths'
      | `addon_${number}_fee`
      | `addon_${number}_months`;

/**
 * 검증 에러 맵
 * - Partial로 선택적 에러 표현
 */
export type ValidationErrors = Partial<Record<ValidationErrorKey, string>>;
