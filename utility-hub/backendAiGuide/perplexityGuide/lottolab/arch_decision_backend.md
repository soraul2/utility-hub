arch_decision_backend.md – Lotto Market v2 Backend Architecture Decisions
문서 버전: v1.0
작성자: Perplexity (Backend Architect & QA)
프로젝트: lotto-market-v2 (Spring Boot + Spring Security + OAuth2 + JWT + Spring AI)

1. 기술 스택
 Spring Boot 3.5.10
최신 Spring Boot 버전 사용

 Spring Security 6.x
 Spring Security 6.5.2

최신 Spring Security 버전 사용

 Spring Data JPA

최신 Spring Data JPA 사용

 io.jsonwebtoken:jjwt

최신 jjwt 사용

 MySQL 8.x

최신 MySQL 버전 사용

 Gradle 8.x

최신 Gradle 버전 사용

2. 아키텍처
2.1 레이어 구조
 Controller

Web API 엔드포인트 처리

 Service

비즈니스 로직 (규칙/시뮬/통계/생성)

 Repository

DB 접근

 Global

에러 처리, 보안, 설정 공통 관리

2.2 패키지 구조
 com.wootae.backend.lotto

도메인 로직 (Controller, Service, DTO, Entity, Repository)

 com.wootae.backend.global

에러, 설정, 공통 인프라

3. 보안
3.1 인증
 Spring Security + OAuth2 + JWT

최신 Spring Security, OAuth2, JWT 사용

 Naver, Google 소셜 로그인

최신 Spring Security OAuth2 Client 사용

3.2 토큰
 HttpOnly + Secure 쿠키

토큰 저장 권장

 Access Token 만료 시간: 1시간

 Refresh Token 만료 시간: 14일

3.3 CORS
 환경별 CORS 설정

application.properties (개발): http://localhost:3000,http://localhost:5173

application-prod.properties (프로덕션): https://yourdomain.com

4. 로깅
 로그 레벨: WARN

루트 레벨 WARN

 로그 파일: /var/log/backend/app.log

로그 파일 이름

 로그 파일 최대 크기: 10MB

로그 파일 크기

 로그 파일 최대 이력: 30

로그 파일 이력

5. 데이터베이스
 MySQL 8.x

최신 MySQL 버전 사용

 users, lotto_draw, lotto_rule, lotto_simulation_stats 테이블

테이블 이름

 users 테이블

id, email, nickname, provider, provider_id, role, token_version 필드

6. 테스트
 테스트 커버리지 80% 이상

핵심 서비스 메서드

 테스트 결과 보고서: coverage_report.html

테스트 결과 보고서 파일 이름

7. 배포
 Docker + GitHub Actions + Cloud Run + Cloud SQL

배포 환경

 Dockerfile

Docker 이미지 빌드

 GitHub Actions

CI/CD

 Cloud Run

배포

 Cloud SQL

데이터베이스

이 문서는 Perplexity가 정의한 아키텍처 결정 사항입니다.
Gemini와 Claude가 이 아키텍처 결정사항을 기준으로 코드와 구조를 설계하면,
아키텍처 일관성과 기술 스택 일관성을 높일 수 있습니다.