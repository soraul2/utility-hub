/**
 * 텍스트 → Markdown 변환 훅
 * 
 * 텍스트를 Markdown으로 변환하는 로직과 상태를 관리합니다.
 */

import { useState, useEffect, useCallback } from 'react';
import type { TextToMdOptions } from '../lib/textToMd';
import {
      DEFAULT_OPTIONS,
      convertTextToMarkdown,
      downloadMarkdown,
      copyToClipboard,
} from '../lib/textToMd';

export interface UseTextToMdReturn {
      // 상태
      input: string;
      output: string;
      options: TextToMdOptions;
      copySuccess: string;

      // 액션
      setInput: (text: string) => void;
      setOptions: (options: TextToMdOptions) => void;
      handleCopy: () => Promise<void>;
      handleDownload: () => void;
}

/**
 * 텍스트 → Markdown 변환 훅
 * 
 * @param initialOptions - 초기 변환 옵션 (선택)
 * @returns 변환 상태 및 제어 함수
 */
export function useTextToMd(
      initialOptions: TextToMdOptions = DEFAULT_OPTIONS
): UseTextToMdReturn {
      const [input, setInput] = useState('');
      const [output, setOutput] = useState('');
      const [options, setOptions] = useState<TextToMdOptions>(initialOptions);
      const [copySuccess, setCopySuccess] = useState('');

      // 입력 또는 옵션 변경 시 자동 변환
      useEffect(() => {
            const converted = convertTextToMarkdown(input, options);
            setOutput(converted);
      }, [input, options]);

      // 클립보드 복사
      const handleCopy = useCallback(async () => {
            const success = await copyToClipboard(output);

            if (success) {
                  setCopySuccess('복사됨!');
            } else {
                  setCopySuccess('복사 실패');
            }

            // 2초 후 메시지 제거
            setTimeout(() => setCopySuccess(''), 2000);
      }, [output]);

      // 파일 다운로드
      const handleDownload = useCallback(() => {
            downloadMarkdown(output);
      }, [output]);

      return {
            input,
            output,
            options,
            copySuccess,
            setInput,
            setOptions,
            handleCopy,
            handleDownload,
      };
}
