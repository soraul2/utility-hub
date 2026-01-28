/**
 * 클립보드 복사 유틸리티
 * 
 * 텍스트를 클립보드에 복사하는 통합 유틸리티 함수
 */

/**
 * 텍스트를 클립보드에 복사
 * 
 * @param text - 복사할 텍스트
 * @returns 성공 여부를 나타내는 Promise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
      try {
            await navigator.clipboard.writeText(text);
            return true;
      } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
      }
}
