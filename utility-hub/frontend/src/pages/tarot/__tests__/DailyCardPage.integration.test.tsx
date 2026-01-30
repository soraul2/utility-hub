import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DailyCardPage from '../DailyCardPage';
import { server } from '@/test/mocks/server';
import { http, HttpResponse, delay } from 'msw';

// Mock scrollIntoView since it's not available in JSDOM
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Mock DailyCardSelectionView to avoid drag/scroll/animation complexity in integration test
vi.mock('../components/DailyCardSelectionView', () => ({
      default: ({ onCardSelect, selectedCardIndex, onConfirm, showConfirmModal, onFinalConfirm }: any) => (
            <div data-testid="selection-view">
                  <h1>Selection View</h1>
                  <button onClick={() => onCardSelect(0)}>Select Card 0</button>
                  {selectedCardIndex !== null && (
                        <button onClick={onConfirm}>Confirm Destiny</button>
                  )}
                  {showConfirmModal && (
                        <div data-testid="confirm-modal">
                              <button onClick={onFinalConfirm}>Final Confirm</button>
                        </div>
                  )}
            </div>
      ),
}));

describe('DailyCardPage Integration', () => {
      const BASE_URL = 'http://localhost:8080/api/tarot';

      it('전체 흐름: 카드 선택 -> 확인 모달 -> 결과 화면', async () => {
            // Arrange
            const user = userEvent.setup();

            // Mock API response with delay to test loading state if needed
            server.use(
                  http.get(`${BASE_URL}/daily-card`, async () => {
                        await delay(50);
                        return HttpResponse.json({
                              sessionId: 12345,
                              card: {
                                    position: 'DAILY',
                                    isReversed: false,
                                    cardInfo: {
                                          id: 'major-0',
                                          nameKo: '광대',
                                          nameEn: 'The Fool',
                                          imagePath: '/images/tarot/major-0.jpg',
                                          keywords: '시작',
                                          uprightMeaning: '새로운 시작',
                                          reversedMeaning: '무모함',
                                          arcana: 'MAJOR',
                                          number: 0,
                                    },
                              },
                              aiReading: '# 당신의 운세\n\n광대 카드가 나왔습니다.',
                              createdAt: new Date().toISOString(),
                        });
                  })
            );

            render(<DailyCardPage />);

            // 1. Initial State: Selection View
            expect(screen.getByText('Selection View')).toBeInTheDocument();

            // 2. Select Card (using mock button)
            await user.click(screen.getByText('Select Card 0'));

            // 3. Confirm Destiny (using mock button)
            const confirmBtn = await screen.findByText('Confirm Destiny');
            await user.click(confirmBtn);

            // 4. Final Confirm (using mock modal)
            const finalConfirmBtn = await screen.findByText('Final Confirm');
            await user.click(finalConfirmBtn);

            // 5. Result View should appear after loading
            await waitFor(() => {
                  // Check for result content
                  // The content might be in markdown viewer or title
                  expect(screen.getByText('The Fool')).toBeInTheDocument();
                  expect(screen.getByText(/당신의 운세/i)).toBeInTheDocument();
            }, { timeout: 3000 });
      });

      it('API 에러 시 에러 메시지와 재시도 버튼 표시', async () => {
            // Arrange
            const user = userEvent.setup();
            server.use(
                  http.get(`${BASE_URL}/daily-card`, () => {
                        return HttpResponse.json(
                              { message: '이미 카드를 뽑았습니다.' },
                              { status: 400 }
                        );
                  })
            );

            render(<DailyCardPage />);

            // Select and Confirm
            await user.click(screen.getByText('Select Card 0'));
            await user.click(await screen.findByText('Confirm Destiny'));
            await user.click(await screen.findByText('Final Confirm'));

            // Assert Error
            await waitFor(() => {
                  expect(screen.getByText('이미 카드를 뽑았습니다.')).toBeInTheDocument();
            });

            // Retry button check (ErrorBanner renders this)
            // Note: DailyCardResultView also renders a retry button if data is null, so we might have duplicates.
            const retryBtns = screen.getAllByText('다시 시도');
            expect(retryBtns.length).toBeGreaterThan(0);

            // Click Retry -> Should go back to selection
            await user.click(retryBtns[0]);

            await waitFor(() => {
                  expect(screen.getByText('Selection View')).toBeInTheDocument();
            });
      });
});
