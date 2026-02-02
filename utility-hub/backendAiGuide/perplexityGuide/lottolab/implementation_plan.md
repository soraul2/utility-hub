implementation_plan.md 초안을 Lotto Lab 백엔드용으로 정리해 줄게. (MVP 기준, Spring Boot + MySQL)

Lotto Lab – Backend Implementation Plan (MVP)
0. 전제
   스택: Spring Boot 3.x, Java 17+, Spring Web, Spring Security, Spring Data JPA, MySQL, Lombok

아키텍처: 부분형 모놀리식, Layered Architecture

기준 문서:

design_spec_backend.md

checklist_security_backend.md

1. 프로젝트 셋업
   1-1. 초기 설정
   Spring Initializr로 기본 프로젝트 생성

Dependencies: Web, Security, JPA, Validation, Lombok, MySQL, Scheduling

기본 패키지 생성: com.lottolab

서브 패키지 생성:

user, lotto, strategy, recommend, global.error, global.config

1-2. 공통 설정
application.yml에 dev 프로파일, DB 설정, JPA 옵션 설정

SecurityConfig – JWT 필터 자리 및 인증/인가 기본 룰 정의

CORS 설정(WebMvcConfigurer 또는 SecurityConfig)

2. 공통 에러/응답 인프라
   2-1. Error/Exception 구조
   ErrorCode enum 정의 (COMMON, AUTH, LOTTO, PRESET, AI 등)

BusinessException 추상 클래스 구현

도메인별 예외 클래스(필요 시) – 없다면 BusinessException만 사용

2-2. GlobalExceptionHandler
@RestControllerAdvice로 GlobalExceptionHandler 생성

처리 대상:

BusinessException → {success:false, code, message}

MethodArgumentNotValidException, ConstraintViolationException → COMMON_001

나머지 모든 예외 → COMMON_002

ErrorResponse DTO 정의

3. User/Auth 모듈
   3-1. 도메인/리포지토리
   User 엔티티 (id, email, passwordHash, nickname, createdAt)

UserRepository (findByEmail 등)

3-2. 보안
JWT 토큰 유틸/서비스 구현

SecurityConfig에서:

/api/auth/** permitAll

나머지 경로는 인증 필요(일부는 후에 열어도 됨)

PasswordEncoder(BCrypt) Bean 등록

3-3. 서비스/컨트롤러
AuthService

signup, login 메서드

이메일 중복 검사, 비밀번호 해시, 토큰 발급

DTO: SignupRequest, LoginRequest, AuthResponse

AuthController – /api/auth/signup, /api/auth/login 구현

단위/통합 테스트 작성

4. Lotto 도메인 (회차, 규칙, 시뮬 요약)
   4-1. 엔티티/리포지토리
   LottoDraw 엔티티 + LottoDrawRepository

LottoRule 엔티티 + 초기 데이터(RANDOM, HOT, COLD, TENS) 로딩

LottoSimulationSummary 엔티티 + LottoSimulationSummaryRepository

4-2. 번호 생성 로직
NumberGeneratorService

메서드:

generateNumbers(ruleCode, options)

규칙별 구현(Random, Hot, Cold, Tens) – 아직은 메모리 기반 간단 구현

검증: validateOptions()

DTO: GenerateRequest, GenerateOptions, GenerateResponse

4-3. 컨트롤러
LottoController – /api/lotto/generate

@PostMapping("/generate")

Request DTO 검증 후 서비스 호출

UserActivity 기록(옵션)

4-4. 테스트
NumberGeneratorServiceTest – 규칙별 생성 결과 기본 검증

LottoControllerTest – 정상/에러 플로우, Validation 체크

5. 시뮬레이션 배치 & 통계
   5-1. 시뮬레이션 서비스
   LottoSimulationService

로직:

주어진 LottoRule와 회차 범위에 대해 N(10만) 세트 생성

LottoDraw와 매칭하여 등수별 count 계산

LottoSimulationSummary로 저장/업데이트

5-2. 스케줄러
SimulationScheduler

@Scheduled로 주 1회 동작 (혹은 수동 트리거 메서드도 추가)

순서:

최신 회차 여부 체크

규칙 목록 조회

rule × period(50,100) 조합으로 시뮬 수행

5-3. 통계 조회 API
LottoStatsService

getRuleStats(period) → LottoSimulationSummary aggregate

DTO: RuleStatsResponse, RuleStatsDto

LottoStatsController – /api/rules/stats?period=50

5-4. 테스트
시뮬 서비스 단위 테스트 – 작은 N으로 검증

통계 API 통합 테스트 – 더미 데이터 기반 응답 구조 확인

6. Dashboard 요약 & Recommend 모듈
   6-1. Recommend 서비스
   RecommendService

getDashboardSummary(userId, period)

최신 회차 조회

LottoSimulationSummary에서 전체 테스트 수/규칙별 히트율 계산

UserActivity 또는 Preset 사용 기록으로 topUsedRule 계산(간단 로직)

템플릿 기반 문장 생성(messageLines)

6-2. 컨트롤러
DashboardController – /api/dashboard/summary

내부에서 RecommendService 호출

(선택) /api/recommend/summary 별도 제공 시 RecommendController 구현

6-3. 테스트
RecommendService 단위 테스트 – 다양한 가짜 데이터 케이스

DashboardController 통합 테스트 – JWT 인증 포함

7. Strategy Preset 모듈
   7-1. 엔티티/리포지토리
   StrategyPreset + StrategyPresetRepository

rulesJson 필드에 구조 정의(JSON Schema 문서화)

7-2. 서비스
StrategyPresetService

getPresets(userId)

createPreset(userId, request) – 개수 제한 체크, 옵션 Validation

updatePreset(userId, id, request) – 소유권 확인

deletePreset(userId, id)

7-3. 컨트롤러
StrategyPresetController

GET /api/presets

POST /api/presets

PUT /api/presets/{id}

DELETE /api/presets/{id}

7-4. 테스트
서비스 단위 테스트 – 개수 제한/소유권 검증

컨트롤러 통합 테스트 – 인증/인가 플로우

8. 문서화 & 도구
   8-1. OpenAPI/Swagger
   springdoc-openapi 연동

주요 DTO/엔드포인트에 Swagger 어노테이션 추가

/swagger-ui.html에서 전체 API 확인

8-2. README / Walkthrough
README_backend.md

빌드/실행 방법, DB 초기화 방법, 배치 실행 방법

walkthrough_backend.md

패키지 구조, 주요 서비스/플로우 설명

예: “대시보드 호출 → 어떤 서비스/리포지토리 연쇄 호출인지”

9. QA & 마무리
   mvn test, mvn package가 깨끗하게 통과하는지 확인

design_spec_backend.md, checklist_security_backend.md와 실제 코드 비교

엔드포인트/DTO/에러 코드 일치 여부 체크

Perplexity 리뷰 요청 → 피드백 반영

Claude에게 리팩터링/문서 정리 요청(구조 개선, 중복 제거, 테스트 보강)

