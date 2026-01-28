# 미스틱 타로 (Mystic Tarot) 프론트엔드-백엔드 통합 협업 명세서 (v0.2)

이 문서는 프론트엔드 팀과 백엔드 팀 간의 원활한 협업을 위해 API 스펙, 데이터 구조, 이미지 경로 및 에러 처리 정책을 정의한 통합 명세서입니다.

## 1. 기본 정보
- **Base URL**: `http://localhost:8080/api/tarot`
- **Content-Type**: `application/json; charset=UTF-8`
- **CORS 정책**: `http://localhost:3000`, `http://localhost:5173` 허용 (Credentials 포함)

## 2. API 엔드포인트 상세

### 2.1 오늘의 카드 생성
사용자의 이름을 입력받아 하루의 운세를 위한 단일 카드를 추출하고 AI 리딩을 생성합니다.
- **Method**: `GET`
- **Path**: `/daily-card`
- **Query Params**:
  - `userName` (String, Optional): 사용자 이름 (예: "홍길동")
- **Success Response (200 OK)**:
```json
{
  "sessionId": 123,
  "card": {
    "position": "DAILY",
    "isReversed": false,
    "cardInfo": {
      "id": "major_0",
      "nameKo": "광대",
      "nameEn": "The Fool",
      "arcana": "MAJOR",
      "imagePath": "/images/tarot/major_0.jpg",
      "keywords": "새로운 시작, 순수함, 자유",
      "uprightMeaning": "순수한 마음으로 새로운 모험을 시작함을 의미합니다...",
      "reversedMeaning": "경솔한 행동이나 무모한 시작을 경계해야 합니다..."
    }
  },
  "aiReading": "### 오늘의 활기찬 에너지...\n\n오늘 당신은 새로운 시작의 기운을 받았습니다...",
  "createdAt": "2024-01-28T14:00:00"
}
```

### 2.2 3카드 스프레드 리딩 생성
과거, 현재, 미래를 상징하는 3장의 카드를 뽑고 종합적인 AI 상담 결과를 반환합니다.
- **Method**: `POST`
- **Path**: `/readings/three-cards`
- **Request Body**:
```json
{
  "question": "올해 연애운이 어떨까요?",
  "userName": "홍길동",
  "userAge": 25,
  "userGender": "MALE",
  "topic": "LOVE"
}
```
- **Success Response (200 OK)**:
```json
{
  "sessionId": 456,
  "cards": [
    { "position": "PAST", "isReversed": true, "cardInfo": { ... } },
    { "position": "PRESENT", "isReversed": false, "cardInfo": { ... } },
    { "position": "FUTURE", "isReversed": false, "cardInfo": { ... } }
  ],
  "aiReading": "# 3카드 스프레드 리딩 결과\n\n당신의 과거는...",
  "createdAt": "2024-01-28T14:10:00"
}
```

## 3. 프론트엔드 가이드

### 3.1 이미지 렌더링
- 각 카드 객체의 `imagePath` 필드 값을 사용합니다 (예: `/images/tarot/major_0.jpg`).
- 프론트엔드에서는 해당 경로 앞에 정적 자원 서버 주소(예: `http://localhost:8080`)를 붙여서 이미지를 요청해야 합니다.

### 3.2 역방향(Reversed) 처리
- `isReversed: true`인 경우, 프론트엔드에서 카드 이미지를 **180도 회전(CSS: transform: rotate(180deg))** 하여 표시해야 합니다.
- 리딩 텍스트는 백엔드에서 역방향 의미를 고려하여 이미 처리된 상태로 전달됩니다.

### 3.3 AI 리딩 출력
- `aiReading`은 **Markdown** 형식을 포함할 수 있습니다.
- 프론트엔드에서는 `react-markdown` 등의 라이브러리를 사용하여 렌더링하는 것을 권장합니다.

## 4. 공통 에러 응답 포맷
에러 발생 시 백엔드는 일관된 JSON 구조를 반환합니다.
```json
{
  "code": "TAROT_001",
  "message": "카드 덱 초기화에 실패했습니다."
}
```
- `TAROT_XXX`: 타로 도메인 관련 에러
- `AI_XXX`: AI 호출 및 서비스 관련 에러

## 5. 협업 참고 사항
- 설계 변경이 필요한 경우 `design_spec_tarot.md`를 우선 수정해야 합니다.
- 새로운 스프레드 방식(예: 켈틱 크로스) 추가 시 DTO 구조를 백엔드와 사전 협의하십시오.
