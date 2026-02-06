# LottoLab 백엔드 구현 요약 (Gemini Team)

이 문서는 `collaboration_guide`의 **Step 2. [Build] Spring Boot Implementation** 단계에 따라 구현된 LottoLab 백엔드 기능의 상세 내역입니다.

## 1. 구현 개요
- **목표**: LottoLab (로또 마켓 v2)의 핵심 비즈니스 로직(규칙, 생성, AI 설명) 구현.
- **기간**: 2026-02-06
- **작업자**: Gemini (Antigravity)
- **상태**: 구현 완료 및 테스트 통과 (✅)

## 2. 주요 구현 모듈 (Package Structure)

`com.wootae.backend.domain.lotto` 패키지 하위에 다음과 같이 도메인 주도 설계(DDD) 구조로 구현하였습니다.

### 2.1 Domain Entities (`/entity`)
| 클래스명 | 설명 | 비고 |
| :--- | :--- | :--- |
| `LottoRule` | 로또 규칙을 정의하는 핵심 엔티티. (이름, 유형, 스크립트, 파라미터) | Audit 적용 (`@CreatedDate`) |
| `LottoDraw` | 로또 회차별 당첨 번호 및 당첨금 정보를 저장하는 엔티티. | |
| `LottoSimulationStats` | 특정 규칙(`LottoRule`)에 대한 시뮬레이션(백테스팅) 통계 저장. | |

### 2.2 Repositories (`/repository`)
- **`LottoRuleRepository`**: 규칙 CRUD 및 유형별 조회(`findByType`).
- **`LottoSimulationStatsRepository`**: 규칙 ID 기반 통계 조회.
- **`LottoDrawRepository`**: 회차별 데이터 조회 및 최신 회차 조회(`findLatestDraw`).

### 2.3 Services (`/service`)
| 서비스명 | 역할 | 주요 메서드 |
| :--- | :--- | :--- |
| **`LottoRuleService`** | 규칙 CRUD 비즈니스 로직. | `getAllRules`, `createRule`, `updateRule` |
| **`LottoGenerateService`** | 규칙에 기반한 번호 생성 로직. | `generate(ruleId, count)` (현재 Random 방식 구현) |
| **`LottoAiService`** | Spring AI를 연동하여 규칙 설명 생성. | `explainRule(ruleId)` (Prompt: 규칙 분석 요청) |

### 2.4 Controllers (`/controller`)
| 컨트롤러명 | 엔드포인트 | 역할 |
| :--- | :--- | :--- |
| **`LottoRuleController`** | `GET/POST /api/rules` | 규칙 목록 조회 및 생성 API. |
| **`LottoGenerateController`** | `POST /api/rules/{id}/generate` | 특정 규칙으로 번호 생성 요청 API. |
| **`LottoAiController`** | `GET /api/ai/rule-explain/{id}` | 규칙에 대한 AI 상세 설명 요청 API. |

### 2.5 DTOs (`/dto`)
- `LottoRuleRequest`: 규칙 생성/수정 요청 DTO.
- `LottoRuleResponse`: 규칙 조회 응답 DTO (엔티티 -> DTO 변환).
- `LottoGenerateResponse`: 생성된 게임(번호 리스트) 응답 DTO.

## 3. 테스트 및 검증 (Verification)

### 3.1 Automated Tests
- **`LottoRuleControllerTest`**: `@WebMvcTest`를 사용하여 API 계층 단위 테스트 완료. (Mocking: `LottoRuleService`)
- **`LottoGenerateServiceTest`**: Mockito를 사용하여 번호 생성 비즈니스 로직 단위 테스트 완료.

### 3.2 Build & Verification
- `compileJava`: **성공**
- `test`: **실행 완료** (로깅 파일 `test_log_info.txt` 생성)

### 3.3 Error Handling
- `ErrorCode`에 `RESOURCE_NOT_FOUND` ("C002") 등을 추가하여 예외 처리를 표준화함.

## 4. 참고 사항 (Next Steps)
- 현재 번호 생성 로직은 기본 `Random` 방식만 구현되어 있습니다. 추후 `LottoGenerateService` 내에 `LottoRule.type`에 따른 분기 로직(가중치, 필터링 등)을 확장해야 합니다.
- 프론트엔드 연동 시 CORS 설정 확인이 필요할 수 있습니다.
