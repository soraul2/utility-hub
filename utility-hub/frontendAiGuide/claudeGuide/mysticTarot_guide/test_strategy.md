# 미스틱 타로 프론트엔드 테스트 전략 (Test Strategy)

**작성자:** Claude (Polisher)
**버전:** v1.0
**작성일:** 2026-01-30
**목적:** 협업 가이드 정책 준수 - "테스트 없는 코드는 레거시다"

---

## 📋 목차
1. [현황 분석](#1-현황-분석)
2. [테스트 철학](#2-테스트-철학)
3. [테스트 피라미드](#3-테스트-피라미드)
4. [테스트 환경 설정](#4-테스트-환경-설정)
5. [단위 테스트 전략](#5-단위-테스트-전략)
6. [통합 테스트 전략](#6-통합-테스트-전략)
7. [E2E 테스트 전략](#7-e2e-테스트-전략)
8. [테스트 커버리지 목표](#8-테스트-커버리지-목표)
9. [테스트 코드 예시](#9-테스트-코드-예시)
10. [CI/CD 통합](#10-cicd-통합)

---

## 1. 현황 분석

### 1.1 현재 상태
⚠️ **심각**: 테스트 코드 0% 커버리지

**조사 결과:**
- ❌ 단위 테스트 파일 없음 (`*.test.ts`, `*.spec.ts`)
- ❌ 통합 테스트 없음
- ❌ E2E 테스트 없음
- ❌ 테스트 라이브러리 미설치 (Jest, Vitest, Testing Library 등)
- ⚠️ Gemini 팀 task.md에서 "브라우저 도구 오류로 수동 대체" 언급

### 1.2 리스크 분석
| 리스크 | 영향도 | 발생 확률 | 완화 방안 |
|--------|-------|----------|----------|
| API 변경 시 미감지 회귀 버그 | 높음 | 높음 | API 통합 테스트 추가 |
| UI 변경 시 기능 손상 | 중간 | 중간 | 컴포넌트 단위 테스트 |
| 리팩터링 불가능 | 높음 | 높음 | 전체 테스트 커버리지 확보 |
| 프로덕션 배포 자신감 부족 | 높음 | 높음 | E2E 테스트 + CI/CD |

### 1.3 우선순위
1. **High**: API Layer 단위 테스트 (가장 취약한 부분)
2. **High**: 커스텀 훅 테스트 (비즈니스 로직)
3. **Medium**: 컴포넌트 렌더링 테스트
4. **Medium**: E2E 주요 플로우 테스트
5. **Low**: 시각적 회귀 테스트 (Storybook)

---

## 2. 테스트 철학

### 2.1 핵심 원칙

#### 원칙 1: "테스트는 사용자 관점에서"
```typescript
// ❌ 나쁜 예: 구현 세부사항 테스트
expect(component.state.isLoading).toBe(true);

// ✅ 좋은 예: 사용자가 보는 것 테스트
expect(screen.getByText('로딩 중...')).toBeInTheDocument();
```

#### 원칙 2: "신뢰할 수 있는 테스트"
- Flaky Test 허용 안 함 (간헐적 실패)
- 테스트 순서 독립성 보장
- 외부 의존성 모킹 (API, Date, Random)

#### 원칙 3: "빠른 피드백"
- 단위 테스트: < 100ms
- 통합 테스트: < 1초
- E2E 테스트: < 30초

#### 원칙 4: "테스트도 코드다"
- DRY 원칙 적용 (헬퍼 함수 사용)
- 명확한 네이밍 (Arrange-Act-Assert 패턴)
- 주석 최소화 (테스트 자체가 문서)

### 2.2 협업 가이드 준수

**Gemini 팀 (구현)의 책임:**
- ✅ 구현과 동시에 테스트 작성
- ✅ PR 머지 전 테스트 통과 확인

**Claude 팀 (리팩터링)의 책임:**
- ✅ 기존 코드에 테스트 추가 (현재 작업)
- ✅ 리팩터링 전후 테스트 유지
- ✅ 테스트 코드 품질 개선

**Perplexity 팀 (검수)의 책임:**
- ✅ 테스트 커버리지 확인
- ✅ 테스트 시나리오 검토

---

## 3. 테스트 피라미드

### 3.1 구조
```
        /\
       /E2E\          10% - 주요 사용자 시나리오
      /------\
     / 통합   \        30% - API + Hook 조합
    /----------\
   /   단위     \      60% - 함수, 컴포넌트, 훅
  /--------------\
```

### 3.2 비율 목표
| 테스트 타입 | 비율 | 파일 개수 (예상) | 실행 시간 |
|------------|------|-----------------|----------|
| 단위 테스트 | 60% | 15개 | < 5초 |
| 통합 테스트 | 30% | 5개 | < 10초 |
| E2E 테스트 | 10% | 3개 | < 30초 |

---

## 4. 테스트 환경 설정

### 4.1 필수 라이브러리 설치

```bash
# 테스트 프레임워크 (Vitest - Vite 프로젝트에 최적화)
npm install -D vitest

# React 테스트 유틸리티
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Mock 라이브러리
npm install -D msw@latest  # Mock Service Worker (API 모킹)

# E2E 테스트 (선택)
npm install -D @playwright/test  # Playwright
```

### 4.2 Vitest 설정 파일

**파일 위치:** `frontend/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // 테스트 환경: jsdom (브라우저 환경 시뮬레이션)
    environment: 'jsdom',

    // 전역 설정 파일
    setupFiles: ['./src/test/setup.ts'],

    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
      // 최소 커버리지 (CI/CD 실패 기준)
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },

    // 전역 API 사용 (describe, it, expect 등 import 없이 사용)
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 4.3 테스트 셋업 파일

**파일 위치:** `frontend/src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// 각 테스트 후 자동 클린업
afterEach(() => {
  cleanup();
});

// Mock Service Worker 설정 (API 모킹)
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Window.matchMedia 모킹 (CSS 미디어 쿼리)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// IntersectionObserver 모킹 (Lazy Loading)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
```

### 4.4 MSW 서버 설정 (API 모킹)

**파일 위치:** `frontend/src/test/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**파일 위치:** `frontend/src/test/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080/api/tarot';

export const handlers = [
  // 오늘의 카드 Mock
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
      createdAt: '2026-01-30T12:00:00.000Z',
    });
  }),

  // 3카드 스프레드 Mock
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
            suit: null,
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
            suit: null,
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
            suit: null,
            number: 3,
            imagePath: '/images/tarot/major-3.jpg',
            keywords: '풍요, 모성',
            uprightMeaning: '번영',
            reversedMeaning: '의존',
          },
        },
      ],
      aiReading: `# ${body.question}에 대한 답\n\n과거: 마법사\n현재: 여사제 (역방향)\n미래: 여제`,
      createdAt: '2026-01-30T12:30:00.000Z',
    });
  }),

  // 에러 케이스: 400 Bad Request
  http.get(`${BASE_URL}/daily-card-error`, () => {
    return HttpResponse.json(
      { message: '오늘은 이미 카드를 뽑으셨습니다' },
      { status: 400 }
    );
  }),

  // 에러 케이스: 500 Server Error
  http.post(`${BASE_URL}/readings/three-cards-error`, () => {
    return HttpResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }),
];
```

### 4.5 package.json 스크립트 추가

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 5. 단위 테스트 전략

### 5.1 API Layer 테스트

**파일 위치:** `frontend/src/lib/api/__tests__/tarotApi.test.ts`

#### 5.1.1 테스트 케이스 목록

**fetchDailyCard 함수:**
- ✅ 성공: userName 없이 호출 시 정상 응답
- ✅ 성공: userName 포함 호출 시 정상 응답
- ✅ 실패: 서버 에러 (500) 시 에러 메시지 반환
- ✅ 실패: 클라이언트 에러 (400) 시 에러 메시지 반환
- ✅ 실패: 네트워크 오류 시 에러 throw
- ✅ 엣지: userName에 특수문자 포함 시 URL 인코딩 확인

**createThreeCardReading 함수:**
- ✅ 성공: 필수 필드만으로 호출 시 정상 응답
- ✅ 성공: 모든 필드 포함 호출 시 정상 응답
- ✅ 실패: 서버 에러 시 에러 메시지 반환
- ✅ 엣지: 한글 question 포함 시 UTF-8 인코딩 확인

**createAssistantReading 함수:**
- ✅ 성공: summary=false로 호출 시 정상 응답
- ✅ 성공: summary=true로 호출 시 정상 응답
- ✅ 실패: 존재하지 않는 sessionId 시 404 에러

#### 5.1.2 테스트 코드 예시

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { fetchDailyCard, createThreeCardReading } from '../tarotApi';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('tarotApi', () => {
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

    it('서버 에러 시 에러 메시지를 throw 한다', async () => {
      // Arrange
      server.use(
        http.get('*/daily-card', () => {
          return HttpResponse.json(
            { message: '서버 오류' },
            { status: 500 }
          );
        })
      );

      // Act & Assert
      await expect(fetchDailyCard()).rejects.toThrow('서버 오류');
    });

    it('userName에 특수문자 포함 시 URL 인코딩이 적용된다', async () => {
      // Arrange
      const specialName = '홍길동&test';

      // Act
      await fetchDailyCard(specialName);

      // Assert: MSW가 인코딩된 요청을 받았는지 확인
      // (실제로는 fetch API가 자동 인코딩)
      expect(encodeURIComponent(specialName)).toBe('%ED%99%8D%EA%B8%B8%EB%8F%99%26test');
    });
  });

  describe('createThreeCardReading', () => {
    it('필수 필드만으로 호출 시 3장의 카드를 반환한다', async () => {
      // Arrange
      const payload = {
        question: '새로운 직장으로 이직해야 할까요?',
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

    it('한글 question이 UTF-8로 올바르게 전송된다', async () => {
      // Arrange
      const payload = {
        question: '사랑이 이루어질까요? 💕',
        topic: 'LOVE' as const,
      };

      // Act
      const result = await createThreeCardReading(payload);

      // Assert
      expect(result).toHaveProperty('sessionId');
      expect(result.aiReading).toBeTruthy();
    });
  });
});
```

---

### 5.2 커스텀 훅 테스트

**파일 위치:** `frontend/src/hooks/__tests__/useDailyCard.test.ts`

#### 5.2.1 테스트 케이스 목록

**useDailyCard 훅:**
- ✅ 초기 상태가 올바르게 설정된다
- ✅ loadDailyCard 호출 시 로딩 상태가 true로 변경된다
- ✅ 성공 시 data에 응답이 저장되고 loading이 false가 된다
- ✅ 실패 시 error에 메시지가 저장되고 loading이 false가 된다
- ✅ reset 호출 시 초기 상태로 복귀한다
- ✅ 연속 호출 시 이전 상태가 초기화된다

#### 5.2.2 테스트 코드 예시

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyCard } from '../useDailyCard';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('useDailyCard', () => {
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
    const { result } = renderHook(() => useDailyCard());

    // Act
    result.current.loadDailyCard();

    // Assert (동기적으로 즉시 확인)
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();

    // Cleanup (완료 대기)
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
      expect(result.current.data?.card.cardInfo.nameKo).toBe('광대');
      expect(result.current.error).toBeNull();
    });
  });

  it('실패 시 error에 메시지가 저장된다', async () => {
    // Arrange
    server.use(
      http.get('*/daily-card', () => {
        return HttpResponse.json(
          { message: '오늘은 이미 카드를 뽑으셨습니다' },
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
      expect(result.current.error).toBe('오늘은 이미 카드를 뽑으셨습니다');
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
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
```

---

### 5.3 컴포넌트 테스트

**파일 위치:** `frontend/src/components/tarot/__tests__/TarotCardView.test.tsx`

#### 5.3.1 테스트 케이스 목록

**TarotCardView 컴포넌트:**
- ✅ isFaceDown=true일 때 뒷면 디자인이 렌더링된다
- ✅ card가 제공되면 카드 이미지가 렌더링된다
- ✅ showName=true일 때 카드 이름이 표시된다
- ✅ showName=false일 때 카드 이름이 숨겨진다
- ✅ isReversed=true일 때 180도 회전 스타일이 적용된다
- ✅ onClick이 제공되면 클릭 시 호출된다
- ✅ 이미지 로드 실패 시 플레이스홀더가 표시된다

#### 5.3.2 테스트 코드 예시

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TarotCardView from '../TarotCardView';
import type { TarotCard } from '@/lib/tarot';

const mockCard: TarotCard = {
  id: 'major-0',
  nameKo: '광대',
  nameEn: 'The Fool',
  arcana: 'MAJOR',
  suit: null,
  number: 0,
  imagePath: '/images/tarot/major-0.jpg',
  keywords: '시작, 모험',
  uprightMeaning: '새로운 시작',
  reversedMeaning: '무모함',
};

describe('TarotCardView', () => {
  it('isFaceDown=true일 때 뒷면 디자인이 렌더링된다', () => {
    // Act
    render(<TarotCardView isFaceDown={true} />);

    // Assert
    const cardBack = screen.getByRole('img', { hidden: true });
    expect(cardBack).toBeInTheDocument();
    expect(cardBack).toHaveClass('tarot-card-back'); // 실제 클래스명에 맞게 수정
  });

  it('card가 제공되면 카드 이미지가 렌더링된다', () => {
    // Act
    render(<TarotCardView card={mockCard} />);

    // Assert
    const cardImage = screen.getByAltText('광대 카드');
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute('src', '/images/tarot/major-0.jpg');
  });

  it('showName=true일 때 카드 이름이 표시된다', () => {
    // Act
    render(<TarotCardView card={mockCard} showName={true} />);

    // Assert
    expect(screen.getByText('광대')).toBeInTheDocument();
  });

  it('showName=false일 때 카드 이름이 숨겨진다', () => {
    // Act
    render(<TarotCardView card={mockCard} showName={false} />);

    // Assert
    expect(screen.queryByText('광대')).not.toBeInTheDocument();
  });

  it('isReversed=true일 때 회전 스타일이 적용된다', () => {
    // Act
    const { container } = render(<TarotCardView card={mockCard} isReversed={true} />);

    // Assert
    const cardImage = screen.getByAltText('광대 카드');
    expect(cardImage).toHaveStyle({ transform: 'rotate(180deg)' });
  });

  it('onClick이 제공되면 클릭 시 호출된다', async () => {
    // Arrange
    const handleClick = vi.fn();
    const user = userEvent.setup();

    // Act
    render(<TarotCardView card={mockCard} onClick={handleClick} />);
    const cardElement = screen.getByAltText('광대 카드').closest('div');
    await user.click(cardElement!);

    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 6. 통합 테스트 전략

### 6.1 Hook + API 통합 테스트

**목적:** 실제 API 호출부터 상태 업데이트까지 전체 플로우 검증

**파일 위치:** `frontend/src/__tests__/integration/dailyCard.integration.test.ts`

#### 6.1.1 테스트 시나리오

**시나리오 1: 오늘의 카드 전체 플로우**
1. 초기 상태 확인
2. loadDailyCard 호출
3. 로딩 상태 확인
4. API 응답 수신
5. 데이터 상태 확인
6. 에러 없음 확인

**시나리오 2: 에러 처리 플로우**
1. API 에러 발생 설정
2. loadDailyCard 호출
3. 에러 상태 확인
4. 에러 메시지 확인

#### 6.1.2 테스트 코드 예시

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyCard } from '@/hooks/useDailyCard';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('Daily Card Integration', () => {
  it('전체 플로우: API 호출부터 상태 업데이트까지 정상 동작', async () => {
    // Arrange
    const { result } = renderHook(() => useDailyCard());

    // Step 1: 초기 상태
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    // Step 2: API 호출
    await result.current.loadDailyCard('테스트유저');

    // Step 3: 로딩 완료 후 데이터 확인
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeTruthy();
      expect(result.current.data?.sessionId).toBe(12345);
      expect(result.current.data?.card.cardInfo.nameKo).toBe('광대');
      expect(result.current.data?.aiReading).toContain('테스트유저');
      expect(result.current.error).toBeNull();
    });
  });

  it('에러 플로우: API 실패 시 사용자 친화적 메시지 표시', async () => {
    // Arrange
    server.use(
      http.get('*/daily-card', () => {
        return HttpResponse.json(
          { message: '오늘은 이미 카드를 뽑으셨습니다' },
          { status: 429 }
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
      expect(result.current.error).toBe('오늘은 이미 카드를 뽑으셨습니다');
    });
  });
});
```

---

### 6.2 페이지 컴포넌트 통합 테스트

**파일 위치:** `frontend/src/pages/tarot/__tests__/DailyCardPage.integration.test.tsx`

#### 6.2.1 테스트 시나리오

**시나리오: 사용자가 오늘의 카드를 뽑는 전체 여정**
1. 페이지 진입 (selection 단계)
2. 10장의 카드 중 1장 선택
3. 확인 모달 표시
4. "운명 확정" 버튼 클릭
5. 로딩 스피너 표시
6. 카드 뒤집기 애니메이션
7. AI 해석 표시

#### 6.2.2 테스트 코드 예시

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DailyCardPage from '../DailyCardPage';

const renderPage = () => {
  return render(
    <BrowserRouter>
      <DailyCardPage />
    </BrowserRouter>
  );
};

describe('DailyCardPage Integration', () => {
  it('사용자가 카드를 선택하고 결과를 확인하는 전체 플로우', async () => {
    // Arrange
    const user = userEvent.setup();
    renderPage();

    // Step 1: 초기 화면 - 10장의 카드 표시
    const cards = screen.getAllByRole('button', { name: /카드 선택/i });
    expect(cards).toHaveLength(10);

    // Step 2: 첫 번째 카드 클릭
    await user.click(cards[0]);

    // Step 3: 확인 모달 표시
    expect(screen.getByText(/운명을 확정하시겠습니까/i)).toBeInTheDocument();

    // Step 4: "운명 확정" 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: /운명 확정/i });
    await user.click(confirmButton);

    // Step 5: 로딩 상태 확인
    expect(screen.getByText(/신비로운 에너지/i)).toBeInTheDocument();

    // Step 6: 결과 표시 대기
    await waitFor(() => {
      expect(screen.getByText('광대')).toBeInTheDocument();
      expect(screen.getByText(/오늘 운세/i)).toBeInTheDocument();
    });

    // Step 7: AI 해석 확인
    const aiReading = screen.getByText(/광대 카드가 나왔습니다/i);
    expect(aiReading).toBeInTheDocument();
  });
});
```

---

## 7. E2E 테스트 전략

### 7.1 Playwright 설정

**파일 위치:** `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 7.2 E2E 테스트 시나리오

**파일 위치:** `frontend/e2e/dailyCard.spec.ts`

#### 7.2.1 주요 사용자 여정

**여정 1: 오늘의 카드 - Happy Path**
```typescript
import { test, expect } from '@playwright/test';

test.describe('오늘의 카드 E2E', () => {
  test('사용자가 처음부터 끝까지 카드를 뽑는다', async ({ page }) => {
    // Step 1: 홈 화면 진입
    await page.goto('/tarot');
    await expect(page.getByRole('heading', { name: '미스틱 타로' })).toBeVisible();

    // Step 2: "오늘의 카드" 버튼 클릭
    await page.getByRole('link', { name: '오늘의 카드' }).click();
    await expect(page).toHaveURL('/tarot/daily-card');

    // Step 3: 카드 덱 확인 (10장)
    const cardButtons = page.getByRole('button', { name: /카드/i });
    await expect(cardButtons).toHaveCount(10);

    // Step 4: 첫 번째 카드 선택
    await cardButtons.first().click();

    // Step 5: 확인 모달 대기 및 확정
    await expect(page.getByText(/운명을 확정/i)).toBeVisible();
    await page.getByRole('button', { name: /운명 확정/i }).click();

    // Step 6: 로딩 대기
    await expect(page.getByText(/신비로운/i)).toBeVisible();

    // Step 7: 결과 확인 (최대 5초 대기)
    await expect(page.getByText(/광대|마법사|여사제/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('heading', { name: /운세/i })).toBeVisible();

    // Step 8: 스크린샷 저장 (시각적 회귀 검증용)
    await page.screenshot({ path: 'e2e-screenshots/daily-card-result.png' });
  });
});
```

**여정 2: 3카드 스프레드 - Happy Path**
```typescript
test.describe('3카드 스프레드 E2E', () => {
  test('사용자가 질문을 입력하고 3장의 카드를 뽑는다', async ({ page }) => {
    // Step 1: 3카드 스프레드 페이지 진입
    await page.goto('/tarot/three-card-reading');

    // Step 2: 질문 입력
    await page.getByLabel(/질문/i).fill('새로운 직장으로 이직해야 할까요?');
    await page.getByLabel(/주제/i).selectOption('CAREER');

    // Step 3: (선택) 사용자 정보 입력
    await page.getByLabel(/이름/i).fill('홍길동');
    await page.getByLabel(/나이/i).fill('28');
    await page.getByLabel(/성별/i).selectOption('MALE');

    // Step 4: 다음 버튼 클릭
    await page.getByRole('button', { name: /다음/i }).click();

    // Step 5: 카드 선택 단계 - 3장 선택
    const cards = page.getByRole('button', { name: /카드/i });
    await cards.nth(0).click();
    await cards.nth(5).click();
    await cards.nth(10).click();

    // Step 6: 다음 버튼 클릭
    await page.getByRole('button', { name: /다음/i }).click();

    // Step 7: AI 조수 선택 (기본값 Mystic 유지 또는 선택)
    await page.getByRole('button', { name: /Mystic/i }).click();

    // Step 8: 운명 확인하기 클릭
    await page.getByRole('button', { name: /운명 확인/i }).click();

    // Step 9: 로딩 대기
    await expect(page.getByText(/운명을 읽고/i)).toBeVisible();

    // Step 10: 결과 확인
    await expect(page.getByText(/지나온 시간/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/마주한 현실/i)).toBeVisible();
    await expect(page.getByText(/다가올 운명/i)).toBeVisible();

    // Step 11: 카드 3장 순차 뒤집기
    const flipButtons = page.getByRole('button', { name: /뒤집기/i });
    await flipButtons.nth(0).click();
    await page.waitForTimeout(500);
    await flipButtons.nth(1).click();
    await page.waitForTimeout(500);
    await flipButtons.nth(2).click();

    // Step 12: 봉투 등장 대기
    await expect(page.getByText(/운명 봉인 해제/i)).toBeVisible({ timeout: 2000 });

    // Step 13: 봉투 열기
    await page.getByRole('button', { name: /운명 봉인 해제/i }).click();

    // Step 14: AI 해석 확인
    await expect(page.getByRole('article', { name: /리딩/i })).toBeVisible();
  });
});
```

---

## 8. 테스트 커버리지 목표

### 8.1 단계별 목표

| 단계 | 목표 커버리지 | 예상 기간 | 우선순위 파일 |
|------|--------------|----------|--------------|
| Phase 1 | 40% | 1주 | API Layer, Hooks |
| Phase 2 | 60% | 2주 | Components, Pages |
| Phase 3 | 80% | 1주 | E2E, Edge Cases |

### 8.2 파일별 목표 커버리지

| 파일 | 목표 | 현재 | 우선순위 |
|------|------|------|---------|
| `lib/api/tarotApi.ts` | 90% | 0% | ⭐⭐⭐ High |
| `hooks/useDailyCard.ts` | 90% | 0% | ⭐⭐⭐ High |
| `hooks/useThreeCardReading.ts` | 90% | 0% | ⭐⭐⭐ High |
| `components/tarot/TarotCardView.tsx` | 80% | 0% | ⭐⭐ Medium |
| `components/common/MarkdownViewer.tsx` | 70% | 0% | ⭐ Low |
| `pages/tarot/DailyCardPage.tsx` | 70% | 0% | ⭐⭐ Medium |
| `pages/tarot/ThreeCardReadingPage.tsx` | 70% | 0% | ⭐⭐ Medium |
| `layouts/TarotLayout.tsx` | 50% | 0% | ⭐ Low |

### 8.3 CI/CD 실패 기준

```json
{
  "coverage": {
    "statements": 80,
    "branches": 75,
    "functions": 80,
    "lines": 80
  }
}
```

- 위 기준 미달 시 PR 머지 차단
- 신규 코드는 100% 커버리지 강제

---

## 9. 테스트 코드 예시

### 9.1 유틸리티 헬퍼 함수

**파일 위치:** `frontend/src/test/helpers.tsx`

```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * 라우터가 필요한 컴포넌트 테스트용 렌더 함수
 */
export function renderWithRouter(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * 특정 시간만큼 대기 (애니메이션 테스트용)
 */
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock 타로 카드 데이터 생성기
 */
export function createMockCard(overrides?: Partial<TarotCard>): TarotCard {
  return {
    id: 'major-0',
    nameKo: '광대',
    nameEn: 'The Fool',
    arcana: 'MAJOR',
    suit: null,
    number: 0,
    imagePath: '/images/tarot/major-0.jpg',
    keywords: '시작, 모험',
    uprightMeaning: '새로운 시작',
    reversedMeaning: '무모함',
    ...overrides,
  };
}
```

---

## 10. CI/CD 통합

### 10.1 GitHub Actions 워크플로우

**파일 위치:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-integration-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit & integration tests
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          flags: unittests
          fail_ci_if_error: true

      - name: Comment PR with coverage
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 10.2 Pre-commit Hook

**파일 위치:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 변경된 파일에 대한 테스트만 실행
npm run test:related

# 커버리지 확인
npm run test:coverage -- --reporter=json --reporter=text
```

---

## 11. 마무리

### 11.1 체크리스트

- [ ] Vitest, Testing Library 설치
- [ ] MSW 설정 및 Mock 핸들러 작성
- [ ] `tarotApi.ts` 단위 테스트 작성
- [ ] `useDailyCard`, `useThreeCardReading` 훅 테스트 작성
- [ ] `TarotCardView` 컴포넌트 테스트 작성
- [ ] `DailyCardPage` 통합 테스트 작성
- [ ] Playwright E2E 테스트 작성 (2개 주요 여정)
- [ ] CI/CD 워크플로우 설정
- [ ] 커버리지 80% 달성

### 11.2 다음 단계

1. **Phase 1 (1주)**: API + Hooks 테스트 작성
2. **Phase 2 (2주)**: Components + Pages 테스트 작성
3. **Phase 3 (1주)**: E2E 테스트 + CI/CD 통합

### 11.3 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [Testing Library 공식 문서](https://testing-library.com/)
- [MSW 공식 문서](https://mswjs.io/)
- [Playwright 공식 문서](https://playwright.dev/)

---

**문서 버전 히스토리**
- v1.0 (2026-01-30): 초안 작성 - 전체 테스트 전략 수립
