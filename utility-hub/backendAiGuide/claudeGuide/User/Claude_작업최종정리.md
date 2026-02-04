# Claude 팀 작업 최종 정리 및 실행 계획

**작성 일자**: 2026-02-04  
**대상자**: Claude 팀 (리팩토링/문서화 담당)  
**기한**: Perplexity 팀 검증 전 완료  

---

## 📋 Executive Summary (1줄 요약)

**Gemini 팀의 OAuth2 + JWT 인증 구현을 분석한 결과, 보안 강화 + 설정 외부화 + 테스트 작성 + 문서화를 통해 운영 수준으로 리팩토링해야 합니다.**

---

## 1. 분석 결과 한눈에 보기

### 1.1 Gemini 팀 구현의 현재 상태
✅ **잘한 부분**:
- Spring Security + OAuth2 통합이 체계적으로 구현됨
- 레이어 아키텍처 (Controller-Service-Repository) 명확함
- JWT 토큰 생성/검증 로직이 명확함
- 에러 처리 표준화 (ErrorCode + BusinessException + GlobalExceptionHandler)

⚠️ **개선 필요 부분**:
- JWT 필터의 예외 처리 부재 → 보안 위험
- OAuth2 응답 검증 부족 → NPE 위험
- 설정값 하드코딩 (토큰 시간, 콜백 URL) → 배포 어려움
- 테스트 커버리지 낮음 → 보안 필터, OAuth2 서비스 테스트 없음
- 로깅 부족 → 보안 감시 불가능

---

## 2. Claude 팀의 확정 산출물 (5개 필수 제출)

### 2.1 리팩토링 상세 계획서
📄 **파일명**: `claude_refactoring_plan.md`

```
Tier 1 (필수 보안): A-1 JWT 필터 예외처리, A-2 OAuth2 입력 검증
Tier 2 (권장 설정): B-2 토큰 시간 외부화, B-3 콜백 URL 외부화, A-3 CORS 분리
Tier 3 (추가 개선): B-4 조회 최적화, B-5 로깅 강화
```

### 2.2 리팩토링된 소스 코드
📁 **폴더**: `refactored_source_code/`

**핵심 변경 파일 (8개)**:
1. `JwtAuthenticationFilter.java` - Exception Handling 강화
2. `CustomOAuth2UserService.java` - 입력 검증 추가
3. `UserProfile.java` (신규) - 클래스 분리
4. `OAuthAttributesExtractor.java` (신규) - 유틸리티 분리
5. `JwtTokenService.java` - 토큰 시간 외부화
6. `OAuth2AuthenticationSuccessHandler.java` - 콜백 URL 외부화
7. `SecurityConfig.java` - CORS 프로파일 분리
8. `application-{dev|prod}.yml` (신규) - 설정 파일

### 2.3 향상된 테스트 코드
📁 **폴더**: `enhanced_test_code/`

**신규 테스트 파일 (4개)**:
1. `JwtAuthenticationFilterTest.java` - JWT 필터 검증 (4가지 시나리오)
2. `CustomOAuth2UserServiceTest.java` - OAuth2 서비스 검증 (5가지 시나리오)
3. `OAuth2AuthenticationSuccessHandlerTest.java` - 성공 핸들러 검증 (3가지 시나리오)
4. `UserControllerTest.java` (강화) - API 엔드포인트 검증

**목표**: 테스트 커버리지 80% 이상

### 2.4 기술 문서 (4개)
📁 **폴더**: `technical_documentation/`

1. **README_BACKEND_AUTH.md**
   - 인증 시스템 아키텍처 설명
   - 주요 클래스 및 메서드 설명
   - 개발 환경 설정 방법
   - 일반적인 문제 및 해결법

2. **API_SPECIFICATION_AUTH.md**
   - `/api/user/me` 엔드포인트 명세
   - `/api/auth/token/refresh` 엔드포인트 명세
   - OAuth2 플로우 설명
   - curl 예시 포함

3. **SECURITY_GUIDELINES.md**
   - JWT 토큰 클라이언트 저장 방법
   - CSRF 보호 전략
   - CORS 정책 설명
   - 프로덕션 배포 보안 체크리스트

4. **DESIGN_VS_IMPLEMENTATION.md**
   - design_spec_backend.md 항목별 구현 상태 테이블
   - 명세 준수 여부 확인
   - 개선된 부분 설명
   - 미반영 사항 및 향후 계획

### 2.5 리팩토링 완료 보고서
📄 **파일명**: `claude_walkthrough.md`

- Tier별 리팩토링 완료 체크리스트
- 각 변경 사항 요약
- 테스트 실행 결과 (pass/fail, 커버리지)
- 명세 준수 최종 검증
- Perplexity 검증 전 자가 점검

---

## 3. 구체적 리팩토링 항목 정리

### 🔴 **Tier 1 (필수 보안) - 반드시 적용**

#### A-1. JwtAuthenticationFilter Exception Handling
```
변경 파일: JwtAuthenticationFilter.java
문제: 토큰 검증 실패 시 예외 처리 없음 → 잘못된 토큰도 요청 계속 진행
해결: try-catch로 명시적 처리, 로깅 추가
예시:
  if (token != null && jwtTokenService.validateToken(token)) {
      Authentication authentication = jwtTokenService.getAuthentication(token);
      SecurityContextHolder.getContext().setAuthentication(authentication);
      log.info("JWT 검증 성공");
  } else {
      log.warn("유효하지 않은 토큰");
  }
```

#### A-2. CustomOAuth2UserService 입력 검증
```
변경 파일: CustomOAuth2UserService.java
문제: OAuth2 응답의 null 체크 없음 → NPE 위험
해결: OAuthAttributes.extract()에 각 필드 null/빈값 체크 추가
예시:
  if (response == null) throw new OAuth2AuthenticationException("응답이 올바르지 않음");
  if (providerId == null || providerId.isBlank()) throw new ...
```

### 🟡 **Tier 2 (권장 설정) - 프로덕션 필수**

#### B-2. JWT 토큰 시간 외부화
```
변경 파일: JwtTokenService.java + application-{dev|prod}.yml
현재 (문제): private final long accessTokenValidityInMilliseconds = 1000 * 60 * 60;
개선:
  @Value("${spring.jwt.access-token-expiry:3600000}")
  private long accessTokenValidityInMilliseconds;
  
application-dev.yml:
  spring:
    jwt:
      access-token-expiry: 3600000    # 1 hour
      refresh-token-expiry: 1209600000 # 14 days
```

#### B-3. OAuth2 콜백 URL 외부화
```
변경 파일: OAuth2AuthenticationSuccessHandler.java + application-{dev|prod}.yml
현재 (문제): String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/auth/callback")
개선:
  @Value("${oauth2.frontend-callback-url}")
  private String callbackUrl;
  
  String targetUrl = UriComponentsBuilder.fromUriString(callbackUrl)
  
application-dev.yml:
  oauth2:
    frontend-callback-url: http://localhost:3000/auth/callback

application-prod.yml:
  oauth2:
    frontend-callback-url: https://your-domain.com/auth/callback
```

#### A-3. CORS 설정 프로파일 분리
```
변경 파일: SecurityConfig.java
dev: 모든 도메인 허용 (개발 편의)
prod: 화이트리스트 기반 도메인만 허용 (보안)

application-prod.yml:
  cors:
    allowed-origins: https://your-domain.com,https://api.your-domain.com
```

### 🟢 **Tier 3 (추가 개선) - 선택적**

#### B-4. UserController 조회 최적화
```
변경 파일: UserController.java
현재: Optional 체이닝 추가, 로깅 추가
```

#### B-5. 로깅 강화
```
변경 파일: 모든 서비스/필터
추가: @Slf4j, 주요 메서드 진입/종료 로깅, 보안 이벤트 로깅
```

---

## 4. 테스트 작성 세부 계획

### JwtAuthenticationFilterTest (4가지 시나리오)
```java
1. testValidToken() - 정상 토큰 → SecurityContext 설정 확인
2. testExpiredToken() - 만료된 토큰 → 필터 통과하지만 권한 없음
3. testInvalidToken() - 잘못된 토큰 → 필터 통과하지만 권한 없음
4. testMissingHeader() - 헤더 없음 → 필터 통과하지만 권한 없음
```

### CustomOAuth2UserServiceTest (5가지 시나리오)
```java
1. testLoadUserWithNaver() - 정상 Naver 응답 → 신규 사용자 생성
2. testLoadUserWithGoogle() - 정상 Google 응답 → 신규 사용자 생성
3. testUpdateExistingUser() - 기존 사용자 → 닉네임/이메일 업데이트
4. testInvalidResponse() - null 응답 → 예외 발생
5. testMissingFields() - 필드 누락 → 예외 발생
```

### OAuth2AuthenticationSuccessHandlerTest (3가지 시나리오)
```java
1. testTokenGeneration() - JWT 토큰 생성 확인
2. testRedirectUrl() - 콜백 URL로 리다이렉트 확인
3. testTokenInResponse() - 토큰이 URL에 포함되었는지 확인
```

---

## 5. 문서화 구조

### README_BACKEND_AUTH.md
```
- 인증 시스템 개요 (OAuth2 + JWT)
- 아키텍처 다이어그램 (텍스트)
- 주요 클래스 설명
  - CustomOAuth2UserService: OAuth2 사용자 로드 및 저장
  - JwtTokenService: JWT 토큰 생성/검증
  - JwtAuthenticationFilter: JWT 필터
  - SecurityConfig: Spring Security 설정
- 개발 환경 설정 (local 실행 방법)
- Troubleshooting (자주 묻는 문제)
```

### API_SPECIFICATION_AUTH.md
```
- GET /api/user/me
  Request: Authorization: Bearer {token}
  Response: { id, email, nickname, provider, role }
  Error Codes: AUTH_001, TOKEN_001 등
  Example curl

- POST /api/auth/token/refresh
  Request: { refreshToken }
  Response: { accessToken, refreshToken, tokenType, expiresIn }
  Error Codes: TOKEN_INVALID 등
  Example curl

- OAuth2 플로우 설명
```

### SECURITY_GUIDELINES.md
```
- JWT 토큰 클라이언트 저장 방법
  - localStorage vs sessionStorage vs memory
  - XSS 취약성 주의
  
- CSRF 보호
  - JWT는 CSRF 보호가 기본적으로 안전
  
- CORS 정책
  - dev: 모든 도메인 허용
  - prod: 화이트리스트 기반
  
- 프로덕션 배포 체크리스트
  - 환경변수 설정 확인
  - JWT Secret 안전성 확인
  - CORS 화이트리스트 적용 확인
```

### DESIGN_VS_IMPLEMENTATION.md
```
| 항목 | design_spec_backend.md | 실제 구현 | 상태 |
|------|----------------------|---------|------|
| User 엔티티 | id, email, nickname, provider, role | 모두 구현 | ✅ |
| OAuth2 플로우 | Naver, Google 지원 | 구현됨 | ✅ |
| JWT 토큰 | Access 1h, Refresh 14d | 구현됨 | ✅ |
| API 엔드포인트 | /api/user/me, /api/auth/token/refresh | 구현됨 | ✅ |
| 입력 검증 | OAuth2 응답 검증 | 미흡 → 리팩토링 | ⚠️ |
| 테스트 커버리지 | 80% 이상 | ~30% → 리팩토링 | ⚠️ |

[리팩토링 후 개선 사항]
```

---

## 6. 최종 제출물 폴더 구조

```
C:\AiProject\utility-hub\utility-hub\backendAiGuide\claudeGuide\User\
│
├── 코드분석_리팩토링체크리스트.md           ✅ (이미 작성)
├── claude_deliverables_spec.md              ✅ (이미 작성)
├── claude_refactoring_plan.md               ⏳ (작성 필요)
├── claude_walkthrough.md                    ⏳ (작성 필요)
├── 협업가이드_Claude역할정의.md             ✅ (이미 작성)
│
├── refactored_source_code/
│   ├── JwtAuthenticationFilter.java         ⏳
│   ├── CustomOAuth2UserService.java         ⏳
│   ├── UserProfile.java (신규)              ⏳
│   ├── OAuthAttributesExtractor.java (신규) ⏳
│   ├── JwtTokenService.java                 ⏳
│   ├── OAuth2AuthenticationSuccessHandler.java ⏳
│   ├── SecurityConfig.java                  ⏳
│   ├── UserController.java                  ⏳
│   ├── application.yml                      ⏳
│   ├── application-dev.yml (신규)           ⏳
│   └── application-prod.yml (신규)          ⏳
│
├── enhanced_test_code/
│   ├── JwtAuthenticationFilterTest.java         ⏳
│   ├── CustomOAuth2UserServiceTest.java         ⏳
│   ├── OAuth2AuthenticationSuccessHandlerTest.java ⏳
│   └── UserControllerTest.java (강화)          ⏳
│
└── technical_documentation/
    ├── README_BACKEND_AUTH.md                ⏳
    ├── API_SPECIFICATION_AUTH.md             ⏳
    ├── SECURITY_GUIDELINES.md                ⏳
    └── DESIGN_VS_IMPLEMENTATION.md           ⏳
```

---

## 7. 실행 순서 (권장)

### Phase 1: Tier 1 보안 리팩토링 (3-4시간)
1. JwtAuthenticationFilter 예외 처리 추가
2. CustomOAuth2UserService 입력 검증 추가
3. 로컬 테스트로 동작 확인

### Phase 2: Tier 2 설정 외부화 (2-3시간)
1. JwtTokenService 토큰 시간 외부화
2. OAuth2AuthenticationSuccessHandler 콜백 URL 외부화
3. SecurityConfig CORS 프로파일 분리
4. application-{dev|prod}.yml 작성

### Phase 3: 코드 품질 개선 (2-3시간)
1. UserProfile & OAuthAttributesExtractor 클래스 분리
2. UserController 로깅 추가
3. 전체 로깅 강화

### Phase 4: 테스트 작성 (4-5시간)
1. JwtAuthenticationFilterTest 작성
2. CustomOAuth2UserServiceTest 작성
3. OAuth2AuthenticationSuccessHandlerTest 작성
4. UserControllerTest 강화
5. `./gradlew clean test` 전체 통과 확인

### Phase 5: 문서화 (2-3시간)
1. README_BACKEND_AUTH.md 작성
2. API_SPECIFICATION_AUTH.md 작성
3. SECURITY_GUIDELINES.md 작성
4. DESIGN_VS_IMPLEMENTATION.md 작성
5. claude_refactoring_plan.md 작성
6. claude_walkthrough.md 작성

**전체 소요 시간**: ~18시간

---

## 8. 품질 검수 기준 (자가 점검)

Claude 팀은 제출 전 다음을 확인:

- [ ] `./gradlew clean build` 성공
- [ ] `./gradlew clean test` 성공 (모든 테스트)
- [ ] 테스트 커버리지: 80% 이상
- [ ] 모든 파일에 "변경 사항" 주석 포함
- [ ] API 응답/에러 코드 변경 없음 (외부 계약 유지)
- [ ] 5개 산출물 모두 완성 및 폴더 정리
- [ ] clone_walkthrough.md에 자가 점검 결과 기록

---

## 9. 다음 단계: Perplexity 검증

Claude 완료 후:

1. **Perplexity에게 검증 요청**
   - 파일 경로: `backendAiGuide/claudeGuide/User/`
   - 요청: design_spec_backend.md 준수 여부 + 보안 강화 확인 + API 계약 유지 확인

2. **Perplexity의 검증 체크리스트**
   - [ ] 아키텍처 준수 (레이어 구조)
   - [ ] 보안 강화 (Tier 1 항목)
   - [ ] 테스트 커버리지 (80%)
   - [ ] API 계약 유지 (엔드포인트, 응답 스키마)
   - [ ] 설정 외부화 (프로파일별)

3. **최종 승인**
   - Perplexity 검증 통과 → 본격 적용

---

## 🎯 최종 목표

```
Gemini 팀의 OAuth2 + JWT 구현
    ↓
Claude 팀의 리팩토링 + 테스트 + 문서화
    ↓
Perplexity 팀의 설계 준수 + 보안 검증
    ↓
운영 수준의 고품질 백엔드 인증 모듈 완성 ✅
```

---

**최종 작성**: Claude AI  
**작성 일자**: 2026-02-04  
**제출 기한**: Perplexity 검증 전  
**담당**: Claude 팀 (리팩토링/문서화)
