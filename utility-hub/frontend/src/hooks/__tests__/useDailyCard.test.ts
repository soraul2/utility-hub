import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyCard } from '../useDailyCard';
import { server } from '@/test/mocks/server';
import { http, HttpResponse, delay } from 'msw';

describe('useDailyCard', () => {
      const BASE_URL = 'http://localhost:8080/api/tarot';

      it('초기 상태가 올바르게 설정된다', () => {
            // Act
            const { result } = renderHook(() => useDailyCard());

            // Assert
            expect(result.current.data).toBeNull();
            expect(result.current.loading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(typeof result.current.loadDailyCard).toBe('function');
            expect(typeof result.current.reset).toBe('function');
      });

      it('loadDailyCard 호출 시 로딩 상태가 활성화된다', async () => {
            // Arrange
            server.use(
                  http.get(`${BASE_URL}/daily-card`, async () => {
                        await delay(100); // 100ms 지연
                        return HttpResponse.json({});
                  })
            );
            const { result } = renderHook(() => useDailyCard());

            // Act
            // Promise를 반환하지만 await하지 않음 (로딩 상태 확인을 위해)
            // act를 사용하여 상태 업데이트가 반영될 수 있도록 함
            // 하지만 비동기 함수 시작 시점의 상태를 잡으려면 waitFor를 사용하는 것이 안전함
            result.current.loadDailyCard('테스트유저');

            // Assert
            await waitFor(() => {
                  expect(result.current.loading).toBe(true);
            });

            // Cleanup
            await waitFor(() => expect(result.current.loading).toBe(false));
      });

      it('성공 시 data에 응답이 저장된다', async () => {
            // Arrange
            const { result } = renderHook(() => useDailyCard());

            // Act
            await result.current.loadDailyCard('홍길동');

            // Assert
            await waitFor(() => {
                  expect(result.current.loading).toBe(false);
                  expect(result.current.data).toBeTruthy();
                  expect(result.current.data?.aiReading).toContain('홍길동');
                  expect(result.current.error).toBeNull();
            });
      });

      it('API 실패 시 error에 에러 메시지가 저장된다', async () => {
            // Arrange
            server.use(
                  http.get(`${BASE_URL}/daily-card`, () => {
                        return HttpResponse.json(
                              { message: '이미 카드를 뽑았습니다.' },
                              { status: 400 }
                        );
                  })
            );
            const { result } = renderHook(() => useDailyCard());

            // Act
            await result.current.loadDailyCard();

            // Assert
            await waitFor(() => {
                  expect(result.current.loading).toBe(false);
                  expect(result.current.data).toBeNull();
                  expect(result.current.error).toBe('이미 카드를 뽑았습니다.');
            });
      });

      it('reset 호출 시 초기 상태로 복귀한다', async () => {
            // Arrange
            const { result } = renderHook(() => useDailyCard());
            await result.current.loadDailyCard();
            await waitFor(() => expect(result.current.data).toBeTruthy());

            // Act
            result.current.reset();

            // Assert
            await waitFor(() => {
                  expect(result.current.data).toBeNull();
                  expect(result.current.loading).toBe(false);
                  expect(result.current.error).toBeNull();
            });
      });
});
