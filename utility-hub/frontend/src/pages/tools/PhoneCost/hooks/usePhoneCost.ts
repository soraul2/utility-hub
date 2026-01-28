/**
 * Phone Cost Calculator 상태 관리 훅
 * - useReducer 기반 복잡한 상태 관리
 * - LocalStorage 연동으로 데이터 지속성 제공
 * - 계산/검증 로직은 유틸리티로 분리
 */

import { useReducer, useCallback, useEffect } from 'react';
import type { CarrierPlanInput, MvnoPlanInput, CarrierAddon, PlanComparisonResult, ValidationErrors } from '../types';
import { INITIAL_CARRIER_PLAN, INITIAL_MVNO_PLAN } from '../constants';
import { calculateCarrierTotal, calculateMvnoTotal } from '../utils/calculators';
import { validateInputs } from '../utils/validators';

const STORAGE_KEY = 'phone-cost-calculator-v1';

// Action Types
type Action =
      | { type: 'SET_CARRIER_FIELD'; field: keyof CarrierPlanInput; value: number }
      | { type: 'ADD_ADDON' }
      | { type: 'REMOVE_ADDON'; index: number }
      | { type: 'UPDATE_ADDON'; index: number; field: keyof CarrierAddon; value: string | number }
      | { type: 'SET_MVNO_FIELD'; field: keyof MvnoPlanInput; value: number }
      | { type: 'TOGGLE_VAT'; target: 'carrier' | 'mvno' }
      | { type: 'CALCULATE' }
      | { type: 'RESET' };

// State Interface
interface State {
      carrierPlan: CarrierPlanInput;
      mvnoPlan: MvnoPlanInput;
      carrierVatIncluded: boolean;
      mvnoVatIncluded: boolean;
      result: PlanComparisonResult | null;
      errors: ValidationErrors;
}

/**
 * LocalStorage에서 초기 상태 로드
 * - 파싱 실패 시 기본값 반환
 * - 이전 버전 호환성 유지 (vatIncluded -> carrierVatIncluded/mvnoVatIncluded)
 */
function loadInitialState(): State {
      try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                  const parsed = JSON.parse(saved);
                  if (parsed.carrierPlan && parsed.mvnoPlan) {
                        return {
                              carrierPlan: parsed.carrierPlan,
                              mvnoPlan: parsed.mvnoPlan,
                              // 이전 버전 호환성: vatIncluded -> carrierVatIncluded/mvnoVatIncluded
                              carrierVatIncluded: parsed.carrierVatIncluded ?? parsed.vatIncluded ?? false,
                              mvnoVatIncluded: parsed.mvnoVatIncluded ?? parsed.vatIncluded ?? false,
                              result: null,
                              errors: {},
                        };
                  }
            }
      } catch (e) {
            console.error('Failed to load state from localStorage', e);
      }

      return {
            carrierPlan: INITIAL_CARRIER_PLAN,
            mvnoPlan: INITIAL_MVNO_PLAN,
            carrierVatIncluded: false,
            mvnoVatIncluded: false,
            result: null,
            errors: {},
      };
}

/**
 * 상태 리듀서
 * - 모든 상태 변경을 중앙 집중식으로 관리
 */
function reducer(state: State, action: Action): State {
      switch (action.type) {
            case 'SET_CARRIER_FIELD':
                  return {
                        ...state,
                        carrierPlan: { ...state.carrierPlan, [action.field]: action.value },
                  };

            case 'ADD_ADDON': {
                  const newAddon: CarrierAddon = {
                        id: Date.now().toString(),
                        name: '',
                        monthlyFee: 0,
                        months: 24,
                  };
                  return {
                        ...state,
                        carrierPlan: {
                              ...state.carrierPlan,
                              addons: [...state.carrierPlan.addons, newAddon],
                        },
                  };
            }

            case 'REMOVE_ADDON':
                  return {
                        ...state,
                        carrierPlan: {
                              ...state.carrierPlan,
                              addons: state.carrierPlan.addons.filter((_, i) => i !== action.index),
                        },
                  };

            case 'UPDATE_ADDON': {
                  const updatedAddons = [...state.carrierPlan.addons];
                  updatedAddons[action.index] = {
                        ...updatedAddons[action.index],
                        [action.field]: action.value,
                  };
                  return {
                        ...state,
                        carrierPlan: { ...state.carrierPlan, addons: updatedAddons },
                  };
            }

            case 'SET_MVNO_FIELD':
                  return {
                        ...state,
                        mvnoPlan: { ...state.mvnoPlan, [action.field]: action.value },
                  };

            case 'TOGGLE_VAT':
                  if (action.target === 'carrier') {
                        return { ...state, carrierVatIncluded: !state.carrierVatIncluded };
                  }
                  return { ...state, mvnoVatIncluded: !state.mvnoVatIncluded };

            case 'CALCULATE': {
                  // 검증 수행 (유틸리티 함수 사용)
                  const errors = validateInputs(state.carrierPlan, state.mvnoPlan);

                  if (Object.keys(errors).length > 0) {
                        return { ...state, errors, result: null };
                  }

                  // 계산 수행 (유틸리티 함수 사용)
                  const { total: carrierTotal, formula: carrierFormula } = calculateCarrierTotal(
                        state.carrierPlan,
                        state.carrierVatIncluded
                  );
                  const { total: mvnoTotal, formula: mvnoFormula } = calculateMvnoTotal(
                        state.mvnoPlan,
                        state.mvnoVatIncluded
                  );

                  const difference = carrierTotal - mvnoTotal;

                  // 더 저렴한 플랜 결정
                  let cheaper: 'carrier' | 'mvno' | 'same' = 'same';
                  if (difference > 0) cheaper = 'mvno';
                  else if (difference < 0) cheaper = 'carrier';

                  return {
                        ...state,
                        errors: {},
                        result: {
                              carrierTotal,
                              mvnoTotal,
                              difference,
                              cheaper,
                              formula: {
                                    carrier: carrierFormula,
                                    mvno: mvnoFormula,
                              },
                        },
                  };
            }

            case 'RESET':
                  return loadInitialState();

            default:
                  return state;
      }
}

/**
 * Phone Cost Calculator 메인 훅
 * @returns 상태 및 액션 함수들
 */
export function usePhoneCost() {
      const [state, dispatch] = useReducer(reducer, null, loadInitialState);

      // LocalStorage에 상태 저장 (result와 errors는 제외)
      useEffect(() => {
            const dataToSave = {
                  carrierPlan: state.carrierPlan,
                  mvnoPlan: state.mvnoPlan,
                  carrierVatIncluded: state.carrierVatIncluded,
                  mvnoVatIncluded: state.mvnoVatIncluded,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      }, [state.carrierPlan, state.mvnoPlan, state.carrierVatIncluded, state.mvnoVatIncluded]);

      // 액션 함수들 (useCallback으로 메모이제이션)
      const setCarrierField = useCallback((field: keyof CarrierPlanInput, value: number) => {
            dispatch({ type: 'SET_CARRIER_FIELD', field, value });
      }, []);

      const addAddon = useCallback(() => {
            dispatch({ type: 'ADD_ADDON' });
      }, []);

      const removeAddon = useCallback((index: number) => {
            dispatch({ type: 'REMOVE_ADDON', index });
      }, []);

      const updateAddon = useCallback((index: number, field: keyof CarrierAddon, value: string | number) => {
            dispatch({ type: 'UPDATE_ADDON', index, field, value });
      }, []);

      const setMvnoField = useCallback((field: keyof MvnoPlanInput, value: number) => {
            dispatch({ type: 'SET_MVNO_FIELD', field, value });
      }, []);

      const toggleVat = useCallback((target: 'carrier' | 'mvno') => {
            dispatch({ type: 'TOGGLE_VAT', target });
      }, []);

      const calculate = useCallback(() => {
            dispatch({ type: 'CALCULATE' });
      }, []);

      return {
            state,
            actions: {
                  setCarrierField,
                  addAddon,
                  removeAddon,
                  updateAddon,
                  setMvnoField,
                  toggleVat,
                  calculate,
            },
      };
}
