# checklist_security_backend.md – Utility Hub Backend (TextToMd) v0.3.0

본 체크리스트는 Utility Hub 백엔드(TextToMd API)의  
입력값 검증, 에러 처리, 보안/로깅, Spring AI 연동 안정성을 점검하기 위한 문서이다.

---

## 1. 입력값 검증 (Validation)

- [ ] `rawText`가 null 또는 공백일 때 `TEXT_001` 에러로 400 응답을 반환한다.
- [ ] `rawText` 길이에 상한(예: 10,000자)을 두고, 초과 시 `TEXT_001` 에러로 처리한다.
- [ ] JSON 파싱 오류(필드 타입 불일치 등)는 Spring 기본 400 응답 포맷 또는 공통 에러 핸들러로 정규화한다.
- [ ] `autoHeading`, `autoList`가 boolean이 아닐 경우 400 응답이 발생하며, 에러 메시지는 한국어로 짧고 명확하다.[web:232]
- [ ] `persona` 필드가 null일 경우 서버에서 `STANDARD`로 안전하게 기본값 처리한다.
- [ ] `persona` 필드에 잘못된 Enum 값이 입력될 경우 JSON 파싱 오류로 400 응답을 반환하고, 에러 메시지는 과도한 내부 정보를 노출하지 않는다.

---

## 2. 에러 처리 & 에러 응답 포맷

- [ ] 모든 비즈니스 예외는 `BusinessException` + `ErrorCode`를 통해 관리된다.
- [ ] `ErrorCode`에는 최소 다음 항목이 정의되어 있다:
  - [ ] `INVALID_TEXT_INPUT (TEXT_001, 400)`
  - [ ] `AI_PROVIDER_ERROR (AI_001, 502)`
  - [ ] (선택) `AI_TIMEOUT (AI_002, 504)`
  - [ ] (선택) `INVALID_PERSONA (PERSONA_001, 400)` – 지원하지 않는 페르소나 처리용
- [ ] `GlobalExceptionHandler`는 `BusinessException` 발생 시 JSON `{ code, message }` 형식으로 응답한다.
- [ ] 알 수 없는 예외(`Exception`) 발생 시 500 + 일반적인 메시지(예: “알 수 없는 오류가 발생했습니다.”)만 노출한다.
- [ ] 에러 응답에는 스택 트레이스, 내부 클래스명, SQL/시스템 정보 등 민감하거나 구현 세부 정보가 포함되지 않는다.[web:232][web:277]

---

## 3. Spring AI 연동 안정성

- [ ] Spring AI ChatClient 호출 시 예외를 적절히 캐치하여 `BusinessException(ErrorCode.AI_PROVIDER_ERROR)` 등으로 변환한다.[web:186][web:201]
- [ ] LLM 응답이 null 또는 비어 있을 경우, 안전한 기본값(빈 문자열 등) 또는 적절한 에러로 처리한다.
- [ ] AI 요청당 타임아웃 설정이 `application.properties`/`application.yml` 또는 클라이언트 설정에 명시되어 있다.
- [ ] ChatClient 설정(모델 이름, API 키 등)은 설정 파일/환경 변수에서 관리하고, 서비스 비즈니스 로직과 분리되어 있다.[web:186][web:232]

---

## 4. 보안 & 프라이버시

- [ ] OpenAI/LLM API 키는 환경 변수 또는 외부 설정(예: `.env`, `application.yml`)로 관리되며, 깃 저장소에 커밋되지 않는다.[web:231][web:232][web:271]
- [ ] 원본 텍스트(`rawText`) 전체를 평문 로그로 남기지 않는다.
  - [ ] 로그가 필요할 경우, 최대 N자(예: 200자)까지만 잘라서 저장하거나, 요청 ID만 남기고 본문은 저장하지 않는다.[web:233][web:236][web:242]
- [ ] API 통신은 운영 환경에서 HTTPS를 사용하는 것을 기본으로 한다.[web:232][web:277]
- [ ] 인증/인가 도입 시, `SecurityConfig`에서 `/api/text-to-md` 경로의 접근 정책을 명시한다.[web:230][web:229]
- [ ] CORS 정책은 프론트엔드 도메인(또는 개발용 localhost)에 맞춰 최소 권한으로 설정한다.

---

## 5. 레이트 리밋 & 리소스 보호 (옵션)

- [ ] TextToMd API에 대해 간단한 요청 제한(예: IP/사용자 기준 분당 N건) 정책을 정의했다.[web:234][web:237]
- [ ] 레이트 리밋 초과 시, HTTP 429 또는 적절한 상태코드와 함께 한국어 에러 메시지를 반환한다.
- [ ] 레이트 리밋/스로틀링 정책은 운영 환경의 LLM 요금/성능 특성에 맞게 튜닝 가능하게 설계되어 있다.

---

## 6. 로깅 & 모니터링

- [ ] TextToMd 요청에 대해 최소한 다음 항목을 로그로 남긴다:
  - [ ] 요청 ID 또는 트레이스 ID
  - [ ] 응답 시간(소요 시간)
  - [ ] 성공/실패 여부, 에러 코드
- [ ] 예외 발생 시, 서버 내부 로그에는 스택 트레이스를 남기되, 클라이언트에게는 간단한 메시지만 전달한다.
- [ ] 로그에는 PII/민감 데이터(예: 인증 토큰, API 키, 사용자의 상세 텍스트 내용)가 포함되지 않도록 필터링 또는 마스킹 규칙이 적용되어 있다.[web:233][web:236][web:242]
- [ ] 로그 레벨은 개발/운영 환경에 따라 적절히 조정된다 (DEBUG/INFO/WARN/ERROR).[web:232]

---

## 7. 문서 & 테스트

- [ ] Swagger(UI)에서 TextToMd API의 Request/Response/에러 응답 구조와 `persona` Enum이 확인 가능하다.[web:142][web:148]
- [ ] 단위 테스트:
  - [ ] `TextToMdService.validateRequest`에 대해 정상/에러 케이스 테스트가 존재한다.
  - [ ] 각 페르소나별 프롬프트 생성 로직에 대한 테스트가 존재한다.
  - [ ] `persona` 필드 없는 요청이 `STANDARD`로 처리되는지 검증한다.
- [ ] 통합 테스트:
  - [ ] `/api/text-to-md`에 대해 여러 페르소나로 요청 시 200 응답 및 서로 다른 출력 패턴을 검증한다.
- [ ] CI에서 백엔드 테스트와 빌드(`./mvnw test`+`./mvnw package` 또는 `./gradlew test`+`./gradlew build`)가 성공해야만 배포 워크플로우가 실행된다.[web:232][web:249][web:255]
