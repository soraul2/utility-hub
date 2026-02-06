README_backend.md – Lotto Market v2 Backend README
문서 버전: v1.0
작성자: Perplexity (Backend Architect & QA)
프로젝트: lotto-market-v2 (Spring Boot + Spring Security + OAuth2 + JWT + Spring AI)

1. 개요
Lotto Market v2는 데이터 기반 로또 규칙 상점 + 연구소형 분석 앱입니다.

백엔드는 Spring Boot + Spring Security + OAuth2 + JWT + Spring AI로 구성되어 있습니다.

2. 아키텍처
Spring Boot 3.2.x

Spring Security 6.x

Spring Data JPA

io.jsonwebtoken:jjwt

MySQL 8.x

Gradle 8.x

Docker + GitHub Actions + Cloud Run + Cloud SQL

3. 설치 및 실행
3.1 환경 변수 설정
JWT_SECRET

JWT_ACCESS_EXPIRY

JWT_REFRESH_EXPIRY

OAUTH2_CALLBACK_URL

CORS_ALLOWED_ORIGINS

3.2 빌드 및 실행
bash
./gradlew build
./gradlew run
3.3 테스트
bash
./gradlew test
4. API 문서
design_spec_backend.md

collaborations_rule_backend.md

checklist_security_backend.md

test_strategy_backend.md

arch_decision_backend.md

design_vs_implementation.md

5. 인증
Spring Security + OAuth2 + JWT

Naver, Google 소셜 로그인

HttpOnly + Secure 쿠키

Access Token: 1시간

Refresh Token: 14일

6. 데이터베이스
MySQL 8.x

users, lotto_draw, lotto_rule, lotto_simulation_stats 테이블

7. 테스트
테스트 커버리지 80% 이상

테스트 결과 보고서: coverage_report.html

8. 배포
Docker + GitHub Actions + Cloud Run + Cloud SQL

Dockerfile

GitHub Actions

Cloud Run

Cloud SQL

이 문서는 Perplexity가 정의한 백엔드 프로젝트 README입니다.
Gemini와 Claude가 이 문서를 기준으로 프로젝트를 이해하고,
Perplexity가 품질과 일관성을 유지하기 쉬워집니다.