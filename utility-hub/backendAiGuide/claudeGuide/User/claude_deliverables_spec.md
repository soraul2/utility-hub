# Claude 팀 작업 명세 및 산출물 가이드 (Utility Hub 백엔드 리팩토링)

**작성 일자**: 2026-02-04  
**버전**: v1.0  
**참조 문서**: 
- `final_collaboration_guide_backend.md` (협업 헌법)
- `코드분석_리팩토링체크리스트.md` (리팩토링 요청사항)

---

## 1. 개요 및 역할 (R&R)

### Claude 팀의 역할 (최종 정제자)
**최종 목표**: Gemini 팀의 OAuth2 + JWT 인증 구현을 리팩토링하고, 운영 수준의 고품질 백엔드 코드 & 문서 산출

### 책임 범위
1. **보안 강화**: JWT 필터 예외 처리, 입력 검증 강화
2. **설정 외부화**: 환경변수/프로파일 기반 설정 관리
3. **코드 리팩토링**: 클래스 분리, 중복 제거, 가독성 개선
4. **테스트 작성**: 단위/통합 테스트 커버리지 확대
5. **문서화**: API 명세, README, 설계 vs 구현 일치성 검증 문서

---

## 2. 필수 산출물 (제출 목록)

Claude 팀은 다음 **5가지 핵심 산출물**을 반드시 생성하여 `backendAiGuide/claudeGuide/User/` 폴더에 제출해야 합니다.

### 2.1. 리팩토링 상세 계획서 (`claude_refactoring_plan.md`)
**위치**: `backendAiGuide/claudeGuide/User/claude_refactoring_plan.md`

**내용**:
- Tier 1~3별 리팩토링 항목 상세 설명
- 각 항목별 "현재 코드 → 개선 코드" 구체적 비교
- 리팩토링 순서 및 의존성 분석
- 예상 소요 시간 및 난이도

**예시 구조**:
```markdown
# Tier 1: 필수 보안 리팩토링

## 항목 A-1: JwtAuthenticationFilter Exception Handling
### 현재 코드 (문제점)
[코드 스니펫]

### 개선 코드 (해결안)
[코드 스니펫]

### 영향 범위
- 변경 파일: JwtAuthenticationFilter.java
- 의존 클래스: GlobalExceptionHandler
```

### 2.2. 리팩토링된 소스 코드 (`refactored_source_code/`)
**위치**: `backendAiGuide/claudeGuide/User/refactored_source_code/`

**내용**:
- JwtAuthenticationFilter.java (예외 처리 강화)
- CustomOAuth2UserService.java (입력 검증 추가)
- UserProfile.java (새로 추출된 DTO 클래스)
- OAuthAttributes.java (새로 추출된 유틸리티 클래스)
- JwtTokenService.java (토큰 시간 외부화)
- OAuth2AuthenticationSuccessHandler.java (콜백 URL 외부화)
- application-dev.yml / application-prod.yml (설정 파일 추가)
- SecurityConfig.java (CORS 프로파일 분리)

**원칙**:
- 원래 동작(API 응답, 에러 코드)은 절대 변경하지 않음
- 순수 내부 구조 개선만 진행
- 각 파일마다 주석으로 "변경 사항" 명시

### 2.3. 향상된 테스트 코드 (`enhanced_test_code/`)
**위치**: `backendAiGuide/claudeGuide/User/enhanced_test_code/`

**내용**:
- `JwtAuthenticationFilterTest.java`
  - 정상 토큰 시나리오
  - 만료된 토큰 시나리오
  - 잘못된 토큰 시나리오
  - 헤더 없음 시나리오
  
- `CustomOAuth2UserServiceTest.java`
  - 정상 Naver 응답
  - 정상 Google 응답
  - null 값 처리
  - 신규 사용자 생성
  - 기존 사용자 업데이트

- `OAuth2AuthenticationSuccessHandlerTest.java`
  - JWT 생성 확인
  - 리다이렉트 URL 확인
  - 토큰 포함 여부 확인

- `UserControllerTest.java` (기존 강화)
  - 인증 없이 접근 시 실패 확인
  - 정상 토큰으로 접근 시 사용자 정보 반환 확인

**테스트 커버리지 목표**: 핵심 도메인 로직 80% 이상

### 2.4. 기술 문서 (`technical_documentation/`)
**위치**: `backendAiGuide/claudeGuide/User/technical_documentation/`

#### 2.4.1. README_BACKEND_AUTH.md
**내용**:
- 백엔드 인증 시스템 개요
- 아키텍처 다이어그램 (텍스트 기반)
- 주요 클래스/메서드 설명
- 설정 방법 (dev/prod)
- 문제 해결 가이드 (Troubleshooting)

#### 2.4.2. API_SPECIFICATION_AUTH.md
**내용**:
- `/api/user/me` 상세 명세
  - Request/Response 스키마
  - Error Codes
  - Example curl commands
  
- `/api/auth/token/refresh` 상세 명세
  - Request/Response 스키마
  - 토큰 로테이션 정책
  - Example curl commands

- `/login/oauth2/authorization/{provider}` 설명
  - OAuth2 플로우
  - 콜백 URL 및 토큰 전달 방식

#### 2.4.3. SECURITY_GUIDELINES.md
**내용**:
- JWT 토큰 저장 방법 (클라이언트 측)
- CSRF 보호 전략
- CORS 정책 설명
- 프로덕션 배포 시 보안 체크리스트

#### 2.4.4. DESIGN_VS_IMPLEMENTATION.md
**내용**:
- `design_spec_backend.md` vs 실제 구현 비교 테이블
- 명세 준수 여부 확인
- 설계에서 벗어난 부분 (있다면) 정당성 설명
- 미반영 사항 (있다면) 향후 계획

### 2.5. 리팩토링 결과 보고서 (`claude_walkthrough.md`)
**위치**: `backendAiGuide/claudeGuide/User/claude_walkthrough.md`

**내용**:
- 리팩토링 완료 현황 (Tier별 체크리스트)
- 각 항목별 변경 내용 요약
- 테스트 실행 결과
  - `./gradlew clean test` 성공 여부
  - 테스트 커버리지 수치
  - 실패한 테스트 (있다면) 분석

- 명세 준수 최종 검증
  - `design_spec_backend.md` 준수 확인
  - `collaborations_rule_backend.md` 준수 확인
  - 기존 API 동작 변경 없음 확인

- Perplexity 검증 전 자가 점검 (Self-Review)
  - 보안: JWT 필터 예외 처리, 입력 검증 강화 완료
  - 설정: 프로파일별 설정 분리 완료
  - 테스트: 커버리지 80% 달성 여부
  - 문서: 4개 기술 문서 작성 완료

---

## 3. 상세 작업 명세 (구현 체크리스트)

### Phase 1: Tier 1 보안 리팩토링 (필수)

#### Task 1-1: JwtAuthenticationFilter 예외 처리 강화
**변경 파일**: `backend/src/main/java/com/wootae/backend/global/auth/JwtAuthenticationFilter.java`

**작업 내용**:
- [ ] JWT 검증 실패 시 명시적 예외 처리 추가
- [ ] 로깅 강화 (DEBUG: 토큰 파싱 시작, INFO: 검증 성공, WARN: 검증 실패)
- [ ] 필터 체인 진행 전 권한 확인
- [ ] try-catch로 모든 예외 명시적 처리

**코드 예시**:
```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
    String token = resolveToken(request);
    try {
        if (token != null) {
            if (jwtTokenService.validateToken(token)) {
                Authentication authentication = jwtTokenService.getAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                log.info("JWT 검증 성공: userId={}", authentication.getName());
            } else {
                log.warn("유효하지 않은 토큰 수신: {}", obfuscateToken(token));
            }
        }
    } catch (BusinessException e) {
        log.warn("토큰 검증 중 비즈니스 예외 발생", e);
        // GlobalExceptionHandler가 처리하도록 위임
        filterChain.doFilter(request, response);
        return;
    }
    filterChain.doFilter(request, response);
}
```

#### Task 1-2: CustomOAuth2UserService 입력 검증 강화
**변경 파일**: `backend/src/main/java/com/wootae/backend/domain/user/service/CustomOAuth2UserService.java`

**작업 내용**:
- [ ] OAuthAttributes.extract()에 null 체크 추가
- [ ] 필수 필드 (providerId, email 또는 nickname) 검증
- [ ] 잘못된 제공자 응답 시 명시적 예외 발생
- [ ] 사용자 정보 매핑 실패 시 로깅

**코드 예시**:
```java
public static UserProfile extract(String registrationId, Map<String, Object> attributes) {
    if ("naver".equals(registrationId)) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) {
            throw new OAuth2AuthenticationException("Naver OAuth2 응답이 올바르지 않습니다");
        }
        
        String providerId = (String) response.get("id");
        String nickname = (String) response.get("nickname");
        String email = (String) response.get("email");
        
        if (providerId == null || providerId.isBlank()) {
            throw new OAuth2AuthenticationException("providerId가 비어있습니다");
        }
        // ... 나머지 필드 검증
        
        return new UserProfile(providerId, nickname, email, AuthProvider.NAVER);
    }
    // ... Google 처리
}
```

### Phase 2: Tier 2 설정 외부화 (권장)

#### Task 2-1: JWT 토큰 시간 외부화
**변경 파일**: 
- `backend/src/main/java/com/wootae/backend/global/auth/JwtTokenService.java`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-dev.yml`
- `backend/src/main/resources/application-prod.yml` (신규)

**작업 내용**:
- [ ] JwtTokenService에서 @Value로 토큰 시간 외부화
- [ ] application.yml에 기본값 설정
- [ ] dev/prod 프로파일별 다른 값 설정
- [ ] 변수명: `spring.jwt.access-token-expiry`, `spring.jwt.refresh-token-expiry` (단위: ms)

#### Task 2-2: OAuth2 콜백 URL 외부화
**변경 파일**:
- `backend/src/main/java/com/wootae/backend/global/auth/OAuth2AuthenticationSuccessHandler.java`
- `backend/src/main/resources/application.yml` (수정)
- `backend/src/main/resources/application-dev.yml` (수정)
- `backend/src/main/resources/application-prod.yml` (수정)

**작업 내용**:
- [ ] OAuth2AuthenticationSuccessHandler에서 콜백 URL을 @Value로 외부화
- [ ] application.yml에 기본값 (http://localhost:3000/auth/callback)
- [ ] prod에서 실제 프론트엔드 URL 설정 가능
- [ ] 변수명: `oauth2.frontend-callback-url`

#### Task 2-3: CORS 설정 프로파일 분리
**변경 파일**: `backend/src/main/java/com/wootae/backend/global/auth/SecurityConfig.java`

**작업 내용**:
- [ ] CORS 설정을 프로파일별로 분리하는 configuration bean 생성
- [ ] dev: allowedOriginPatterns("*") + allowCredentials(true)
- [ ] prod: 화이트리스트 기반 도메인만 허용 (application-prod.yml에서 관리)
- [ ] 변수명: `cors.allowed-origins` (쉼표 구분 문자열)

### Phase 3: 코드 품질 개선

#### Task 3-1: UserProfile & OAuthAttributes 클래스 분리
**신규 파일**:
- `backend/src/main/java/com/wootae/backend/domain/user/dto/oauth/UserProfile.java`
- `backend/src/main/java/com/wootae/backend/domain/user/util/OAuthAttributesExtractor.java`

**작업 내용**:
- [ ] CustomOAuth2UserService 내부 UserProfile을 독립 DTO로 추출
- [ ] OAuthAttributes를 유틸리티 클래스로 추출
- [ ] 테스트 작성 용이하도록 public 클래스로 변경

#### Task 3-2: UserController 조회 최적화
**변경 파일**: `backend/src/main/java/com/wootae/backend/domain/user/controller/UserController.java`

**작업 내용**:
- [ ] 토큰의 userId를 @AuthenticationPrincipal에서 직접 추출
- [ ] Optional 체이닝으로 안전성 강화
- [ ] 로깅 추가 (액세스 요청 기록)

#### Task 3-3: 로깅 강화
**변경 파일**: 관련 서비스/컨트롤러 전체

**작업 내용**:
- [ ] 모든 주요 클래스에 @Slf4j 추가
- [ ] 주요 메서드 진입점/종료점 로깅
- [ ] 보안 관련 이벤트 로깅 (로그인 시도, 토큰 검증 실패 등)
- [ ] 로그 레벨 구분 (DEBUG, INFO, WARN, ERROR)

### Phase 4: 테스트 작성

#### Task 4-1: JwtAuthenticationFilter 테스트
**신규 파일**: `backend/src/test/java/com/wootae/backend/global/auth/JwtAuthenticationFilterTest.java`

**테스트 시나리오**:
- [ ] 정상 JWT 토큰으로 SecurityContext 설정 확인
- [ ] 만료된 토큰 시 필터 통과 but 권한 없음 확인
- [ ] 잘못된 토큰 시 필터 통과 but 권한 없음 확인
- [ ] Authorization 헤더 없음 시 필터 통과 but 권한 없음 확인

#### Task 4-2: CustomOAuth2UserService 테스트
**신규 파일**: `backend/src/test/java/com/wootae/backend/domain/user/service/CustomOAuth2UserServiceTest.java`

**테스트 시나리오**:
- [ ] 정상 Naver OAuth2 응답으로 신규 사용자 생성
- [ ] 정상 Google OAuth2 응답으로 신규 사용자 생성
- [ ] 기존 사용자 로그인 시 업데이트 확인
- [ ] null 응답 처리 확인 (예외 발생)

#### Task 4-3: OAuth2AuthenticationSuccessHandler 테스트
**신규 파일**: `backend/src/test/java/com/wootae/backend/global/auth/OAuth2AuthenticationSuccessHandlerTest.java`

**테스트 시나리오**:
- [ ] 로그인 성공 시 JWT 토큰 생성 확인
- [ ] 리다이렉트 URL에 토큰 포함 확인
- [ ] 콜백 URL이 설정값과 일치 확인

#### Task 4-4: 통합 테스트 강화
**변경 파일**: `backend/src/test/java/com/wootae/backend/domain/user/controller/UserControllerTest.java`

**테스트 시나리오**:
- [ ] 토큰 없이 `/api/user/me` 접근 → 401 Unauthorized
- [ ] 유효한 토큰으로 `/api/user/me` 접근 → 200 + 사용자 정보
- [ ] 토큰 갱신 엔드포인트 테스트 추가

### Phase 5: 문서화

#### Task 5-1: README_BACKEND_AUTH.md 작성
**내용**:
- [ ] 인증 시스템 아키텍처 설명
- [ ] 주요 클래스 설명 (CustomOAuth2UserService, JwtTokenService 등)
- [ ] 설정 방법 (dev 환경 세팅)
- [ ] 일반적인 오류 및 해결 방법

#### Task 5-2: API_SPECIFICATION_AUTH.md 작성
**내용**:
- [ ] `/api/user/me` 엔드포인트 명세
- [ ] `/api/auth/token/refresh` 엔드포인트 명세
- [ ] 각 엔드포인트별 curl 예시
- [ ] 에러 코드 매핑 테이블

#### Task 5-3: SECURITY_GUIDELINES.md 작성
**내용**:
- [ ] JWT 토큰 클라이언트 저장 방법
- [ ] 프로덕션 배포 시 보안 체크리스트
- [ ] CORS/CSRF 전략 설명

#### Task 5-4: DESIGN_VS_IMPLEMENTATION.md 작성
**내용**:
- [ ] `design_spec_backend.md` 항목별 구현 상태 테이블
- [ ] 명세 준수 여부 확인
- [ ] 개선된 부분 설명

---

## 4. 품질 검수 기준

Claude 팀의 산출물이 다음 기준을 충족해야 Perplexity 팀에 검증 요청합니다.

### 코드 품질
- [ ] 모든 파일에 개선 사항 주석 포함
- [ ] Java 명명 규칙 준수 (PascalCase/camelCase)
- [ ] Lombok @RequiredArgsConstructor 적용
- [ ] `./gradlew clean build` 성공
- [ ] `./gradlew clean test` 성공 (모든 테스트 통과)

### 보안
- [ ] JWT 필터 예외 처리 강화
- [ ] OAuth2 입력 검증 강화
- [ ] CORS 프로파일 분리
- [ ] 환경변수/설정 파일로 민감 정보 외부화

### 설정 관리
- [ ] JWT 토큰 시간 외부화 (application-{profile}.yml)
- [ ] OAuth2 콜백 URL 외부화 (application-{profile}.yml)
- [ ] CORS 설정 프로파일 분리

### 테스트
- [ ] 단위 테스트: JwtAuthenticationFilter, CustomOAuth2UserService, OAuth2AuthenticationSuccessHandler
- [ ] 통합 테스트: UserController, AuthController
- [ ] 테스트 커버리지: 80% 이상 (핵심 도메인 로직)
- [ ] 모든 테스트 통과

### 문서화
- [ ] README_BACKEND_AUTH.md (아키텍처, 설정 방법)
- [ ] API_SPECIFICATION_AUTH.md (엔드포인트 명세)
- [ ] SECURITY_GUIDELINES.md (보안 체크리스트)
- [ ] DESIGN_VS_IMPLEMENTATION.md (명세 준수 확인)

---

## 5. 산출물 제출 경로 및 파일 구조

```
backendAiGuide/claudeGuide/User/
├── 코드분석_리팩토링체크리스트.md          # (이미 작성)
├── claude_deliverables_spec.md            # Claude 산출물 명세 (이 파일)
├── claude_refactoring_plan.md             # 리팩토링 상세 계획
├── claude_walkthrough.md                  # 리팩토링 완료 보고서
│
├── refactored_source_code/
│   ├── JwtAuthenticationFilter.java
│   ├── CustomOAuth2UserService.java
│   ├── UserProfile.java (신규)
│   ├── OAuthAttributesExtractor.java (신규)
│   ├── JwtTokenService.java
│   ├── OAuth2AuthenticationSuccessHandler.java
│   ├── SecurityConfig.java
│   ├── UserController.java
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
│
├── enhanced_test_code/
│   ├── JwtAuthenticationFilterTest.java
│   ├── CustomOAuth2UserServiceTest.java
│   ├── OAuth2AuthenticationSuccessHandlerTest.java
│   └── UserControllerTest.java (enhanced)
│
└── technical_documentation/
    ├── README_BACKEND_AUTH.md
    ├── API_SPECIFICATION_AUTH.md
    ├── SECURITY_GUIDELINES.md
    └── DESIGN_VS_IMPLEMENTATION.md
```

---

## 6. 일정 및 체크포인트

| 단계 | 내용 | 예상 소요 시간 | 완료 여부 |
|------|------|----------------|----------|
| Phase 1 | Tier 1 보안 리팩토링 (필수) | 3-4시간 | [ ] |
| Phase 2 | Tier 2 설정 외부화 | 2-3시간 | [ ] |
| Phase 3 | 코드 품질 개선 | 2-3시간 | [ ] |
| Phase 4 | 테스트 작성 | 4-5시간 | [ ] |
| Phase 5 | 문서화 | 2-3시간 | [ ] |
| **전체** | **합계** | **~18시간** | [ ] |

---

## 7. 검증 체크리스트 (Perplexity 팀용)

Claude 팀이 완료 후 Perplexity 팀은 다음을 검증합니다:

- [ ] 원래 API 응답/에러 코드 변경 없음 (외부 계약 유지)
- [ ] 모든 테스트 통과 (`./gradlew clean test`)
- [ ] 테스트 커버리지 80% 이상
- [ ] `design_spec_backend.md` 준수 확인
- [ ] 보안 강화 항목 (A-1, A-2, A-3) 완료 확인
- [ ] 설정 외부화 완료 확인

---

**산출물 제출 폴더**: `C:\AiProject\utility-hub\utility-hub\backendAiGuide\claudeGuide\User\`

**기한**: 설계팀(Perplexity) 검증 전 완료

**담당자**: Claude 팀 (리팩토링/문서화)

**최종 검증자**: Perplexity 팀 (설계/보안 최종 확인)
