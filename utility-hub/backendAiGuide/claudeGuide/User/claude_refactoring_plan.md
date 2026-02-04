# Claude 팀 리팩토링 상세 계획 및 실행 현황

**작성 일자**: 2026-02-04  
**작성자**: Claude AI  
**상태**: Phase 1, 2 완료 / Phase 3~5 진행 중

---

## 📊 리팩토링 진행 상황

### ✅ Phase 1: Tier 1 보안 리팩토링 (완료)

#### A-1. JwtAuthenticationFilter Exception Handling 강화
**파일**: [JwtAuthenticationFilter.java](../../../backend/src/main/java/com/wootae/backend/global/auth/JwtAuthenticationFilter.java)

**변경 내용**:
```java
// [개선] @Slf4j 추가 + 로깅 강화
@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(...) {
        String token = resolveToken(request);
        
        try {
            if (token != null) {
                if (jwtTokenService.validateToken(token)) {
                    Authentication authentication = jwtTokenService.getAuthentication(token);
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.debug("JWT 검증 성공: userId={}", authentication.getName());
                } else {
                    log.warn("유효하지 않은 JWT 토큰 수신");
                }
            } else {
                log.debug("Authorization 헤더에서 JWT 토큰을 찾을 수 없음");
            }
        } catch (Exception e) {
            log.warn("JWT 토큰 검증 중 예외 발생: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}
```

**개선 효과**:
- ✅ Exception Handling 추가로 예기치 않은 토큰 검증 실패 처리
- ✅ 로깅 강화로 보안 감시 가능
- ✅ 요청이 올바르게 진행되지 않는 경우 감지

---

#### A-2. CustomOAuth2UserService 입력 검증 강화
**파일**: [CustomOAuth2UserService.java](../../../backend/src/main/java/com/wootae/backend/domain/user/service/CustomOAuth2UserService.java)

**변경 내용**:
```java
private static class OAuthAttributes {
    public static UserProfile extract(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            
            // [개선] Naver 응답 검증
            if (response == null) {
                throw new IllegalArgumentException("Naver OAuth2 응답이 올바르지 않습니다");
            }
            
            String providerId = (String) response.get("id");
            String nickname = (String) response.get("nickname");
            String email = (String) response.get("email");
            
            // [개선] 필수 필드 검증
            if (providerId == null || providerId.isBlank()) {
                throw new IllegalArgumentException("Naver providerId가 비어있거나 null입니다");
            }
            if (nickname == null || nickname.isBlank()) {
                throw new IllegalArgumentException("Naver nickname이 비어있거나 null입니다");
            }
            
            return new UserProfile(providerId, nickname, email, AuthProvider.NAVER);
        } else if ("google".equals(registrationId)) {
            // [개선] Google도 동일하게 검증
            String sub = (String) attributes.get("sub");
            String name = (String) attributes.get("name");
            String email = (String) attributes.get("email");
            
            if (sub == null || sub.isBlank()) {
                throw new IllegalArgumentException("Google sub(providerId)가 비어있거나 null입니다");
            }
            if (name == null || name.isBlank()) {
                throw new IllegalArgumentException("Google name이 비어있거나 null입니다");
            }
            
            return new UserProfile(sub, name, email, AuthProvider.GOOGLE);
        }
        throw new IllegalArgumentException("Unsupported Provider: " + registrationId);
    }
}
```

**개선 효과**:
- ✅ NPE(NullPointerException) 방지
- ✅ 필수 필드 검증으로 데이터 품질 보장
- ✅ Naver/Google 모두 동일 검증 기준 적용

**추가 로깅 강화**:
```java
private User saveOrUpdate(UserProfile userProfile) {
    // [개선] 사용자 정보 저장/업데이트 로깅
    User user = userRepository
        .findByProviderAndProviderId(userProfile.getProvider(), userProfile.getProviderId())
        .map(entity -> {
            log.info("기존 사용자 업데이트: provider={}, providerId={}", 
                userProfile.getProvider(), userProfile.getProviderId());
            entity.update(userProfile.getNickname(), userProfile.getEmail());
            return entity;
        })
        .orElseGet(() -> {
            log.info("신규 사용자 생성: provider={}, providerId={}", 
                userProfile.getProvider(), userProfile.getProviderId());
            return userProfile.toEntity();
        });
    
    return userRepository.save(user);
}
```

---

### ✅ Phase 2: Tier 2 설정 외부화 (완료)

#### B-2. JWT 토큰 시간 외부화
**파일**: 
- [JwtTokenService.java](../../../backend/src/main/java/com/wootae/backend/global/auth/JwtTokenService.java)
- [application.properties](../../../backend/src/main/resources/application.properties)

**변경 내용**:
```java
// [개선] JwtTokenService 생성자: @Value로 토큰 시간 외부화
@Slf4j
@Component
public class JwtTokenService {
    private final SecretKey key;
    private final long accessTokenValidityInMilliseconds;
    private final long refreshTokenValidityInMilliseconds;
    
    public JwtTokenService(
        @Value("${spring.jwt.secret}") String secret,
        @Value("${spring.jwt.access-token-expiry:3600000}") long accessTokenExpiry,
        @Value("${spring.jwt.refresh-token-expiry:1209600000}") long refreshTokenExpiry) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityInMilliseconds = accessTokenExpiry;
        this.refreshTokenValidityInMilliseconds = refreshTokenExpiry;
    }
}
```

**application.properties 추가**:
```properties
# --- JWT (개선: 토큰 시간 외부화) ---
spring.jwt.secret=${JWT_SECRET}
spring.jwt.access-token-expiry=3600000        # 1 hour (ms)
spring.jwt.refresh-token-expiry=1209600000    # 14 days (ms)
```

**개선 효과**:
- ✅ 배포 시 코드 수정 불필요
- ✅ 환경별로 다른 토큰 시간 설정 가능
- ✅ 테스트 시 시간값 override 가능

---

#### B-3. OAuth2 콜백 URL 외부화
**파일**: 
- [OAuth2AuthenticationSuccessHandler.java](../../../backend/src/main/java/com/wootae/backend/global/auth/OAuth2AuthenticationSuccessHandler.java)
- [application.properties](../../../backend/src/main/resources/application.properties)

**변경 내용**:
```java
// [개선] OAuth2AuthenticationSuccessHandler
@Slf4j
@RequiredArgsConstructor
@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final JwtTokenService jwtTokenService;
    
    // [개선] 콜백 URL 외부화 (@Value 사용)
    @Value("${oauth2.frontend-callback-url:http://localhost:3000/auth/callback}")
    private String callbackUrl;
    
    @Override
    public void onAuthenticationSuccess(...) {
        String accessToken = jwtTokenService.createAccessToken(authentication);
        String refreshToken = jwtTokenService.createRefreshToken(authentication);
        
        // [개선] callbackUrl 변수 사용
        String targetUrl = UriComponentsBuilder.fromUriString(callbackUrl)
            .queryParam("accessToken", accessToken)
            .queryParam("refreshToken", refreshToken)
            .build().toUriString();
        
        log.info("OAuth2 로그인 성공: callback URL로 리다이렉트={}", callbackUrl);
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
```

**application.properties 추가**:
```properties
# --- OAuth2 Frontend Callback URL (개선: 외부화) ---
oauth2.frontend-callback-url=http://localhost:3000/auth/callback
```

**application-prod.properties**:
```properties
oauth2.frontend-callback-url=${OAUTH2_FRONTEND_CALLBACK_URL:https://your-domain.com/auth/callback}
```

**개선 효과**:
- ✅ 환경별로 다른 콜백 URL 설정 가능
- ✅ 프로덕션 배포 시 코드 수정 불필요
- ✅ 환경변수로 동적 설정 지원

---

#### A-3. CORS 설정 프로파일 분리
**파일**: 
- [SecurityConfig.java](../../../backend/src/main/java/com/wootae/backend/global/auth/SecurityConfig.java)
- [application.properties](../../../backend/src/main/resources/application.properties)
- [application-prod.properties](../../../backend/src/main/resources/application-prod.properties) (신규)

**변경 내용**:
```java
// [개선] CORS 설정을 프로파일별로 분리
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final Environment environment;
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // [개선] CORS 설정을 프로파일별로 분리 (@Value 사용)
        String allowedOrigins = environment.getProperty("cors.allowed-origins", "*");
        
        if ("*".equals(allowedOrigins)) {
            // dev 환경: 모든 도메인 허용
            configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
        } else {
            // prod 환경: 화이트리스트 기반 도메인만 허용
            List<String> origins = Arrays.asList(allowedOrigins.split(","));
            configuration.setAllowedOrigins(origins);
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

**application.properties**:
```properties
# --- CORS (개선: 프로파일별 설정, dev 기본값) ---
cors.allowed-origins=*
```

**application-prod.properties** (신규):
```properties
# --- CORS (프로덕션: 화이트리스트 기반 도메인만 허용) ---
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:https://your-domain.com,https://api.your-domain.com}
```

**개선 효과**:
- ✅ 개발 환경에서는 모든 도메인 허용으로 개발 편의성
- ✅ 프로덕션에서는 화이트리스트 기반으로 보안 강화
- ✅ 프로파일별로 다른 CORS 정책 적용

---

## 📋 Phase 3: 코드 품질 개선 (진행 예정)

### B-1. UserProfile & OAuthAttributesExtractor 클래스 분리
**대상 파일**: CustomOAuth2UserService.java → 신규 파일로 분리

**작업 내용**:
1. `UserProfile.java` (신규) - 독립적인 DTO 클래스로 추출
2. `OAuthAttributesExtractor.java` (신규) - 유틸리티 클래스로 분리

**예상 효과**:
- 클래스 복잡도 감소
- 테스트 작성 용이성 증대
- 코드 재사용성 향상

---

### B-4. UserController 조회 최적화
**대상 파일**: UserController.java

**작업 내용**:
- Optional 체이닝 추가
- 로깅 추가 (액세스 요청 기록)

---

### B-5. 로깅 강화
**대상 파일**: 관련 서비스/필터 전체

**작업 내용**:
- 모든 주요 클래스에 @Slf4j 추가 (이미 일부 완료)
- 주요 메서드 진입/종료 로깅
- 보안 이벤트 로깅

---

## 📋 Phase 4: 테스트 코드 작성 (진행 예정)

### C-1. JwtAuthenticationFilterTest (신규)
**테스트 시나리오** (4가지):
```
1. testValidToken() - 정상 JWT 토큰 → SecurityContext 설정 확인
2. testExpiredToken() - 만료된 토큰 → 필터 통과하지만 권한 없음
3. testInvalidToken() - 잘못된 토큰 → 필터 통과하지만 권한 없음
4. testMissingHeader() - Authorization 헤더 없음 → 필터 통과하지만 권한 없음
```

---

### C-2. CustomOAuth2UserServiceTest (신규)
**테스트 시나리오** (5가지):
```
1. testLoadUserWithNaver() - 정상 Naver 응답 → 신규 사용자 생성
2. testLoadUserWithGoogle() - 정상 Google 응답 → 신규 사용자 생성
3. testUpdateExistingUser() - 기존 사용자 → 닉네임/이메일 업데이트
4. testInvalidResponse() - null 응답 → 예외 발생
5. testMissingFields() - 필드 누락 → 예외 발생
```

---

### C-3. OAuth2AuthenticationSuccessHandlerTest (신규)
**테스트 시나리오** (3가지):
```
1. testTokenGeneration() - JWT 토큰 생성 확인
2. testRedirectUrl() - 콜백 URL로 리다이렉트 확인
3. testTokenInResponse() - 토큰이 URL에 포함되었는지 확인
```

---

### C-4. UserControllerTest (강화)
**테스트 시나리오** (3가지):
```
1. testUnauthorizedAccess() - 토큰 없이 접근 → 401 Unauthorized
2. testGetMeWithValidToken() - 유효한 토큰 → 200 + 사용자 정보
3. testRefreshToken() - 토큰 갱신 → 새로운 토큰 발급
```

**목표**: 테스트 커버리지 80% 이상

---

## 📋 Phase 5: 기술 문서화 (진행 예정)

### 5-1. README_BACKEND_AUTH.md
**내용**:
- 인증 시스템 아키텍처
- 주요 클래스 설명
- 개발 환경 설정
- Troubleshooting

---

### 5-2. API_SPECIFICATION_AUTH.md
**내용**:
- `/api/user/me` 엔드포인트
- `/api/auth/token/refresh` 엔드포인트
- OAuth2 플로우
- curl 예시

---

### 5-3. SECURITY_GUIDELINES.md
**내용**:
- JWT 토큰 저장 방법
- CSRF 보호
- CORS 정책
- 프로덕션 배포 체크리스트

---

### 5-4. DESIGN_VS_IMPLEMENTATION.md
**내용**:
- design_spec_backend.md 항목별 구현 상태
- 명세 준수 확인
- 개선 사항 설명

---

## 🎯 최종 검수 기준

- [ ] Phase 1~3 리팩토링 완료
- [ ] Phase 4 테스트 커버리지 80% 이상
- [ ] Phase 5 기술 문서 완성
- [ ] `./gradlew clean build` 성공
- [ ] `./gradlew clean test` 모든 테스트 통과
- [ ] API 응답/에러 코드 변경 없음 (외부 계약 유지)

---

**작성**: Claude AI  
**상태**: Phase 1-2 완료, Phase 3-5 진행 중  
**다음**: Perplexity 최종 검증
