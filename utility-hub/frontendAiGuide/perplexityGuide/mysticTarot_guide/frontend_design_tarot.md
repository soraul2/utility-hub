1) frontend_design_tarot.md – Mystic Tarot Frontend v0.1
0. Overview
환경: React + TypeScript (가정), SPA, 다크 테마, 신비로운 밤하늘 무드.

백엔드 연동: GET /api/tarot/daily-card, POST /api/tarot/readings/three-cards 사용.
​

목표:

오늘의 카드 한 장을 빠르게 보고,

질문 기반 3장 스프레드를 편하게 남기며,

AI 리딩을 Markdown으로 읽기 쉽게 제공.

1. 주요 화면 구조
홈 화면 (/)

상단: 앱 로고 / 타이틀 “Mystic Tarot”.

메인 CTA:

“오늘의 카드 보기” 버튼.

“3장 스프레드 리딩” 버튼.

하단: 간단한 disclaimer (앱은 참고용, 결정 책임은 사용자에게).

오늘의 카드 화면 (/daily)

상단: 날짜, “오늘의 카드”.

카드 영역:

카드 이미지 (imagePath + 호스트 URL), isReversed일 경우 180도 회전.
​

카드 이름(한글/영문), 키워드.

AI 리딩:

aiReading Markdown → react-markdown으로 렌더링.
​

UX:

“다시 뽑기” 버튼 (새로 호출).

“메인으로” 버튼.

3장 스프레드 리딩 화면 (/three-cards)

질문 입력 폼:

질문 텍스트 (필수).

주제 Topic: 연애/재물/커리어/건강 등 Select.

프로필 섹션: “당신의 현재를 조금만 알려줄래요?”

이름(선택, String).

나이(선택, Number).

성별(선택: 여성/남성/말하고 싶지 않음 → MALE/FEMALE/UNKNOWN 매핑).
​

리딩 결과 영역:

3장 카드(과거/현재/미래) 카드 컴포넌트 3개.

각 카드: 이미지, 이름, position 표시(PAST/PRESENT/FUTURE).

AI 리딩: Markdown 렌더링.

UX:

“새로운 질문하기” 버튼 → 폼 리셋.

“메인으로” 버튼.

(v0.1 옵션) 히스토리 화면 스텁 (/history)

추후 백엔드 히스토리 API 붙이기 위한 자리만 잡음.

“히스토리는 다음 버전에서 제공될 예정입니다.” 정도 안내 문구.

2. 주요 컴포넌트 설계
AppLayout

헤더(타이틀), 푸터(disclaimer), 다크 테마 배경, 공통 로딩/에러 토스트 영역.

DailyCardPage

상태: cardData, loading, error.

마운트 시 /daily-card 호출, userName은 URL query 또는 간단 Input으로 전달 가능.

ThreeCardReadingPage

폼 컴포넌트 + 결과 컴포넌트로 분리.

상태: form, readingResult, loading, error.

TarotCardView

Props: { cardInfo, position, isReversed }.

CSS로 이미지 180도 회전, position 배지 표시.

MarkdownViewer

내부에서 react-markdown 사용, 기본 헤딩/리스트/문단 스타일 지정.
​

ErrorBanner / LoadingSpinner

공통 에러/로딩 UI, 에러 코드 TAROT_XXX, AI_XXX를 메세지에 함께 노출.
​

3. 스타일 가이드 (요약)
컬러:

배경: 짙은 남보라/네이비(#050816 근처), 별빛·은은한 그라디언트.

포인트: 금색/보라색 버튼.

타이포:

한글/영문 혼용 가독성 높은 Sans + 제목에 약간 세리프 느낌 폰트.

애니메이션:

카드 등장 시 살짝 페이드 인 + 위로 떠오르는 모션.

버튼 hover 시 미묘한 글로우 효과.