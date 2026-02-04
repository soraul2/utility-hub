# OAuth2+JWT 백엔드 인증 시스템 아키텍처 가이드

## 목차
1. [시스템 개요](#시스템-개요)
2. [아키텍처](#아키텍처)
3. [핵심 클래스](#핵심-클래스)
4. [설정 가이드](#설정-가이드)
5. [사용 흐름](#사용-흐름)
6. [문제 해결](#문제-해결)

---

## 시스템 개요

### 목적
Spring Boot 6.x + Spring Security 6.x 환경에서 OAuth2 기반의 소셜 로그인(네이버, 구글)과 JWT 토큰을 이용한 상태 비저장(Stateless) 인증 시스템 구현.

### 주요 특징
- **OAuth2 소셜 로그인**: Naver, Google 제공자 지원
- **JWT 토큰**: Access Token (1시간) + Refresh Token (14일)
- **외부 설정**: 환경별 설정값 외부화 (@Value, application.properties)
- **보안**: 입력 검증, 예외 처리, CORS 설정 분리
- **로깅**: 인증 흐름 추적 및 모니터링 (@Slf4j)

### 기술 스택
- **Framework**: Spring Boot 3.2.x
- **Security**: Spring Security 6.x
- **OAuth2**: Spring Security OAuth2 Client
- **JWT**: io.jsonwebtoken:jjwt
- **ORM**: Spring Data JPA + MySQL
- **Build**: Gradle 8.x

---

## 아키텍처

### 레이어 구조
```
┌─────────────────────────────────────┐
│  Frontend (React/Vite)              │
│  - OAuth2 로그인 페이지             │
│  - JWT 토큰 저장 (localStorage)    │
└──────────────┬──────────────────────┘
               │ OAuth2 code
┌──────────────▼──────────────────────┐
│  Security Layer                     │
│  - OAuth2AuthenticationSuccessHandler│
│  - JwtAuthenticationFilter          │
│  - SecurityConfig                   │
└──────────────┬──────────────────────┘
               │ Access/Refresh Token
┌──────────────▼──────────────────────┐
│  Service Layer                      │
│  - AuthService                      │
│  - JwtTokenService                  │
│  - CustomOAuth2UserService          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Data Access Layer                  │
│  - UserRepository                   │
│  - User Entity                      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Database (MySQL)                   │
│  - users 테이블                     │
└─────────────────────────────────────┘
```

### 인증 흐름
```
1. 사용자 로그인 (OAuth2)
   ↓
2. /oauth2/authorization/{provider}로 리다이렉트
   ↓
3. 제공자(Naver/Google) 로그인
   ↓
4. Authorization Code 획득
   ↓
5. OAuth2AuthenticationSuccessHandler 실행
   ├─ 사용자 정보 추출 (OAuthAttributesExtractor)
   ├─ UserProfile DTO 생성
   ├─ User 엔티티 생성 또는 업데이트
   └─ JWT 토큰 발급
   ↓
6. 프론트엔드로 콜백 URL 리다이렉트
   ├─ ?accessToken=...&refreshToken=...
   └─ localStorage에 저장
   ↓
7. API 호출 시 Authorization 헤더에 토큰 포함
   ↓
8. JwtAuthenticationFilter에서 토큰 검증
   ├─ Bearer 형식 확인
   ├─ 서명 및 만료 시간 검증
   └─ SecurityContext에 인증 정보 설정
   ↓
9. API 요청 처리
```

---

## 핵심 클래스

### 1. SecurityConfig.java
**역할**: Spring Security 설정 및 CORS 설정

```java
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    // CORS 설정 (프로필별 분리)
    // - dev: 모든 도메인 허용
    // - prod: 화이트리스트 기반
    
    // OAuth2 로그인 설정
    // - 제공자: naver, google
    // - 인가 엔드포인트
    // - 토큰 엔드포인트
    
    // JWT 필터 등록
    // - JwtAuthenticationFilter 체인에 추가
}
```

**주요 설정**:
- `cors.allowed-origins`: 프로필별 CORS 허용 도메인
- `oauth2.frontend-callback-url`: 프론트엔드 콜백 URL
- Filter Chain: CORS → OAuth2 → JWT Filter

---

### 2. JwtTokenService.java
**역할**: JWT 토큰 생성, 검증, 정보 추출

```java
@Component
@Slf4j
public class JwtTokenService {
    
    // 토큰 생성
    public String createAccessToken(Authentication auth);
    public String createRefreshToken(Authentication auth);
    
    // 토큰 검증
    public boolean validateToken(String token);
    public Long getUserIdFromToken(String token);
    
    // 기본값 (application.properties에서 외부화)
    private static final long ACCESS_TOKEN_EXPIRY = 3600000;      // 1시간
    private static final long REFRESH_TOKEN_EXPIRY = 1209600000;  // 14일
}
```

**외부 설정**:
- `spring.jwt.secret`: JWT 서명 키
- `spring.jwt.access-token-expiry`: 액세스 토큰 만료 시간 (ms)
- `spring.jwt.refresh-token-expiry`: 리프레시 토큰 만료 시간 (ms)

---

### 3. JwtAuthenticationFilter.java
**역할**: 모든 요청의 JWT 토큰 검증

```java
@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) {
        try {
            // 1. Authorization 헤더 추출
            String authHeader = request.getHeader("Authorization");
            
            // 2. Bearer 토큰 파싱
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                
                // 3. 토큰 검증
                if (jwtTokenService.validateToken(token)) {
                    // 4. SecurityContext 설정
                    Long userId = jwtTokenService.getUserIdFromToken(token);
                    // ... Authentication 생성 및 설정
                }
            }
        } catch (Exception e) {
            // [개선] 예외 처리 및 로깅
            log.warn("JWT 토큰 검증 실패", e);
        }
        
        // 5. 다음 필터로 진행
        filterChain.doFilter(request, response);
    }
}
```

**검증 단계**:
1. Authorization 헤더 존재 확인
2. Bearer 스키마 확인
3. JWT 시그니처 검증
4. 토큰 만료 시간 검증
5. SecurityContext 설정

---

### 4. CustomOAuth2UserService.java
**역할**: OAuth2 사용자 정보 로드 및 저장

```java
@Service
@Slf4j
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User oauth2User = super.loadUser(userRequest);
        
        // 1. 제공자별 사용자 정보 추출 (OAuthAttributesExtractor 이용)
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        UserProfile userProfile = OAuthAttributesExtractor.extract(
            registrationId, 
            oauth2User.getAttributes()
        );
        
        // 2. 사용자 저장 또는 업데이트
        User user = userRepository.findByProviderAndProviderId(
            userProfile.getProvider(), 
            userProfile.getProviderId()
        ).orElseGet(() -> userRepository.save(userProfile.toEntity()));
        
        // 3. 사용자 정보 갱신
        user.update(userProfile.getNickname(), userProfile.getEmail());
        
        return new DefaultOAuth2User(
            oauth2User.getAuthorities(),
            userProfile.toEntity().getEmail() != null ? 
                Map.of("email", userProfile.toEntity().getEmail()) : 
                Map.of(),
            "email"
        );
    }
}
```

**처리 흐름**:
1. OAuth2 제공자에서 사용자 정보 수신
2. `OAuthAttributesExtractor`로 필드 매핑
3. 기존 사용자 조회 또는 신규 생성
4. 사용자 정보 갱신 (닉네임, 이메일)
5. OAuth2User 래핑 후 반환

---

### 5. OAuthAttributesExtractor.java [개선]
**역할**: 제공자별 사용자 속성 추출 유틸리티

```java
@Slf4j
public class OAuthAttributesExtractor {
    
    public static UserProfile extract(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return extractNaverProfile(attributes);
        } else if ("google".equals(registrationId)) {
            return extractGoogleProfile(attributes);
        }
        throw new IllegalArgumentException("지원하지 않는 제공자: " + registrationId);
    }
    
    private static UserProfile extractNaverProfile(Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        
        String id = (String) response.get("id");
        String nickname = (String) response.get("nickname");
        String email = (String) response.get("email");
        
        // [개선] null 및 공백 검증
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("네이버 제공자 ID 누락");
        }
        
        return new UserProfile(id, nickname, email, AuthProvider.NAVER);
    }
    
    private static UserProfile extractGoogleProfile(Map<String, Object> attributes) {
        String id = (String) attributes.get("sub");
        String name = (String) attributes.get("name");
        String email = (String) attributes.get("email");
        
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("구글 제공자 ID 누락");
        }
        
        return new UserProfile(id, name, email, AuthProvider.GOOGLE);
    }
}
```

**기능**:
- Naver: response 필드 추출
- Google: 최상위 필드 추출
- null/공백 검증
- 제공자별 필드명 매핑

---

### 6. UserProfile.java [개선]
**역할**: OAuth2 사용자 프로필 DTO

```java
@Getter
@AllArgsConstructor
public class UserProfile {
    private final String providerId;
    private final String nickname;
    private final String email;
    private final AuthProvider provider;
    
    // User 엔티티로 변환
    public User toEntity() {
        return User.builder()
                .providerId(providerId)
                .nickname(nickname)
                .email(email)
                .provider(provider)
                .role(UserRole.ROLE_USER)
                .build();
    }
}
```

---

### 7. OAuth2AuthenticationSuccessHandler.java
**역할**: OAuth2 로그인 성공 시 JWT 토큰 발급

```java
@Component
@Slf4j
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    // [개선] 콜백 URL 외부화
    @Value("${oauth2.frontend-callback-url:http://localhost:3000/auth/callback}")
    private String callbackUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                       HttpServletResponse response,
                                       Authentication authentication) {
        // 1. JWT 토큰 생성
        String accessToken = jwtTokenService.createAccessToken(authentication);
        String refreshToken = jwtTokenService.createRefreshToken(authentication);
        
        // 2. 콜백 URL 생성 (쿼리 파라미터 포함)
        String targetUrl = UriComponentsBuilder.fromUriString(callbackUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();
        
        // 3. 프론트엔드로 리다이렉트
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
        
        log.info("OAuth2 로그인 성공: {}", callbackUrl);
    }
}
```

---

### 8. AuthController.java
**역할**: 토큰 갱신 엔드포인트

```java
@RestController
@RequestMapping("/api/auth")
@Slf4j
@RequiredArgsConstructor
public class AuthController {
    
    @PostMapping("/token/refresh")
    public ResponseEntity<AuthDto.TokenResponse> refreshToken(
            @RequestBody AuthDto.TokenRefreshRequest request) {
        
        log.debug("토큰 갱신 요청");
        AuthDto.TokenResponse response = authService.refreshToken(request.getRefreshToken());
        
        log.info("토큰 갱신 완료");
        return ResponseEntity.ok(response);
    }
}
```

---

### 9. User.java [개선]
**역할**: 사용자 엔티티

```java
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String nickname;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;
    
    @Column(nullable = false)
    private String providerId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    // [개선] 사용자 정보 업데이트
    public void update(String nickname, String email) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        if (email != null && !email.isBlank()) {
            this.email = email;
        }
    }
}
```

---

## 설정 가이드

### application.properties (개발 환경)
```properties
# JWT 설정
spring.jwt.secret=your-secret-key-min-256-bits-long
spring.jwt.access-token-expiry=3600000
spring.jwt.refresh-token-expiry=1209600000

# OAuth2 설정
oauth2.frontend-callback-url=http://localhost:3000/auth/callback

# CORS 설정
cors.allowed-origins=http://localhost:3000,http://localhost:5173

# OAuth2 제공자 설정
spring.security.oauth2.client.registration.naver.client-id=YOUR_NAVER_CLIENT_ID
spring.security.oauth2.client.registration.naver.client-secret=YOUR_NAVER_CLIENT_SECRET
spring.security.oauth2.client.registration.naver.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.naver.scope=profile,email

spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=profile,email
```

### application-prod.properties (운영 환경)
```properties
# JWT 설정 (환경 변수로 외부화)
spring.jwt.secret=${JWT_SECRET}
spring.jwt.access-token-expiry=${JWT_ACCESS_EXPIRY:3600000}
spring.jwt.refresh-token-expiry=${JWT_REFRESH_EXPIRY:1209600000}

# OAuth2 설정
oauth2.frontend-callback-url=${OAUTH2_CALLBACK_URL}

# CORS 설정 (운영 환경: 특정 도메인만)
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:https://yourdomain.com}

# 로깅 설정
logging.level.com.wootae.backend.security=INFO
logging.level.com.wootae.backend.domain=INFO
```

---

## 사용 흐름

### 시나리오 1: OAuth2 로그인
```
1. 사용자가 "네이버로 로그인" 버튼 클릭
2. POST /oauth2/authorization/naver로 리다이렉트
3. 사용자가 네이버에서 로그인 및 동의
4. Authorization Code를 서버가 수신
5. CustomOAuth2UserService에서 사용자 정보 조회
6. User 엔티티 생성 또는 업데이트
7. OAuth2AuthenticationSuccessHandler에서 JWT 발급
8. 프론트엔드로 리다이렉트 (accessToken, refreshToken 파라미터 포함)
9. 프론트엔드에서 localStorage에 토큰 저장
```

### 시나리오 2: 보호된 API 호출
```
1. 프론트엔드에서 GET /api/user/me 요청
2. Authorization 헤더에 "Bearer {accessToken}" 포함
3. JwtAuthenticationFilter에서 토큰 검증
4. 유효하면 SecurityContext 설정
5. UserController.me() 메서드 실행
6. User 정보 반환 (AuthDto.UserResponse)
```

### 시나리오 3: 토큰 갱신
```
1. accessToken 만료됨
2. 프론트엔드에서 POST /api/auth/token/refresh 요청
3. 요청 본문에 refreshToken 포함
4. AuthService.refreshToken() 실행
5. 새로운 accessToken 생성
6. 새 토큰 반환
```

---

## 문제 해결

### 문제 1: JWT 서명 검증 실패
**증상**: 401 Unauthorized, "Invalid JWT Signature"

**원인**:
- JWT_SECRET이 변경됨
- 다른 서버에서 발급한 토큰
- 토큰이 손상됨

**해결**:
- 모든 서버의 `spring.jwt.secret` 동일 확인
- application-prod.properties 환경 변수 재확인
- 프론트엔드 localStorage 토큰 삭제 후 재로그인

---

### 문제 2: CORS 오류
**증상**: "Access to XMLHttpRequest has been blocked by CORS policy"

**원인**:
- `cors.allowed-origins`에 프론트엔드 도메인 없음
- 요청 헤더의 Origin과 설정값 불일치

**해결**:
```properties
# 개발 환경
cors.allowed-origins=http://localhost:3000,http://localhost:5173

# 운영 환경
cors.allowed-origins=https://yourdomain.com
```

---

### 문제 3: OAuth2 제공자 연동 실패
**증상**: "ClientAuthenticationException" 또는 "400 Bad Request"

**원인**:
- Client ID/Secret 오류
- Redirect URI 미등록
- 승인되지 않은 scope

**해결**:
1. Naver Developer Console에서 Client ID/Secret 재확인
2. 콜백 URL이 정확한지 확인 (oauth2.frontend-callback-url)
3. Scope 권한 확인

---

### 문제 4: 토큰 만료 시간 너무 짧음/길음
**증상**: 사용자가 자주 로그인되거나 오랫동안 로그인 유지

**원인**:
- `spring.jwt.access-token-expiry` 값 부적절

**해결**:
```properties
# 기본값 (권장)
spring.jwt.access-token-expiry=3600000    # 1시간

# 더 짧게 (높은 보안)
spring.jwt.access-token-expiry=900000     # 15분

# 더 길게 (편의성)
spring.jwt.access-token-expiry=7200000    # 2시간
```

---

### 문제 5: 사용자 정보 누락
**증상**: User 엔티티에 nickname 또는 email 없음

**원인**:
- OAuth2 제공자가 필드 제공 안함
- OAuthAttributesExtractor 필드 매핑 오류

**해결**:
```java
// OAuthAttributesExtractor에서 null 체크 추가
if (nickname == null || nickname.isBlank()) {
    nickname = email.split("@")[0];  // 기본값 설정
}
```

---

## 모니터링 및 디버깅

### 로깅 수준 설정
```properties
# 보안 관련 로깅
logging.level.com.wootae.backend.security=DEBUG

# OAuth2 로깅
logging.level.org.springframework.security.oauth2=DEBUG

# JWT 로깅
logging.level.io.jsonwebtoken=DEBUG
```

### 주요 로그 메시지
```
[DEBUG] JWT 토큰 검증: userId=1
[INFO] OAuth2 로그인 성공: callback URL로 리다이렉트=...
[WARN] JWT 토큰 검증 실패: 토큰 만료됨
[INFO] 토큰 갱신 완료: userId=1
```

---

## 참고 자료

- [Spring Security OAuth2 공식 문서](https://spring.io/projects/spring-security)
- [JWT 명세](https://tools.ietf.org/html/rfc7519)
- [Naver OAuth2](https://developers.naver.com/docs/login/overview)
- [Google OAuth2](https://developers.google.com/identity/protocols/oauth2)
