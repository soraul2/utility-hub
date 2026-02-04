import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/tokenStorage';
import type { TokenResponse } from '../types/auth';

/**
 * 전역 Axios 인스턴스 설정
 * 
 * - Base URL: /api (Vite 프록시 설정 활용)
 * - Request Interceptor: 모든 요청에 Bearer 토큰 주입
 * - Response Interceptor: 401 발생 시 토큰 재발급(Refresh) 처리
 */
const axiosInstance: AxiosInstance = axios.create({
      baseURL: '/api',
      headers: {
            'Content-Type': 'application/json',
      },
});

/**
 * 요청 인터셉터: 헤더에 액세스 토큰 추가
 */
axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
            const token = getAccessToken();
            if (token && config.headers) {
                  config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
      },
      (error) => {
            return Promise.reject(error);
      }
);

/**
 * 응답 인터셉터: 401 에러(만료된 토큰) 처리
 */
let isRefreshing = false;

interface QueueItem {
      resolve: (token: string) => void;
      reject: (error: unknown) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
      failedQueue.forEach((prom) => {
            if (error) {
                  prom.reject(error);
            } else if (token) {
                  prom.resolve(token);
            }
      });
      failedQueue = [];
};

axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
            return response;
      },
      async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            // 401 에러이고 아직 재시도하지 않은 요청인 경우
            if (error.response?.status === 401 && !originalRequest._retry) {

                  // 이미 토큰 재발급 중이라면 큐에 추가
                  if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                              failedQueue.push({ resolve, reject });
                        })
                              .then((token) => {
                                    if (originalRequest.headers) {
                                          originalRequest.headers.Authorization = `Bearer ${token}`;
                                    }
                                    return axiosInstance(originalRequest);
                              })
                              .catch((err) => {
                                    return Promise.reject(err);
                              });
                  }

                  originalRequest._retry = true;
                  isRefreshing = true;

                  const refreshToken = getRefreshToken();

                  if (!refreshToken) {
                        // 리프레시 토큰이 없으면 로그아웃 처리
                        isRefreshing = false;
                        clearTokens();
                        // 페이지 새로고침하여 로그인 상태 초기화 유도 (또는 Context에서 처리)
                        window.location.href = '/login';
                        return Promise.reject(error);
                  }

                  try {
                        // 토큰 재발급 요청
                        const response = await axios.post<TokenResponse>('/api/auth/token/refresh', {
                              refreshToken: refreshToken,
                        });

                        const { accessToken, refreshToken: newRefreshToken } = response.data;

                        // 새 토큰 저장
                        setTokens(accessToken, newRefreshToken);

                        // 헤더 업데이트 및 큐 처리
                        if (originalRequest.headers) {
                              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        }
                        processQueue(null, accessToken);

                        return axiosInstance(originalRequest);
                  } catch (refreshError) {
                        // 재발급 실패 시 로그아웃
                        processQueue(refreshError, null);
                        clearTokens();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                  } finally {
                        isRefreshing = false;
                  }
            }

            return Promise.reject(error);
      }
);

export default axiosInstance;
