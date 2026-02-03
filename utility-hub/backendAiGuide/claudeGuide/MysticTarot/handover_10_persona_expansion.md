# Handover to Claude Team - 10 Persona Expansion

> **From:** Gemini Team  
> **Date:** 2026-01-23  
> **Version:** v0.3.0 (10 Persona Expansion)

## 📋 Overview

Gemini 팀이 TextToMd 백엔드 API의 페르소나를 **1개에서 10개로 확장**했습니다. 이 문서는 Claude 팀이 코드를 리팩토링하고, Perplexity 팀이 설계 문서를 업데이트할 수 있도록 변경 사항을 정리한 핸드오버 문서입니다.

---

## 🎯 What Changed

### 기존 (v0.2.x)
- **단일 페르소나**: "Smart Assistant" 스타일만 존재
- 모든 요청이 동일한 프롬프트로 처리됨

### 현재 (v0.3.0)
- **10가지 페르소나**: 사용자가 상황에 맞는 스타일 선택 가능
- Request DTO에 `persona` 필드 추가 (기본값: `STANDARD`)
- 페르소나별 프롬프트 생성 로직 구현

---

## 🔧 Implementation Details

### 1. DTO Changes

**파일:** `backend/src/main/java/com/wootae/backend/domain/text2md/dto/TextToMdDTO.java`

#### 추가된 필드
```java
@Schema(description = "마크다운 변환 스타일 (페르소나)", example = "STANDARD")
private Persona persona = Persona.STANDARD;
```

#### 추가된 Enum
```java
public enum Persona {
    STANDARD,   // 표준 마크다운 (이모지 없음, 중립적)
    SMART,      // 친절한 AI 비서 (이모지, 요약 포함)
    DRY,        // 건조한 팩트 중심 (명사형 종결)
    ACADEMIC,   // 학술적 (인용 스타일, 섹션 번호)
    CASUAL,     // 캐주얼 (편안한 말투, 이모지 다수)
    TECHNICAL,  // 기술 문서 (코드 블록, 구조화)
    CREATIVE,   // 창의적 (감성적 표현, 비유)
    MINIMAL,    // 미니멀 (핵심만, 불렛 포인트)
    DETAILED,   // 상세 (단계별 설명, 예시)
    BUSINESS    // 비즈니스 (전문적, 액션 아이템)
}
```

---

### 2. Service Logic Changes

**파일:** `backend/src/main/java/com/wootae/backend/domain/text2md/service/TextToMdService.java`

#### 변경된 메서드: `buildPrompt()`

**Before (v0.2.x):**
```java
private String buildPrompt(TextToMdDTO.Request request) {
    StringBuilder sb = new StringBuilder();
    // 단일 "Smart Assistant" 프롬프트만 생성
    sb.append("당신은 사용자의 텍스트를 가장 보기 좋고 명확하게 정리해주는 '스마트 AI 비서'입니다.\n");
    // ...
    return sb.toString();
}
```

**After (v0.3.0):**
```java
private String buildPrompt(TextToMdDTO.Request request) {
    StringBuilder sb = new StringBuilder();
    
    // Persona에 따라 다른 프롬프트 생성
    TextToMdDTO.Persona persona = request.getPersona();
    if (persona == null) {
        persona = TextToMdDTO.Persona.STANDARD;
    }
    
    switch (persona) {
        case SMART -> buildSmartPrompt(sb, request);
        case DRY -> buildDryPrompt(sb, request);
        case ACADEMIC -> buildAcademicPrompt(sb, request);
        case CASUAL -> buildCasualPrompt(sb, request);
        case TECHNICAL -> buildTechnicalPrompt(sb, request);
        case CREATIVE -> buildCreativePrompt(sb, request);
        case MINIMAL -> buildMinimalPrompt(sb, request);
        case DETAILED -> buildDetailedPrompt(sb, request);
        case BUSINESS -> buildBusinessPrompt(sb, request);
        default -> buildStandardPrompt(sb, request);
    }
    
    return sb.toString();
}
```

#### 추가된 메서드 (10개)
- `buildStandardPrompt(StringBuilder sb, Request request)`
- `buildSmartPrompt(StringBuilder sb, Request request)`
- `buildDryPrompt(StringBuilder sb, Request request)`
- `buildAcademicPrompt(StringBuilder sb, Request request)`
- `buildCasualPrompt(StringBuilder sb, Request request)`
- `buildTechnicalPrompt(StringBuilder sb, Request request)`
- `buildCreativePrompt(StringBuilder sb, Request request)`
- `buildMinimalPrompt(StringBuilder sb, Request request)`
- `buildDetailedPrompt(StringBuilder sb, Request request)`
- `buildBusinessPrompt(StringBuilder sb, Request request)`

각 메서드는 해당 페르소나에 맞는 프롬프트 텍스트를 생성합니다.

---

## 📊 Persona Specifications

| Persona | 사용 시나리오 | 주요 특징 |
|---------|-------------|----------|
| **STANDARD** | 일반 문서 정리 | 이모지 없음, 표준 마크다운, 중립적 어조 |
| **SMART** | 학습 자료, 블로그 | 친절한 어조, 이모지 사용, 요약 포함 |
| **DRY** | 업무 보고서, 회의록 | 건조한 어조, 팩트 중심, 명사형 종결 |
| **ACADEMIC** | 논문, 연구 자료 | 학술적 어조, 인용 스타일, 섹션 번호 |
| **CASUAL** | 메모, 일상 기록 | 편안한 말투, 이모지 다수, 짧은 문장 |
| **TECHNICAL** | 개발 문서, API 명세 | 코드 블록 강조, 기술 용어 유지, 구조화 |
| **CREATIVE** | 스토리, 에세이 | 감성적 표현, 비유 사용, 문학적 구조 |
| **MINIMAL** | 빠른 스캔, 요약 | 핵심만 추출, 불렛 포인트 위주, 최소 설명 |
| **DETAILED** | 상세 가이드, 튜토리얼 | 단계별 설명, 예시 포함, 주석 추가 |
| **BUSINESS** | 제안서, 기획서 | 전문적 어조, 데이터 강조, 액션 아이템 |

---

## 🔍 API Changes

### Request Schema (Updated)

```json
{
  "rawText": "string",
  "autoHeading": boolean,
  "autoList": boolean,
  "persona": "STANDARD" | "SMART" | "DRY" | "ACADEMIC" | "CASUAL" | 
             "TECHNICAL" | "CREATIVE" | "MINIMAL" | "DETAILED" | "BUSINESS"
}
```

### Response Schema (Unchanged)

```json
{
  "markdownText": "string",
  "model": "string",
  "tokensUsed": integer
}
```

### Backward Compatibility ✅

**기존 요청 (persona 필드 없음):**
```json
{
  "rawText": "테스트",
  "autoHeading": true,
  "autoList": false
}
```
→ 자동으로 `persona: STANDARD` 적용됨

---

## 🚨 Known Issues & Refactoring Opportunities

### 1. **Code Smell: Long Method & Switch Statement**
- `TextToMdService`에 10개의 프롬프트 생성 메서드가 하드코딩됨
- Switch-case 문이 길어져 유지보수 어려움

**권장 리팩토링:**
- **Strategy Pattern** 도입
- `PromptStrategy` 인터페이스 생성
- 각 페르소나별 Strategy 구현체 분리

### 2. **Prompt Hardcoding**
- 프롬프트 텍스트가 자바 코드에 섞여 있음
- 프롬프트 수정 시 컴파일 필요

**권장 리팩토링:**
- `prompts.yml` 파일로 프롬프트 외부화
- 런타임에 프롬프트 수정 가능하도록 개선

### 3. **Test Coverage**
- 페르소나별 프롬프트 생성 로직에 대한 단위 테스트 부족

**권장 추가:**
- 각 페르소나별 프롬프트 생성 테스트
- 페르소나별 출력 차이 검증 테스트

---

## 📝 Action Items for Teams

### For Perplexity Team (설계 업데이트)

#### 1. `design_spec_backend.md` 업데이트 필요
- [ ] API 스펙에 `persona` 필드 추가
- [ ] 10가지 Persona Enum 정의 추가
- [ ] Request DTO 예시 업데이트

#### 2. `checklist_security_backend.md` 업데이트 필요
- [ ] `persona` 필드 검증 규칙 추가
- [ ] 잘못된 persona 값 입력 시 에러 처리 정의

#### 3. `collaborations_rule_backend.md` 업데이트 필요
- [ ] v0.3.0 변경 사항 반영
- [ ] Claude 팀 리팩토링 가이드라인 추가

---

### For Claude Team (리팩토링)

#### 우선순위 1: Strategy Pattern 도입
```java
// 제안 구조
public interface PromptStrategy {
    String buildPrompt(String rawText, boolean autoHeading, boolean autoList);
}

@Component("SMART")
public class SmartPromptStrategy implements PromptStrategy { ... }

@Component("DRY")
public class DryPromptStrategy implements PromptStrategy { ... }

// Service에서 사용
private final Map<Persona, PromptStrategy> strategies;
```

#### 우선순위 2: 프롬프트 외부화
```yaml
# prompts.yml
personas:
  SMART:
    system: "당신은 친절한 AI 비서입니다."
    rules:
      - "이모지를 적극 사용하세요"
      - "요약을 포함하세요"
  DRY:
    system: "당신은 건조한 문서 변환기입니다."
    rules:
      - "명사형 종결을 사용하세요"
```

#### 우선순위 3: 테스트 추가
- 각 페르소나별 프롬프트 생성 테스트
- 페르소나별 출력 차이 검증

---

## ✅ Verification Checklist

- [x] 빌드 성공 (`./gradlew build`)
- [x] 애플리케이션 구동 성공 (포트 8080)
- [x] Swagger UI에서 10가지 페르소나 확인
- [x] 하위 호환성 확인 (persona 없는 요청 → STANDARD 적용)
- [ ] 단위 테스트 작성 (Claude 팀 담당)
- [ ] 통합 테스트 작성 (Claude 팀 담당)
- [ ] 설계 문서 업데이트 (Perplexity 팀 담당)

---

## 📎 Related Files

### 변경된 파일
- [TextToMdDTO.java](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/domain/text2md/dto/TextToMdDTO.java)
- [TextToMdService.java](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/domain/text2md/service/TextToMdService.java)

### 참고 문서
- [Implementation Plan](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/implementation_plan.md)
- [Walkthrough](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/walkthrough.md)
- [Swagger UI Screenshot](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/swagger_persona_enum_values_1769168232683.png)

---

## 🎬 Next Steps

1. **Perplexity 팀**: 설계 문서 3종 업데이트
2. **Claude 팀**: 코드 리팩토링 (Strategy Pattern, 프롬프트 외부화)
3. **Gemini 팀**: 프론트엔드 페르소나 선택 UI 추가

---

**Handover Date:** 2026-01-23  
**Contact:** Gemini Team  
**Version:** v0.3.0
