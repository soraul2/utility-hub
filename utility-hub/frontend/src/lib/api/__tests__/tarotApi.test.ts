import { describe, it, expect, vi } from 'vitest';
import { fetchDailyCard, createThreeCardReading, createAssistantReading } from '../tarotApi';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('tarotApi', () => {
      const BASE_URL = 'http://localhost:8080/api/tarot';

      describe('fetchDailyCard', () => {
            it('userName 없이 호출 시 정상 응답을 반환한다', async () => {
                  // Act
                  const result = await fetchDailyCard();

                  // Assert
                  expect(result).toHaveProperty('sessionId');
                  expect(result).toHaveProperty('card');
                  expect(result.card.cardInfo.nameKo).toBe('광대');
            });

            it('userName 포함 호출 시 AI 리딩에 이름이 포함된다', async () => {
                  // Act
                  const result = await fetchDailyCard('홍길동');

                  // Assert
                  expect(result.aiReading).toContain('홍길동');
            });

            it('서버 에러(500) 시 에러 메시지를 throw 한다', async () => {
                  // Arrange
                  server.use(
                        http.get(`${BASE_URL}/daily-card`, () => {
                              return HttpResponse.json(
                                    { message: '서버 내부 오류' },
                                    { status: 500 }
                              );
                        })
                  );

                  // Act & Assert
                  await expect(fetchDailyCard()).rejects.toThrow('서버 내부 오류');
            });

            it('네트워크 오류 시 fetch 에러를 throw 한다', async () => {
                  // Arrange
                  server.use(
                        http.get(`${BASE_URL}/daily-card`, () => {
                              return HttpResponse.error();
                        })
                  );

                  // Act & Assert
                  await expect(fetchDailyCard()).rejects.toThrow();
            });
      });

      describe('createThreeCardReading', () => {
            it('필수 필드만으로 호출 시 3장의 카드를 반환한다', async () => {
                  // Arrange
                  const payload = {
                        question: '이직운',
                        topic: 'CAREER' as const,
                  };

                  // Act
                  const result = await createThreeCardReading(payload);

                  // Assert
                  expect(result.cards).toHaveLength(3);
                  expect(result.cards[0].position).toBe('PAST');
                  expect(result.cards[1].position).toBe('PRESENT');
                  expect(result.cards[2].position).toBe('FUTURE');
            });
      });

      describe('createAssistantReading', () => {
            it('조수 리딩 요청 시 정상 응답을 반환한다', async () => {
                  // Arrange
                  const sessionId = 12345;
                  const type = 'MYSTIC';

                  server.use(
                        http.post(`${BASE_URL}/readings/${sessionId}/assistants/${type}`, () => {
                              return HttpResponse.json({
                                    answer: '조수의 답변입니다.',
                              });
                        })
                  );

                  // Act
                  const result = await createAssistantReading(sessionId, type);

                  // Assert
                  expect(result.answer).toBe('조수의 답변입니다.');
            });
      });
});
