# 타로 도메인 코드 평가 리포트

이 문서는 `utility-hub` 프로젝트의 타로 도메인 구현에 대한 포괄적인 평가를 제공합니다.

## 1. 아키텍처 및 구조 (Architecture & Structure)
**평가: 우수함 (Excellent)**

이 코드베이스는 표준적이고 깔끔한 Spring Boot 계층형 아키텍처(Layered Architecture)를 따르고 있습니다:
- **Controller 계층** (`TarotController`): HTTP 요청을 처리하고 서비스로 위임합니다. 역할 분리가 명확합니다.
- **Service 계층** (`TarotReadingService`, `TarotCardService`, `TarotAiService`): 비즈니스 로직을 캡슐화합니다. 관심사의 분리(카드 관리 vs 리딩 조율 vs AI 생성)가 잘 유지되고 있습니다.
- **Repository 계층** (`TarotReadingRepository`): 표준 JPA 리포지토리입니다.
- **DTOs** (`TarotDTOs`): 요청/응답 객체에 내부 정적 클래스(Inner static classes)를 사용하여 패키지 구조를 깔끔하게 유지하고 있습니다. 다만 시간이 지남에 따라 파일 크기가 커질 수 있습니다.

## 2. 도메인 모델링 (Domain Modeling)
**평가: 좋음 (Good)**

- **엔티티 (Entities)**:
  - `TarotCard`: JSON에서 로드되는 경량 POJO/Entity입니다.
  - `TarotReadingSession`: "뽑은 카드 목록"을 JSON 문자열(`drawnCardsJson`)로 저장합니다.
  - **장점**: 데이터베이스 스키마를 단순화합니다(단순 카드 목록을 위한 별도의 조인 테이블 불필요).
  - **단점**: 향후 "바보(The Fool) 카드가 포함된 모든 세션"과 같은 쿼리를 수행할 때, 기본 JSON 쿼리 지원 없이는 조회가 어려울 수 있습니다. 현재 범위에서는 실용적이고 허용 가능한 선택입니다.

## 3. 비즈니스 로직 (Business Logic)
**평가: 매우 좋음 (Very Good)**

- **카드 덱 관리**: `TarotCardService`는 시작 시(`@PostConstruct`) JSON 리소스에서 덱을 초기화합니다. 효율적인 방식입니다.
- **특수 기능**: "마스터 포르투나" 모드(`drawPositiveCards`)는 서비스 내에서 긍정적인 카드를 필터링하고 정방향을 강제하는 특정 비즈니스 로직을 구현합니다.
- **취약점 (Fragility Risk)**: "긍정적인 카드" 목록이 `TarotCardService.java` 내에 하드코딩된 문자열(`"The Sun"`, `"The Star"` 등)로 존재합니다. 만약 `tarot_data.json`의 이름이 변경되면 이 로직은 조용히 실패할 것입니다.
  - **권장 사항**: `isPositive` 플래그를 `TarotCard` 엔티티/JSON 데이터 자체로 이동하여 하드코딩 대신 데이터 기반으로 처리하도록 개선하는 것이 좋습니다.

## 4. AI 통합 (`TarotAiService`)
**평가: 우수함 (Excellent)**

- **프롬프트 엔지니어링**: 다양한 "조수 페르소나"(실비아, 루나, 포르투나 등)를 위한 상세하고 창의적인 시스템 프롬프트를 갖추고 있습니다. 특히 부정적인 카드를 긍정적으로 재해석하도록 지시하는 포르투나 프롬프트가 잘 작성되었습니다.
- **구현**: `ChatClient`를 효과적으로 사용하고 있습니다.
- **유지보수성**: 프롬프트가 `StringBuilder`를 사용하여 작성되었습니다. 프롬프트가 더 복잡해지면, Java 코드를 깔끔하게 유지하기 위해 외부 템플릿 파일(예: `st` 파일 또는 Spring AI Prompt Templates)로 이동하는 것을 고려해보세요.

## 5. 테스트 (Testing)
**평가: 좋음 (Good)**

- **단위 테스트** (`TarotCardServiceTest`):
  - 외부에서 로드되는 리소스(`tarot_data.json`)를 올바르게 모킹(Mocking)했습니다.
  - "포르투나" 모드(긍정 카드 전용)에 대한 특정 로직을 검증합니다.
  - 엣지 케이스(카드가 충분하지 않을 때의 폴백)에 대한 커버리지가 좋습니다.
- **통합/슬라이스 테스트** (`TarotControllerTest`):
  - `@WebMvcTest`를 사용하여 API 계약을 검증합니다.
  - 컨트롤러 로직을 격리하기 위해 서비스 계층을 모킹했습니다.

## 6. 요약 및 제안

타로 도메인은 탄탄한 기반 위에 잘 구현되었습니다. 표준적인 CRUD 로직과 창의적인 AI 통합을 성공적으로 혼합했습니다.

**주요 개선 제안 사항:**
1.  **데이터 기반 로직**: `TarotCardService`의 하드코딩된 "긍정 카드" 이름을 `tarot_data.json`의 속성(예: `"isPositive": true`)으로 이동하세요.
2.  **프롬프트 관리**: 긴 프롬프트 문자열을 별도의 리소스 파일로 추출하거나 프롬프트 템플릿 엔진을 사용하여 `TarotAiService`의 가독성을 높이세요.
3.  **JSON 지속성**: 카드 사용 통계(예: "가장 많이 뽑힌 카드는?")가 중요해진다면, `drawnCards`를 별도 테이블로 정규화하거나 강력한 JSON 인덱싱을 지원하는 데이터베이스 사용을 고려하세요.

전반적으로 코드는 우수한 품질이며, 현재 범위 내에서 프로덕션에 사용할 준비가 되어 있습니다.
