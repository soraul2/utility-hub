미스틱 타로 프론트엔드 체크리스트
checklist_frontend_tarot.md

도메인: Mystic Tarot – Frontend (React SPA)
작성자: Perplexity (Architect & QA)
버전: v1.0
작성일: 2026-01-30

이 체크리스트는 미스틱 타로 프론트엔드에 대해
**“설계대로 구현되었는지”**와 **“협업 헌법을 지켰는지”**를 점검하기 위한 QA 도구다.
​

1. 라우팅 & 화면 구조
 라우트가 설계와 일치하는가?

/tarot → TarotHome

/tarot/daily-card → DailyCardPage

/tarot/three-card-reading → ThreeCardReadingPage

 (옵션) /tarot/history는 “다음 버전에서 제공 예정” 안내만 있고, 실제 기능은 붙어 있지 않은가?
​

 전체 화면은 TarotLayout으로 감싸여 있고, 공통 헤더/배경/푸터 구조를 공유하는가?
​

2. 오늘의 카드 플로우 (/tarot/daily-card)
2.1 선택 → 확정 → 결과 플로우
 진입 시 선택 단계(카드 뒷면 덱)가 먼저 보이는가? (직접 API 호출 후 결과만 보여주지 않는가)
​

 카드 선택 시 “운명 확정” 모달이 뜨고,

 “다시 선택” / “운명 확정” 두 버튼이 존재하는가?
​

 “운명 확정” 클릭 후에만 GET /daily-card API를 호출하는가?
​

 결과 단계에서:

 카드 플립 애니메이션이 발생하고,

 Mystic Scattering(보랏빛 입자) 이펙트가 표시되는가?
​

 “다시 뽑기” 클릭 시 상태가 초기화되고 다시 선택 단계로 돌아가는가?
​

2.2 API/데이터 사용
 DailyCardResponse.card.cardInfo.imagePath에 백엔드 호스트(http://localhost:8080 등 환경별 URL)를 붙여 <img src>로 사용하고 있는가?
​

 isReversed가 true일 때 CSS transform: rotate(180deg) 또는 동등한 회전 처리로 역방향을 표현하는가?
​

 aiReading은 MarkdownViewer(react-markdown)로 렌더링되는가? HTML 문자열 직접 삽입은 하지 않는가?

3. 3카드 스프레드 플로우 (/tarot/three-card-reading)
3.1 입력 단계 (질문/프로필)
 질문 필드는 TextArea이고, Placeholder/Label이 설계와 유사한 형태로 존재하는가?
​

 Topic 선택 옵션이 설계 enum과 일치하는가?

LOVE, MONEY, CAREER, HEALTH, GENERAL.
​

 이름/나이/성별은 모두 선택 항목이고, 질문만 필수인가?
​

 성별 UI 선택이 FEMALE/MALE/UNKNOWN으로 정확히 매핑되는가?
​

 질문이 비어 있으면 “3장 스프레드 뽑기/다음” 버튼이 비활성화되는가?
​

 HEALTH/MONEY/LEGAL 관련 토픽에서 추가 경고 라벨이 나타나는가? (중요 결정은 이 리딩만으로 하지 말라는 안내)

3.2 카드 선택/AI 조수/결과 플로우
 카드 선택 단계에서 3장 선택이 완료되기 전까지 다음 단계로 진행할 수 없는가?
​

 선택된 3장은 “지나온 시간 / 마주한 현실 / 다가올 운명” 라벨에 순서대로 매핑되는가?
​

 AI 조수 선택 화면에서 8개 페르소나가 노출되는가? (Fortuna는 1% 확률 등장)
​

 Fortuna 등장 시 별도의 시각 효과(컨페티, 글로우 등)가 있는가?
​

 “운명 확인하기” 클릭 후 POST /readings/three-cards가 설계된 JSON 스키마로 호출되는가?

question, topic, userName?, userAge?, userGender?, assistantType?.

 결과 단계에서:

 3장은 처음에 모두 뒷면이고, 사용자가 하나씩 뒤집을 수 있는가?

 마지막 카드 뒤집기 후 봉투(Seal of Destiny)가 Fly-in → Pulse → Shatter 시퀀스로 나타나는가?
​

 [운명 봉인 해제] 버튼 클릭 후에야 AI 전체 리딩이 표시되는가? (그 전에는 일부/전체가 노출되지 않아야 함).
​

4. 데이터/타입/검증 규칙
4.1 타입/모델
 코드 상의 타입 정의가 설계의 TarotCard, DrawnCardDto, DailyCardResponse, ThreeCardRequest/Response와 일치하는가?
​

 TarotTopic, UserGender, TarotAssistantType enum 값이 설계와 동일한 문자열 집합을 사용하는가?
​

4.2 프론트 입력 검증
 질문 길이: 10–500자 범위에서 검증되는가? (너무 짧은 질문은 막는지)
​

 userName: 선택, 2–20자, 허용 문자 제약(한글/영문/숫자) 준수 여부.
​

 userAge: 선택, 1–120 범위의 정수만 허용되는가?
​

 잘못된 입력이 있을 때는 서버 호출 전에 UI에서 막고, 의미 있는 에러 메시지를 보여주는가?

5. API 사용 & 에러 처리
5.1 API 호출 규칙
 API Base URL이 .env (예: VITE_API_BASE_URL) 기준으로 구성되며, 코드에 하드코딩된 호스트가 없는가?
​

 fetchDailyCard, createThreeCardReading는 설계된 시그니처를 따르고,

HTTP 4xx/5xx 응답 시 res.ok 체크 후 JSON 에러를 throw하는가?

 Frontend에서 API를 직접 임의로 늘리지 않고, 설계된 엔드포인트만 사용하는가? (예: /daily-card, /readings/three-cards, /readings/{id}/assistants/{type}).
​

5.2 에러 처리 UX
 네트워크 에러/서버 에러/검증 에러에 따라 다른 메시지를 보여주는가? (예: 네트워크: “연결 확인”, 400: 검증 메시지, 500: “서버에 문제가…”).

 ErrorBanner가 공통적으로 사용되고, 필요 시 “재시도” 버튼을 제공하는가?
​

 알 수 없는 에러에 대해서도 기본 메시지(예: “알 수 없는 오류가 발생했습니다”)가 제공되는가?
​

6. Markdown & 보안
 AI 리딩(aiReading)은 항상 MarkdownViewer(react-markdown)로 렌더링되는가?

 dangerouslySetInnerHTML 등으로 raw HTML을 직접 주입하지 않는가?

 (v0.2 전) HTML 태그가 필요 없다는 전제를 유지하고 있는가?

 (v0.2 이후) rehype-sanitize 또는 동등한 sanitize 설정 도입 시, 설계/가이드에 먼저 반영되었는가?

7. 테스트 & 품질
7.1 단위/통합 테스트
 lib/api/tarotApi.ts에 대한 단위 테스트가 존재하고, 성공/에러/엣지 케이스를 커버하는가?

 useDailyCard, useThreeCardReading에 대한 테스트가 존재하며, 상태 전이(초기→로딩→성공/실패→리셋)를 검증하는가?
​

 TarotCardView에 대한 테스트가:

뒷면/앞면, 정방향/역방향, 이름 표시 여부, 클릭 핸들링을 확인하는가?
​

 DailyCardPage, ThreeCardReadingPage에 대해 최소 1개 이상의 통합 테스트가 있고, 주요 플로우(Happy Path)를 검증하는가?

7.2 E2E 테스트
 Playwright 기반 E2E 테스트에 다음 시나리오가 포함되는가?

오늘의 카드: 홈 → 오늘의 카드 → 카드 선택 → 운명 확정 → 결과 확인.

3카드 스프레드: 홈 → 3카드 → 질문/프로필 입력 → 카드 선택 → 조수 선택 → 운명 봉인 해제 → 결과 확인.

 E2E 테스트가 로컬에서 정상 통과하고, CI에서도 주기적으로 실행되는가?

7.3 커버리지 기준
 test_strategy.md에 정의된 최소 커버리지(예: statements 80% 등)를 만족하는가?

 신규 기능/화면 추가 시, 테스트 코드도 함께 추가되었는가? (테스트 없는 기능이 없는지 확인).

8. 접근성 & 반응형
 주요 인터랙션 요소(카드, 버튼, 모달)에 대해 Tab 이동 및 Enter/Space로 조작이 가능한가?
​

 스크린 리더용 aria-label, role이 핵심 요소에 부여되어 있는가? (카드 선택 버튼, 모달 등).
​

 색상 대비가 타로 다크 테마에서도 텍스트 가독성을 유지하는가?(WCAG AA 근사)
​

 모바일(세로), 태블릿, 데스크톱에서 레이아웃이 깨지지 않고, 주요 플로우가 모두 사용 가능한가?
​

9. 윤리/가드레일
 HEALTH/MONEY/CAREER/LEGAL 관련 질문에 대해, 하단 디스클레이머가 항상 노출되는가?

 AI 리딩 문구에서 “확정적 미래 보장”식 표현(예: 반드시, 절대, 100%)을 강조하지 않도록 프론트 카피/문구가 조정되어 있는가? (과한 확정 표현이 있으면 재검토 요청)

이 체크리스트는 Perplexity가 최종 검수할 때 사용되며,
Gemini/Claude도 자기 점검용으로 활용할 수 있다.
항목이 실제 구현/운영과 어긋나기 시작하면, 반드시 Perplexity가 먼저 이 문서를 업데이트한 뒤 코드/문서를 맞춰 간다.
​