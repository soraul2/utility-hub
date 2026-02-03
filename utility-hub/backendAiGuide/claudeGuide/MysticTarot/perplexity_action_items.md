# Action Items for Perplexity Team

> **목적:** Perplexity 팀이 설계 문서를 v0.3.0에 맞춰 업데이트하기 위한 체크리스트

---

## 📝 Overview

Gemini 팀이 TextToMd API에 **10가지 페르소나**를 추가했습니다. Perplexity 팀은 기존 설계 문서 3종을 업데이트하여 새로운 기능을 반영해야 합니다.

---

## 📄 Document Update Checklist

### 1. design_spec_backend.md

**파일 위치:** `backendAiGuide/perplexityGuide/design_spec_backend.md`

#### 업데이트 필요 섹션

##### ✅ Section 2.2: Request DTO
**현재 (v0.1):**
```java
public static class Request {
    private String rawText;
    private boolean autoHeading;
    private boolean autoList;
}
```

**업데이트 필요 (v0.3.0):**
```java
public static class Request {
    private String rawText;
    private boolean autoHeading;
    private boolean autoList;
    
    @Schema(description = "마크다운 변환 스타일", example = "STANDARD")
    private Persona persona = Persona.STANDARD; // 기본값
}

public enum Persona {
    STANDARD,   // 표준 마크다운
    SMART,      // 친절한 AI 비서
    DRY,        // 건조한 팩트
    ACADEMIC,   // 학술적
    CASUAL,     // 캐주얼
    TECHNICAL,  // 기술 문서
    CREATIVE,   // 창의적
    MINIMAL,    // 미니멀
    DETAILED,   // 상세
    BUSINESS    // 비즈니스
}
```

##### ✅ Section 3.3: 프롬프트 설계 (buildPrompt)
**추가 필요:**
```markdown
### 3.3.1 Multi-Persona 지원

`persona` 필드에 따라 다른 프롬프트를 생성합니다:

- **STANDARD**: 이모지 없음, 표준 마크다운, 중립적 어조
- **SMART**: 친절한 어조, 이모지 사용, 요약 포함 (기존 기본 동작)
- **DRY**: 건조한 어조, 팩트 중심, 명사형 종결
- **ACADEMIC**: 학술적 어조, 인용 스타일, 섹션 번호
- **CASUAL**: 편안한 말투, 이모지 다수, 짧은 문장
- **TECHNICAL**: 코드 블록 강조, 기술 용어 유지
- **CREATIVE**: 감성적 표현, 비유 사용, 문학적 구조
- **MINIMAL**: 핵심만 추출, 불렛 포인트 위주
- **DETAILED**: 단계별 설명, 예시 포함, 주석 추가
- **BUSINESS**: 전문적 어조, 데이터 강조, 액션 아이템
```

##### ✅ Section 6: 프론트와의 계약
**업데이트 필요:**
```markdown
프론트엔드 요청:
- POST /api/text-to-md
- Body: { 
    "rawText": string, 
    "autoHeading": boolean, 
    "autoList": boolean,
    "persona": "STANDARD" | "SMART" | "DRY" | ... (선택, 기본값: STANDARD)
  }
```

---

### 2. checklist_security_backend.md

**파일 위치:** `backendAiGuide/perplexityGuide/checklist_security_backend.md`

#### 업데이트 필요 섹션

##### ✅ Section 1: 입력값 검증 (Validation)
**추가 필요:**
```markdown
- [ ] `persona` 필드가 null일 경우 `STANDARD`로 기본값 처리된다.
- [ ] `persona` 필드에 잘못된 Enum 값이 입력될 경우 JSON 파싱 오류로 400 응답을 반환한다.
- [ ] 지원하지 않는 persona 값에 대한 에러 처리가 명확하다.
```

##### ✅ Section 2: 에러 처리 & 에러 응답 포맷
**추가 필요 (선택):**
```markdown
- [ ] `ErrorCode`에 다음 항목이 추가되었다:
  - [ ] `INVALID_PERSONA (PERSONA_001, 400)` (선택 사항)
```

##### ✅ Section 7: 문서 & 테스트
**추가 필요:**
```markdown
- [ ] 단위 테스트:
  - [ ] 각 페르소나별 프롬프트 생성 로직 테스트가 존재한다.
  - [ ] `persona` 필드 없는 요청이 `STANDARD`로 처리되는지 검증한다.
- [ ] 통합 테스트:
  - [ ] 각 페르소나로 요청 시 200 응답 및 서로 다른 출력 생성을 검증한다.
```

---

### 3. collaborations_rule_backend.md

**파일 위치:** `backendAiGuide/perplexityGuide/collaborations_rule_backend.md`

#### 업데이트 필요 섹션

##### ✅ Section 5: 버전 관리
**추가 필요:**
```markdown
- 현재 문서 버전: `backend-text2md v0.3.0`
- 변경 로그:
  - v0.1:
    - TextToMd 전용 백엔드 API 설계 및 에러 처리 구조 정의.
    - Spring AI ChatClient 기반의 기본 호출 패턴 도입.
  - v0.2.x:
    - Gemini 팀이 기본 구현 완료 (Smart Assistant 페르소나).
  - v0.3.0 (2026-01-23):
    - **10가지 페르소나 추가**: STANDARD, SMART, DRY, ACADEMIC, CASUAL, TECHNICAL, CREATIVE, MINIMAL, DETAILED, BUSINESS
    - Request DTO에 `persona` 필드 추가 (기본값: STANDARD)
    - 페르소나별 프롬프트 생성 로직 구현
    - 하위 호환성 보장
```

##### ✅ Section 4: Prompt & Model 변경 절차
**업데이트 필요:**
```markdown
- 프롬프트/모델/페르소나 변경이 필요한 경우:
  1. Perplexity가 `design_spec_backend.md`에서 관련 섹션을 갱신.
  2. `checklist_security_backend.md`에 필요한 검증/테스트 항목을 추가.
  3. Gemini가 변경된 설계에 맞게 구현 수정.
  4. Claude가 변경 내역을 문서화 및 리팩터링.
```

---

## 📊 Persona Specification Table

**각 문서에 추가할 표:**

| Persona | 사용 시나리오 | 주요 특징 |
|---------|-------------|----------|
| STANDARD | 일반 문서 정리 | 이모지 없음, 표준 마크다운, 중립적 어조 |
| SMART | 학습 자료, 블로그 | 친절한 어조, 이모지 사용, 요약 포함 |
| DRY | 업무 보고서, 회의록 | 건조한 어조, 팩트 중심, 명사형 종결 |
| ACADEMIC | 논문, 연구 자료 | 학술적 어조, 인용 스타일, 섹션 번호 |
| CASUAL | 메모, 일상 기록 | 편안한 말투, 이모지 다수, 짧은 문장 |
| TECHNICAL | 개발 문서, API 명세 | 코드 블록 강조, 기술 용어 유지, 구조화 |
| CREATIVE | 스토리, 에세이 | 감성적 표현, 비유 사용, 문학적 구조 |
| MINIMAL | 빠른 스캔, 요약 | 핵심만 추출, 불렛 포인트 위주, 최소 설명 |
| DETAILED | 상세 가이드, 튜토리얼 | 단계별 설명, 예시 포함, 주석 추가 |
| BUSINESS | 제안서, 기획서 | 전문적 어조, 데이터 강조, 액션 아이템 |

---

## ✅ Final Checklist

### design_spec_backend.md
- [ ] Section 2.2 (Request DTO) 업데이트
- [ ] Section 3.3 (프롬프트 설계) 업데이트
- [ ] Section 6 (프론트와의 계약) 업데이트
- [ ] Persona 사양 표 추가

### checklist_security_backend.md
- [ ] Section 1 (입력값 검증) 업데이트
- [ ] Section 2 (에러 처리) 업데이트 (선택)
- [ ] Section 7 (문서 & 테스트) 업데이트

### collaborations_rule_backend.md
- [ ] Section 4 (Prompt 변경 절차) 업데이트
- [ ] Section 5 (버전 관리) 업데이트 (v0.3.0 추가)

---

## 📎 Reference Files

- [Gemini Implementation Plan](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/implementation_plan.md)
- [Gemini Walkthrough](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/walkthrough.md)
- [Handover Document](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/claudeGuide/handover_10_persona_expansion.md)

---

**작성일:** 2026-01-23  
**작성자:** Gemini Team  
**대상:** Perplexity Team  
**우선순위:** High (v0.3.0 릴리스 전 필수)
