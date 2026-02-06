design_vs_implementation.md – Lotto Market v2 Backend Design vs Implementation
문서 버전: v1.0
작성자: Perplexity (Backend Architect & QA)
프로젝트: lotto-market-v2 (Spring Boot + Spring Security + OAuth2 + JWT + Spring AI)

1. 개요
이 문서는 design_spec_backend.md와 실제 구현 사이의 불일치를 기록하는 문서입니다.

변경이 필요할 때는 코드부터 고치지 않고, design_spec_backend.md를 먼저 수정한 뒤,
그 변경을 기준으로 코드를 업데이트합니다.

2. 변경 내역
2.1 OAuth2 로그인 엔드포인트
설계: POST /oauth2/authorization/{provider}

구현: 동일

상태: 일치 ✅

2.2 사용자 정보 조회 엔드포인트
설계: GET /api/user/me

구현: 동일

상태: 일치 ✅

2.3 토큰 갱신 엔드포인트
설계: POST /api/auth/token/refresh

구현: 동일

상태: 일치 ✅

2.4 회원 탈퇴 엔드포인트
설계: DELETE /api/user/me

구현: 동일

상태: 일치 ✅

2.5 규칙 목록 조회 엔드포인트
설계: GET /api/rules

구현: 동일

상태: 일치 ✅

2.6 TOP 5 규칙 조회 엔드포인트
설계: GET /api/rules/top

구현: 동일

상태: 일치 ✅

2.7 규칙 상세 조회 엔드포인트
설계: GET /api/rules/{ruleId}

구현: 동일

상태: 일치 ✅

2.8 규칙 기간별 통계 엔드포인트
설계: GET /api/rules/{ruleId}/stats/period

구현: 동일

상태: 일치 ✅

2.9 규칙 분포 통계 엔드포인트
설계: GET /api/rules/{ruleId}/stats/distribution

구현: 동일

상태: 일치 ✅

2.10 규칙 기반 번호 생성 엔드포인트
설계: POST /api/rules/{ruleId}/generate

구현: 동일

상태: 일치 ✅

2.11 Spring AI 규칙 설명 생성 엔드포인트
설계: POST /api/ai/rule-explain

구현: 동일

상태: 일치 ✅

2.12 사용자 당첨 히스토리 엔드포인트
설계: GET /api/me/history

구현: 동일

상태: 일치 ✅

2.13 사용자 통계 엔드포인트
설계: GET /api/me/stats

구현: 동일

상태: 일치 ✅

3. 향후 변경 계획
 HttpOnly + Secure 쿠키 도입

토큰 저장 방식 변경

 Redis 캐싱 도입

토큰, 사용자 정보, 규칙 통계 캐싱

 Rate Limiting 추가

/api/auth/token/refresh 등에 Rate Limiter 적용

 감사 로그 시스템 추가

로그인, 로그아웃, 토큰 갱신, 회원 탈퇴 등 이벤트 로그

 MFA (Multi-Factor Authentication) 추가

TOTP, SMS 등 2단계 인증 도입

이 문서는 Perplexity가 정의한 설계 vs 구현 불일치 기록 문서입니다.
Gemini와 Claude가 이 문서를 기준으로 변경을 기록하면,
설계/구현 일치와 변경 추적을 높일 수 있습니다.