/**
 * 백엔드 에러 코드를 사용자 친화적 메시지로 매핑
 * 
 * @see backendAiGuide/perplexityGuide/design_spec_backend.md
 * @see frontendAiGuide/perplexityGuide/text2md_guide/checklist_security_front_v0.3_text2md.md
 */

export interface ErrorResponse {
      code: string;
      message: string;
}

/**
 * 백엔드 에러 코드를 사용자 친화적 한국어 메시지로 변환
 * 
 * @param code - 백엔드에서 반환한 에러 코드 (예: TEXT_001, AI_001)
 * @param defaultMessage - 매핑되지 않은 코드에 대한 기본 메시지
 * @returns 사용자에게 표시할 한국어 에러 메시지
 */
export const mapErrorCodeToMessage = (code: string, defaultMessage: string): string => {
      const errorMap: Record<string, string> = {
            // 입력 검증 에러
            'TEXT_001': '입력 텍스트가 비어 있거나 너무 깁니다. (최대 10,000자)',

            // AI 서비스 에러
            'AI_001': 'AI 서비스 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
            'AI_002': 'AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',

            // 페르소나 에러 (선택)
            'PERSONA_001': '지원하지 않는 페르소나입니다.',
      };

      return errorMap[code] || defaultMessage;
};

/**
 * 에러 코드가 입력 관련 에러인지 확인
 * TEXT_001 에러는 입력 영역 아래에 특별히 표시됨
 */
export const isInputError = (code: string): boolean => {
      return code === 'TEXT_001';
};

/**
 * 에러 코드가 AI 서비스 관련 에러인지 확인
 * AI_001, AI_002 에러는 상단 Alert로 표시됨
 */
export const isAiServiceError = (code: string): boolean => {
      return code === 'AI_001' || code === 'AI_002';
};
