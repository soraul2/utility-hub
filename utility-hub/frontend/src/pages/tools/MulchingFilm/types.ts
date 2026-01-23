/**
 * 멀칭 비닐 계산기 타입 정의
 * 
 * UI 컴포넌트에서 사용하는 모든 타입을 중앙 관리합니다.
 */

import type { CalculationResult } from '../../../hooks/useMulchingHistory';

/**
 * 입력 필드 상태
 */
export interface MulchingState {
      /** 밭의 면적 (평) */
      areaPyeong: string;
      /** 비닐 폭 (cm) */
      widthCm: string;
      /** 비닐 길이 (m) */
      lengthM: string;
      /** 롤당 가격 (원) */
      pricePerRoll: string;
}

/**
 * 입력 필드 검증 에러
 */
export interface ValidationErrors {
      areaPyeong?: string;
      widthCm?: string;
      lengthM?: string;
      pricePerRoll?: string;
}

/**
 * 입력 필드 설정
 */
export interface InputFieldConfig {
      /** 필드 이름 */
      name: keyof MulchingState;
      /** 라벨 텍스트 */
      label: string;
      /** 플레이스홀더 */
      placeholder: string;
      /** 단위 (평, cm, m, 원) */
      unit?: string;
}

/**
 * 결과 표시 Props
 */
export interface ResultDisplayProps {
      /** 계산 결과 (null이면 초기 상태) */
      result: CalculationResult | null;
}

/**
 * 상세 내역 Props
 */
export interface DetailSectionProps {
      /** 계산 결과 */
      result: CalculationResult;
}

/**
 * 입력 폼 Props
 */
export interface InputFormProps {
      /** 입력 상태 */
      inputs: MulchingState;
      /** 검증 에러 */
      errors: ValidationErrors;
      /** 입력 변경 핸들러 */
      onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      /** 계산 버튼 클릭 핸들러 */
      onCalculate: () => void;
}

/**
 * 히스토리 테이블 Props
 */
export interface HistoryTableProps {
      /** 계산 기록 배열 */
      history: CalculationResult[];
}
