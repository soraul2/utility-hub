# 데이터베이스 스키마 문서

## 개요

미스틱 타로 백엔드는 MySQL 8.0+를 사용하여 타로 리딩 세션 데이터를 영구 저장합니다. 이 문서는 데이터베이스 스키마, 엔티티 관계, JSON 직렬화 전략을 설명합니다.

---

## 데이터베이스 설정

### 데이터베이스 생성

```sql
CREATE DATABASE utility_hub 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

**인코딩 선택 이유**:
- `utf8mb4`: 이모지 및 특수 문자 지원 (포르투나의 ✨🎉💰 등)
- `utf8mb4_unicode_ci`: 대소문자 구분 없는 정렬

---

## 엔티티 관계도 (ERD)

```
┌─────────────────────────────────┐
│  tarot_reading_sessions         │
├─────────────────────────────────┤
│ id (PK)              BIGINT      │
│ question             VARCHAR(500)│
│ spread_type          VARCHAR(50) │
│ user_name            VARCHAR(100)│
│ user_age             INT         │
│ user_gender          VARCHAR(20) │
│ drawn_cards_json     TEXT        │
│ ai_reading           TEXT        │
│ created_at           TIMESTAMP   │
└─────────────────────────────────┘
```

**현재 버전**: 단일 테이블 구조 (v1.0)

---

## 테이블 상세

### tarot_reading_sessions

타로 리딩 세션의 모든 정보를 저장하는 메인 테이블입니다.

#### DDL

```sql
CREATE TABLE tarot_reading_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(500) NOT NULL COMMENT '사용자 질문',
    spread_type VARCHAR(50) COMMENT '스프레드 타입 (DAILY_ONE, THREE_CARD)',
    user_name VARCHAR(100) COMMENT '사용자 이름 (선택)',
    user_age INT COMMENT '사용자 나이 (선택)',
    user_gender VARCHAR(20) COMMENT '사용자 성별 (선택)',
    drawn_cards_json TEXT COMMENT '뽑힌 카드 정보 (JSON 배열)',
    ai_reading TEXT COMMENT 'AI 생성 리딩 결과',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    
    INDEX idx_created_at (created_at),
    INDEX idx_user_name (user_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 컬럼 설명

| 컬럼명 | 타입 | Null | 설명 | 예시 |
|--------|------|------|------|------|
| `id` | BIGINT | NO | 세션 고유 ID (자동 증가) | 123 |
| `question` | VARCHAR(500) | NO | 사용자가 입력한 질문 | "올해 나의 연애운은?" |
| `spread_type` | VARCHAR(50) | YES | 스프레드 타입 Enum | "THREE_CARD", "DAILY_ONE" |
| `user_name` | VARCHAR(100) | YES | 사용자 이름 | "홍길동" |
| `user_age` | INT | YES | 사용자 나이 | 25 |
| `user_gender` | VARCHAR(20) | YES | 사용자 성별 | "MALE", "FEMALE", "UNKNOWN" |
| `drawn_cards_json` | TEXT | YES | 뽑힌 카드 정보 (JSON) | `[{"position":"PAST",...}]` |
| `ai_reading` | TEXT | YES | AI가 생성한 리딩 텍스트 | "# 운명의 흐름\n..." |
| `created_at` | TIMESTAMP | NO | 세션 생성 시각 (자동) | 2026-01-30 14:30:00 |

#### 인덱스

```sql
-- 최근 리딩 조회 최적화
CREATE INDEX idx_created_at ON tarot_reading_sessions(created_at DESC);

-- 사용자별 히스토리 조회 최적화
CREATE INDEX idx_user_name ON tarot_reading_sessions(user_name);
```

---

## JPA 엔티티 매핑

### TarotReadingSession.java

```java
@Entity
@Table(name = "tarot_reading_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class TarotReadingSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String question;
    
    @Enumerated(EnumType.STRING)
    private TarotSpread spreadType;
    
    private String userName;
    private Integer userAge;
    private String userGender;
    
    @Column(columnDefinition = "TEXT")
    private String drawnCardsJson; // JSON 직렬화
    
    @Column(columnDefinition = "TEXT")
    private String aiReading;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @Builder
    public TarotReadingSession(...) { ... }
}
```

### Enum 타입

```java
public enum TarotSpread {
    DAILY_ONE,    // 오늘의 카드 (1장)
    THREE_CARD    // 3카드 스프레드 (과거-현재-미래)
}
```

---

## JSON 직렬화 전략

### 문제 정의

타로 카드 정보는 복잡한 객체 구조를 가집니다:

```java
class DrawnCardDto {
    String position;        // "PAST", "PRESENT", "FUTURE"
    boolean isReversed;     // 역방향 여부
    TarotCard cardInfo;     // 카드 상세 정보 (이름, 의미, 키워드 등)
}
```

이를 관계형 DB에 저장하려면:
1. **별도 테이블 생성** (정규화) → 조인 오버헤드
2. **JSON 직렬화** (비정규화) → 단순하고 빠름

### 선택한 방법: JSON 직렬화

```java
@Service
public class TarotReadingService {
    
    private final ObjectMapper objectMapper;
    
    public ThreeCardSpreadResponse createThreeCardReading(...) {
        List<DrawnCardDto> cards = cardService.drawCards(3);
        
        // JSON으로 직렬화
        String cardsJson = objectMapper.writeValueAsString(cards);
        
        TarotReadingSession session = TarotReadingSession.builder()
            .drawnCardsJson(cardsJson)
            .build();
        
        return readingRepository.save(session);
    }
}
```

### 저장 예시

**Java 객체**:
```java
List<DrawnCardDto> cards = [
    DrawnCardDto(position="PAST", isReversed=false, cardInfo=TarotCard(...)),
    DrawnCardDto(position="PRESENT", isReversed=true, cardInfo=TarotCard(...)),
    DrawnCardDto(position="FUTURE", isReversed=false, cardInfo=TarotCard(...))
];
```

**DB 저장 (drawn_cards_json)**:
```json
[
  {
    "position": "PAST",
    "isReversed": false,
    "cardInfo": {
      "id": "major_0",
      "nameKo": "바보",
      "nameEn": "The Fool",
      "arcana": "MAJOR",
      "keywords": "새로운 시작, 순수함",
      "uprightMeaning": "...",
      "reversedMeaning": "..."
    }
  },
  ...
]
```

### 장단점

| 장점 | 단점 |
|------|------|
| ✅ 조인 불필요 (빠른 조회) | ❌ JSON 내부 필드로 검색 어려움 |
| ✅ 스키마 변경 없이 카드 정보 확장 가능 | ❌ 데이터 중복 (카드 정보 반복 저장) |
| ✅ 구현 단순 | ❌ 정규화 위반 |

**결론**: 타로 리딩은 **조회 중심**이며 카드별 검색이 불필요하므로 JSON 직렬화가 적합합니다.

---

## 데이터 접근 계층

### Repository

```java
public interface TarotReadingRepository extends JpaRepository<TarotReadingSession, Long> {
    
    // 사용자별 최근 리딩 조회
    List<TarotReadingSession> findByUserNameOrderByCreatedAtDesc(String userName);
    
    // 특정 기간 리딩 조회
    List<TarotReadingSession> findByCreatedAtBetween(
        LocalDateTime start, 
        LocalDateTime end
    );
    
    // 스프레드 타입별 조회
    List<TarotReadingSession> findBySpreadType(TarotSpread spreadType);
}
```

### 사용 예시

```java
@Service
public class TarotHistoryService {
    
    private final TarotReadingRepository repository;
    
    public List<HistoryResponse> getUserHistory(String userName) {
        List<TarotReadingSession> sessions = 
            repository.findByUserNameOrderByCreatedAtDesc(userName);
        
        return sessions.stream()
            .map(this::toHistoryResponse)
            .collect(Collectors.toList());
    }
}
```

---

## 데이터 마이그레이션

### 초기 데이터 (선택)

타로 카드 데이터는 `tarot_data.json` 파일로 관리되며 DB에 저장하지 않습니다. 애플리케이션 시작 시 메모리에 로드됩니다.

```java
@Service
public class TarotCardService {
    
    @PostConstruct
    public void initializeDeck() {
        Resource resource = resourceLoader.getResource("classpath:tarot_data.json");
        this.deck = objectMapper.readValue(resource.getInputStream(), 
            new TypeReference<List<TarotCard>>() {});
    }
}
```

---

## 성능 고려사항

### 1. 인덱스 전략

```sql
-- 최근 리딩 조회 (가장 빈번)
CREATE INDEX idx_created_at ON tarot_reading_sessions(created_at DESC);

-- 사용자별 히스토리 (중요도 중간)
CREATE INDEX idx_user_name ON tarot_reading_sessions(user_name);

-- 복합 인덱스 (필요시)
CREATE INDEX idx_user_created ON tarot_reading_sessions(user_name, created_at DESC);
```

### 2. TEXT 컬럼 최적화

`ai_reading`과 `drawn_cards_json`은 TEXT 타입으로 대용량 데이터를 저장합니다.

**주의사항**:
- TEXT 컬럼은 인덱스 불가 (MySQL 제한)
- 전문 검색(Full-Text Search)이 필요하면 별도 검색 엔진 고려

### 3. 파티셔닝 (대규모 데이터)

월별 파티셔닝으로 조회 성능 향상:

```sql
ALTER TABLE tarot_reading_sessions
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p202601 VALUES LESS THAN (202602),
    PARTITION p202602 VALUES LESS THAN (202603),
    ...
);
```

---

## 백업 및 복구

### 백업 스크립트

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p utility_hub tarot_reading_sessions > backup_$DATE.sql
```

### 복구

```bash
mysql -u root -p utility_hub < backup_20260130_143000.sql
```

---

## 향후 확장 방향

### 1. 사용자 테이블 분리 (정규화)

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    gender VARCHAR(20)
);

ALTER TABLE tarot_reading_sessions
ADD COLUMN user_id BIGINT,
ADD FOREIGN KEY (user_id) REFERENCES users(id);
```

### 2. 카드 테이블 추가 (선택)

현재는 JSON 파일로 관리하지만, DB로 이관 가능:

```sql
CREATE TABLE tarot_cards (
    id VARCHAR(50) PRIMARY KEY,
    name_ko VARCHAR(100),
    name_en VARCHAR(100),
    arcana VARCHAR(20),
    keywords TEXT,
    upright_meaning TEXT,
    reversed_meaning TEXT
);
```

### 3. 조수별 리딩 테이블

```sql
CREATE TABLE assistant_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT,
    assistant_type VARCHAR(50),
    reading TEXT,
    created_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES tarot_reading_sessions(id)
);
```

---

## 결론

미스틱 타로의 데이터베이스 설계는:
- ✅ **단순함**: 단일 테이블로 모든 세션 정보 관리
- ✅ **유연함**: JSON 직렬화로 스키마 변경 없이 확장 가능
- ✅ **효율적**: 인덱스 최적화로 빠른 조회 성능
- ✅ **확장 가능**: 향후 정규화 및 테이블 분리 가능

현재 구조는 **MVP 단계**에 최적화되어 있으며, 트래픽 증가 시 점진적으로 정규화할 수 있습니다.
