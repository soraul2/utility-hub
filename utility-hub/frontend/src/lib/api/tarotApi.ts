import type { AssistantReadingResponse, DailyCardResponse, TarotAssistantType, ThreeCardRequest, ThreeCardResponse } from '../tarot';

const BASE_URL = `http://${window.location.hostname}:8080/api/tarot`;

export const fetchDailyCard = async (userName?: string): Promise<DailyCardResponse> => {
      const params = userName ? `?userName=${encodeURIComponent(userName)}` : '';
      const response = await fetch(`${BASE_URL}/daily-card${params}`, {
            method: 'GET',
            headers: {
                  'Content-Type': 'application/json; charset=UTF-8',
            },
      });

      if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '오늘의 카드를 불러오는데 실패했습니다.');
      }

      return response.json();
};

export const createThreeCardReading = async (payload: ThreeCardRequest): Promise<ThreeCardResponse> => {
      const response = await fetch(`${BASE_URL}/readings/three-cards`, {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(payload),
      });

      if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '리딩을 생성하는데 실패했습니다.');
      }

      return response.json();
};

export const createAssistantReading = async (sessionId: number, type: TarotAssistantType, summary: boolean = false): Promise<AssistantReadingResponse> => {
      const query = summary ? '?summary=true' : '';
      const response = await fetch(`${BASE_URL}/readings/${sessionId}/assistants/${type}${query}`, {
            method: 'POST',
            headers: {
                  'Content-Type': 'application/json; charset=UTF-8',
            },
      });

      if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '조수 리딩을 생성하는데 실패했습니다.');
      }

      return response.json();
};
