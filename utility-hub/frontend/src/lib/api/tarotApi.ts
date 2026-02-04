import axiosInstance from '../../api/axiosInstance';
import type {
      AssistantReadingResponse,
      DailyCardResponse,
      HistoryResponse,
      PageResponse,
      TarotAssistantType,
      ThreeCardRequest,
      ThreeCardResponse,
      ShareResponse
} from '../tarot';

const BASE_URL = '/tarot';

export const fetchDailyCard = async (userName?: string): Promise<DailyCardResponse> => {
      const response = await axiosInstance.get<DailyCardResponse>(`${BASE_URL}/daily-card`, {
            params: userName ? { userName } : {},
      });
      return response.data;
};

export const createThreeCardReading = async (payload: ThreeCardRequest): Promise<ThreeCardResponse> => {
      const response = await axiosInstance.post<ThreeCardResponse>(`${BASE_URL}/readings/three-cards`, payload);
      return response.data;
};

export const createAssistantReading = async (
      sessionId: number,
      type: TarotAssistantType,
      summary: boolean = false
): Promise<AssistantReadingResponse> => {
      const response = await axiosInstance.post<AssistantReadingResponse>(
            `${BASE_URL}/readings/${sessionId}/assistants/${type}`,
            null,
            { params: summary ? { summary: true } : {} }
      );
      return response.data;
};

export const getHistory = async (
      page: number = 0,
      size: number = 10,
      spreadType?: string,
      sort?: string,
      search?: string
): Promise<PageResponse<HistoryResponse>> => {
      const response = await axiosInstance.get<PageResponse<HistoryResponse>>(`${BASE_URL}/history`, {
            params: { page, size, spreadType, sort, search },
      });
      return response.data;
};

export const deleteReading = async (sessionId: number): Promise<void> => {
      await axiosInstance.delete(`${BASE_URL}/history/${sessionId}`);
};

export const getShare = async (shareUuid: string): Promise<ShareResponse> => {
      const response = await axiosInstance.get<ShareResponse>(`${BASE_URL}/share/${shareUuid}`);
      return response.data;
};

export const migrateSessions = async (sessionIds: number[]): Promise<void> => {
      await axiosInstance.post(`${BASE_URL}/migrate`, { sessionIds });
};
