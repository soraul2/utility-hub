1) design_spec_tarot.md – Mystic Tarot v0.1
0. Overview

신비로운 밤하늘 분위기의 타로 운세 앱 “Mystic Tarot”.

기능: 오늘의 카드(1장), 3장 스프레드(과거·현재·미래), AI 기반 해석, 히스토리/저널.

백엔드: Spring Boot + Spring AI, 퍼블릭 도메인 1909 Rider–Waite 덱 사용.

1. Goals & Scope

사용자가 오늘의 기운, 특정 주제(연애/재물/커리어/건강), 과거·현재·미래 흐름을 간단한 플로우로 볼 수 있게 한다.

카드 뽑기·스프레드는 순수 도메인 로직, 해석은 LLM이 담당.

v0.1 범위: Deck/카드/스프레드 모델, 오늘의 카드/3장 스프레드/히스토리 API, 기본 프롬프트 설계.

2. 핵심 플로우

오늘의 카드

홈 → /api/tarot/daily-card → 카드 1장 + 짧은 요약 → 상세에서 AI 확장.

3장 스프레드

주제 선택 → 질문 입력 + (이름/나이/성별 선택 입력) → /api/tarot/readings/three-cards → 카드 3장 + AI 해석 → 저널 저장.

히스토리

/api/tarot/readings/history 목록

/api/tarot/readings/{id} 상세

개별 삭제 + 전체 삭제.

3. 도메인 모델

TarotCard: id, nameKo/nameEn, arcana, suit, number, imagePath, keywordsKo, uprightMeaningKo, reversedMeaningKo.

TarotSpread: id, code (DAILY_ONE, THREE_CARD_PPF), nameKo, positions(예: PAST/PRESENT/FUTURE).

TarotReadingSession: id, question, topic, language, spreadCode, drawnCards(cardId, position, isReversed, snapshotName/imagePath), aiSummary/aiPast/aiPresent/aiFuture/aiAdvice, createdAt, userNameSnapshot, ageGroup, gender.

4. API (요약)

GET /api/tarot/daily-card

응답: 1장 카드 정보 + 짧은 aiSummary + meta(deck, language, createdAt).

POST /api/tarot/readings/three-cards

요청 예:

json
{
  "question": "상반기 취업운이 궁금해",
  "topic": "CAREER",
  "language": "ko",
  "aiMode": "MYSTIC_STANDARD",
  "name": "민수",
  "age": 27,
  "gender": "FEMALE"
}
응답:

spreadType,

cards[] (position, cardName, arcana, suit, number, isReversed, imageUrl, keywords),

aiReading(summary, past, present, future, advice),

disclaimer, meta(deck, language, createdAt).

히스토리 관련

GET /api/tarot/readings/history?limit=20

GET /api/tarot/readings/{id}

DELETE /api/tarot/readings/{id}

DELETE /api/tarot/readings/purge.

5. AI 연동 & 프롬프트 방향

Spring AI ChatClient 기반.

시스템 메시지 핵심:

신비로운 톤, 미래 “보장/확정” 금지, 이름/나이/성별은 톤·예시 조정용으로만 사용, 차별·고정관념 표현 금지.

6. 윤리/법적 가드레일 요약

응답에 항상 disclaimer 포함.

히스토리/프로필 삭제 기능 제공.

2) 사용자 프로필·개인화 설계 (design_spec 내 섹션)
목적

이름·나이·성별을 받아 리딩의 호칭, 예시, 톤을 사용자에게 맞추되, 전부 선택 사항으로 유지.

UI

질문 입력 화면 하단 섹션 “당신의 현재를 조금만 알려줄래요?”

이름

Label: “어떻게 불러드리면 좋을까요? (선택)”

Placeholder: “예: 민수, 별명도 좋아요”
​

나이

숫자 입력(예: 27), 내부적으로 연령대(10대/20대...)로 매핑.
​

성별

옵션: “여성 / 남성 / 말하고 싶지 않음” pill 버튼.

API 필드

요청 DTO에 name(nullable), age(nullable), gender(MALE/FEMALE/UNKNOWN).

TarotReadingSession에 userNameSnapshot, ageGroup, gender 저장, 히스토리 삭제 시 함께 제거.

프롬프트 규칙

이름: 가끔 부드럽게 호칭할 때 사용.

나이: 삶의 단계에 맞는 예시(진로 탐색/두 번째 막 등).

성별: 말투 조정 정도, 고정관념·차별 금지.