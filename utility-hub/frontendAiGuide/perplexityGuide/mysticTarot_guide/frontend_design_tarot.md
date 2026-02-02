미스틱 타로 프론트엔드 설계 명세서
design_spec_frontend_tarot.md

작성자: Perplexity (Architect & QA)
버전: v1.1
작성일: 2026-01-30
위치(권장): frontendAiGuide/perplexityGuide/mysticTarot_guide/design_spec_frontend_tarot.md

이 문서는 미스틱 타로 프론트엔드의 Single Source of Truth 설계 명세이며,
프론트 관련 설계 변경은 항상 이 문서를 먼저 수정한 뒤, 구현(Gemini)과 리팩터링(Claude) 단계로 내려간다.

0. Overview
0.1 목표
AI 기반 타로 리딩 서비스 Mystic Tarot의 프론트엔드를 설계한다.
​

사용자가:

오늘의 카드를 빠르게 확인하고,

질문 기반 3카드 스프레드를 편하게 생성하며,

AI Markdown 리딩을 읽기 쉽고 신비로운 UI로 경험할 수 있게 한다.

0.2 환경 및 기술 스택
프레임워크: React 19.2.0 + TypeScript 5.9.3.

라우팅: React Router DOM 7.12.0.
​

스타일링: TailwindCSS 3.4.19 + 커스텀 CSS (밤하늘 다크 테마, Glassmorphism).

번들러/빌드: Vite 7.2.4.
​

UI 라이브러리:

react-markdown 10.1.0 (AI 리딩 Markdown 렌더링).

canvas-confetti 1.9.4 (Fortuna 등장 효과).
​

FontAwesome 7.1.0, Chakra Petch (Google Fonts).
​

0.3 아키텍처 원칙
단방향 데이터 흐름: Props down, Events up.
​

레이어 분리:

UI(Page) Layer ↔ Component Layer ↔ Hook(Business) Layer ↔ API Layer.
​

커스텀 훅으로 비즈니스 로직 분리: useDailyCard, useThreeCardReading.
​

Progressive Disclosure: 카드 뒤집기, 봉투 애니메이션을 통해 단계별로 정보 공개.
​

Error-first 설계: API/검증/네트워크 에러는 공통 패턴으로 처리하여 사용자 친화적 메시지를 제공.

1. 화면/라우트 설계
1.1 라우트 구조
베이스 경로: /tarot.
​

경로	화면	설명
/tarot	TarotHome	미스틱 타로 홈, 두 기능 진입점.
​
/tarot/daily-card	DailyCardPage	오늘의 카드 기능.
​
/tarot/three-card-reading	ThreeCardReadingPage	3카드 스프레드 기능.
​
(옵션) /tarot/history	HistoryPage (스텁)	향후 히스토리 확장용 자리.
​
1.2 홈 화면 (/tarot)
상단: 앱 로고/타이틀 “Mystic Tarot”.
​

메인 CTA:

“오늘의 카드 보기” → /tarot/daily-card.
​

“3장 스프레드 리딩” → /tarot/three-card-reading.
​

하단: disclaimer 텍스트:

예: “이 리딩은 참고용 조언이며, 중요한 결정은 반드시 전문가와 상의하세요.”
​

1.3 오늘의 카드 (/tarot/daily-card)
상단:

오늘 날짜, 제목 “오늘의 카드”.
​

카드 영역:

v0.1 설계: API 호출 후 카드 1장 표시.
​

구현 v0.6: 10장의 뒷면 카드 중 1장 선택 → 운명 확정 모달 → API 호출 → 결과 표시.
​

표시 요소:

카드 이미지: card.cardInfo.imagePath 앞에 백엔드 호스트를 붙여 <img>.
​

isReversed === true면 CSS rotate(180deg) 적용.
​

카드 이름(한글/영문), 키워드.
​

AI 리딩:

aiReading 문자열을 MarkdownViewer로 렌더링 (react-markdown).

UX 요소:

“다시 뽑기” 버튼: 상태 리셋 후 다시 선택 단계로.
​

“메인으로” 버튼: /tarot로 이동.
​

운명 확정 모달, Mystic Scattering(보랏빛 입자) 이펙트, 카드 플립 애니메이션.
​

1.4 3카드 스프레드 (/tarot/three-card-reading)
단계 1: 질문/프로필 입력
폼 필드 (prompt_wireframe 기준).
​

질문(TextArea, 필수):

Label: “어떤 점이 가장 궁금하신가요?”

Placeholder: “예: 올해 상반기 취업운이 궁금해요.”

주제(Select, 필수): LOVE, MONEY, CAREER, HEALTH, GENERAL.
​

이름(Input, 선택): “어떻게 불러드리면 좋을까요? (선택)”
​

나이(Input number, 선택).
​

성별(Radio/Select, 선택): 여성/남성/말하고 싶지 않음 → FEMALE/MALE/UNKNOWN 매핑.
​

버튼: “3장 스프레드 뽑기” 또는 “다음”. 질문이 비어 있으면 비활성화.
​

건강/재정/법률 주제 선택 시, 추가 경고 라벨 노출.
​

단계 2: 카드 선택
22장의 카드 뒷면을 아치형/리스트 형태로 보여주고, 3장 선택.
​

선택 순서에 따라 “지나온 시간(과거) / 마주한 현실(현재) / 다가올 운명(미래)” 라벨에 매핑.
​

3장 선택 완료 시에만 다음 단계 버튼 활성화.
​

단계 3: AI 조수 선택
8명 AI 조수 카드 표시.
​

타입	캐릭터	특징
SYLVIA	Sylvia	공감형
LUNA	Luna	직관형
ORION	Orion	분석형
NOCTIS	Noctis	신비형
VANCE	Vance	현실형
ELARA	Elara	위로형
KLAUS	Klaus	철학형
FORTUNA	Fortuna	히든 마스터, 1% 확률 등장 + 컨페티.
​
Grayscale → Hover 시 Color 인터랙션.
​

기본값: Mystic(내부적으로 특정 assistantType로 매핑).

단계 4: 결과/서사적 리추얼
카드 3장 순차 플립, AI 리딩은 봉투 해제 전까지 숨김.
​

마지막 카드 뒤집기 후:

앤티크 편지 봉투(Seal of Destiny)가 Fly-in → Pulse → Shatter 애니메이션.
​

[운명 봉인 해제] 버튼 클릭 시 AI 리딩 공개.
​

AI 리딩은 “지나온 시간 / 마주한 현실 / 다가올 운명” 섹션이 포함된 Markdown.

버튼: “다시 점치기”, “처음으로”.
​

2. 데이터 모델 (TypeScript)
2.1 열거형 타입
ts
export type TarotTopic =
  | 'LOVE'
  | 'MONEY'
  | 'CAREER'
  | 'HEALTH'
  | 'GENERAL';

export type UserGender =
  | 'FEMALE'
  | 'MALE'
  | 'UNKNOWN';

export type TarotAssistantType =
  | 'SYLVIA'
  | 'LUNA'
  | 'ORION'
  | 'NOCTIS'
  | 'VANCE'
  | 'ELARA'
  | 'KLAUS'
  | 'FORTUNA';

export type TarotArcana = 'MAJOR' | 'MINOR';

export type TarotSuit = 'WANDS' | 'CUPS' | 'SWORDS' | 'PENTACLES' | null;
2.2 핵심 엔티티
ts
export interface TarotCard {
  id: string;
  nameKo: string;
  nameEn: string;
  arcana: TarotArcana;
  suit: TarotSuit;
  number: number;
  imagePath: string;
  keywords: string;
  uprightMeaning: string;
  reversedMeaning: string;
}

export interface DrawnCardDto {
  position: string;      // 'DAILY' | 'PAST' | 'PRESENT' | 'FUTURE'
  isReversed: boolean;
  cardInfo: TarotCard;
}

export interface DailyCardResponse {
  sessionId: number;
  card: DrawnCardDto;
  aiReading: string;
  createdAt: string;
}

export interface ThreeCardRequest {
  question: string;
  topic: TarotTopic;
  userName?: string;
  userAge?: number;
  userGender?: UserGender;
  assistantType?: TarotAssistantType;
}

export interface ThreeCardResponse {
  sessionId: number;
  cards: DrawnCardDto[];
  aiReading: string;
  createdAt: string;
}

export interface AssistantReadingResponse {
  assistantType: TarotAssistantType;
  assistantName: string;
  assistantTitle: string;
  reading: string;
}
2.3 UI 상수
ts
export const TAROT_TOPICS = [
  { value: 'LOVE', label: '❤️ 연애운' },
  { value: 'MONEY', label: '💰 금전운' },
  { value: 'CAREER', label: '💼 직업운' },
  { value: 'HEALTH', label: '🏥 건강운' },
  { value: 'GENERAL', label: '🔮 종합운' },
];

export const TAROT_GENDERS = [
  { value: 'FEMALE', label: '여성' },
  { value: 'MALE', label: '남성' },
  { value: 'UNKNOWN', label: '선택 안 함' },
];
3. API 사용 규칙
3.1 공통
Base URL: http://{hostname}:8080/api/tarot (프론트에선 .env의 VITE_API_BASE_URL 사용).
​

헤더: Content-Type: application/json; charset=UTF-8.
​

3.2 오늘의 카드 (GET /daily-card)
프론트 예시:

ts
const fetchDailyCard = async (userName?: string): Promise<DailyCardResponse> => {
  const params = userName ? `?userName=${encodeURIComponent(userName)}` : '';
  const res = await fetch(`${BASE_URL}/daily-card${params}`);
  if (!res.ok) throw await res.json();
  return res.json();
};
응답:

card.imagePath 앞에 백엔드 호스트(http://localhost:8080)를 붙여 <img>에 사용.
​

aiReading은 MarkdownViewer로 렌더링.

3.3 3카드 스프레드 (POST /readings/three-cards)
ts
const createThreeCardReading = async (payload: ThreeCardRequest): Promise<ThreeCardResponse> => {
  const res = await fetch(`${BASE_URL}/readings/three-cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json();
};
cards는 PAST → PRESENT → FUTURE 순으로 정렬해 보여준다.
​

isReversed가 true면 카드 이미지를 회전.
​

4. 상태/에러 처리 패턴
4.1 공통 상태 패턴
초기:

ts
data = null;
loading = false;
error = null;
호출 전:

loading = true, error = null.
​

성공:

loading = false, data = 응답.

실패:

loading = false, error = message.
​

4.2 훅 설계
useDailyCard
ts
export function useDailyCard() {
  const [data, setData] = useState<DailyCardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDailyCard = useCallback(async (userName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDailyCard(userName);
      setData(res);
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
useThreeCardReading도 동일 패턴.

4.3 UI 레벨 처리
tsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorBanner message={error} onRetry={reset} />;
if (data) return <ResultView data={data} />;
return <SelectionView onSelect={handleCardSelect} />;
5. 컴포넌트/레이아웃 설계
5.1 계층 구조
text
App.tsx (Router)
└─ TarotLayout.tsx
   ├─ Header (타이틀, 네비게이션)
   ├─ Background (밤하늘/별빛)
   └─ Outlet
      ├─ TarotHome.tsx
      ├─ DailyCardPage.tsx
      │   ├─ useDailyCard
      │   ├─ TarotCardView
      │   ├─ MarkdownViewer
      │   ├─ LoadingSpinner
      │   └─ ErrorBanner
      └─ ThreeCardReadingPage.tsx
          ├─ useThreeCardReading
          ├─ TarotCardView × 3+
          ├─ MarkdownViewer
          ├─ LoadingSpinner
          └─ ErrorBanner
5.2 주요 컴포넌트 계약
TarotCardView
ts
interface TarotCardViewProps {
  card?: TarotCard;
  isReversed?: boolean;
  position?: string;
  showName?: boolean;
  className?: string;
  onClick?: () => void;
  isFaceDown?: boolean;
}
isFaceDown 또는 !card → 뒷면 표시 (대칭 문양, gold foil).
​

isReversed → transform: rotate(180deg).
​

접근성: onClick가 있으면 role="button", tabIndex=0, alt="{nameKo} 카드".
​

MarkdownViewer
ts
interface MarkdownViewerProps {
  content: string;
  className?: string;
}
react-markdown 사용, 향후 rehype-sanitize 도입.

ErrorBanner, LoadingSpinner
ErrorBanner(message, onRetry?)

LoadingSpinner(message?) (기본: “신비로운 에너지를 불러오는 중...”).
​

6. 스타일/성능/보안 요약
6.1 디자인 토큰 (요약)
색상:

--mystic-purple: #8B5CF6, --mystic-gold: #FFC107, --mystic-dark: #1A1A2E, --mystic-night: #0F0F1E.
​

폰트: Chakra Petch, base 16px, heading 20–36px.
​

6.2 성능 목표
번들 크기 < 500KB(gzip), Lighthouse 90+, TTI < 3.5초.

6.3 보안/윤리
Markdown은 react-markdown + sanitize로 XSS 방어.

HEALTH/MONEY/LEGAL 토픽 선택 시, 추가 디스클레이머 표시.
​

이름/나이/성별은 톤 조정용 정보이며, 차별/고정관념 표현에 사용하지 않는다.

7. 테스트/확장 메모
테스트 전략: test_strategy.md에 정의된 Vitest + RTL + MSW + Playwright 피라미드 준수.

향후 확장:

히스토리, 계정, 리버설 고도화, i18n 등은 v1.1 설계 범위 밖으로 두고, 필요 시 v1.2+에서 명시적으로 추가.
​

이 문서(design_spec_frontend_tarot.md v1.1)를 기준으로,

설계 변경은 항상 여기서 먼저 수행하고,

Gemini는 이 스펙만 보고 프론트 구현/수정,

Claude는 이 스펙 + 구현 코드를 기준으로 리팩터링/문서화를 수행한다.
​