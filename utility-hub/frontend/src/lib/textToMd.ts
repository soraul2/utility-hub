/**
 * 텍스트 → Markdown 변환 로직
 * 
 * 일반 텍스트를 Markdown 형식으로 변환하는 유틸리티 함수들을 제공합니다.
 */

/**
 * 변환 옵션
 */
export interface TextToMdOptions {
      /** 첫 줄을 자동으로 제목(#)으로 변환 */
      autoHeading: boolean;
      /** 각 줄을 자동으로 리스트(-)로 변환 */
      autoList: boolean;
}

/**
 * 기본 변환 옵션
 */
export const DEFAULT_OPTIONS: TextToMdOptions = {
      autoHeading: true,
      autoList: true,
};

/**
 * 텍스트를 Markdown으로 변환
 * 
 * @param text - 변환할 원본 텍스트
 * @param options - 변환 옵션
 * @returns 변환된 Markdown 텍스트
 */
export function convertTextToMarkdown(
      text: string,
      options: TextToMdOptions = DEFAULT_OPTIONS
): string {
      if (!text || text.trim().length === 0) {
            return '';
      }

      const lines = text.split('\n');
      const processedLines: string[] = [];

      lines.forEach((line, index) => {
            let currentLine = line;

            // 자동 제목 변환 (첫 줄만)
            if (options.autoHeading && index === 0 && currentLine.trim().length > 0) {
                  if (!currentLine.startsWith('#')) {
                        currentLine = `# ${currentLine}`;
                  }
            }

            // 자동 리스트 변환
            if (options.autoList && currentLine.trim().length > 0) {
                  // 이미 제목이나 리스트가 아닌 경우에만 변환
                  if (!currentLine.startsWith('#') && !currentLine.startsWith('-')) {
                        currentLine = `- ${currentLine}`;
                  }
            }

            processedLines.push(currentLine);
      });

      return processedLines.join('\n');
}

/**
 * Markdown 텍스트를 파일로 다운로드
 * 
 * @param content - 다운로드할 Markdown 내용
 * @param filename - 파일명 (기본값: 'converted.md')
 */
export function downloadMarkdown(content: string, filename: string = 'converted.md'): void {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 메모리 정리
      URL.revokeObjectURL(url);
}

/**
 * 클립보드에 텍스트 복사
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
