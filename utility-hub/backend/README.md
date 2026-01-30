# Mystic Tarot Backend

미스틱 타로 백엔드 API 서버 - Spring Boot + Spring AI 기반

## 📋 목차
- [프로젝트 개요](#프로젝트-개요)
- [기술 스택](#기술-스택)
- [주요 기능](#주요-기능)
- [시작하기](#시작하기)
- [API 엔드포인트](#api-엔드포인트)
- [프론트엔드 연동](#프론트엔드-연동)
- [테스트](#테스트)
- [배포](#배포)

---

## 프로젝트 개요

미스틱 타로는 AI 기반 타로 리딩 서비스의 백엔드 API입니다. 78장의 타로 카드 데이터와 8가지 독창적인 AI 페르소나를 활용하여 사용자에게 개인화된 타로 리딩을 제공합니다.

### 아키텍처

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Frontend   │─────▶│   Backend    │─────▶│  Spring AI  │
│  (React)    │      │ (Spring Boot)│      │  (Gemini)   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │    MySQL     │
                     │   Database   │
                     └──────────────┘
```

### 핵심 특징

- **8가지 AI 페르소나**: 실비아(현실적), 루나(치유), 오리온(긍정), 녹티스(독설), 밴스(분석), 엘라라(신비), 클라우스(학술), 포르투나(행운)
- **포르투나 특수 로직**: 긍정 카드만 필터링하여 무조건적인 행운 보장
- **풍부한 카드 데이터**: 78장 전체 덱, 키워드, 정/역방향 의미 포함
- **세션 저장**: 모든 리딩 기록을 DB에 저장하여 히스토리 조회 가능

---

## 기술 스택

| Category | Technology | Version |
|----------|-----------|---------|
| Framework | Spring Boot | 3.5.10 |
| AI Integration | Spring AI | 1.1.2 |
| AI Provider | Google Gemini | - |
| Database | MySQL | 8.0+ |
| Build Tool | Gradle | 8.x |
| Java | OpenJDK | 21 |
| ORM | Spring Data JPA | - |

---

## 주요 기능

### 1. 오늘의 카드 (Daily Card)
- 하루의 가이드를 제공하는 단일 카드 리딩
- 사용자 이름 기반 개인화 (선택)
- AI 기반 해석 제공

### 2. 3카드 스프레드 (Three Card Spread)
- 과거-현재-미래 3장 카드 리딩
- 질문 주제별 맞춤 해석 (연애, 재물, 커리어, 건강, 일반)
- 사용자 프로필 기반 개인화 (이름, 나이, 성별)
- AI 조수 선택 가능

### 3. AI 페르소나 시스템
8가지 독특한 성격의 AI 조수가 각자의 스타일로 카드를 해석합니다:

| 조수 | 한글명 | 특징 | 말투 |
|------|--------|------|------|
| SYLVIA | 실비아 | 현실적 조언자 | 직설적, 실용적 |
| LUNA | 루나 | 치유의 달빛 | 따뜻하고 위로하는 |
| ORION | 오리온 | 긍정의 별 | 밝고 희망적 |
| NOCTIS | 녹티스 | 어둠의 진실 | 냉정하고 독설적 |
| VANCE | 밴스 | 논리의 현자 | 분석적, 체계적 |
| ELARA | 엘라라 | 신비의 무녀 | 시적이고 신비로운 |
| KLAUS | 클라우스 | 학자 | 학술적, 역사적 |
| FORTUNA | 포르투나 | 행운의 여신 | 긍정적, 희망적 (특수 로직) |

---

## 시작하기

### 사전 요구사항

- Java 21 이상
- MySQL 8.0 이상
- Gradle 8.x
- Google Gemini API Key

### 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```env
# Database
DB_URL=jdbc:mysql://localhost:3306/utility_hub?useSSL=false&serverTimezone=Asia/Seoul
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DRIVER=com.mysql.cj.jdbc.Driver

# Spring AI (Google Gemini)
SPRING_AI_GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

### 데이터베이스 설정

```sql
CREATE DATABASE utility_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE utility_hub;

CREATE TABLE tarot_reading_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    spread_type VARCHAR(50),
    user_name VARCHAR(100),
    user_age INT,
    user_gender VARCHAR(20),
    drawn_cards_json TEXT,
    ai_reading TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 로컬 실행

```bash
# 1. 프로젝트 클론
git clone https://github.com/soraul2/utility-hub.git
cd utility-hub/backend

# 2. 빌드
./gradlew build

# 3. 실행
./gradlew bootRun
```

서버가 `http://localhost:8080`에서 실행됩니다.

---

## API 엔드포인트

### Base URL
```
http://localhost:8080/api/tarot
```

### 1. 오늘의 카드 조회

**GET** `/daily-card`

**Query Parameters:**
- `userName` (optional): 사용자 이름

**Example Request:**
```bash
curl -X GET "http://localhost:8080/api/tarot/daily-card?userName=홍길동"
```

**Example Response:**
```json
{
  "sessionId": 123,
  "card": {
    "position": "DAILY",
    "isReversed": false,
    "cardInfo": {
      "id": "major_0",
      "nameKo": "바보",
      "nameEn": "The Fool",
      "arcana": "MAJOR",
      "keywords": "새로운 시작, 순수함, 모험",
      "uprightMeaning": "새로운 시작과 무한한 가능성...",
      "reversedMeaning": "무모함, 경솔함..."
    }
  },
  "aiReading": "오늘은 새로운 시작의 에너지가 가득한 날입니다...",
  "createdAt": "2026-01-30T14:30:00"
}
```

### 2. 3카드 스프레드 생성

**POST** `/readings/three-cards`

**Request Body:**
```json
{
  "question": "올해 나의 연애운은?",
  "topic": "LOVE",
  "userName": "홍길동",
  "userAge": 25,
  "userGender": "MALE",
  "assistantType": "LUNA"
}
```

**Example Response:**
```json
{
  "sessionId": 124,
  "cards": [
    {
      "position": "PAST",
      "isReversed": false,
      "cardInfo": { /* 카드 정보 */ }
    },
    {
      "position": "PRESENT",
      "isReversed": true,
      "cardInfo": { /* 카드 정보 */ }
    },
    {
      "position": "FUTURE",
      "isReversed": false,
      "cardInfo": { /* 카드 정보 */ }
    }
  ],
  "aiReading": "과거에는... 현재는... 미래에는...",
  "createdAt": "2026-01-30T14:35:00"
}
```

### API 문서 (Swagger)

서버 실행 후 다음 URL에서 전체 API 명세 확인:
```
http://localhost:8080/swagger-ui.html
```

---

## 프론트엔드 연동

### 연동 상태
✅ **완전히 연동됨** - 프론트엔드는 이미 백엔드 API와 통합되어 있습니다.

### 프론트엔드 API 클라이언트
위치: `frontend/src/lib/api/tarotApi.ts`

```typescript
// 오늘의 카드 조회
const dailyCard = await fetchDailyCard("홍길동");

// 3카드 리딩 생성
const reading = await createThreeCardReading({
  question: "올해 나의 연애운은?",
  topic: "LOVE",
  userName: "홍길동",
  assistantType: "LUNA"
});
```

### 타입 정의
위치: `frontend/src/lib/tarot.ts`

프론트엔드의 TypeScript 타입은 백엔드 DTO와 완벽히 일치합니다:
- `TarotCard` ↔ `TarotCard.java`
- `DrawnCardDto` ↔ `DrawnCardDto`
- `ThreeCardRequest` ↔ `ThreeCardSpreadRequest`
- `ThreeCardResponse` ↔ `ThreeCardSpreadResponse`
- `TarotAssistantType` ↔ `TarotAssistantType` enum

---

## 테스트

### 단위 테스트 실행

```bash
./gradlew test
```

### 테스트 커버리지 리포트

```bash
./gradlew test jacocoTestReport
```

리포트 위치: `build/reports/jacoco/test/html/index.html`

### 주요 테스트

- **TarotCardServiceTest**: 덱 초기화, 카드 드로우, 포르투나 긍정 카드 필터링
- **TarotControllerTest**: API 엔드포인트 통합 테스트

---

## 배포

### 프로덕션 빌드

```bash
./gradlew clean build -x test
```

생성된 JAR: `build/libs/backend-0.0.1-SNAPSHOT.jar`

### 실행

```bash
java -jar build/libs/backend-0.0.1-SNAPSHOT.jar
```

### 환경 변수 주입 (프로덕션)

```bash
java -jar backend.jar \
  --spring.datasource.url=${DB_URL} \
  --spring.datasource.username=${DB_USERNAME} \
  --spring.datasource.password=${DB_PASSWORD} \
  --spring.ai.google.genai.api-key=${GEMINI_API_KEY}
```

---

## 프로젝트 구조

```
backend/
├── src/main/java/com/wootae/backend/
│   └── domain/tarot/
│       ├── controller/      # REST API 컨트롤러
│       ├── service/         # 비즈니스 로직
│       ├── entity/          # JPA 엔티티
│       ├── dto/             # 데이터 전송 객체
│       ├── enums/           # Enum 타입
│       └── repository/      # JPA 레포지토리
├── src/main/resources/
│   ├── tarot_data.json      # 78장 타로 카드 데이터
│   └── application.yml      # 설정 파일
└── src/test/java/           # 테스트 코드
```

---

## 문제 해결

### 자주 발생하는 이슈

**1. AI 응답 타임아웃**
```
원인: Gemini API 응답 지연
해결: application.yml에서 타임아웃 설정 증가
```

**2. DB 커넥션 풀 고갈**
```
원인: AI 호출 중 트랜잭션 유지
해결: v0.2.1에서 AI 호출을 @Transactional 외부로 분리하여 해결됨
```

**3. 포르투나 카드가 부정적으로 나옴**
```
원인: 긍정 카드 필터링 로직 미작동
확인: TarotCardService.drawPositiveCards() 호출 여부 확인
```

---

## 기여

이 프로젝트는 AI 협업 가이드에 따라 개발되었습니다:
- **Perplexity**: 설계 및 QA
- **Gemini (Antigravity)**: 구현
- **Claude**: 리팩터링 및 문서화

---

## 라이선스

MIT License

---

## 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/soraul2/utility-hub/issues)
