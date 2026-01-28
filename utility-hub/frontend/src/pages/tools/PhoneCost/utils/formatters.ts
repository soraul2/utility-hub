/**
 * 포맷팅 유틸리티 함수
 * - 금액 및 숫자 포맷팅 로직 중앙 관리
 * - 재사용성 및 테스트 용이성 향상
 */

/**
 * 숫자를 한국어 금액 형식으로 변환
 * @param value - 변환할 금액 (원 단위)
 * @returns 한국어 금액 문자열 (예: "1,207만 1,200원")
 * @example
 * formatToKoreanWon(12071200) // "1,207만 1,200원"
 * formatToKoreanWon(50000) // "5만 원"
 * formatToKoreanWon(0) // "0원"
 */
export function formatToKoreanWon(value: number): string {
      if (value === 0) return '0원';

      const man = Math.floor(value / 10000);
      const remainder = value % 10000;

      return `${man > 0 ? `${man.toLocaleString()}만 ` : ''}${remainder > 0 ? `${remainder.toLocaleString()}` : ''}원`.trim();
}

/**
 * 숫자를 천 단위 구분 기호로 포맷팅
 * @param value - 포맷팅할 숫자
 * @returns 천 단위 구분 기호가 포함된 문자열 (예: "1,234,567")
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(0) // "0"
 */
export function formatNumber(value: number): string {
      return Math.floor(value).toLocaleString();
}
