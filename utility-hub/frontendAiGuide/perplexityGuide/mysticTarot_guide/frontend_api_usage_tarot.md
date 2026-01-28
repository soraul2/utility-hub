2) frontend_api_usage_tarot.md – API 연동 & 에러 처리 가이드 v0.1
0. Overview
Base URL: http://localhost:8080/api/tarot.
​

공통 헤더: Content-Type: application/json; charset=UTF-8.

CORS: http://localhost:3000 허용, credentials 포함 가능.
​

1. 오늘의 카드 호출 규칙
Endpoint

Method: GET

Path: /daily-card

Query Params:

userName (optional)

프론트 예시 (TypeScript):

ts
const fetchDailyCard = async (userName?: string) => {
  const params = userName ? `?userName=${encodeURIComponent(userName)}` : "";
  const res = await fetch(`http://localhost:8080/api/tarot/daily-card${params}`);
  if (!res.ok) throw await res.json();
  return res.json() as Promise<DailyCardResponse>;
};
응답 사용:

sessionId는 (v0.1) 화면에서 직접 쓰지 않지만, 추후 히스토리용으로 state에 보관 가능.
​

card.imagePath 앞에 백엔드 호스트(http://localhost:8080)를 붙여 <img src>로 사용.
​

aiReading은 MarkdownViewer로 렌더링.

2. 3카드 스프레드 호출 규칙
Endpoint

Method: POST

Path: /readings/three-cards

요청 바디 규칙:

question: string (필수).

topic: enum (예: LOVE, CAREER, MONEY, HEALTH).

userName, userAge, userGender: 모두 선택.

성별 매핑: 여성 → FEMALE, 남성 → MALE, 말하고 싶지 않음 → UNKNOWN.
​

프론트 예시:

ts
const createThreeCardReading = async (payload: ThreeCardRequest) => {
  const res = await fetch("http://localhost:8080/api/tarot/readings/three-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await res.json();
  return res.json() as Promise<ThreeCardResponse>;
};
응답 사용:

cards: position별로 정렬(PAST → PRESENT → FUTURE)해서 보여주기.

isReversed: true면 카드 이미지를 CSS로 회전.

aiReading: Markdown 렌더링.

3. 로딩/에러/성공 상태 관리
공통 패턴:

호출 전: loading = true, error = null.

성공: loading = false, data 세팅.

실패: loading = false, error에 { code, message } 바인딩.
​

에러 응답 포맷:

json
{
  "code": "TAROT_001",
  "message": "카드 덱 초기화에 실패했습니다."
}
프론트 처리:

code로 타입 분류:

TAROT_XXX: 카드/덱/입력 관련 오류 → “잠시 후 다시 시도해 주세요.”

AI_XXX: AI 호출 실패 → “AI 리딩 생성에 잠시 문제가 발생했어요.”

필요 시 토스트 + 페이지 상단 ErrorBanner 병행.

4. AI 리딩 Markdown 처리
라이브러리: react-markdown 권장.
​

기본 옵션:

헤딩(예: ### 오늘의 활기찬 에너지)은 H3 스타일로 표시.

링크/이미지는 v0.1 기준 거의 없다고 가정, 기본 스타일만 유지.

주의:

XSS 방지를 위해 rehype-sanitize 같은 옵션 검토 (v0.2에서 강화 예정).

5. 기타 협업 규칙
API 스펙 변경(필드명/타입/엔드포인트)은 무조건 design_spec_tarot.md와 백엔드 명세부터 수정 후, 프론트는 그 변경을 따라간다.
​

새로운 스프레드(예: 켈틱 크로스) 도입 시:

DTO 구조가 달라질 수 있으므로, 먼저 Perplexity 설계 → Gemini 구현 → 프론트 반영 순서를 지킨다.
​