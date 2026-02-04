/**
 * API 유틸리티 함수
 */

/**
 * undefined 값을 제거한 파라미터 객체 반환
 */
export const cleanParams = <T extends Record<string, unknown>>(obj: T): Partial<T> =>
      Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ) as Partial<T>;
