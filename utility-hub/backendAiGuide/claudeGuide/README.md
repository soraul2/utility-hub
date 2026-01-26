# Claude Team Guide - TextToMd 10 Persona Expansion

> **Version:** v0.3.0  
> **Date:** 2026-01-23  
> **From:** Gemini Team

---

## 📚 Document Overview

이 디렉토리는 Gemini 팀이 구현한 **TextToMd 10 Persona 확장** 작업을 Claude 팀에게 인계하기 위한 문서들을 포함합니다.

### 📄 Documents

1. **[handover_10_persona_expansion.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/claudeGuide/handover_10_persona_expansion.md)**
   - 전체 변경 사항 요약
   - 구현 세부 사항
   - API 변경 사항
   - 알려진 이슈 및 리팩토링 기회
   - 각 팀별 액션 아이템

2. **[refactoring_guide.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/claudeGuide/refactoring_guide.md)**
   - Strategy Pattern 리팩토링 가이드
   - 단계별 구현 방법
   - 테스트 전략
   - 리팩토링 체크리스트

3. **[perplexity_action_items.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/claudeGuide/perplexity_action_items.md)**
   - Perplexity 팀 설계 문서 업데이트 체크리스트
   - 각 문서별 수정 필요 섹션
   - 업데이트 우선순위

---

## 🎯 Quick Start

### For Claude Team (리팩토링 담당)

1. **[handover_10_persona_expansion.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/claudeGuide/handover_10_persona_expansion.md)** 읽기
   - 전체 변경 사항 파악
   - 현재 코드 구조 이해

2. **[refactoring_guide.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/claudeGuide/refactoring_guide.md)** 따라 리팩토링
   - Strategy Pattern 도입
   - 테스트 작성
   - 프롬프트 외부화 (선택)

3. **검증**
   - 모든 기존 테스트 통과 확인
   - API 동작 변경 없음 확인

### For Perplexity Team (설계 문서 업데이트 담당)

1. **[perplexity_action_items.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/claudeGuide/perplexity_action_items.md)** 확인
   - 업데이트 필요 문서 3종 확인
   - 각 섹션별 수정 사항 체크

2. **문서 업데이트**
   - `design_spec_backend.md`
   - `checklist_security_backend.md`
   - `collaborations_rule_backend.md`

3. **버전 업데이트**
   - v0.1 → v0.3.0 반영

---

## 📊 What Was Implemented

### 10 Persona Types

| Persona | 설명 | 특징 |
|---------|------|------|
| STANDARD | 표준 마크다운 | 이모지 없음, 중립적 |
| SMART | 친절한 AI 비서 | 이모지, 요약 포함 |
| DRY | 건조한 팩트 | 명사형 종결 |
| ACADEMIC | 학술 논문 | 섹션 번호, 인용 |
| CASUAL | 캐주얼 메모 | 편안한 말투 |
| TECHNICAL | 기술 문서 | 코드 블록 강조 |
| CREATIVE | 창의적 글쓰기 | 감성적 표현 |
| MINIMAL | 미니멀 요약 | 핵심만 추출 |
| DETAILED | 상세 가이드 | 단계별 설명 |
| BUSINESS | 비즈니스 문서 | 전문적 어조 |

### Changed Files

- `backend/src/main/java/com/wootae/backend/domain/text2md/dto/TextToMdDTO.java`
  - `persona` 필드 추가
  - `Persona` Enum 정의

- `backend/src/main/java/com/wootae/backend/domain/text2md/service/TextToMdService.java`
  - `buildPrompt()` 메서드 리팩토링
  - 10개 페르소나별 프롬프트 생성 메서드 추가

---

## ✅ Verification Status

- ✅ 빌드 성공
- ✅ 서버 구동 성공 (포트 8080)
- ✅ Swagger UI 확인 완료
- ✅ 하위 호환성 보장
- ⏳ 단위 테스트 작성 (Claude 팀 담당)
- ⏳ 설계 문서 업데이트 (Perplexity 팀 담당)

---

## 🔗 Related Resources

### Gemini Team Artifacts
- [Implementation Plan](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/implementation_plan.md)
- [Walkthrough](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/walkthrough.md)
- [Swagger UI Screenshot](file:///C:/Users/HOME/.gemini/antigravity/brain/b56a4b91-4d27-4776-b607-5e9d4b00fbd3/swagger_persona_enum_values_1769168232683.png)

### Perplexity Team Documents
- [design_spec_backend.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/perplexityGuide/design_spec_backend.md)
- [checklist_security_backend.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/perplexityGuide/checklist_security_backend.md)
- [collaborations_rule_backend.md](file:///c:/AiProject/utility-hub/utility-hub/backendAiGuide/perplexityGuide/collaborations_rule_backend.md)

### Source Code
- [TextToMdDTO.java](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/domain/text2md/dto/TextToMdDTO.java)
- [TextToMdService.java](file:///c:/AiProject/utility-hub/utility-hub/backend/src/main/java/com/wootae/backend/domain/text2md/service/TextToMdService.java)

---

## 📞 Contact

**Questions?** Contact Gemini Team

**Version:** v0.3.0  
**Last Updated:** 2026-01-23
