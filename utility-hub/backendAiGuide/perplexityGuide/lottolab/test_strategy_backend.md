test_strategy_backend.md – Lotto Market v2 Backend Test Strategy
문서 버전: v1.0
작성자: Perplexity (Backend Architect & QA)
프로젝트: lotto-market-v2 (Spring Boot + Spring Security + OAuth2 + JWT + Spring AI)

1. 테스트 정책
 모든 핵심 서비스 메서드에 단위 테스트

 /api/rules, /api/rules/{ruleId}/generate, /api/user/me 등 엔드포인트에 대한 통합 테스트

 ./mvnw test 실행 후 모든 테스트 통과

 ./mvnw package 실행 후 빌드 성공

 CI/CD에서 테스트 실패 시 배포 중단

2. 단위 테스트
2.1 테스트 범위
 LottoRuleService

규칙 저장/수정/삭제 테스트

규칙 리스트 조회 테스트

 LottoGenerateService

규칙 기반 번호 생성 테스트

무료 생성 쿼터 테스트

 LottoAiService

규칙 설명 생성 테스트

예외 처리 테스트

 AuthService

OAuth2 로그인 테스트

토큰 갱신 테스트

사용자 정보 조회 테스트

회원 탈퇴 테스트

 JwtTokenService

토큰 생성 테스트

토큰 검증 테스트

사용자 ID 추출 테스트

 CustomOAuth2UserService

OAuth2 사용자 정보 로드/저장 테스트

UserProfile DTO 생성 테스트

 OAuthAttributesExtractor

제공자별 속성 추출 테스트

null 및 공백 검증 테스트

UserProfile DTO 생성 테스트

2.2 테스트 종류
 정상 케이스

예: 성공적으로 규칙 저장, 번호 생성, 토큰 갱신

 예외 케이스

예: 규칙 없음, 유효하지 않은 토큰, 잘못된 요청 형식

 성능 테스트

예: 규칙 100개, 1000회차, 10만 세트 시뮬 시간 테스트

3. 통합 테스트
3.1 테스트 범위
 @SpringBootTest 또는 @WebMvcTest를 사용해 엔드포인트 기반 테스트

 /api/rules 엔드포인트 테스트

규칙 리스트 조회

필터/정렬 테스트

 /api/rules/{ruleId} 엔드포인트 테스트

규칙 상세 조회

규칙 통계 조회

 /api/rules/{ruleId}/generate 엔드포인트 테스트

번호 생성

무료 생성 쿼터 테스트

 /api/ai/rule-explain 엔드포인트 테스트

규칙 설명 생성

 /api/user/me 엔드포인트 테스트

사용자 정보 조회

 /api/auth/token/refresh 엔드포인트 테스트

토큰 갱신

 /api/user/me (DELETE) 엔드포인트 테스트

회원 탈퇴

3.2 테스트 환경
 테스트용 데이터베이스 생성

 테스트용 OAuth2 제공자 설정

 테스트용 JWT 토큰 생성 및 검증

4. 성능 테스트
 규칙 100개, 1000회차, 10만 세트 시뮬 성능 테스트

 1000회차 × 100개 규칙 × 10만 세트 시뮬 시간 측정

 테스트 결과는 performance_test_result.txt에 저장

5. 코드 커버리지
 핵심 서비스 메서드의 커버리지 80% 이상

 테스트 커버리지 보고서는 coverage_report.html에 저장

6. 로깅 테스트
 로깅 설정 확인

 로그 파일 확인

 로그 레벨 확인

이 문서는 Perplexity가 정의한 백엔드 테스트 전략입니다.
Gemini와 Claude가 이 테스트 전략을 기준으로 코드와 테스트를 작성하면,
코드 품질과 테스트 커버리지를 높일 수 있습니다.