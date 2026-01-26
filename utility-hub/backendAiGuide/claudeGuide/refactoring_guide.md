# Refactoring Guide for Claude Team

> **목적:** TextToMd 10 Persona 확장 코드를 Strategy Pattern으로 리팩토링하는 가이드

---

## 🎯 Refactoring Goals

1. **확장성 향상**: 새 페르소나 추가 시 기존 코드 수정 최소화
2. **테스트 용이성**: 각 페르소나별 독립적인 테스트 가능
3. **유지보수성**: 프롬프트 관리 및 수정 용이
4. **단일 책임 원칙**: 각 클래스가 하나의 페르소나만 담당

---

## 📐 Proposed Architecture

### Current Structure (v0.3.0)
```
TextToMdService
├─ buildPrompt() [switch-case]
├─ buildStandardPrompt()
├─ buildSmartPrompt()
├─ buildDryPrompt()
├─ buildAcademicPrompt()
├─ buildCasualPrompt()
├─ buildTechnicalPrompt()
├─ buildCreativePrompt()
├─ buildMinimalPrompt()
├─ buildDetailedPrompt()
└─ buildBusinessPrompt()
```

**문제점:**
- 모든 프롬프트 로직이 하나의 서비스 클래스에 집중
- 새 페르소나 추가 시 서비스 클래스 수정 필요 (OCP 위반)
- 테스트 시 전체 서비스 의존성 필요

---

### Proposed Structure (Strategy Pattern)
```
domain/text2md/
├─ controller/
│  └─ TextToMdController.java
├─ service/
│  └─ TextToMdService.java (간소화)
├─ strategy/
│  ├─ PromptStrategy.java (인터페이스)
│  ├─ StandardPromptStrategy.java
│  ├─ SmartPromptStrategy.java
│  ├─ DryPromptStrategy.java
│  ├─ AcademicPromptStrategy.java
│  ├─ CasualPromptStrategy.java
│  ├─ TechnicalPromptStrategy.java
│  ├─ CreativePromptStrategy.java
│  ├─ MinimalPromptStrategy.java
│  ├─ DetailedPromptStrategy.java
│  └─ BusinessPromptStrategy.java
└─ dto/
   └─ TextToMdDTO.java
```

---

## 🔨 Implementation Steps

### Step 1: Create PromptStrategy Interface

**파일:** `domain/text2md/strategy/PromptStrategy.java`

```java
package com.wootae.backend.domain.text2md.strategy;

import com.wootae.backend.domain.text2md.dto.TextToMdDTO;

public interface PromptStrategy {
    
    /**
     * 페르소나에 맞는 프롬프트를 생성합니다.
     * 
     * @param request 사용자 요청 (rawText, autoHeading, autoList 포함)
     * @return LLM에 전달할 프롬프트 문자열
     */
    String buildPrompt(TextToMdDTO.Request request);
    
    /**
     * 이 전략이 담당하는 페르소나를 반환합니다.
     * 
     * @return Persona enum 값
     */
    TextToMdDTO.Persona getPersona();
}
```

---

### Step 2: Implement Strategy Classes

**예시:** `domain/text2md/strategy/SmartPromptStrategy.java`

```java
package com.wootae.backend.domain.text2md.strategy;

import com.wootae.backend.domain.text2md.dto.TextToMdDTO;
import org.springframework.stereotype.Component;

@Component
public class SmartPromptStrategy implements PromptStrategy {
    
    @Override
    public String buildPrompt(TextToMdDTO.Request request) {
        StringBuilder sb = new StringBuilder();
        
        sb.append("당신은 사용자의 텍스트를 가장 보기 좋고 명확하게 정리해주는 '스마트 AI 비서'입니다.\n");
        sb.append("단순한 포맷 변환을 넘어, 내용의 핵심을 파악하여 읽기 쉽도록 문장을 다듬고 구조화하세요.\n\n");
        
        sb.append("[작성 원칙]\n");
        sb.append("- **요약 및 정리**: 내용이 길다면 서두에 3줄 요약을 추가하거나, 섹션을 나누어 체계적으로 정리하세요.\n");
        sb.append("- **가독성 강화**: 중요한 단어는 **굵게**, 리스트는 불렛(-)을 사용하고, 적절한 이모지(😀, 💡, ✅ 등)를 사용하여 시각적 즐거움을 더하세요.\n");
        sb.append("- **톤앤매너**: 공손하고 명확한 문체를 사용하되, 정보 전달에 방해가 되지 않도록 하세요.\n");
        
        if (request.isAutoHeading()) {
            sb.append("- 문서의 제목은 내용 전체를 아우르는 매력적인 문구로 H1(#)을 작성하세요.\n");
        }
        sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 즉시 출력하세요.\n\n");
        
        sb.append("[정리할 텍스트]\n");
        sb.append(request.getRawText());
        
        return sb.toString();
    }
    
    @Override
    public TextToMdDTO.Persona getPersona() {
        return TextToMdDTO.Persona.SMART;
    }
}
```

**나머지 9개 Strategy 클래스도 동일한 패턴으로 구현**

---

### Step 3: Refactor TextToMdService

**파일:** `domain/text2md/service/TextToMdService.java`

```java
package com.wootae.backend.domain.text2md.service;

import com.wootae.backend.domain.text2md.dto.TextToMdDTO;
import com.wootae.backend.domain.text2md.strategy.PromptStrategy;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TextToMdService {

    private final ChatClient.Builder chatClientBuilder;
    private final List<PromptStrategy> promptStrategies;
    
    // Persona → Strategy 매핑 (생성자에서 자동 초기화)
    private Map<TextToMdDTO.Persona, PromptStrategy> strategyMap;
    
    @PostConstruct
    public void init() {
        this.strategyMap = promptStrategies.stream()
            .collect(Collectors.toMap(
                PromptStrategy::getPersona,
                Function.identity()
            ));
    }

    public TextToMdDTO.Response convert(TextToMdDTO.Request request) {
        validateRequest(request);
        
        // Strategy 선택
        TextToMdDTO.Persona persona = request.getPersona() != null 
            ? request.getPersona() 
            : TextToMdDTO.Persona.STANDARD;
        
        PromptStrategy strategy = strategyMap.get(persona);
        if (strategy == null) {
            throw new BusinessException(ErrorCode.INVALID_PERSONA);
        }
        
        // 프롬프트 생성 및 AI 호출
        String promptText = strategy.buildPrompt(request);
        String markdown = callAi(promptText);
        
        // 응답 정제
        if (markdown != null) {
            markdown = markdown.replace("\\n", "\n");
            markdown = markdown.replace("\\r\\n", "\n");
            markdown = markdown.replaceAll("\n{3,}", "\n\n");
        }
        
        TextToMdDTO.Response response = new TextToMdDTO.Response();
        response.setMarkdownText(markdown);
        response.setModel("gemini-2.0-flash-exp");
        return response;
    }

    private void validateRequest(TextToMdDTO.Request request) {
        if (!StringUtils.hasText(request.getRawText())) {
            throw new BusinessException(ErrorCode.INVALID_TEXT_INPUT);
        }
        if (request.getRawText().length() > 10000) {
            throw new BusinessException(ErrorCode.INVALID_TEXT_INPUT);
        }
    }

    private String callAi(String promptText) {
        try {
            ChatClient chatClient = chatClientBuilder.build();
            return chatClient.prompt()
                .user(promptText)
                .call()
                .content();
        } catch (Exception e) {
            log.error("AI Service Error", e);
            throw new BusinessException(ErrorCode.AI_PROVIDER_ERROR);
        }
    }
}
```

---

### Step 4: Add New Error Code (Optional)

**파일:** `global/error/ErrorCode.java`

```java
INVALID_PERSONA(HttpStatus.BAD_REQUEST, "PERSONA_001", "지원하지 않는 페르소나입니다."),
```

---

## 🧪 Testing Strategy

### Unit Test Example

**파일:** `service/TextToMdServiceTest.java`

```java
@SpringBootTest
class TextToMdServiceTest {
    
    @Autowired
    private TextToMdService service;
    
    @Test
    void testSmartPersona() {
        // Given
        TextToMdDTO.Request request = new TextToMdDTO.Request();
        request.setRawText("테스트 텍스트");
        request.setPersona(TextToMdDTO.Persona.SMART);
        
        // When
        TextToMdDTO.Response response = service.convert(request);
        
        // Then
        assertThat(response.getMarkdownText()).isNotNull();
        // 추가 검증...
    }
}
```

**파일:** `strategy/SmartPromptStrategyTest.java`

```java
class SmartPromptStrategyTest {
    
    private SmartPromptStrategy strategy;
    
    @BeforeEach
    void setUp() {
        strategy = new SmartPromptStrategy();
    }
    
    @Test
    void testBuildPrompt_containsKeywords() {
        // Given
        TextToMdDTO.Request request = new TextToMdDTO.Request();
        request.setRawText("테스트");
        request.setAutoHeading(true);
        
        // When
        String prompt = strategy.buildPrompt(request);
        
        // Then
        assertThat(prompt).contains("스마트 AI 비서");
        assertThat(prompt).contains("이모지");
        assertThat(prompt).contains("테스트");
    }
}
```

---

## 📋 Refactoring Checklist

### Phase 1: Strategy Pattern 도입
- [ ] `PromptStrategy` 인터페이스 생성
- [ ] 10개 Strategy 구현체 생성
- [ ] `TextToMdService` 리팩토링 (switch-case 제거)
- [ ] `ErrorCode`에 `INVALID_PERSONA` 추가 (선택)

### Phase 2: 테스트 작성
- [ ] 각 Strategy별 단위 테스트 작성
- [ ] Service 통합 테스트 작성
- [ ] 페르소나별 출력 차이 검증 테스트

### Phase 3: 프롬프트 외부화 (선택)
- [ ] `prompts.yml` 파일 생성
- [ ] YAML 파싱 로직 추가
- [ ] Strategy에서 YAML 프롬프트 사용

### Phase 4: 문서화
- [ ] 각 Strategy 클래스에 JavaDoc 추가
- [ ] README에 새 페르소나 추가 방법 문서화

---

## ⚠️ Migration Notes

### Breaking Changes
- **없음**: 기존 API 계약 유지 (하위 호환성 보장)

### Deployment Considerations
- 리팩토링 후에도 동일한 동작 보장
- 기존 테스트 모두 통과 확인 필수

---

## 🎓 Benefits After Refactoring

1. **확장성**: 새 페르소나 추가 시 새 Strategy 클래스만 생성
2. **테스트**: 각 Strategy 독립적으로 테스트 가능
3. **유지보수**: 프롬프트 수정 시 해당 Strategy만 수정
4. **가독성**: 서비스 클래스 간소화, 역할 명확화

---

**작성일:** 2026-01-23  
**작성자:** Gemini Team  
**대상:** Claude Team
