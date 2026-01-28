import type { Persona } from '../../components/tools/text-to-md/types';
import { mapErrorCodeToMessage, type ErrorResponse } from './errorMapper';

interface TextToMdRequest {
      rawText: string;
      autoHeading: boolean;
      autoList: boolean;
      persona?: Persona;
}

interface TextToMdResponse {
      markdownText: string;
      model?: string;
      tokensUsed?: number;
}

/**
 * 백엔드 TextToMd API 호출
 * 
 * @param request - 변환 요청 데이터
 * @returns 변환된 마크다운 텍스트 및 메타데이터
 * @throws Error - 에러 코드가 매핑된 사용자 친화적 메시지
 */
export const fetchTextToMd = async (request: TextToMdRequest): Promise<TextToMdResponse> => {
      try {
            const response = await fetch('/api/text-to-md', {
                  method: 'POST',
                  headers: {
                        'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(request),
            });

            if (!response.ok) {
                  const errorData = await response.json().catch(() => ({})) as Partial<ErrorResponse>;

                  // 백엔드 에러 코드가 있으면 매핑, 없으면 기본 메시지
                  const errorMessage = errorData.code
                        ? mapErrorCodeToMessage(errorData.code, errorData.message || '알 수 없는 오류가 발생했습니다.')
                        : errorData.message || `오류가 발생했습니다. (Status: ${response.status})`;

                  // 에러 코드를 Error 객체에 포함 (UI에서 특별 처리용)
                  const error = new Error(errorMessage);
                  (error as any).code = errorData.code;
                  throw error;
            }

            return await response.json();
      } catch (error) {
            console.error('TextToMd API Error:', error);
            throw error;
      }
};
