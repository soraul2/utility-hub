# 미스틱 타로 (Mystic Tarot) 백엔드 구현 계획서

이 문서는 Perplexity의 `design_spec_tarot.md` 설계를 바탕으로 Gemini 팀(Antigravity)이 작성한 백엔드 구현 계획입니다.

## 1. 개요
`tarot_data.json`의 상세 카드 데이터를 통합하고, "오늘의 카드" 필터링 및 AI 페르소나 리딩 기능을 구현하여 타로 서비스의 품질을 고도화합니다.

## 2. 패키지 및 클래스 구성
구현 대상은 `com.wootae.backend.domain.tarot` 패키지 하위에 위치합니다.

### 2.1 주요 컴포넌트
- **Controller**: `TarotController.java`
  - `GET /api/tarot/daily-card`: 오늘의 카드 조회 엔드포인트 추가
  - `POST /api/tarot/readings/three-cards`: 기존 3카드 리딩 유지 및 고도화
- **Service**:
  - `TarotCardService.java`: `tarot_data.json` 로딩, 덱 관리 및 **Fortuna 전용 필터링** 로직
  - `TarotAiService.java`: 다중 페르소나(`TarotAssistantType`) 기반 동적 프롬프트 생성 및 AI 호출
  - `TarotReadingService.java`: 리딩 세션 생성, 결과 저장 및 비즈니스 워크플로우 제어
- **DTO**: `TarotDTOs.java`
  - `DailyCardResponse`, `DrawnCardDto`, `ThreeCardSpreadResponse` 등 정의
- **Entity**:
  - `TarotCard.java`: 카드 기본 정보 및 키워드, 정/역방향 의미 포함
  - `TarotReadingSession.java`: 리딩 결과 저장을 위한 엔티티
  - `TarotSpread.java`: 스프레드 타입(DAILY_ONE, THREE_CARD) Enum

## 3. 구현 단계 (Work Order)
- [x] **데이터 통합**: `tarot_data.json`의 필드(ID, 한글/영문명, 키워드, 정/역 의미)를 `TarotCard` 엔티티에 반영.
- [x] **덱 초기화 로직 구현**: `TarotCardService`에서 `ObjectMapper`를 사용하여 JSON 데이터를 로드하고 메모리에 덱을 구성.
- [x] **AI 리딩 고도화**: `TarotAiService`에서 8가지 페르소나별 성격과 말투를 적용하고, 카드별 상세 의미를 프롬프트에 동적으로 삽입.
- [x] **오늘의 카드 구현**: 단일 카드 추출 및 전용 AI 해석 생성 로직 개발.
- [x] **API 엔드포인트 추가**: `TarotController`에 오늘의 카드 API 구현 및 Swagger 문서화완료.
- [x] **검증**: 단위 테스트(`TarotCardServiceTest`) 및 통합 테스트(`TarotControllerTest`) 수행 완료 (Swagger 명세 포함).

## 4. 테스트 전략
- `TarotCardService`: JSON 데이터 로딩 성공 여부 및 카드 추출 무작위성 검증.
- `TarotAiService`: 생성된 프롬프트의 유효성 및 AI 응답 수신 확인.
- `TarotReadingService`: 트랜잭션 내에서 리딩 세션이 DB에 정확히 저장되는지 확인.
