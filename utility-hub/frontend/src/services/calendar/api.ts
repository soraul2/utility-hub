import axiosInstance from '../../api/axiosInstance';

export const calendarApi = {
      getGoogleStatus: () =>
            axiosInstance.get<{ connected: boolean }>('/calendar/google/status'),

      getGoogleAuthUrl: () =>
            axiosInstance.get<{ authUrl: string }>('/calendar/google/auth-url'),

      disconnectGoogle: () =>
            axiosInstance.post<{ success: boolean }>('/calendar/google/disconnect'),
};
