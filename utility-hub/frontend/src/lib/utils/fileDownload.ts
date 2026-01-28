/**
 * 파일 다운로드 유틸리티
 * 
 * Markdown 파일 다운로드를 위한 통합 유틸리티 함수
 */

/**
 * Markdown 텍스트를 파일로 다운로드
 * 
 * @param content - 다운로드할 Markdown 내용
 * @param filename - 파일명 (기본값: 타임스탬프 포함 자동 생성)
 */
export function downloadMarkdown(content: string, filename?: string): void {
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename || `converted_${new Date().getTime()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 메모리 정리
      URL.revokeObjectURL(url);
}
