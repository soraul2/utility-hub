checklist_security_backend.md – Lotto Market v2 Backend Security & Validation Checklist
문서 버전: v1.0
작성자: Perplexity (Backend Architect & QA)
프로젝트: lotto-market-v2 (Spring Boot + Spring Security + OAuth2 + JWT + Spring AI)

1. 보안 규정
1.1 토큰 관리
 JWT 서명 키는 .env 또는 외부 설정만 사용, 깃에 커밋 금지

 Access Token 만료 시간: 1시간

 Refresh Token 만료 시간: 14일

 토큰 저장: 기본 권장 HttpOnly + Secure 쿠키

 토큰은 URL 파라미터로 보낼 수 없음

1.2 인증 및 인가
 모든 API 엔드포인트는 @PreAuthorize 또는 기타 인가 로직으로 보호

 ROLE_USER, ROLE_PREMIUM, ROLE_ADMIN 역할을 명확히 구분

 관리 API(/admin/...)는 ROLE_ADMIN 전용

 OAuth2 로그인 후 JwtAuthenticationFilter에서 토큰 검증

1.3 CORS 및 CSRF
 cors.allowed-origins 환경별 설정:

application.properties (개발): http://localhost:3000,http://localhost:5173

application-prod.properties (프로덕션): https://yourdomain.com

 Spring Security에서 CORS 설정 분리

 CSRF 방어: HttpOnly + Secure 쿠키 사용, 필요 시 CSRF 토큰 활용

 SecurityConfig에서 csrf.disable() 또는 sessionCreationPolicy(STATELESS) 설정

1.4 로깅 및 감사
 OAuth2 로그인/토큰 생성/검증/로그아웃 이벤트를 모두 로깅

 로그에는 rawText 전체를 남기지 않음, 요청 ID나 최대 N자만 기록

 모든 에러 응답은 ErrorResponse 형식으로 기록

 감사 테이블(AuditLog)은 추후 도입 예정

2. 입력 검증
2.1 DTO 검증
 모든 Request DTO에 jakarta.validation 애노테이션 사용

@NotNull, @NotBlank, @Min, @Max 등

 예:

ruleId: @Min(1)

count: @Min(1) @Max(100)

ruleId는 1000 이하로 제한

2.2 OAuth2 속성 검증
 OAuthAttributesExtractor에서

attributes null 및 비어 있음 검증

제공자 ID(null, 공백) 검증

 네이버 응답 객체 및 구글 sub 필드 검증

2.3 JWT 토큰 검증
 JwtAuthenticationFilter에서

Authorization 헤더 존재 여부 확인

Bearer 형식 확인

토큰 빈 문자열 여부 확인

유효 서명 및 만료 시간 검증

3. 에러 처리
3.1 공통 에러 응답
 모든 400/500 계열 응답은 ErrorResponse 형식 사용

json
{
  "status": 401,
  "errorCode": "AUTH_UNAUTHORIZED",
  "message": "인증 정보가 없습니다",
  "timestamp": "2026-02-06T13:00:00Z"
}
 에러 코드는 design_spec_backend.md에 정의된 값만 사용 (AUTH_UNAUTHORIZED, EXPIRED_TOKEN, INVALID_REFRESH_TOKEN 등)

3.2 예외 매핑
 GlobalExceptionHandler에서 BusinessException + ErrorCode 구조로 예외 처리

 Spring Security 관련 예외: 401 또는 403

 Spring AI 관련 예외: AI_PROVIDER_ERROR, AI_TIMEOUT 등으로 매핑

4. 테스트 체크리스트
 ./mvnw test 실행 후 모든 테스트 통과

 ./mvnw package 실행 후 빌드 성공

 핵심 서비스 메서드에 단위 테스트

 /api/rules, /api/rules/{ruleId}/generate, /api/user/me 등에 대한 통합 테스트

 테스트 커버리지 목표: 핵심 서비스 80% 이상

5. 배포 체크리스트
 HTTPS 설정 검토 (SSL/TLS 인증서, server.ssl 설정)

 환경 변수 설정 (JWT_SECRET, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, OAUTH2_CALLBACK_URL, CORS_ALLOWED_ORIGINS)

 데이터베이스 초기화 확인

users 테이블, lotto_draw, lotto_rule, lotto_simulation_stats 등

 로깅 설정

logging.level 설정

logging.file 설정

 모니터링 도구 설정 (CloudWatch, ELK 등)

이 문서는 Perplexity가 정의한 백엔드 보안/검증 체크리스트입니다.
Gemini와 Claude가 이 체크리스트를 기준으로 코드와 설정을 검토하면,
설계/구현 일치와 보안 준수를 높일 수 있습니다.