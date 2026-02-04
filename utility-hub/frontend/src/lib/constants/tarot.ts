/**
 * MysticTarot 상수 정의
 */

// 카드 관련 상수
export const TAROT_DECK_SIZE = 22;
export const DAILY_CARD_COUNT = 10;
export const THREE_CARD_POSITIONS = ['PAST', 'PRESENT', 'FUTURE'] as const;

// 확률 상수
export const FORTUNA_PROBABILITY = 0.01;

// 페이지네이션 상수
export const DEFAULT_PAGE_SIZE = 10;

// 딜레이 상수
export const SEARCH_DEBOUNCE_MS = 500;

// 에러 메시지
export const ERROR_MESSAGES = {
      UNKNOWN: '알 수 없는 오류가 발생했습니다.',
      DELETE_FAILED: '기록 삭제에 실패했습니다.',
      NETWORK: '네트워크 연결을 확인해주세요.',
      NOT_FOUND: '요청한 데이터를 찾을 수 없습니다.',
} as const;

// 유효성 검사 상수
export const VALIDATION = {
      QUESTION_MAX_LENGTH: 500,
      USERNAME_MAX_LENGTH: 50,
      USER_AGE_MIN: 1,
      USER_AGE_MAX: 120,
} as const;
