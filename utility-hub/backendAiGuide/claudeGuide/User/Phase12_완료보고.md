# Claude 팀 리팩토링 진행 현황 및 다음 단계

**작성 일자**: 2026-02-04  
**현재 상태**: Phase 1-2 완료 ✅, Phase 3-5 진행 중 ⏳

---

## 📊 완료된 작업 (Phase 1-2)

### Phase 1: Tier 1 보안 리팩토링 ✅

#### A-1. JWT 필터 Exception Handling 강화 ✅
**파일**: `backend/src/main/java/com/wootae/backend/global/auth/JwtAuthenticationFilter.java`

**변경 사항**:
- @Slf4j 추가
- try-catch로 Exception Handling 강화
- 로깅 추가 (DEBUG, WARN 레벨)
- 토큰 검증 실패 시 명시적 처리

**상태**: ✅ 완료

---

#### A-2. OAuth2 입력 검증 강화 ✅
**파일**: `backend/src/main/java/com/wootae/backend/domain/user/service/CustomOAuth2UserService.java`

**변경 사항**:
- OAuthAttributes.extract()에 null/빈값 체크 추가
- Naver/Google 필드 검증 강화
- saveOrUpdate() 메서드에 로깅 추가
- IllegalArgumentException으로 명시적 예외 처리

**상태**: ✅ 완료

---

### Phase 2: Tier 2 설정 외부화 ✅

#### B-2. JWT 토큰 시간 외부화 ✅
**파일**:
- `backend/src/main/java/com/wootae/backend/global/auth/JwtTokenService.java`
- `backend/src/main/resources/application.properties`

**변경 사항**:
- JwtTokenService 생성자에서 @Value로 토큰 시간 주입
- application.properties에 기본값 추가
  - `spring.jwt.access-token-expiry=3600000` (1시간)
  - `spring.jwt.refresh-token-expiry=1209600000` (14일)

**상태**: ✅ 완료

---

#### B-3. OAuth2 콜백 URL 외부화 ✅
**파일**:
- `backend/src/main/java/com/wootae/backend/global/auth/OAuth2AuthenticationSuccessHandler.java`
- `backend/src/main/resources/application.properties`

**변경 사항**:
- @Value로 callbackUrl 주입
- 로깅 추가
- application.properties에 기본값 추가
  - `oauth2.frontend-callback-url=http://localhost:3000/auth/callback`

**상태**: ✅ 완료

---

#### A-3. CORS 설정 프로파일 분리 ✅
**파일**:
- `backend/src/main/java/com/wootae/backend/global/auth/SecurityConfig.java`
- `backend/src/main/resources/application.properties`
- `backend/src/main/resources/application-prod.properties` (신규)

**변경 사항**:
- Environment 의존성 추가
- CORS 설정을 프로파일별로 분리
  - dev: 모든 도메인 허용 (`*`)
  - prod: 화이트리스트 기반 (환경변수로 설정)
- application-prod.properties 신규 생성
  - `cors.allowed-origins=${CORS_ALLOWED_ORIGINS:...}`

**상태**: ✅ 완료

---

## 📋 남은 작업 (Phase 3-5)

### Phase 3: 코드 품질 개선 ⏳

#### B-1. UserProfile & OAuthAttributesExtractor 클래스 분리
**대상**: CustomOAuth2UserService.java 내부 클래스 분리
**예상 파일**:
- `domain/user/dto/oauth/UserProfile.java`
- `domain/user/util/OAuthAttributesExtractor.java`

#### B-4. UserController 조회 최적화
**대상**: UserController.java
**작업**: Optional 체이닝, 로깅 추가

#### B-5. 로깅 강화
**대상**: 모든 주요 서비스/필터
**작업**: @Slf4j 추가, 로깅 포인트 강화

---

### Phase 4: 테스트 코드 작성 ⏳

#### C-1. JwtAuthenticationFilterTest (신규)
**시나리오**: 4가지 (정상 토큰, 만료 토큰, 잘못된 토큰, 헤더 없음)

#### C-2. CustomOAuth2UserServiceTest (신규)
**시나리오**: 5가지 (Naver, Google, 업데이트, 예외 등)

#### C-3. OAuth2AuthenticationSuccessHandlerTest (신규)
**시나리오**: 3가지 (토큰 생성, 리다이렉트, 토큰 포함)

#### C-4. UserControllerTest 강화
**시나리오**: 3가지 (미인증, 정상 접근, 토큰 갱신)

**목표**: 테스트 커버리지 80% 이상

---

### Phase 5: 기술 문서화 ⏳

#### 5-1. README_BACKEND_AUTH.md
- 아키텍처 설명
- 클래스 설명
- 설정 가이드
- Troubleshooting

#### 5-2. API_SPECIFICATION_AUTH.md
- 엔드포인트 명세
- OAuth2 플로우
- curl 예시

#### 5-3. SECURITY_GUIDELINES.md
- 보안 가이드
- 배포 체크리스트

#### 5-4. DESIGN_VS_IMPLEMENTATION.md
- 명세 준수 확인
- 개선 사항 설명

---

## 🚀 다음 진행 방향

### 즉시 필요한 작업

1. **Phase 3 완료**: 클래스 분리, 로깅 강화 (예상 2-3시간)
2. **Phase 4 완료**: 테스트 코드 작성 (예상 4-5시간)
   - `./gradlew clean test` 실행 확인
   - 테스트 커버리지 80% 이상 달성
3. **Phase 5 완료**: 기술 문서 작성 (예상 2-3시간)
4. **최종 검증**: `./gradlew clean build` 성공 확인

### 제출 준비

- [ ] 모든 리팩토링 파일 작성 완료
- [ ] 모든 테스트 통과
- [ ] claude_walkthrough.md 작성 (최종 보고서)
- [ ] 모든 산출물 `claudeGuide/User/` 폴더에 정리

### Perplexity 검증 준비

- [ ] claude_walkthrough.md에 자가 점검 결과 기록
- [ ] 모든 파일에 "변경 사항" 주석 확인
- [ ] API 계약 유지 확인 (엔드포인트, 응답 스키마, 에러 코드)

---

## 📊 리팩토링 영향도 분석

### 변경된 파일 (5개)
1. JwtAuthenticationFilter.java
2. CustomOAuth2UserService.java
3. JwtTokenService.java
4. OAuth2AuthenticationSuccessHandler.java
5. SecurityConfig.java

### 신규 파일 (2개)
1. application-prod.properties
2. claude_refactoring_plan.md

### 수정된 파일 (1개)
1. application.properties

---

## ✅ 검수 체크리스트

### 외부 계약 유지
- [ ] `/api/user/me` 엔드포인트 변경 없음
- [ ] `/api/auth/token/refresh` 엔드포인트 변경 없음
- [ ] Request/Response JSON 스키마 변경 없음
- [ ] 에러 코드/메시지 변경 없음

### 빌드 및 테스트
- [ ] `./gradlew clean build` 성공
- [ ] `./gradlew clean test` 성공
- [ ] 테스트 커버리지 80% 이상

### 코드 품질
- [ ] 모든 파일에 "변경 사항" 주석 추가
- [ ] Java 명명 규칙 준수
- [ ] Lombok @RequiredArgsConstructor 활용

### 보안
- [ ] JWT 필터 예외 처리 강화 ✅
- [ ] OAuth2 입력 검증 강화 ✅
- [ ] CORS 설정 보안 강화 ✅
- [ ] 환경변수 기반 설정 ✅

### 설정 관리
- [ ] 토큰 시간 외부화 ✅
- [ ] 콜백 URL 외부화 ✅
- [ ] CORS 프로파일 분리 ✅

---

## 📌 중요 사항

### 주의할 점
1. **절대 변경 금지**: API 엔드포인트, Request/Response 스키마, 에러 코드
2. **테스트 통과**: `./gradlew clean test` 모두 성공해야 함
3. **명세 준수**: design_spec_backend.md와 일치해야 함

### 진행 중 문제 해결 방법
- 빌드 실패 시: 의존성 확인, import 문제 체크
- 테스트 실패 시: MockMvc 설정, @SpringBootTest 적용 확인
- 설정 문제 시: application-{profile}.properties 파일명 확인

---

**작성**: Claude AI  
**최종 목표**: Phase 3-5 완료 후 Perplexity 검증  
**예상 기한**: ~18시간 (총 리팩토링 기간)
