/**
 * 멀칭 비닐 계산기 상수 정의
 * 
 * 매직 넘버와 설정값을 중앙 관리합니다.
 */

/**
 * 레이아웃 관련 상수
 */
export const LAYOUT = {
      /** 컨테이너 최대 너비 */
      CONTAINER_MAX_WIDTH: 'max-w-[480px]',
} as const;

/**
 * 히스토리 관련 상수
 */
export const HISTORY = {
      /** 최대 저장 개수 */
      MAX_ITEMS: 5,
} as const;

/**
 * 입력 필드 플레이스홀더
 */
export const INPUT_PLACEHOLDERS = {
      areaPyeong: '100',
      widthCm: '90',
      lengthM: '500',
      pricePerRoll: '25000',
} as const;

/**
 * 입력 필드 라벨
 */
export const INPUT_LABELS = {
      areaPyeong: '밭의 면적 (평)',
      widthCm: '비닐 폭 (cm)',
      lengthM: '비닐 길이 (m)',
      pricePerRoll: '롤당 가격 (원)',
} as const;

/**
 * 검증 에러 메시지
 */
export const VALIDATION_MESSAGES = {
      REQUIRED: '값을 입력해 주세요',
      INVALID_NUMBER: '숫자만 입력 가능합니다',
      MUST_BE_POSITIVE: '0보다 큰 값을 입력해 주세요',
} as const;
