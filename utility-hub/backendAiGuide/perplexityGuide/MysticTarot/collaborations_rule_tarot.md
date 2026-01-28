collaborations_rule_tarot.md – Mystic Tarot v0.1
Mystic Tarot 도메인에서 Perplexity / Gemini(Antigravity) / Claude가 협업할 때 따라야 할 역할·규칙·워크플로를 정의한다.

이 문서는 타로 도메인의 Single Source of Truth로, 변경 시 항상 이 문서를 먼저 갱신한다.

1. 역할 정의 (R&R)
1.1 Perplexity – Architect & QA (Control Tower)
책임

Mystic Tarot용 설계 문서 작성·업데이트

design_spec_tarot.md

checklist_security_tarot.md

본 collaborations_rule_tarot.md

도메인 모델·API 스펙·AI 프롬프트 방향 정의 및 수정.

보안·프라이버시·윤리 가드레일 검토.

Gemini/Claude가 만든 결과물에 대한 구조적 리뷰·피드백.

출력물

도메인 설계(Deck/카드/스프레드/리딩 세션).

API 스펙(오늘의 카드, 3장 스프레드, 히스토리).

보안 체크리스트, 협업 규칙 문서.

1.2 Gemini (Antigravity) – Main Builder
책임

Spring Boot + Spring AI 기반 Mystic Tarot 백엔드 구현.

Controller/Service/Repository/Entity/DTO/Config 코드 작성·수정.

LLM 연동(프롬프트·타임아웃·에러 핸들링) 실제 코드 구현.

테스트 코드 작성(JUnit 등) 및 자동 실행.

출력물

backend/domain/tarot 패키지 소스 코드.

API 구현, 통합 테스트, walkthrough_tarot.md(구현 흐름 기록).

1.3 Claude – Refiner & Editor
책임

Gemini가 구현한 Mystic Tarot 코드를 리팩터링·구조 개선·주석 정리.

README, API 문서, 사용자 가이드 등 텍스트 산출물 다듬기.

프롬프트 텍스트(시스템/유저 메시지 예시) 문장톤 통일, 카피 수정.

출력물

리팩터링된 서비스/도메인 코드.

문서 정리: README_tarot.md, API 예제, 프롬프트 가이드.

2. 기본 협업 루프
Mystic Tarot 도메인의 모든 변경은 [설계(Perplexity) → 구현(Gemini) → 정제(Claude) → 검증(Perplexity)] 순서를 따른다.

설계 (Perplexity)

사용자 요구 또는 새로운 아이디어 발생 시, Perplexity가 먼저 design_spec_tarot.md를 수정한다.

변경 내용: 새 API, 도메인 필드 추가, 프롬프트 규칙 변경, 보안 체크리스트 보강 등.

구현 (Gemini)

Perplexity가 확정한 스펙을 바탕으로 Gemini가 실제 코드를 작성·수정한다.

구현 후 자체 테스트를 통과시키고, 변경사항을 walkthrough_tarot.md에 기록한다.

정제 (Claude)

Claude가 코드 구조 개선, 중복 제거, 예외 처리 정돈, 주석·문서 업데이트를 수행한다.

검증 (Perplexity)

Perplexity가 최종 결과물을 스펙·체크리스트와 비교 검증한다.

문제 발견 시 설계 문서를 먼저 수정하고, 다시 2단계로 내려보낸다.

3. 문서·코드 변경 원칙
문서 선행 원칙

Mystic Tarot 도메인에 기능/스키마/프롬프트 변경이 필요할 때,

항상 design_spec_tarot.md와 checklist_security_tarot.md부터 수정한다.

코드만 먼저 바꾸는 작업은 금지.

단일 출처 보장

API 스펙(엔드포인트, 필드, 에러 포맷)의 참조 출처는 오직 design_spec_tarot.md이다.

보안·프라이버시는 checklist_security_tarot.md를 단일 기준으로 삼는다.

변경 기록

각 버전 변경 시,

문서 상단에 Version, Last Updated, Change Summary를 업데이트한다.
​

4. 도메인별 규칙 (Mystic Tarot 특화)
퍼블릭 도메인 카드 리소스

카드 이미지는 1909 Rider–Waite-Smith 퍼블릭 도메인 버전만 사용한다.

리마스터/리컬러 상용 이미지(서점·앱 리소스)는 사용 금지.

개인화 정보(이름/나이/성별)

선택 사항이며, 미입력 상태에서도 리딩이 동작해야 한다.

이 정보는 리딩 톤·예시를 맞추는 데만 사용하고, 차별적·고정관념적 표현에 활용해서는 안 된다.

AI 리딩 톤

신비롭고 몽환적인 표현은 허용되지만,

미래를 100% 예언·보장하는 문장은 금지.

건강·재정·법률 관련 결정을 대신해 주는 뉘앙스는 금지.

항상 disclaimer 문구를 동반한다(설계 문서 참고).

히스토리·저널

사용자가 요청하면 개별 리딩 삭제 및 전체 삭제가 가능해야 한다.

삭제 시 연관된 이름/나이/성별 스냅샷도 함께 제거.

5. Perplexity ↔ Gemini 협업 규칙
Perplexity → Gemini 작업 전달 시

항상 다음 3가지를 세트로 제공한다.

최신 design_spec_tarot.md

최신 checklist_security_tarot.md

구현 범위를 명시한 간단한 작업 지시(예: “3장 스프레드 API 구현 + 히스토리 목록/삭제까지”).

Gemini 구현 규칙

설계 문서에 없는 API/필드는 임의로 추가하지 않는다. 필요 시 Perplexity에게 먼저 설계 변경을 요청.

보안 관련 항목(인증, 레이트 리밋, 입력 검증 등)은 항상 체크리스트를 참조해 구현.

결과 공유

구현 완료 후, walkthrough_tarot.md에 변경 파일, 주요 클래스, 테스트 결과를 기록한다.

6. Perplexity ↔ Claude 협업 규칙
리팩터링 요청 시

Perplexity는 “리팩터링 범위”를 적어준다.

예: TarotAiService 내부 프롬프트 빌더 정리, TarotReadingSession 매핑 단순화 등.

Claude 작업 원칙

기존 설계(design_spec_tarot.md)와 API 스펙을 변경하지 않는다.

필요한 변경이 설계와 충돌할 경우, Perplexity에게 “설계 변경 필요”를 명시한 메모를 남긴다.

산출물

리팩터링된 코드,

코드 주석/문서 업데이트,

프롬프트 예시/카피 톤 정리.

7. 이 문서의 업데이트 규칙
Mystic Tarot 도메인에

새 스프레드 추가,

회원제 도입,

유료 결제/프리미엄 리딩 추가 등 협업 구조에 영향을 주는 변경이 생기면,

가장 먼저 이 collaborations_rule_tarot.md를 업데이트한다.

업데이트 순서

Perplexity가 새 규칙/역할 범위 정의.

Gemini/Claude가 변경된 규칙에 동의하는 형태로 구현/리팩터링 수행.

실제 코드와 문서가 일치하는지 Perplexity가 최종 검증.

이 파일까지 포함하면 Mystic Tarot 도메인에 대해

design_spec_tarot.md

checklist_security_tarot.md

collaborations_rule_tarot.md