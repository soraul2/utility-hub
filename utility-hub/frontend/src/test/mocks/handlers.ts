import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api/tarot';

export const handlers = [
      // Mock: Daily Card
      http.get(`${BASE_URL}/daily-card`, ({ request }) => {
            const url = new URL(request.url);
            const userName = url.searchParams.get('userName');

            return HttpResponse.json({
                  sessionId: 12345,
                  card: {
                        position: 'DAILY',
                        isReversed: false,
                        cardInfo: {
                              id: 'major-0',
                              nameKo: '광대',
                              nameEn: 'The Fool',
                              arcana: 'MAJOR',
                              suit: null,
                              number: 0,
                              imagePath: '/images/tarot/major-0.jpg',
                              keywords: '시작, 모험, 순수',
                              uprightMeaning: '새로운 시작',
                              reversedMeaning: '무모함',
                        },
                  },
                  aiReading: `# ${userName || '당신'}의 오늘 운세\n\n광대 카드가 나왔습니다.`,
                  createdAt: new Date().toISOString(),
            });
      }),

      // Mock: Three Card Reading
      http.post(`${BASE_URL}/readings/three-cards`, async ({ request }) => {
            const body = await request.json() as any;

            return HttpResponse.json({
                  sessionId: 67890,
                  cards: [
                        {
                              position: 'PAST',
                              isReversed: false,
                              cardInfo: {
                                    id: 'major-1',
                                    nameKo: '마법사',
                                    nameEn: 'The Magician',
                                    arcana: 'MAJOR',
                                    number: 1,
                                    imagePath: '/images/tarot/major-1.jpg',
                                    keywords: '의지, 창조',
                                    uprightMeaning: '능력 발휘',
                                    reversedMeaning: '미숙함',
                              },
                        },
                        {
                              position: 'PRESENT',
                              isReversed: true,
                              cardInfo: {
                                    id: 'major-2',
                                    nameKo: '여사제',
                                    nameEn: 'The High Priestess',
                                    arcana: 'MAJOR',
                                    number: 2,
                                    imagePath: '/images/tarot/major-2.jpg',
                                    keywords: '직관, 신비',
                                    uprightMeaning: '내면의 목소리',
                                    reversedMeaning: '감춰진 진실',
                              },
                        },
                        {
                              position: 'FUTURE',
                              isReversed: false,
                              cardInfo: {
                                    id: 'major-3',
                                    nameKo: '여제',
                                    nameEn: 'The Empress',
                                    arcana: 'MAJOR',
                                    number: 3,
                                    imagePath: '/images/tarot/major-3.jpg',
                                    keywords: '풍요, 모성',
                                    uprightMeaning: '번영',
                                    reversedMeaning: '의존',
                              },
                        },
                  ],
                  aiReading: `# ${body.question}에 대한 답\n\n과거: 마법사\n현재: 여사제\n미래: 여제`,
                  createdAt: new Date().toISOString(),
            });
      }),
];
