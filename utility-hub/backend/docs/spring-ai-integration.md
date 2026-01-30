# Spring AI 통합 아키텍처

## 개요

미스틱 타로 백엔드는 **Spring AI 1.1.2**를 사용하여 Google Gemini API와 통합됩니다. 이 문서는 ChatClient 설정, 에러 처리, 성능 최적화 전략을 다룹니다.

---

## 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                    Spring Boot Application              │
│                                                          │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │ TarotAiService │────────▶│ ChatClient (Singleton)│   │
│  └────────────────┘         └──────────────────────┘   │
│         │                            │                  │
│         │ 1. 프롬프트 생성            │ 2. API 호출       │
│         ▼                            ▼                  │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │ Prompt Builder │         │ Spring AI Core       │   │
│  └────────────────┘         └──────────────────────┘   │
└─────────────────────────────────────────┬───────────────┘
                                          │
                                          │ HTTPS
                                          ▼
                              ┌────────────────────────┐
                              │  Google Gemini API     │
                              │  (generativelanguage)  │
                              └────────────────────────┘
```

---

## Spring AI 설정

### 의존성 (build.gradle)

```gradle
ext {
    springAiVersion = '1.1.2'
}

dependencies {
    implementation 'org.springframework.ai:spring-ai-starter-model-google-genai'
}

dependencyManagement {
    imports {
        mavenBom "org.springframework.ai:spring-ai-bom:${springAiVersion}"
    }
}
```

### 환경 변수 설정

```yaml
# application.yml
spring:
  ai:
    google:
      genai:
        api-key: ${SPRING_AI_GOOGLE_GENAI_API_KEY}
        model: gemini-1.5-flash  # 또는 gemini-1.5-pro
        temperature: 0.8
        max-tokens: 2048
```

**환경 변수**:
```bash
export SPRING_AI_GOOGLE_GENAI_API_KEY="your_api_key_here"
```

---

## ChatClient 구성

### 싱글톤 패턴 적용

```java
@Service
public class TarotAiService {
    private final ChatClient chatClient; // 인스턴스 변수로 재사용
    
    public TarotAiService(ChatClient.Builder chatClientBuilder) {
        // 서비스 생성 시 한 번만 빌드
        this.chatClient = chatClientBuilder.build();
    }
    
    public String generateReading(...) {
        // 동일한 chatClient 인스턴스 재사용
        return chatClient.prompt()
            .user(context.toString())
            .call()
            .content();
    }
}
```

**최적화 효과**:
- ❌ **이전**: 요청마다 `ChatClient` 새로 생성 → GC 부하
- ✅ **현재**: 서비스 생성 시 1회 빌드 → 메모리 효율 향상

---

## 프롬프트 생성 전략

### 구조화된 프롬프트

모든 AI 호출은 다음 구조를 따릅니다:

```
[시스템 역할 정의]
당신은 {페르소나명}입니다.

[컨텍스트 정보]
- 사용자 정보 (이름, 나이, 성별)
- 질문 내용
- 뽑힌 카드 상세 정보

[지시 사항]
1. 해석 방법
2. 응답 형식 (마크다운)
3. 말투/어조
4. 분량 제한
```

### 예시: 3카드 리딩 프롬프트

```java
StringBuilder context = new StringBuilder();
context.append("당신은 신비로운 타로 리더 'Mystic'입니다. ");
context.append("다음 정보를 바탕으로 깊이 있고 통찰력 있는 3카드 리딩을 제공하세요.\n\n");

// 사용자 정보
if (request.getUserName() != null) {
    context.append("질문자: ").append(request.getUserName()).append("\n");
}

// 질문
context.append("\n질문: ").append(request.getQuestion()).append("\n\n");

// 카드 정보
for (DrawnCardDto card : drawnCards) {
    TarotCard info = card.getCardInfo();
    String orientation = card.isReversed() ? "역방향" : "정방향";
    String meaning = card.isReversed() ? info.getReversedMeaning() : info.getUprightMeaning();
    
    context.append(String.format("### [%s 위치] %s (%s) - %s\n",
        card.getPosition(), info.getNameKo(), info.getNameEn(), orientation));
    context.append("- 키워드: ").append(info.getKeywords()).append("\n");
    context.append("- 기본 의미: ").append(meaning).append("\n\n");
}

// 응답 형식 지시
context.append("지시 사항:\n");
context.append("1. 각 카드가 질문과 어떤 연관이 있는지 구체적으로 설명하세요.\n");
context.append("2. 답변은 다음 마크다운 형식을 반드시 따르세요:\n");
context.append("   # 운명의 흐름\n");
context.append("   # 카드의 목소리\n");
context.append("   # 미스틱의 조언\n");
```

---

## 에러 처리

### Spring AI 예외 계층

```
Exception
└── RuntimeException
    └── SpringAiException (Spring AI 기본 예외)
        ├── ApiException (API 호출 실패)
        ├── TimeoutException (타임아웃)
        └── RateLimitException (요청 제한 초과)
```

### 예외 처리 전략

```java
@Service
public class TarotAiService {
    
    public String generateReading(...) {
        try {
            return chatClient.prompt()
                .user(context.toString())
                .call()
                .content();
                
        } catch (ApiException e) {
            log.error("Gemini API call failed", e);
            throw new TarotAiException("AI 서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.", e);
            
        } catch (TimeoutException e) {
            log.error("Gemini API timeout", e);
            throw new TarotAiException("AI 응답 시간이 초과되었습니다. 다시 시도해주세요.", e);
            
        } catch (Exception e) {
            log.error("Unexpected error during AI reading generation", e);
            throw new TarotAiException("타로 리딩 생성 중 오류가 발생했습니다.", e);
        }
    }
}
```

### 글로벌 에러 핸들러 (권장)

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(TarotAiException.class)
    public ResponseEntity<ErrorResponse> handleTarotAiException(TarotAiException e) {
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(new ErrorResponse("AI_ERROR", e.getMessage()));
    }
}
```

---

## 성능 최적화

### 1. 트랜잭션 분리

**문제**: AI 호출(2~10초)이 `@Transactional` 내부에서 실행되면 DB 커넥션 풀 고갈

**해결**:
```java
@Service
public class TarotReadingService {
    
    public ThreeCardSpreadResponse createThreeCardReading(ThreeCardSpreadRequest request) {
        // 1. 카드 드로우 (빠름)
        List<DrawnCardDto> cards = cardService.drawCards(3);
        
        // 2. AI 호출 (@Transactional 외부에서 실행)
        String aiReading = aiService.generateReading(request, cards);
        
        // 3. DB 저장 (최소한의 트랜잭션)
        TarotReadingSession session = TarotReadingSession.builder()
            .question(request.getQuestion())
            .aiReading(aiReading)
            .build();
        
        session = saveSession(session); // 여기서만 트랜잭션
        
        return buildResponse(session, cards);
    }
    
    @Transactional
    protected TarotReadingSession saveSession(TarotReadingSession session) {
        return readingRepository.save(session); // 밀리초 단위
    }
}
```

**효과**:
- DB 커넥션 점유 시간: 2~10초 → 수 밀리초
- 동시 처리 가능 요청 수 대폭 증가

### 2. 타임아웃 설정

```yaml
spring:
  ai:
    google:
      genai:
        timeout: 30s  # API 호출 타임아웃
```

### 3. 재시도 로직 (선택)

```java
@Retryable(
    value = {ApiException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 1000)
)
public String generateReading(...) {
    return chatClient.prompt()...
}
```

---

## 보안 고려사항

### 1. API 키 관리

❌ **절대 금지**:
```java
// 하드코딩 금지!
String apiKey = "AIzaSyC...";
```

✅ **권장**:
```yaml
# application.yml
spring:
  ai:
    google:
      genai:
        api-key: ${SPRING_AI_GOOGLE_GENAI_API_KEY}
```

### 2. 로깅 안전성

❌ **위험**:
```java
log.info("User question: {}", request.getQuestion()); // 민감 정보 노출
```

✅ **안전**:
```java
log.info("Generated reading for sessionId: {}", sessionId); // ID만 기록
```

### 3. 입력 검증

```java
@PostMapping("/readings/three-cards")
public ResponseEntity<ThreeCardSpreadResponse> createThreeCardReading(
    @Valid @RequestBody ThreeCardSpreadRequest request) { // @Valid 필수
    
    // 추가 검증
    if (request.getQuestion().length() > 500) {
        throw new IllegalArgumentException("질문은 500자를 초과할 수 없습니다.");
    }
    
    return ResponseEntity.ok(readingService.createThreeCardReading(request));
}
```

---

## 모니터링 및 디버깅

### 로깅 전략

```java
@Slf4j
@Service
public class TarotAiService {
    
    public String generateReading(...) {
        long startTime = System.currentTimeMillis();
        
        try {
            String response = chatClient.prompt()...
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("AI reading generated in {}ms", duration);
            
            return response;
            
        } catch (Exception e) {
            log.error("AI generation failed after {}ms", 
                System.currentTimeMillis() - startTime, e);
            throw e;
        }
    }
}
```

### 메트릭 수집 (선택)

```java
@Service
public class TarotAiService {
    
    private final MeterRegistry meterRegistry;
    
    public String generateReading(...) {
        Timer.Sample sample = Timer.start(meterRegistry);
        
        try {
            String response = chatClient.prompt()...
            sample.stop(meterRegistry.timer("tarot.ai.reading.success"));
            return response;
            
        } catch (Exception e) {
            sample.stop(meterRegistry.timer("tarot.ai.reading.failure"));
            throw e;
        }
    }
}
```

---

## 테스트 전략

### 단위 테스트 (Mock 사용)

```java
@ExtendWith(MockitoExtension.class)
class TarotAiServiceTest {
    
    @Mock
    private ChatClient.Builder chatClientBuilder;
    
    @Mock
    private ChatClient chatClient;
    
    @InjectMocks
    private TarotAiService aiService;
    
    @BeforeEach
    void setUp() {
        when(chatClientBuilder.build()).thenReturn(chatClient);
    }
    
    @Test
    void testGenerateReading() {
        // Given
        ChatClient.PromptSpec promptSpec = mock(ChatClient.PromptSpec.class);
        ChatClient.CallSpec callSpec = mock(ChatClient.CallSpec.class);
        
        when(chatClient.prompt()).thenReturn(promptSpec);
        when(promptSpec.user(anyString())).thenReturn(promptSpec);
        when(promptSpec.call()).thenReturn(callSpec);
        when(callSpec.content()).thenReturn("AI 응답 결과");
        
        // When
        String result = aiService.generateReading(request, cards);
        
        // Then
        assertThat(result).isEqualTo("AI 응답 결과");
    }
}
```

### 통합 테스트 (실제 API 호출)

```java
@SpringBootTest
class TarotAiServiceIntegrationTest {
    
    @Autowired
    private TarotAiService aiService;
    
    @Test
    @Disabled("실제 API 호출 - 비용 발생")
    void testRealApiCall() {
        ThreeCardSpreadRequest request = new ThreeCardSpreadRequest();
        request.setQuestion("테스트 질문");
        
        List<DrawnCardDto> cards = createTestCards();
        
        String result = aiService.generateReading(request, cards);
        
        assertThat(result).isNotEmpty();
        assertThat(result).contains("운명의 흐름");
    }
}
```

---

## 문제 해결

### 자주 발생하는 이슈

| 증상 | 원인 | 해결 방법 |
|------|------|----------|
| `ApiException: 401 Unauthorized` | API 키 미설정 또는 잘못됨 | 환경 변수 `SPRING_AI_GOOGLE_GENAI_API_KEY` 확인 |
| `TimeoutException` | Gemini API 응답 지연 | `spring.ai.google.genai.timeout` 증가 |
| DB 커넥션 풀 고갈 | AI 호출이 트랜잭션 내부 | AI 호출을 `@Transactional` 외부로 이동 |
| 응답 품질 저하 | 프롬프트가 모호함 | 지시 사항을 더 구체적으로 작성 |
| `RateLimitException` | API 호출 한도 초과 | 요청 빈도 제한 또는 유료 플랜 전환 |

---

## 향후 개선 방향

### 1. 응답 캐싱
동일한 질문 + 카드 조합에 대해 캐싱 적용:
```java
@Cacheable(value = "tarotReadings", key = "#request.question + #cards.hashCode()")
public String generateReading(...) { ... }
```

### 2. 스트리밍 응답
긴 응답을 실시간으로 전송:
```java
chatClient.prompt()
    .user(context.toString())
    .stream()
    .content()
    .subscribe(chunk -> {
        // SSE로 프론트엔드에 전송
    });
```

### 3. 다중 모델 지원
Gemini 외 다른 모델(GPT, Claude) 선택 가능하도록 확장

---

## 결론

미스틱 타로의 Spring AI 통합은:
- ✅ **안정적**: 에러 처리 및 타임아웃 설정으로 장애 최소화
- ✅ **효율적**: ChatClient 재사용 및 트랜잭션 분리로 성능 최적화
- ✅ **확장 가능**: 새로운 페르소나 추가 시 코드 변경 최소화
- ✅ **보안**: API 키 환경 변수 관리 및 로깅 안전성 확보

이 아키텍처는 **프로덕션 환경**에서 안정적으로 운영 가능한 수준으로 설계되었습니다.
