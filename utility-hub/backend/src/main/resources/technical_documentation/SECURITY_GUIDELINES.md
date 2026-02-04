# OAuth2+JWT 보안 가이드라인

## 목차
1. [개요](#개요)
2. [토큰 관리](#토큰-관리)
3. [CSRF 방어](#csrf-방어)
4. [CORS 설정](#cors-설정)
5. [입력 검증](#입력-검증)
6. [배포 체크리스트](#배포-체크리스트)
7. [운영 중 모니터링](#운영-중-모니터링)

---

## 개요

### 보안 원칙
1. **최소 권한**: 사용자는 필요한 권한만 부여
2. **심층 방어**: 다층적 보안 메커니즘 구현
3. **감사 로깅**: 모든 인증 시도 기록
4. **정기 검토**: 주기적 보안 업데이트 및 취약점 점검

### 위협 모델
- **토큰 탈취**: XSS, 로컬스토리지 유출
- **CSRF 공격**: 사용자 모르게 요청 수행
- **중간자 공격**: HTTP 사용 시 토큰 패킷 탈취
- **브루트 포스**: 대량 로그인 시도
- **인젝션 공격**: SQL, JWT 페이로드 조작

---

## 토큰 관리

### 1. 토큰 저장 방식

#### ❌ 안전하지 않은 방식: localStorage
```javascript
// 위험: XSS 공격 시 토큰 탈취 가능
localStorage.setItem('accessToken', token);
```

**위험성**:
- XSS 취약점으로 JavaScript 실행 시 탈취 가능
- 브라우저 개발자 도구에서 직접 확인 가능

#### ✅ 권장 방식: HttpOnly Secure 쿠키
```java
// 백엔드에서 쿠키 설정
Cookie cookie = new Cookie("accessToken", token);
cookie.setHttpOnly(true);      // JavaScript에서 접근 불가
cookie.setSecure(true);        // HTTPS만 전송
cookie.setPath("/");
cookie.setMaxAge(3600);        // 1시간
response.addCookie(cookie);
```

**장점**:
- JavaScript에서 접근 불가 (XSS 방어)
- 자동으로 모든 요청에 포함 (CSRF 토큰 필요)
- Secure 플래그로 HTTPS만 전송

#### 하이브리드 방식: 이중 토큰
```javascript
// 1. HttpOnly 쿠키: accessToken (자동 전송)
// 2. localStorage: refreshToken (수동 관리, CSRF 토큰)

// 갱신 요청 시 CSRF 토큰 함께 전송
fetch('/api/auth/token/refresh', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': localStorage.getItem('csrfToken')
  },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});
```

---

### 2. 토큰 만료 전략

#### Access Token (단기)
```properties
spring.jwt.access-token-expiry=3600000  # 1시간

권장값:
- 높은 보안 필요: 15분 (900000)
- 일반적 용도: 1시간 (3600000)
- 낮은 보안 필요: 2시간 (7200000)
```

#### Refresh Token (장기)
```properties
spring.jwt.refresh-token-expiry=1209600000  # 14일

권장값:
- 높은 보안 필요: 7일 (604800000)
- 일반적 용도: 14일 (1209600000)
- 낮은 보안 필요: 30일 (2592000000)
```

#### 토큰 갱신 흐름
```
1. Access Token 만료 감지
   ↓
2. Refresh Token으로 갱신 요청
   ↓
3. 새 Access Token 발급
   ↓
4. 자동으로 재시도
```

---

### 3. 토큰 무효화 (로그아웃)

#### 구현 방식 1: 블랙리스트
```java
// Redis에 로그아웃한 토큰 저장
@Component
public class TokenBlacklist {
    private final RedisTemplate<String, Boolean> redisTemplate;
    
    public void addToBlacklist(String token, long expiryTime) {
        String key = "blacklist:" + token;
        redisTemplate.opsForValue().set(key, true, expiryTime, TimeUnit.MILLISECONDS);
    }
    
    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(
            redisTemplate.hasKey("blacklist:" + token)
        );
    }
}
```

#### 구현 방식 2: 토큰 버전
```java
@Entity
public class User {
    private Long tokenVersion;  // 증가할 때마다 이전 토큰 무효화
    
    public void logout() {
        this.tokenVersion++;  // 모든 토큰 무효화
    }
}

// JWT에 tokenVersion 포함
// 검증 시 DB의 tokenVersion과 비교
```

---

## CSRF 방어

### 1. SameSite 쿠키 속성

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(basic -> basic.disable());
        return http.build();
    }
}
```

**SameSite 설정**:
```properties
# 개발 환경
server.servlet.session.cookie.same-site=lax

# 운영 환경 (권장)
server.servlet.session.cookie.same-site=strict
```

| 값 | 설명 | 보안성 |
|-----|------|--------|
| Strict | 다른 사이트에서 쿠키 전송 안함 | ⭐⭐⭐ 최고 |
| Lax | 최상위 네비게이션만 허용 | ⭐⭐ 중간 |
| None | 모든 요청에서 전송 (Secure 필수) | ⭐ 낮음 |

### 2. CSRF 토큰 (선택적)

```java
@PostMapping("/api/auth/logout")
public ResponseEntity<Void> logout(
        @RequestHeader("X-CSRF-Token") String csrfToken) {
    
    // CSRF 토큰 검증
    if (!csrfTokenService.isValid(csrfToken)) {
        throw new SecurityException("Invalid CSRF token");
    }
    
    // 로그아웃 처리
    return ResponseEntity.ok().build();
}
```

---

## CORS 설정

### 1. 프로필별 CORS 설정

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource(Environment env) {
        CorsConfiguration config = new CorsConfiguration();
        
        // 환경별 허용 도메인
        String allowedOrigins = env.getProperty("cors.allowed-origins");
        if ("*".equals(allowedOrigins)) {
            // 개발 환경: 모든 도메인 허용
            config.setAllowedOriginPatterns(Collections.singletonList("*"));
        } else {
            // 운영 환경: 화이트리스트만 허용
            List<String> origins = Arrays.asList(allowedOrigins.split(","));
            config.setAllowedOrigins(origins);
        }
        
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### 2. 환경별 설정값

**개발 환경** (application.properties):
```properties
cors.allowed-origins=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
```

**운영 환경** (application-prod.properties):
```properties
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:https://yourdomain.com}
```

### 3. 프리플라이트 요청 처리

```
OPTIONS /api/user/me HTTP/1.1
Host: api.yourdomain.com
Origin: https://yourdomain.com
Access-Control-Request-Method: GET
Access-Control-Request-Headers: Authorization

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Authorization
Access-Control-Allow-Credentials: true
```

---

## 입력 검증

### 1. OAuth2 속성 검증

```java
@Slf4j
public class OAuthAttributesExtractor {
    
    public static UserProfile extract(String registrationId, Map<String, Object> attributes) {
        // [개선] null 및 공백 검증
        if (attributes == null || attributes.isEmpty()) {
            throw new IllegalArgumentException("OAuth2 속성이 없습니다");
        }
        
        if ("naver".equals(registrationId)) {
            return extractNaverProfile(attributes);
        } else if ("google".equals(registrationId)) {
            return extractGoogleProfile(attributes);
        }
        
        throw new IllegalArgumentException("지원하지 않는 제공자: " + registrationId);
    }
    
    private static UserProfile extractNaverProfile(Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        
        if (response == null) {
            throw new IllegalArgumentException("네이버 응답 객체가 없습니다");
        }
        
        String id = (String) response.get("id");
        
        // null 및 공백 검증
        if (id == null || id.isBlank()) {
            log.warn("네이버 사용자 ID 누락: {}", response);
            throw new IllegalArgumentException("네이버 제공자 ID 누락");
        }
        
        String nickname = (String) response.get("nickname");
        String email = (String) response.get("email");
        
        return new UserProfile(id, nickname, email, AuthProvider.NAVER);
    }
    
    private static UserProfile extractGoogleProfile(Map<String, Object> attributes) {
        String id = (String) attributes.get("sub");
        
        if (id == null || id.isBlank()) {
            log.warn("구글 사용자 ID 누락: {}", attributes);
            throw new IllegalArgumentException("구글 제공자 ID 누락");
        }
        
        String name = (String) attributes.get("name");
        String email = (String) attributes.get("email");
        
        return new UserProfile(id, name, email, AuthProvider.GOOGLE);
    }
}
```

### 2. JWT 토큰 검증

```java
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");
            
            // 검증 1: 헤더 존재 여부
            if (authHeader == null || authHeader.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }
            
            // 검증 2: Bearer 형식
            if (!authHeader.startsWith("Bearer ")) {
                log.warn("잘못된 Bearer 형식: {}", authHeader.substring(0, Math.min(20, authHeader.length())));
                filterChain.doFilter(request, response);
                return;
            }
            
            // 검증 3: 토큰 추출
            String token = authHeader.substring(7);
            if (token.isBlank()) {
                log.warn("빈 토큰 값");
                filterChain.doFilter(request, response);
                return;
            }
            
            // 검증 4: JWT 검증
            if (jwtTokenService.validateToken(token)) {
                Long userId = jwtTokenService.getUserIdFromToken(token);
                // SecurityContext 설정
                log.debug("JWT 토큰 검증 성공: userId={}", userId);
            } else {
                log.warn("JWT 토큰 검증 실패");
            }
            
        } catch (Exception e) {
            log.error("JWT 필터 처리 중 오류", e);
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

## 배포 체크리스트

### 1. 사전 배포 확인

- [ ] **HTTPS 설정**
  ```bash
  # SSL/TLS 인증서 설치
  # Spring Boot application.properties에 포트 8443 설정
  server.ssl.key-store=classpath:keystore.p12
  server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}
  ```

- [ ] **환경 변수 설정**
  ```bash
  export JWT_SECRET=your-very-long-secret-key-min-256-bits
  export JWT_ACCESS_EXPIRY=3600000
  export JWT_REFRESH_EXPIRY=1209600000
  export OAUTH2_CALLBACK_URL=https://yourdomain.com/auth/callback
  export CORS_ALLOWED_ORIGINS=https://yourdomain.com
  ```

- [ ] **데이터베이스 초기화**
  ```bash
  # users 테이블 생성
  CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255),
    nickname VARCHAR(255) NOT NULL,
    provider ENUM('NAVER', 'GOOGLE') NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    role ENUM('ROLE_USER', 'ROLE_ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_provider_id (provider, provider_id)
  );
  ```

- [ ] **로깅 설정**
  ```properties
  logging.level.root=WARN
  logging.level.com.wootae.backend.security=INFO
  logging.level.com.wootae.backend.domain=INFO
  logging.file.name=/var/log/backend/app.log
  logging.file.max-size=10MB
  logging.file.max-history=30
  ```

- [ ] **모니터링 도구**
  - [ ] CloudWatch / ELK Stack 설정
  - [ ] 로그 수집 및 분석
  - [ ] 알림 규칙 설정

### 2. 배포 후 검증

- [ ] **엔드포인트 테스트**
  ```bash
  # 사용자 정보 조회 (유효한 토큰)
  curl -H "Authorization: Bearer {token}" https://api.yourdomain.com/api/user/me
  
  # 사용자 정보 조회 (유효하지 않은 토큰)
  curl -H "Authorization: Bearer invalid" https://api.yourdomain.com/api/user/me
  
  # CORS 테스트
  curl -H "Origin: https://yourdomain.com" -X OPTIONS https://api.yourdomain.com/api/user/me
  ```

- [ ] **보안 헤더 확인**
  ```bash
  curl -I https://api.yourdomain.com/api/user/me
  # 확인 항목:
  # - Strict-Transport-Security
  # - X-Content-Type-Options: nosniff
  # - X-Frame-Options: DENY
  # - Content-Security-Policy
  ```

- [ ] **SSL/TLS 검증**
  ```bash
  openssl s_client -connect api.yourdomain.com:443
  # 인증서 유효 기간 확인
  ```

---

## 운영 중 모니터링

### 1. 주요 모니터링 항목

| 항목 | 임계값 | 액션 |
|------|--------|------|
| 401 오류 비율 | > 5% | 토큰 만료 증가 확인 |
| 토큰 갱신 요청 | > 1000/분 | 성능 저하 모니터링 |
| OAuth2 실패율 | > 2% | 제공자 연동 상태 확인 |
| 응답 시간 | > 1000ms | 데이터베이스 성능 확인 |
| CPU 사용률 | > 80% | 수평 확장 고려 |
| 메모리 사용률 | > 85% | 힙 사이즈 조정 |

### 2. 로그 모니터링

```bash
# 401 오류 증가 감지
tail -f /var/log/backend/app.log | grep "401\|Unauthorized"

# JWT 토큰 검증 실패
tail -f /var/log/backend/app.log | grep "JWT.*failed\|Invalid.*signature"

# OAuth2 인증 실패
tail -f /var/log/backend/app.log | grep "OAuth2.*failed\|ClientAuthentication"
```

### 3. 정기 보안 점검

**월간**:
- [ ] 의존성 업데이트 확인
- [ ] 보안 취약점 스캔
- [ ] 토큰 만료 정책 검토

**분기별**:
- [ ] 사용자 접근 로그 감사
- [ ] 이상 로그인 탐지
- [ ] 권한 설정 검토

**연간**:
- [ ] 보안 감사 (내부/외부)
- [ ] 침투 테스트
- [ ] 재해 복구 테스트

---

## 비상 대응 (Incident Response)

### 토큰 탈취 의심 시

```bash
# 1. 즉시 모든 사용자 토큰 무효화
UPDATE users SET token_version = token_version + 1;

# 2. 로그인 기록 확인
SELECT * FROM audit_log WHERE event='LOGIN' AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

# 3. 비정상 접근 차단
# 방화벽에서 의심 IP 차단

# 4. JWT_SECRET 변경
# 환경 변수 재설정 후 재배포
```

### 데이터 유출 의심 시

```bash
# 1. 감사 로그 분석
SELECT * FROM audit_log WHERE event IN ('SELECT', 'EXPORT') 
  AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR);

# 2. 의심 사용자 계정 잠금
UPDATE users SET locked = true WHERE id IN (...);

# 3. 인시던트 보고
# 보안팀 및 고객 알림
```

---

## 참고 자료

- [OWASP Top 10](https://owasp.org/Top10/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [NIST Cybersecurity](https://csrc.nist.gov/)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
