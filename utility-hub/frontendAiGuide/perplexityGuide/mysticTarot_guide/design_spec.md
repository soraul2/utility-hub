# 미스틱 타로 프론트엔드 설계 명세서 (Design Specification)

**작성자:** Claude (Polisher) - Perplexity 대신 작성
**버전:** v1.0
**작성일:** 2026-01-30
**목적:** Gemini 팀 구현 코드를 기반으로 한 역추적 설계 문서
**위치:** `frontendAiGuide/perplexityGuide/mysticTarot_guide/design_spec.md`

---

## 1. 개요 (Overview)

### 1.1 프로젝트 목적
- AI 기반 타로 리딩 서비스의 프론트엔드 애플리케이션
- 신비롭고 프리미엄한 UX를 통한 몰입형 타로 경험 제공
- 두 가지 핵심 기능: 오늘의 카드, 3카드 스프레드

### 1.2 기술 스택
- **프레임워크**: React 19.2.0 + TypeScript 5.9.3
- **라우팅**: React Router DOM 7.12.0
- **스타일링**: TailwindCSS 3.4.19 + Custom CSS
- **빌드 도구**: Vite 7.2.4
- **UI 라이브러리**: react-markdown 10.1.0, canvas-confetti 1.9.4
- **폰트**: Chakra Petch (Google Fonts), FontAwesome 7.1.0

### 1.3 아키텍처 원칙
- **단방향 데이터 흐름**: Props down, Events up
- **컴포넌트 기반**: 재사용 가능한 모듈형 구조
- **커스텀 훅 패턴**: 비즈니스 로직과 UI 분리
- **Progressive Disclosure**: 단계별 정보 공개로 몰입감 극대화
- **Optimistic UI**: API 응답 전 시각적 피드백 제공

---

## 2. 데이터 모델 (Data Model)

### 2.1 타입 정의 (TypeScript Interfaces)

#### 2.1.1 열거형 타입

```typescript
// 타로 주제 유형
export type TarotTopic =
  | 'LOVE'      // 연애운
  | 'MONEY'     // 금전운
  | 'CAREER'    // 직업운
  | 'HEALTH'    // 건강운
  | 'GENERAL';  // 종합운

// 사용자 성별
export type UserGender =
  | 'FEMALE'    // 여성
  | 'MALE'      // 남성
  | 'UNKNOWN';  // 미선택

// AI 조수 유형 (8가지 페르소나)
export type TarotAssistantType =
  | 'SYLVIA'    // 실비아 (공감형)
  | 'LUNA'      // 루나 (직관형)
  | 'ORION'     // 오리온 (분석형)
  | 'NOCTIS'    // 녹티스 (신비형)
  | 'VANCE'     // 밴스 (현실형)
  | 'ELARA'     // 엘라라 (위로형)
  | 'KLAUS'     // 클라우스 (철학형)
  | 'FORTUNA';  // 포르투나 (히든 마스터, 1% 확률)

// 카드 아르카나
export type TarotArcana =
  | 'MAJOR'     // 메이저 아르카나 (22장)
  | 'MINOR';    // 마이너 아르카나 (56장)

// 카드 슈트 (마이너 아르카나 전용)
export type TarotSuit =
  | 'WANDS'     // 완드 (지팡이)
  | 'CUPS'      // 컵 (성배)
  | 'SWORDS'    // 소드 (검)
  | 'PENTACLES' // 펜타클 (동전)
  | null;       // 메이저 아르카나는 null
```

#### 2.1.2 핵심 엔티티

```typescript
/**
 * 타로 카드 엔티티
 * - 백엔드 DB의 카드 마스터 데이터와 매핑
 */
export interface TarotCard {
  id: string;                // 카드 고유 식별자 (예: "major-0", "wands-ace")
  nameKo: string;            // 한글 이름 (예: "광대", "완드의 에이스")
  nameEn: string;            // 영문 이름 (예: "The Fool", "Ace of Wands")
  arcana: TarotArcana;       // 아르카나 종류
  suit: TarotSuit;           // 슈트 (메이저는 null)
  number: number;            // 카드 번호 (0-78)
  imagePath: string;         // 이미지 경로 (예: "/images/tarot/major-0.jpg")
  keywords: string;          // 키워드 (예: "시작, 모험, 순수")
  uprightMeaning: string;    // 정방향 의미
  reversedMeaning: string;   // 역방향 의미
}

/**
 * 뽑은 카드 DTO (API 응답용)
 * - 카드 정보 + 위치 + 방향 정보 포함
 */
export interface DrawnCardDto {
  position: string;          // 카드 위치 (예: "DAILY", "PAST", "PRESENT", "FUTURE")
  isReversed: boolean;       // 역방향 여부
  cardInfo: TarotCard;       // 카드 상세 정보
}
```

#### 2.1.3 API Request/Response 타입

```typescript
/**
 * 오늘의 카드 API 응답
 */
export interface DailyCardResponse {
  sessionId: number;         // 세션 ID (DB 저장용)
  card: DrawnCardDto;        // 뽑은 카드 정보
  aiReading: string;         // AI 해석 (Markdown 포맷)
  createdAt: string;         // 생성 시간 (ISO 8601)
}

/**
 * 3카드 스프레드 요청
 */
export interface ThreeCardRequest {
  question: string;              // 사용자 질문 (필수, 10-500자)
  topic: TarotTopic;             // 주제 (필수)
  userName?: string;             // 사용자 이름 (선택, 2-20자)
  userAge?: number;              // 나이 (선택, 1-120)
  userGender?: UserGender;       // 성별 (선택)
  assistantType?: TarotAssistantType; // AI 조수 타입 (선택, 기본값: Mystic)
}

/**
 * 3카드 스프레드 API 응답
 */
export interface ThreeCardResponse {
  sessionId: number;             // 세션 ID
  cards: DrawnCardDto[];         // 뽑은 카드 3장 (PAST, PRESENT, FUTURE)
  aiReading: string;             // AI 해석 (Markdown 포맷)
  createdAt: string;             // 생성 시간
}

/**
 * 조수별 리딩 API 응답
 */
export interface AssistantReadingResponse {
  assistantType: TarotAssistantType; // 조수 유형
  assistantName: string;              // 조수 이름 (예: "실비아")
  assistantTitle: string;             // 조수 직함 (예: "공감의 점성술사")
  reading: string;                    // 조수 스타일 AI 해석 (Markdown)
}
```

### 2.2 상수 정의

```typescript
/**
 * 주제 선택 옵션 (UI 표시용)
 */
export const TAROT_TOPICS: Array<{ value: TarotTopic; label: string }> = [
  { value: 'LOVE', label: '❤️ 연애운' },
  { value: 'MONEY', label: '💰 금전운' },
  { value: 'CAREER', label: '💼 직업운' },
  { value: 'HEALTH', label: '🏥 건강운' },
  { value: 'GENERAL', label: '🔮 종합운' },
];

/**
 * 성별 선택 옵션 (UI 표시용)
 */
export const TAROT_GENDERS: Array<{ value: UserGender; label: string }> = [
  { value: 'FEMALE', label: '여성' },
  { value: 'MALE', label: '남성' },
  { value: 'UNKNOWN', label: '선택 안 함' },
];
```

---

## 3. API 명세 (API Specification)

### 3.1 기본 설정

#### 3.1.1 Base URL
```
http://{hostname}:8080/api/tarot
```

#### 3.1.2 공통 헤더
```http
Content-Type: application/json; charset=UTF-8
```

#### 3.1.3 에러 응답 포맷
```typescript
{
  "message": "오류 메시지 (한글)",
  "timestamp": "2026-01-30T12:00:00.000Z",
  "status": 400 | 500
}
```

### 3.2 엔드포인트 상세

#### 3.2.1 오늘의 카드 조회

**기본 정보**
- **Endpoint**: `GET /daily-card`
- **설명**: 하루 한 번 사용자의 오늘 운세를 점칠 카드 제공
- **Rate Limit**: 사용자당 1일 1회 (IP 또는 userName 기준)

**요청 파라미터**
| 파라미터 | 타입 | 필수 | 설명 | 예시 |
|---------|------|------|------|------|
| userName | string | 선택 | 사용자 이름 (2-20자) | `홍길동` |

**요청 예시**
```http
GET /api/tarot/daily-card?userName=홍길동
```

**성공 응답 (200 OK)**
```json
{
  "sessionId": 12345,
  "card": {
    "position": "DAILY",
    "isReversed": false,
    "cardInfo": {
      "id": "major-0",
      "nameKo": "광대",
      "nameEn": "The Fool",
      "arcana": "MAJOR",
      "suit": null,
      "number": 0,
      "imagePath": "/images/tarot/major-0.jpg",
      "keywords": "시작, 모험, 순수",
      "uprightMeaning": "새로운 시작과 가능성의 상징",
      "reversedMeaning": "무모함과 경솔한 결정"
    }
  },
  "aiReading": "# 오늘의 운세\n\n광대 카드는...",
  "createdAt": "2026-01-30T12:00:00.000Z"
}
```

**에러 응답**
- `400 Bad Request`: 유효하지 않은 userName
- `429 Too Many Requests`: 1일 1회 제한 초과
- `500 Internal Server Error`: 서버 오류

---

#### 3.2.2 3카드 스프레드 생성

**기본 정보**
- **Endpoint**: `POST /readings/three-cards`
- **설명**: 사용자 질문에 대한 과거-현재-미래 3카드 리딩 생성
- **AI 모델**: OpenAI GPT-4 Turbo 또는 Claude Opus

**요청 바디**
```typescript
{
  question: string;              // 필수, 10-500자
  topic: TarotTopic;             // 필수
  userName?: string;             // 선택, 2-20자
  userAge?: number;              // 선택, 1-120
  userGender?: UserGender;       // 선택
  assistantType?: TarotAssistantType; // 선택, 기본값: Mystic
}
```

**요청 예시**
```json
{
  "question": "새로운 직장으로 이직해야 할까요?",
  "topic": "CAREER",
  "userName": "홍길동",
  "userAge": 28,
  "userGender": "MALE",
  "assistantType": "ORION"
}
```

**성공 응답 (200 OK)**
```json
{
  "sessionId": 67890,
  "cards": [
    {
      "position": "PAST",
      "isReversed": false,
      "cardInfo": { /* TarotCard 객체 */ }
    },
    {
      "position": "PRESENT",
      "isReversed": true,
      "cardInfo": { /* TarotCard 객체 */ }
    },
    {
      "position": "FUTURE",
      "isReversed": false,
      "cardInfo": { /* TarotCard 객체 */ }
    }
  ],
  "aiReading": "# 당신의 운명\n\n## 🌙 지나온 시간 (과거)\n...",
  "createdAt": "2026-01-30T12:30:00.000Z"
}
```

**에러 응답**
- `400 Bad Request`: 유효성 검증 실패 (질문 길이, 나이 범위 등)
- `500 Internal Server Error`: AI 모델 오류 또는 서버 오류

---

#### 3.2.3 조수별 추가 리딩 요청

**기본 정보**
- **Endpoint**: `POST /readings/{sessionId}/assistants/{type}`
- **설명**: 기존 세션에 대해 특정 AI 조수의 추가 해석 요청
- **사용 시나리오**: 사용자가 다른 페르소나의 해석을 더 듣고 싶을 때

**요청 파라미터**
| 파라미터 | 타입 | 필수 | 설명 | 예시 |
|---------|------|------|------|------|
| sessionId | number | 필수 | 기존 세션 ID | `67890` |
| type | TarotAssistantType | 필수 | 조수 타입 | `SYLVIA` |
| summary | boolean | 선택 | 요약본 여부 (기본 false) | `true` |

**요청 예시**
```http
POST /api/tarot/readings/67890/assistants/SYLVIA?summary=false
```

**성공 응답 (200 OK)**
```json
{
  "assistantType": "SYLVIA",
  "assistantName": "실비아",
  "assistantTitle": "공감의 점성술사",
  "reading": "# 실비아의 따뜻한 조언\n\n당신의 마음이..."
}
```

**에러 응답**
- `404 Not Found`: 존재하지 않는 sessionId
- `400 Bad Request`: 유효하지 않은 assistantType
- `500 Internal Server Error`: AI 모델 오류

---

## 4. 데이터 검증 규칙 (Validation Rules)

### 4.1 프론트엔드 검증 (클라이언트 사이드)

#### 4.1.1 오늘의 카드
| 필드 | 규칙 | 에러 메시지 |
|------|------|-----------|
| userName | 선택, 2-20자, 한글/영문/숫자만 허용 | "이름은 2-20자로 입력해주세요" |

#### 4.1.2 3카드 스프레드
| 필드 | 규칙 | 에러 메시지 |
|------|------|-----------|
| question | 필수, 10-500자 | "질문은 10-500자로 입력해주세요" |
| topic | 필수, TarotTopic 열거형 값 | "주제를 선택해주세요" |
| userName | 선택, 2-20자, 한글/영문/숫자만 | "이름은 2-20자로 입력해주세요" |
| userAge | 선택, 1-120 범위의 정수 | "나이는 1-120 사이로 입력해주세요" |
| userGender | 선택, UserGender 열거형 값 | - |
| assistantType | 선택, TarotAssistantType 열거형 값 | - |

### 4.2 백엔드 검증 (서버 사이드)
- 프론트엔드 검증과 동일한 규칙 적용 (이중 검증)
- SQL Injection, XSS 공격 방어
- Rate Limiting: 오늘의 카드 1일 1회 제한
- 카드 덱 무결성 검증 (중복 카드 방지)

---

## 5. 에러 처리 전략 (Error Handling)

### 5.1 에러 계층 구조

```
UI Layer (Component)
    ↓ ErrorBanner 표시
Hook Layer (useDailyCard, useThreeCardReading)
    ↓ setError(message)
API Layer (tarotApi.ts)
    ↓ throw Error(message)
Network Layer (fetch)
```

### 5.2 에러 타입별 처리

#### 5.2.1 네트워크 에러
- **감지**: `fetch` 실패 (연결 오류, 타임아웃)
- **메시지**: "네트워크 연결을 확인해주세요"
- **UI**: ErrorBanner + 재시도 버튼

#### 5.2.2 서버 에러 (500번대)
- **감지**: `response.status >= 500`
- **메시지**: "서버에 일시적인 문제가 발생했습니다"
- **UI**: ErrorBanner + 재시도 버튼

#### 5.2.3 클라이언트 에러 (400번대)
- **감지**: `response.status >= 400 && < 500`
- **메시지**: 서버가 반환한 `message` 필드 사용
- **UI**: ErrorBanner (재시도 버튼 없음, 입력 수정 필요)

#### 5.2.4 알 수 없는 에러
- **감지**: `catch` 블록에서 `Error` 객체가 아닌 경우
- **메시지**: "알 수 없는 오류가 발생했습니다"
- **UI**: ErrorBanner + 재시도 버튼

### 5.3 에러 처리 코드 패턴

```typescript
// API Layer
async function fetchDailyCard(userName?: string): Promise<DailyCardResponse> {
  try {
    const url = `${BASE_URL}/daily-card${userName ? `?userName=${encodeURIComponent(userName)}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '일일 카드를 가져오는 중 오류가 발생했습니다.');
    }

    return await response.json();
  } catch (error) {
    // 에러를 Hook Layer로 전달
    throw error;
  }
}

// Hook Layer
const loadDailyCard = useCallback(async (userName?: string) => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetchDailyCard(userName);
    setData(response);
  } catch (err) {
    setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
}, []);

// UI Layer
{error && <ErrorBanner message={error} onRetry={reset} />}
```

### 5.4 사용자 친화적 에러 메시지

| 기술적 에러 | 사용자 메시지 | 대응 방법 |
|------------|-------------|----------|
| Network timeout | "네트워크 연결이 불안정합니다" | 재시도 버튼 |
| 429 Too Many Requests | "오늘의 카드는 하루에 한 번만 뽑을 수 있습니다" | 시간 안내 |
| 400 Validation Error | "질문은 최소 10자 이상 입력해주세요" | 입력 필드 수정 |
| 500 Server Error | "서버에 일시적인 문제가 발생했습니다" | 재시도 버튼 |
| AI Model Error | "AI 해석 생성 중 오류가 발생했습니다" | 재시도 버튼 |

---

## 6. UI/UX 플로우 (User Flow)

### 6.1 오늘의 카드 플로우

```
[진입] TarotHome
    ↓ 클릭: "오늘의 카드"
[단계 1] DailyCardPage - 선택 단계 (step: 'selection')
    - 10장의 뒷면 카드 수평 스크롤 표시
    - 드래그 가능한 인터랙션
    - 사용자가 1장 선택
    ↓ 카드 클릭
[모달] 운명 확정 모달
    - 문구: "이 카드로 운명을 확정하시겠습니까?"
    - 버튼: [다시 선택] [운명 확정]
    ↓ [운명 확정] 클릭
[API 호출] fetchDailyCard(userName?)
    - 로딩 스피너 표시
    - 선택한 카드에 "펄스" 애니메이션
    ↓ 응답 성공
[단계 2] DailyCardPage - 결과 단계 (step: 'result')
    - 카드 뒤집기 애니메이션 (animate-flip-in)
    - Mystic Scattering 효과 (보랏빛 입자)
    - 카드 이미지 + 이름 표시
    - AI 해석 MarkdownViewer로 렌더링
    - 버튼: [다시 뽑기]
    ↓ [다시 뽑기] 클릭
[리셋] 단계 1로 복귀
```

### 6.2 3카드 스프레드 플로우

```
[진입] TarotHome
    ↓ 클릭: "3카드 스프레드"
[단계 1] ThreeCardReadingPage - 입력 단계 (step: 'input')
    - 폼 필드:
      * 질문 (textarea, 필수, 10-500자)
      * 주제 (select, 필수)
      * 이름 (input, 선택, 2-20자)
      * 나이 (input, 선택, 1-120)
      * 성별 (select, 선택)
    - 버튼: [다음]
    ↓ [다음] 클릭 (유효성 검증 통과)
[단계 2] ThreeCardReadingPage - 선택 단계 (step: 'selection')
    - 22장의 뒷면 카드 아치형 배치
    - 사용자가 3장 선택 (순차적)
    - 선택된 카드는 하단 타임라인에 배치
      * 1번째: "지나온 시간 (과거)"
      * 2번째: "마주한 현실 (현재)"
      * 3번째: "다가올 운명 (미래)"
    - 버튼: [다음] (3장 선택 완료 후 활성화)
    ↓ [다음] 클릭
[단계 3] ThreeCardReadingPage - 리더 선택 단계 (step: 'leader')
    - 8명의 AI 조수 카드 표시
      * Mystic (기본)
      * Sylvia, Luna, Orion, Noctis, Vance, Elara, Klaus
      * Fortuna (1% 확률로 등장, 컨페티 효과)
    - Grayscale-to-Color 호버 효과
    - 사용자가 1명 선택 (또는 Mystic 기본값)
    - 버튼: [운명 확인하기]
    ↓ [운명 확인하기] 클릭
[API 호출] createThreeCardReading(payload)
    - 로딩 스피너 표시
    - 로딩 문구: "카드가 운명을 읽고 있습니다..."
    ↓ 응답 성공
[단계 4] ThreeCardReadingPage - 결과 단계 (step: 'result')
    - 서브 단계 A: 카드 순차 공개
      * 3장의 카드가 뒷면으로 표시
      * 사용자가 클릭하여 하나씩 뒤집기
      * 각 카드 뒤집기 시 애니메이션 (animate-flip-in)
      * AI 해석은 아직 숨김 (서사적 리추얼)
    ↓ 3번째 카드 뒤집기 완료
    - 서브 단계 B: 운명 봉인 등장
      * 앤티크 편지 봉투가 화면 위에서 날아옴 (Fly-in)
      * 봉투가 둥둥 떠서 빛나며 두근거림 (Pulse)
      * 버튼: [운명 봉인 해제] (열쇠 아이콘)
    ↓ [운명 봉인 해제] 클릭
    - 서브 단계 C: 최종 결과 공개
      * 봉투가 빛나며 산산조각 (Shatter)
      * AI 해석이 페이드인 (MarkdownViewer)
      * 카드 3장 + 해석 전체 표시
      * 버튼: [다시 점치기] [처음으로]
```

### 6.3 네비게이션 구조

```
/tarot (TarotHome)
  ├── /tarot/daily-card (DailyCardPage)
  └── /tarot/three-card-reading (ThreeCardReadingPage)
```

---

## 7. 컴포넌트 설계 (Component Design)

### 7.1 컴포넌트 계층 구조

```
App.tsx (Router)
└── TarotLayout.tsx (레이아웃 래퍼)
    ├── 배경 효과 (별빛, 밤하늘)
    ├── 네비게이션 헤더
    └── <Outlet /> (React Router)
        ├── TarotHome.tsx (홈 화면)
        ├── DailyCardPage.tsx (오늘의 카드)
        │   ├── useDailyCard (커스텀 훅)
        │   ├── TarotCardView (카드 표시)
        │   ├── MarkdownViewer (AI 해석)
        │   ├── LoadingSpinner (로딩)
        │   └── ErrorBanner (에러)
        └── ThreeCardReadingPage.tsx (3카드 스프레드)
            ├── useThreeCardReading (커스텀 훅)
            ├── TarotCardView × 3 (카드 표시)
            ├── MarkdownViewer (AI 해석)
            ├── LoadingSpinner (로딩)
            └── ErrorBanner (에러)
```

### 7.2 주요 컴포넌트 명세

#### 7.2.1 TarotCardView

**목적**: 타로 카드 시각적 표현 (뒷면/앞면, 정방향/역방향)

**Props 인터페이스**
```typescript
interface TarotCardViewProps {
  card?: TarotCard;         // 카드 데이터 (undefined면 뒷면)
  isReversed?: boolean;     // 역방향 여부 (기본 false)
  position?: string;        // 카드 위치 라벨
  showName?: boolean;       // 카드 이름 표시 여부 (기본 true)
  className?: string;       // 추가 CSS 클래스
  onClick?: () => void;     // 클릭 핸들러
  isFaceDown?: boolean;     // 강제 뒷면 표시 (기본 false)
}
```

**렌더링 로직**
- `isFaceDown === true` 또는 `card === undefined`: 카드 뒷면 렌더링
  - 대칭형 신비 문양 디자인
  - 금박 효과 (gold-foil-border)
  - 호버 시 글로우 효과
- `card` 존재: 카드 앞면 렌더링
  - `card.imagePath`의 이미지 표시
  - 이미지 로드 실패 시 플레이스홀더
  - `isReversed === true`: 180도 회전 (transform: rotate(180deg))
  - `showName === true`: 카드 이름 하단 표시

**접근성**
- `onClick` 존재 시 `role="button"`, `tabIndex={0}`
- `alt` 속성: `{card.nameKo} 카드`

---

#### 7.2.2 MarkdownViewer

**목적**: AI 해석 텍스트를 Markdown으로 렌더링

**Props 인터페이스**
```typescript
interface MarkdownViewerProps {
  content: string;          // Markdown 텍스트
  className?: string;       // 추가 CSS 클래스
}
```

**기능**
- `react-markdown` 라이브러리 사용
- 제목 (h1, h2, h3), 리스트, 강조, 링크 지원
- 커스텀 스타일링: 타로 테마 적용
  - h1: 금박 텍스트 효과
  - h2: 보라빛 글로우
  - 강조: 황금색 하이라이트

---

#### 7.2.3 ErrorBanner

**목적**: 에러 메시지 표시 + 재시도 버튼

**Props 인터페이스**
```typescript
interface ErrorBannerProps {
  message: string;          // 에러 메시지
  onRetry?: () => void;     // 재시도 콜백 (선택)
}
```

**UI 구조**
- 빨간색 배경 배너
- 에러 아이콘 + 메시지
- `onRetry` 존재 시 [재시도] 버튼 표시

---

#### 7.2.4 LoadingSpinner

**목적**: 로딩 상태 시각화

**Props 인터페이스**
```typescript
interface LoadingSpinnerProps {
  message?: string;         // 로딩 메시지 (선택)
}
```

**UI 구조**
- 회전하는 신비로운 아이콘 (animate-spin-slow)
- 기본 메시지: "신비로운 에너지를 불러오는 중..."
- 반투명 오버레이 (position: fixed)

---

### 7.3 커스텀 훅 설계

#### 7.3.1 useDailyCard

**목적**: 오늘의 카드 데이터 fetching 및 상태 관리

**반환 인터페이스**
```typescript
interface UseDailyCardReturn {
  data: DailyCardResponse | null;           // 응답 데이터
  loading: boolean;                         // 로딩 상태
  error: string | null;                     // 에러 메시지
  loadDailyCard: (userName?: string) => Promise<void>; // 데이터 로드
  reset: () => void;                        // 상태 초기화
}
```

**상태 전이**
```
초기 상태: { data: null, loading: false, error: null }
    ↓ loadDailyCard() 호출
로딩 상태: { data: null, loading: true, error: null }
    ↓ API 성공
성공 상태: { data: {...}, loading: false, error: null }
    ↓ API 실패
에러 상태: { data: null, loading: false, error: "메시지" }
    ↓ reset() 호출
초기 상태로 복귀
```

---

#### 7.3.2 useThreeCardReading

**목적**: 3카드 스프레드 데이터 fetching 및 상태 관리

**반환 인터페이스**
```typescript
interface UseThreeCardReadingReturn {
  data: ThreeCardResponse | null;           // 응답 데이터
  loading: boolean;                         // 로딩 상태
  error: string | null;                     // 에러 메시지
  createReading: (payload: ThreeCardRequest) => Promise<void>; // 리딩 생성
  reset: () => void;                        // 상태 초기화
}
```

**상태 전이**: `useDailyCard`와 동일

---

## 8. 스타일링 시스템 (Styling System)

### 8.1 디자인 토큰

#### 8.1.1 색상 팔레트
```css
/* 주요 색상 */
--color-mystic-purple: #8B5CF6;     /* 보라 (주요 강조색) */
--color-mystic-gold: #FFC107;       /* 금색 (프리미엄 강조) */
--color-mystic-dark: #1A1A2E;       /* 다크 배경 */
--color-mystic-night: #0F0F1E;      /* 밤하늘 배경 */

/* 그라데이션 */
--gradient-mystic: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-gold: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

#### 8.1.2 타이포그래피
```css
/* 폰트 패밀리 */
--font-primary: 'Chakra Petch', sans-serif;

/* 폰트 크기 */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
```

### 8.2 커스텀 애니메이션

#### 8.2.1 카드 애니메이션
```css
/* 카드 뒤집기 */
@keyframes flip-in {
  from {
    transform: rotateY(180deg);
    opacity: 0;
  }
  to {
    transform: rotateY(0deg);
    opacity: 1;
  }
}

/* 카드 선택 시 슬램 효과 */
@keyframes slam {
  0% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.1) translateY(-10px); }
  100% { transform: scale(1) translateY(0); }
}
```

#### 8.2.2 UI 효과
```css
/* 페이드 인 */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 위로 페이드 인 */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 부유 효과 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 글로우 효과 */
@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(139, 92, 246, 0.5); }
  50% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.8); }
}
```

### 8.3 반응형 디자인

#### 8.3.1 브레이크포인트
```css
/* TailwindCSS 기본 브레이크포인트 사용 */
sm: 640px   /* 모바일 가로 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
```

#### 8.3.2 반응형 규칙
- 모바일 우선 (Mobile-first) 접근
- 카드 덱: 모바일은 스크롤, 데스크톱은 그리드
- 폰트 크기: 뷰포트에 따라 자동 조정 (clamp 사용)
- 터치 친화적: 버튼 최소 크기 44×44px

---

## 9. 보안 요구사항 (Security Requirements)

### 9.1 클라이언트 사이드 보안

#### 9.1.1 입력 검증
- XSS 방어: 사용자 입력 이스케이프 처리
- SQL Injection 방어: 백엔드 Prepared Statement 사용
- 입력 길이 제한: 프론트엔드 + 백엔드 이중 검증

#### 9.1.2 민감 정보 처리
- API 키, 토큰 등 환경 변수로 관리 (`.env` 파일, Git 제외)
- 로컬 스토리지에 민감 정보 저장 금지
- HTTPS 강제 사용 (프로덕션)

### 9.2 API 보안

#### 9.2.1 CORS 정책
- 백엔드에서 허용된 도메인만 요청 허용
- Preflight 요청 처리

#### 9.2.2 Rate Limiting
- 오늘의 카드: IP당 1일 1회
- 3카드 스프레드: IP당 1시간 5회

#### 9.2.3 인증/인가 (향후 확장)
- 현재: 익명 사용자 허용
- 향후: JWT 토큰 기반 인증 추가 고려

---

## 10. 성능 요구사항 (Performance Requirements)

### 10.1 번들 크기
- 초기 번들 크기: < 500KB (gzip)
- Lazy Loading: 라우트별 코드 스플리팅
- 이미지 최적화: WebP 포맷 사용, 적절한 크기 조정

### 10.2 응답 시간
- API 응답 시간: < 3초 (AI 모델 처리 포함)
- 페이지 전환: < 100ms
- 애니메이션 프레임률: 60fps

### 10.3 최적화 전략
- React.memo: 불필요한 리렌더 방지
- useCallback, useMemo: 함수/값 메모이제이션
- 이미지 Lazy Loading: Intersection Observer 사용
- 폰트 최적화: Font-display: swap

---

## 11. 브라우저 호환성 (Browser Compatibility)

### 11.1 지원 브라우저
- Chrome 90+ (권장)
- Firefox 88+
- Safari 14+
- Edge 90+

### 11.2 미지원 브라우저
- Internet Explorer (모든 버전)

### 11.3 Progressive Enhancement
- 기본 기능: 모든 모던 브라우저에서 동작
- 고급 애니메이션: 지원하는 브라우저에서만 활성화
- Graceful Degradation: 미지원 기능은 대체 UI 제공

---

## 12. 접근성 (Accessibility)

### 12.1 현재 상태
⚠️ **미구현**: 접근성 기능 대부분 누락

### 12.2 개선 필요 사항

#### 12.2.1 키보드 네비게이션
- [ ] 모든 인터랙티브 요소 Tab 키로 접근 가능
- [ ] Enter/Space 키로 버튼 클릭 가능
- [ ] Esc 키로 모달 닫기

#### 12.2.2 스크린 리더 지원
- [ ] `aria-label` 추가 (카드 선택 버튼 등)
- [ ] `aria-live` 영역 설정 (에러, 로딩 상태 알림)
- [ ] `role` 속성 추가 (dialog, button 등)

#### 12.2.3 시각적 접근성
- [ ] 색상 대비 비율: WCAG AA 기준 (4.5:1) 준수
- [ ] 포커스 인디케이터: 명확한 아웃라인 표시
- [ ] 텍스트 크기: 최소 16px (본문)

---

## 13. 향후 확장 계획 (Future Enhancements)

### 13.1 기능 확장
- [ ] 사용자 계정 시스템 (로그인, 리딩 히스토리)
- [ ] 리버설 카드 해석 고도화
- [ ] 커스텀 카드 덱 (다양한 타로 덱 선택)
- [ ] 리딩 공유 기능 (SNS 공유, URL 링크)
- [ ] 리딩 저장 및 북마크

### 13.2 기술 부채 해결
- [ ] 접근성 개선 (ARIA, 키보드 네비게이션)
- [ ] 단위/통합 테스트 추가 (현재 0% 커버리지)
- [ ] 성능 모니터링 (Lighthouse CI, Web Vitals)
- [ ] 국제화 (i18n) - 영어, 일본어 지원

---

## 부록 A. 용어 사전 (Glossary)

| 용어 | 설명 |
|------|------|
| 아르카나 (Arcana) | 타로 카드의 대분류. 메이저 (22장), 마이너 (56장) |
| 리버설 (Reversal) | 카드가 거꾸로 뒤집힌 상태. 정방향과 다른 의미 |
| 스프레드 (Spread) | 카드 배치 방식. 3카드는 과거-현재-미래 |
| 리딩 (Reading) | AI 또는 타로 리더의 카드 해석 |
| 페르소나 (Persona) | AI 조수의 성격 유형 (공감형, 분석형 등) |

---

## 부록 B. 참고 문서 (References)

- **Gemini 팀 산출물**
  - [implementation_plan.md](../../geminiGuide/mysticTarot_guide/implementation_plan.md)
  - [task.md](../../geminiGuide/mysticTarot_guide/task.md)
  - [walkthrough.md](../../geminiGuide/mysticTarot_guide/walkthrough.md)

- **Claude 팀 산출물**
  - [README.md](../../claudeGuide/mysticTarot_guide/README.md)
  - [test_strategy.md](../../claudeGuide/mysticTarot_guide/test_strategy.md)

- **협업 가이드**
  - [final_collaboration_guide.md](../../collaborationGuide/final_collaboration_guide.md)

- **기술 스택 문서**
  - [React 19 공식 문서](https://react.dev/)
  - [TailwindCSS 공식 문서](https://tailwindcss.com/)
  - [React Router v7 공식 문서](https://reactrouter.com/)

---

**문서 버전 히스토리**
- v1.0 (2026-01-30): 초안 작성 - 코드 기반 역추적 설계 문서
