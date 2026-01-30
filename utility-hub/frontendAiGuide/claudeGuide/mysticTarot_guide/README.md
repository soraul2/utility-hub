# 🔮 미스틱 타로 프론트엔드 (Mystic Tarot Frontend)

**AI 기반 타로 리딩 서비스의 프론트엔드 애플리케이션**

<div align="center">

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite&logoColor=white)

[기능 소개](#-주요-기능) • [시작하기](#-시작하기) • [개발 가이드](#-개발-가이드) • [문서](#-문서)

</div>

---

## 📖 목차

1. [프로젝트 개요](#-프로젝트-개요)
2. [주요 기능](#-주요-기능)
3. [기술 스택](#-기술-스택)
4. [시작하기](#-시작하기)
5. [폴더 구조](#-폴더-구조)
6. [개발 가이드](#-개발-가이드)
7. [테스트](#-테스트)
8. [배포](#-배포)
9. [트러블슈팅](#-트러블슈팅)
10. [문서](#-문서)
11. [팀 구성](#-팀-구성)
12. [라이선스](#-라이선스)

---

## 🎯 프로젝트 개요

### 미스틱 타로란?

미스틱 타로는 AI 기술과 전통적인 타로 리딩을 결합한 웹 애플리케이션입니다. 사용자는 신비롭고 몰입감 있는 UX를 통해 자신의 운세를 확인하고, 8가지 AI 페르소나로부터 개인화된 조언을 받을 수 있습니다.

### 핵심 가치

- 🌙 **몰입형 경험**: 밤하늘 테마, 프리미엄 애니메이션, 서사적 연출
- 🤖 **AI 페르소나**: 공감형, 분석형 등 8가지 성격의 AI 조수
- 🎴 **정통 타로**: 78장 풀덱 지원, 정방향/역방향 해석
- 📱 **반응형 디자인**: 모바일부터 데스크톱까지 최적화

### 주요 지표

| 항목 | 값 |
|------|-----|
| 번들 크기 | < 500KB (gzip) |
| Lighthouse 성능 | 90+ |
| 첫 콘텐츠 페인트 | < 1.5초 |
| 타임 투 인터랙티브 | < 3.5초 |
| 테스트 커버리지 | 목표 80% (현재 구현 중) |

---

## ✨ 주요 기능

### 1. 오늘의 카드 (Daily Card)

**하루 한 번, 당신의 운세를 점치는 카드**

- 10장의 카드 중 1장 선택 (수평 스크롤 덱)
- 운명 확정 리추얼: 확인 모달로 선택 확정
- Mystic Scattering: 결과 공개 시 보랏빛 입자 효과
- AI 해석: Markdown 포맷의 상세한 오늘 운세

**주요 흐름:**
```
카드 선택 → 확인 모달 → API 호출 → 카드 뒤집기 → AI 해석 표시
```

### 2. 3카드 스프레드 (Three-Card Reading)

**과거-현재-미래를 아우르는 심층 리딩**

- **입력 단계**: 질문, 주제, 개인 정보 (선택)
- **선택 단계**: 22장의 카드 중 3장 선택 (아치형 배치)
- **리더 선택**: 8가지 AI 조수 페르소나 선택
  - Mystic (기본), Sylvia, Luna, Orion, Noctis, Vance, Elara, Klaus
  - Fortuna (히든 마스터, 1% 확률, 컨페티 효과)
- **결과 단계**: 서사적 리추얼
  - 카드 3장 순차 공개
  - 운명 봉인: 앤티크 편지 봉투 연출 (Fly-in → Pulse → Shatter)
  - 상세 AI 해석 (과거/현재/미래 서사)

**주요 흐름:**
```
질문 입력 → 카드 3장 선택 → AI 조수 선택 → API 호출 → 카드 순차 공개 → 봉투 연출 → AI 해석 표시
```

### 3. AI 페르소나 시스템

| 조수 | 타입 | 특징 |
|------|------|------|
| **Sylvia** | 공감형 | 따뜻한 위로와 공감 중심 |
| **Luna** | 직관형 | 신비로운 직관과 영감 |
| **Orion** | 분석형 | 논리적 분석과 전략 |
| **Noctis** | 신비형 | 깊은 통찰과 심오한 조언 |
| **Vance** | 현실형 | 실용적이고 현실적인 조언 |
| **Elara** | 위로형 | 부드러운 격려와 희망 |
| **Klaus** | 철학형 | 철학적 사유와 성찰 |
| **Fortuna** | 히든 마스터 | 운명을 뒤트는 특별한 존재 (1% 확률) |

---

## 🛠 기술 스택

### 핵심 기술

```typescript
{
  "프레임워크": "React 19.2.0",
  "언어": "TypeScript 5.9.3",
  "빌드 도구": "Vite 7.2.4",
  "라우팅": "React Router DOM 7.12.0",
  "스타일링": "TailwindCSS 3.4.19",
  "상태 관리": "React Hooks (로컬 상태)"
}
```

### UI/UX 라이브러리

- **react-markdown** 10.1.0: AI 해석 렌더링
- **canvas-confetti** 1.9.4: Fortuna 등장 시 축하 효과
- **FontAwesome** 7.1.0: 아이콘 시스템
- **Chakra Petch** (Google Fonts): 프리미엄 폰트

### 개발 도구

- **ESLint** 9.21.0: 코드 품질 검사
- **TypeScript Compiler**: 타입 검사
- **Vitest** (예정): 단위/통합 테스트
- **Playwright** (예정): E2E 테스트

### 백엔드 API

- **Base URL**: `http://localhost:8080/api/tarot`
- **통신 방식**: REST API (JSON)
- **AI 모델**: OpenAI GPT-4 Turbo / Claude Opus

---

## 🚀 시작하기

### 필수 요구사항

- **Node.js**: 20.x 이상
- **npm**: 10.x 이상
- **백엔드 서버**: 8080 포트에서 실행 중이어야 함

### 설치 및 실행

#### 1. 저장소 클론

```bash
git clone <repository-url>
cd utility-hub/frontend
```

#### 2. 의존성 설치

```bash
npm install
```

#### 3. 환경 변수 설정 (선택)

프로젝트 루트에 `.env` 파일 생성:

```env
# API Base URL (기본값: localhost:8080)
VITE_API_BASE_URL=http://localhost:8080/api/tarot

# 개발 포트 (기본값: 5173)
VITE_PORT=5173
```

#### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

#### 5. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

#### 6. 프리뷰 (빌드 결과 확인)

```bash
npm run preview
```

---

## 📂 폴더 구조

```
frontend/
├── public/                     # 정적 파일
│   └── images/
│       └── tarot/             # 타로 카드 이미지 (78장)
├── src/
│   ├── assets/                # 에셋 파일
│   │   └── tarot/
│   │       └── envelope.png   # 앤티크 편지 봉투
│   │       └── tarot_back.png # 카드 뒷면 디자인 (852KB)
│   ├── components/            # 컴포넌트
│   │   ├── common/            # 공통 컴포넌트
│   │   │   ├── ErrorBanner.tsx        # 에러 표시
│   │   │   ├── LoadingSpinner.tsx     # 로딩 스피너
│   │   │   └── MarkdownViewer.tsx     # Markdown 렌더러
│   │   └── tarot/             # 타로 전용 컴포넌트
│   │       └── TarotCardView.tsx      # 카드 표시 컴포넌트
│   ├── hooks/                 # 커스텀 훅
│   │   ├── useDailyCard.ts    # 오늘의 카드 상태 관리
│   │   └── useThreeCardReading.ts # 3카드 스프레드 상태 관리
│   ├── layouts/               # 레이아웃 컴포넌트
│   │   └── TarotLayout.tsx    # 타로 앱 전용 레이아웃 (별빛 배경)
│   ├── lib/                   # 유틸리티 및 라이브러리
│   │   ├── api/
│   │   │   └── tarotApi.ts    # 타로 API 클라이언트
│   │   └── tarot.ts           # 타입 정의 및 상수
│   ├── pages/                 # 페이지 컴포넌트
│   │   └── tarot/
│   │       ├── TarotHome.tsx              # 홈 화면
│   │       ├── DailyCardPage.tsx          # 오늘의 카드 페이지
│   │       └── ThreeCardReadingPage.tsx   # 3카드 스프레드 페이지
│   ├── test/                  # 테스트 파일 (예정)
│   │   ├── setup.ts           # 테스트 환경 설정
│   │   ├── helpers.tsx        # 테스트 유틸리티
│   │   └── mocks/             # MSW Mock 핸들러
│   │       ├── server.ts
│   │       └── handlers.ts
│   ├── App.tsx                # 앱 루트 컴포넌트
│   ├── index.css              # 글로벌 스타일 (594 lines)
│   └── main.tsx               # 앱 엔트리 포인트
├── e2e/                       # E2E 테스트 (예정)
│   ├── dailyCard.spec.ts
│   └── threeCardReading.spec.ts
├── index.html                 # HTML 템플릿
├── package.json               # 의존성 관리
├── tsconfig.json              # TypeScript 설정
├── vite.config.ts             # Vite 설정
├── vitest.config.ts           # Vitest 설정 (예정)
├── playwright.config.ts       # Playwright 설정 (예정)
├── tailwind.config.js         # TailwindCSS 설정
└── README.md                  # 프로젝트 문서 (본 파일)
```

### 주요 파일 설명

| 파일 | 설명 | 코드 라인 |
|------|------|-----------|
| `lib/tarot.ts` | TypeScript 타입 정의, 열거형, 상수 | ~200 |
| `lib/api/tarotApi.ts` | API 클라이언트 함수 (3개 엔드포인트) | ~150 |
| `hooks/useDailyCard.ts` | 오늘의 카드 상태 관리 훅 | ~80 |
| `hooks/useThreeCardReading.ts` | 3카드 스프레드 상태 관리 훅 | ~80 |
| `components/tarot/TarotCardView.tsx` | 카드 렌더링 컴포넌트 | ~250 |
| `pages/tarot/DailyCardPage.tsx` | 오늘의 카드 페이지 로직 | ~400 |
| `pages/tarot/ThreeCardReadingPage.tsx` | 3카드 스프레드 페이지 로직 | ~800 |
| `index.css` | 커스텀 애니메이션 및 스타일 | 594 |

---

## 💻 개발 가이드

### 코드 스타일

#### TypeScript 컨벤션

```typescript
// ✅ 좋은 예: 명확한 타입 정의
interface TarotCard {
  id: string;
  nameKo: string;
  // ...
}

// ✅ 좋은 예: 열거형 타입 사용
export type TarotTopic = 'LOVE' | 'MONEY' | 'CAREER' | 'HEALTH' | 'GENERAL';

// ❌ 나쁜 예: any 타입 사용
function processCard(card: any) { /* ... */ }

// ✅ 좋은 예: 제네릭 타입 사용
function processCard<T extends TarotCard>(card: T): T { /* ... */ }
```

#### 컴포넌트 작성 규칙

```typescript
// ✅ 좋은 예: Props 인터페이스 정의
interface TarotCardViewProps {
  card?: TarotCard;
  onClick?: () => void;
  className?: string;
}

export default function TarotCardView({ card, onClick, className }: TarotCardViewProps) {
  // ...
}

// ✅ 좋은 예: useCallback으로 함수 메모이제이션
const handleClick = useCallback(() => {
  onClick?.();
}, [onClick]);

// ✅ 좋은 예: Early return 패턴
if (!card) {
  return <CardBackView />;
}

return <CardFrontView card={card} />;
```

#### 네이밍 컨벤션

| 타입 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `TarotCardView`, `DailyCardPage` |
| 훅 | use + PascalCase | `useDailyCard`, `useThreeCardReading` |
| 함수 | camelCase | `fetchDailyCard`, `createReading` |
| 상수 | UPPER_SNAKE_CASE | `TAROT_TOPICS`, `BASE_URL` |
| 타입/인터페이스 | PascalCase | `TarotCard`, `DailyCardResponse` |

### Git 워크플로우

#### 브랜치 전략

```
main (프로덕션)
  └── develop (개발)
      ├── feature/daily-card
      ├── feature/three-card-reading
      ├── feature/ai-personas
      └── bugfix/card-flip-animation
```

#### 커밋 메시지 규칙

```bash
# 형식: <타입>(<범위>): <제목>
# 타입: feat, fix, refactor, test, docs, style, chore

# 예시
feat(daily-card): 운명 확정 모달 추가
fix(three-card): 봉투 애니메이션 타이밍 수정
refactor(hooks): useDailyCard 에러 처리 개선
test(api): tarotApi 단위 테스트 추가
docs(readme): 설치 가이드 업데이트
style(card-view): 카드 그림자 효과 조정
chore(deps): react-markdown 버전 업데이트
```

### API 연동 방법

#### 1. 타입 정의 (`lib/tarot.ts`)

```typescript
export interface DailyCardResponse {
  sessionId: number;
  card: DrawnCardDto;
  aiReading: string;
  createdAt: string;
}
```

#### 2. API 클라이언트 함수 (`lib/api/tarotApi.ts`)

```typescript
const BASE_URL = `http://${window.location.hostname}:8080/api/tarot`;

export async function fetchDailyCard(userName?: string): Promise<DailyCardResponse> {
  const url = `${BASE_URL}/daily-card${userName ? `?userName=${encodeURIComponent(userName)}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '기본 에러 메시지');
  }

  return response.json();
}
```

#### 3. 커스텀 훅 (`hooks/useDailyCard.ts`)

```typescript
export function useDailyCard() {
  const [data, setData] = useState<DailyCardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDailyCard = useCallback(async (userName?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDailyCard(userName);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, loadDailyCard, reset };
}
```

#### 4. 컴포넌트에서 사용 (`pages/tarot/DailyCardPage.tsx`)

```typescript
export default function DailyCardPage() {
  const { data, loading, error, loadDailyCard, reset } = useDailyCard();

  const handleCardSelect = async () => {
    await loadDailyCard('홍길동');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} onRetry={reset} />;
  if (data) return <ResultView data={data} />;

  return <SelectionView onSelect={handleCardSelect} />;
}
```

### 애니메이션 추가 방법

#### 1. CSS 애니메이션 정의 (`index.css`)

```css
@keyframes custom-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-custom-fade-in {
  animation: custom-fade-in 0.6s ease-out;
}
```

#### 2. TailwindCSS 설정 (`tailwind.config.js`)

```javascript
module.exports = {
  theme: {
    extend: {
      animation: {
        'custom-fade-in': 'custom-fade-in 0.6s ease-out',
      },
    },
  },
};
```

#### 3. 컴포넌트에서 사용

```tsx
<div className="animate-custom-fade-in">
  <TarotCardView card={card} />
</div>
```

---

## 🧪 테스트

> ⚠️ **현재 상태**: 테스트 코드 0% 커버리지 (구현 예정)

### 테스트 전략

자세한 내용은 [test_strategy.md](./test_strategy.md) 참조

#### 테스트 설치 (예정)

```bash
# 테스트 라이브러리 설치
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event msw
npm install -D @playwright/test
```

#### 테스트 실행 (예정)

```bash
# 단위 테스트 실행
npm run test

# 테스트 커버리지 확인
npm run test:coverage

# E2E 테스트 실행
npm run test:e2e
```

### 테스트 우선순위

1. **API Layer**: `lib/api/tarotApi.ts` (90% 커버리지 목표)
2. **Hooks**: `useDailyCard`, `useThreeCardReading` (90% 목표)
3. **Components**: `TarotCardView` (80% 목표)
4. **E2E**: 주요 사용자 여정 (2개 시나리오)

---

## 🌐 배포

### 프로덕션 빌드

```bash
# 1. 빌드 생성
npm run build

# 2. 빌드 파일 확인
ls -lh dist/

# 3. 로컬에서 프리뷰
npm run preview
```

### 환경별 설정

#### 개발 환경 (`.env.development`)

```env
VITE_API_BASE_URL=http://localhost:8080/api/tarot
```

#### 프로덕션 환경 (`.env.production`)

```env
VITE_API_BASE_URL=https://api.mystic-tarot.com/api/tarot
```

### 배포 플랫폼

#### Vercel (권장)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### Netlify

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 배포
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

### 성능 최적화 체크리스트

- [ ] 번들 사이즈 < 500KB (gzip)
- [ ] 이미지 최적화 (WebP 포맷)
- [ ] 코드 스플리팅 (라우트별)
- [ ] Tree Shaking 적용 확인
- [ ] Lazy Loading (이미지, 컴포넌트)
- [ ] Lighthouse 성능 90+ 달성

---

## 🔧 트러블슈팅

### 자주 발생하는 문제

#### 1. API 연결 실패

**증상:**
```
Error: Failed to fetch
네트워크 연결을 확인해주세요
```

**해결 방법:**
1. 백엔드 서버가 8080 포트에서 실행 중인지 확인
   ```bash
   # 백엔드 상태 확인
   curl http://localhost:8080/api/tarot/health
   ```
2. CORS 설정 확인 (백엔드에서 `localhost:5173` 허용)
3. `.env` 파일의 `VITE_API_BASE_URL` 확인

#### 2. 카드 이미지 로드 실패

**증상:**
- 카드가 깨진 이미지 아이콘으로 표시됨

**해결 방법:**
1. 이미지 경로 확인: `public/images/tarot/` 폴더에 78장 이미지 존재 확인
2. 이미지 파일명 형식: `major-0.jpg` ~ `major-21.jpg`, `wands-ace.jpg` 등
3. 네트워크 탭에서 404 에러 확인

#### 3. 빌드 오류

**증상:**
```
Error: TypeScript compilation errors
```

**해결 방법:**
```bash
# 타입 에러 확인
npm run type-check

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 캐시 정리
npm run dev -- --force
```

#### 4. 애니메이션 깜빡임

**증상:**
- 카드 뒤집기 시 화면 깜빡임

**해결 방법:**
- CSS `will-change` 속성 추가
  ```css
  .tarot-card {
    will-change: transform, opacity;
  }
  ```
- GPU 가속 활성화 확인
  ```css
  .tarot-card {
    transform: translateZ(0);
  }
  ```

### 디버깅 팁

#### React DevTools 활용

```bash
# React DevTools 크롬 확장 설치
# 컴포넌트 트리에서 상태 확인
# Profiler로 렌더링 성능 분석
```

#### 네트워크 요청 확인

```javascript
// 개발자 도구 Console에서 실행
// 모든 fetch 요청 로깅
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args[0]);
  const response = await originalFetch(...args);
  console.log('Response:', response.status);
  return response;
};
```

---

## 📚 문서

### 주요 문서

| 문서 | 설명 | 작성자 |
|------|------|--------|
| [README.md](./README.md) | 프로젝트 메인 문서 (본 파일) | Claude |
| [design_spec.md](../../perplexityGuide/mysticTarot_guide/design_spec.md) | 설계 명세서 (역추적) | Claude (Perplexity 대신 작성) |
| [test_strategy.md](./test_strategy.md) | 테스트 전략 및 계획 | Claude |
| [implementation_plan.md](../../geminiGuide/mysticTarot_guide/implementation_plan.md) | 구현 계획서 | Gemini |
| [task.md](../../geminiGuide/mysticTarot_guide/task.md) | 작업 진행 상태 | Gemini |
| [walkthrough.md](../../geminiGuide/mysticTarot_guide/walkthrough.md) | 구현 결과 및 검증 | Gemini |
| [final_collaboration_guide.md](../../collaborationGuide/final_collaboration_guide.md) | 협업 가이드 | Perplexity |

### API 문서

#### 엔드포인트 요약

| 메서드 | 엔드포인트 | 설명 |
|--------|----------|------|
| GET | `/daily-card` | 오늘의 카드 조회 |
| POST | `/readings/three-cards` | 3카드 스프레드 생성 |
| POST | `/readings/{id}/assistants/{type}` | 조수별 추가 리딩 |

자세한 API 명세는 [design_spec.md](../../perplexityGuide/mysticTarot_guide/design_spec.md#3-api-명세) 참조

### 코드 아키텍처

```
┌─────────────────────────────────────────┐
│         UI Layer (Pages)                │
│  - DailyCardPage.tsx                    │
│  - ThreeCardReadingPage.tsx             │
└────────────┬────────────────────────────┘
             │ props, events
┌────────────▼────────────────────────────┐
│      Component Layer                    │
│  - TarotCardView.tsx                    │
│  - MarkdownViewer.tsx                   │
└────────────┬────────────────────────────┘
             │ state, actions
┌────────────▼────────────────────────────┐
│       Hook Layer (Business Logic)       │
│  - useDailyCard.ts                      │
│  - useThreeCardReading.ts               │
└────────────┬────────────────────────────┘
             │ async calls
┌────────────▼────────────────────────────┐
│       API Layer (Data Fetching)         │
│  - tarotApi.ts                          │
│    * fetchDailyCard()                   │
│    * createThreeCardReading()           │
│    * createAssistantReading()           │
└────────────┬────────────────────────────┘
             │ HTTP requests
┌────────────▼────────────────────────────┐
│      Backend API (Port 8080)            │
│  - Spring Boot + AI Integration         │
└─────────────────────────────────────────┘
```

---

## 👥 팀 구성

### AI 협업 체계

본 프로젝트는 3개의 AI 팀이 역할을 분담하여 개발했습니다.

| 팀 | 역할 | 담당 산출물 | 상태 |
|-----|------|-----------|------|
| **Perplexity** | 설계/검수 | `design_spec.md`, `collaboration_guide.md`, `checklist.md` | ⚠️ 누락 (Claude가 대신 작성) |
| **Gemini** | 구현 | `implementation_plan.md`, `task.md`, `walkthrough.md`, 소스코드 | ✅ 완료 |
| **Claude** | 리팩터링/문서화 | `README.md`, `test_strategy.md`, `design_spec.md` (Perplexity 대신 역추적 작성) | ✅ 완료 |

### 협업 가이드 준수

- ✅ Gemini: 구현 완료 (v0.1 → v0.6 반복 개선)
- ⚠️ Perplexity: 설계 문서 미작성 (Claude가 역추적으로 보완)
- ✅ Claude: 문서화 및 테스트 전략 수립 완료

---

## 🎨 디자인 시스템

### 색상 팔레트

```css
/* Primary Colors */
--mystic-purple: #8B5CF6;     /* 주요 강조색 */
--mystic-gold: #FFC107;       /* 프리미엄 강조 */
--mystic-dark: #1A1A2E;       /* 다크 배경 */
--mystic-night: #0F0F1E;      /* 밤하늘 배경 */

/* Gradients */
--gradient-mystic: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-gold: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

### 타이포그래피

- **Primary Font**: Chakra Petch (Google Fonts)
- **Font Sizes**: 12px ~ 36px (Tailwind 기본 스케일)
- **Line Heights**: 1.5 (본문), 1.2 (제목)

### 간격 시스템

- **기본 단위**: 4px (Tailwind의 `spacing` 시스템)
- **컴포넌트 간격**: 16px, 24px, 32px
- **섹션 간격**: 48px, 64px

---

## 📜 라이선스

본 프로젝트는 내부 프로젝트로, 라이선스 정보는 별도로 관리됩니다.

---

## 🙏 감사의 말

- **Gemini 팀**: 뛰어난 UI/UX 구현과 세심한 디테일
- **Perplexity 팀**: 프로젝트 방향 설정 (설계 문서는 보완 필요)
- **백엔드 팀**: 안정적인 API 제공 및 AI 통합
- **오픈소스 커뮤니티**: React, TailwindCSS, Vite 등 훌륭한 도구들

---

## 📞 문의

- **이슈 트래킹**: GitHub Issues
- **문서 개선 제안**: Pull Request 환영
- **긴급 버그**: [Slack Channel] (내부 전용)

---

<div align="center">

**Made with 💜 by AI Collaboration Team**

[Gemini (Implementation)](../../geminiGuide/mysticTarot_guide/) • [Claude (Documentation)](./README.md) • [Perplexity (Design)](../../collaborationGuide/)

</div>
