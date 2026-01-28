import { useState, useCallback, useRef } from 'react';
import type { Persona } from '../components/tools/text-to-md/types';
import { fetchTextToMd } from '../lib/api/textToMdApi';

interface UseTextToMdAiReturn {
      markdownText: string;
      isLoading: boolean;
      error: string | null;
      errorCode: string | null;
      model: string | null;
      tokensUsed: number | null;
      convert: (text: string, persona: Persona, autoHeading: boolean, autoList: boolean) => Promise<void>;
      reset: () => void;
}

export const useTextToMdAi = (): UseTextToMdAiReturn => {
      const [markdownText, setMarkdownText] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<string | null>(null);
      const [errorCode, setErrorCode] = useState<string | null>(null);
      const [model, setModel] = useState<string | null>(null);
      const [tokensUsed, setTokensUsed] = useState<number | null>(null);

      // useRef로 재시도 카운트 관리 (무한 리렌더링 방지)
      const retryCountRef = useRef(0);
      const MAX_RETRIES = 1;

      const convert = useCallback(async (
            text: string,
            persona: Persona,
            autoHeading: boolean,
            autoList: boolean
      ) => {
            if (!text.trim()) {
                  setError("변환할 텍스트를 입력해주세요.");
                  setErrorCode(null);
                  return;
            }

            setIsLoading(true);
            setError(null);
            setErrorCode(null);
            setMarkdownText('');
            setModel(null);
            setTokensUsed(null);

            try {
                  const response = await fetchTextToMd({
                        rawText: text,
                        autoHeading,
                        autoList,
                        persona,
                  });

                  setMarkdownText(response.markdownText);
                  setModel(response.model || null);
                  setTokensUsed(response.tokensUsed || null);
                  retryCountRef.current = 0; // 성공 시 재시도 카운트 리셋
            } catch (err: any) {
                  const errorMessage = err.message || "변환 중 문제가 발생했습니다.";
                  const code = err.code || null;

                  // 네트워크 에러이고 재시도 가능한 경우
                  const isNetworkError = errorMessage.includes('fetch') ||
                        errorMessage.includes('Network') ||
                        errorMessage.includes('Failed to fetch');

                  if (isNetworkError && retryCountRef.current < MAX_RETRIES) {
                        console.log(`Auto-retrying (${retryCountRef.current + 1}/${MAX_RETRIES})...`);
                        retryCountRef.current += 1;

                        // 1초 후 재시도
                        setTimeout(() => {
                              convert(text, persona, autoHeading, autoList);
                        }, 1000);
                        return;
                  }

                  // 재시도 실패 또는 다른 에러
                  setError(errorMessage);
                  setErrorCode(code);
                  retryCountRef.current = 0; // 재시도 카운트 리셋
                  setIsLoading(false);
            } finally {
                  // 재시도 중이 아닐 때만 로딩 해제
                  if (retryCountRef.current === 0) {
                        setIsLoading(false);
                  }
            }
      }, []);

      const reset = useCallback(() => {
            setMarkdownText('');
            setError(null);
            setErrorCode(null);
            setModel(null);
            setTokensUsed(null);
            retryCountRef.current = 0;
      }, []);

      return {
            markdownText,
            isLoading,
            error,
            errorCode,
            model,
            tokensUsed,
            convert,
            reset
      };
};

