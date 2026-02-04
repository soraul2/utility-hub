# MysticTarot 테스트 수정 보고서

## 개요

- **작성일**: 2026-02-04
- **작성팀**: Claude Team
- **버전**: v1.0.1
- **상태**: ✅ 완료 및 검증됨

---

## 1. 문제 상황

### 1.1 Gemini 팀 보고 내용

Gemini 팀에서 MysticTarot 백엔드 구현 중 다음 이슈를 발견하여 Claude 팀에 전달:

1. **컴파일 에러**: `UserRole.ADMIN` → `UserRole.ROLE_ADMIN` 수정으로 해결됨
2. **테스트 실패**: `TarotControllerTest` 실행 시 `IllegalStateException` 발생
   - Spring Context 로드 에러
   - `SecurityConfig`에서 주입받는 보안 관련 빈들이 테스트 환경에서 모킹되지 않음

### 1.2 에러 메시지

```
IllegalStateException: Failed to load ApplicationContext
Caused by: UnsatisfiedDependencyException: Error creating bean with name 'filterChain'
Caused by: NoSuchBeanDefinitionException: No qualifying bean of type 'JwtTokenService'
```

---

## 2. 근본 원인 분석

### 2.1 의존성 체인 문제

```
@WebMvcTest(TarotController.class)
    ↓
SecurityConfig 로드 시도
    ↓
JwtAuthenticationFilter 주입 필요
    ↓
JwtTokenService 주입 필요
    ↓
${spring.jwt.secret} 프로퍼티 주입 실패 ❌
    ↓
전체 컨텍스트 로드 실패
```

### 2.2 누락된 테스트 프로퍼티

**파일**: `backend/src/test/resources/application.properties`

누락된 항목:
- `spring.jwt.secret` (필수 - JwtTokenService 생성자)
- `spring.jwt.access-token-expiry`
- `spring.jwt.refresh-token-expiry`
- `oauth2.frontend-callback-url`
- OAuth2 클라이언트 등록 설정

### 2.3 테스트 설정 문제

`TarotControllerTest`에서:
- `JwtTokenService` 모킹이 누락됨
- Security 필터가 활성화되어 CSRF 토큰 검증 실패

---

## 3. 수정 내용

### 3.1 테스트 application.properties 수정

**파일**: `backend/src/test/resources/application.properties`

**추가된 설정**:

```properties
# JWT Configuration for Testing
spring.jwt.secret=test-secret-key-for-unit-testing-only-minimum-32-characters-required
spring.jwt.access-token-expiry=3600000
spring.jwt.refresh-token-expiry=1209600000

# OAuth2 Configuration for Testing
oauth2.frontend-callback-url=http://localhost:3000/auth/callback

# OAuth2 Client Registration for Testing (dummy values)
spring.security.oauth2.client.registration.google.client-id=test-google-client-id
spring.security.oauth2.client.registration.google.client-secret=test-google-client-secret
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.naver.client-id=test-naver-client-id
spring.security.oauth2.client.registration.naver.client-secret=test-naver-client-secret
spring.security.oauth2.client.registration.naver.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.naver.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.provider.naver.authorization-uri=https://nid.naver.com/oauth2.0/authorize
spring.security.oauth2.client.provider.naver.token-uri=https://nid.naver.com/oauth2.0/token
spring.security.oauth2.client.provider.naver.user-info-uri=https://openapi.naver.com/v1/nid/me
spring.security.oauth2.client.provider.naver.user-name-attribute=response

# CORS Configuration for Testing
cors.allowed-origins=*
```

### 3.2 TarotControllerTest 수정

**파일**: `backend/src/test/java/com/wootae/backend/domain/tarot/controller/TarotControllerTest.java`

**변경사항**:

1. **중복 import 제거**:
```java
// Before (중복)
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.enums.TarotAssistantType;
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.enums.TarotAssistantType;

// After (정리됨)
import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.enums.TarotAssistantType;
```

2. **JwtTokenService 모킹 추가**:
```java
import com.wootae.backend.global.auth.JwtTokenService;

// ...

@MockitoBean
private JwtTokenService jwtTokenService;
```

3. **Security 필터 비활성화**:
```java
@WebMvcTest(TarotController.class)
@AutoConfigureMockMvc(addFilters = false)  // 추가됨
class TarotControllerTest {
```

---

## 4. 검증 결과

### 4.1 TarotControllerTest 실행

```bash
./gradlew test --tests "TarotControllerTest"
```

**결과**: ✅ 성공
- `createThreeCardReading_Success()` - 통과
- `getDailyCard_Success()` - 통과

### 4.2 전체 테스트 실행

```bash
./gradlew test
```

**결과**: ✅ 성공 (26개 테스트 모두 통과)

---

## 5. 폴더 구조 변경

### 5.1 claudeGuide 폴더 재구성

**이전**:
```
claudeGuide/
└── MysticTarot/
    ├── README.md (TextToMd 관련)
    ├── handover_10_persona_expansion.md
    ├── perplexity_action_items.md
    └── refactoring_guide.md
```

**이후**:
```
claudeGuide/
├── MysticTarot/           # MysticTarot 전용
│   └── tarot_test_fix_report.md
├── TextToMd/              # TextToMd 관련 문서 이동
│   ├── README.md
│   ├── handover_10_persona_expansion.md
│   ├── perplexity_action_items.md
│   └── refactoring_guide.md
└── User/                  # 기존 유지
```

---

## 6. 향후 테스트 작성 가이드라인

### 6.1 @WebMvcTest 사용 시 체크리스트

1. **필수 모킹 빈 목록**:
   - `JwtAuthenticationFilter`
   - `JwtTokenService`
   - `CustomOAuth2UserService`
   - `OAuth2AuthenticationSuccessHandler`
   - `JpaMetamodelMappingContext`
   - 테스트 대상 컨트롤러가 사용하는 서비스/리포지토리

2. **Security 필터 비활성화** (권장):
   ```java
   @AutoConfigureMockMvc(addFilters = false)
   ```

3. **CSRF 처리** (필터 활성화 시):
   ```java
   import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

   mockMvc.perform(post("/api/...")
       .with(csrf())
       .contentType(MediaType.APPLICATION_JSON)
       .content(json))
   ```

### 6.2 @SpringBootTest 사용 시 체크리스트

1. 테스트 `application.properties`에 모든 필수 프로퍼티 정의
2. OAuth2 클라이언트 더미 설정 포함
3. JWT 시크릿 키 설정 (최소 32자)

---

## 7. 수정된 파일 목록

| 파일 | 변경 유형 | 설명 |
|------|----------|------|
| `backend/src/test/resources/application.properties` | 수정 | JWT, OAuth2 테스트 프로퍼티 추가 |
| `backend/src/test/java/.../TarotControllerTest.java` | 수정 | JwtTokenService 모킹, 필터 비활성화 |
| `backend/src/main/java/.../TarotController.java` | 수정 | findByEmail → findById 변경 (History 500 에러 수정) |
| `backendAiGuide/claudeGuide/MysticTarot/` | 재구성 | TextToMd 문서 분리, 보고서 추가 |

---

## 8. History API 500 에러 수정

### 8.1 문제 상황

프론트엔드에서 `http://localhost:5173/tarot/history` 접근 시 **500 Internal Server Error** 발생

### 8.2 근본 원인

**CustomOAuth2UserService.java:54**에서 OAuth2 로그인 시 username 속성을 `userId`로 설정:
```java
return new DefaultOAuth2User(
    Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())),
    customAttributes,
    "userId");  // ← username이 userId(숫자)로 설정됨
```

**TarotController.java**에서는 이 username을 이메일로 간주하고 검색:
```java
User user = userRepository.findByEmail(userDetails.getUsername())  // ← userId를 이메일로 검색
    .orElseThrow(() -> new RuntimeException("User not found"));
```

**결과**: 사용자를 찾지 못해 `RuntimeException` 발생 → 500 에러

### 8.3 수정 내용

**파일**: `backend/src/main/java/com/wootae/backend/domain/tarot/controller/TarotController.java`

**모든 인증 관련 메서드 수정** (5개 위치):
- `createThreeCardReading` (Line 43-54)
- `getDailyCard` (Line 64-75)
- `getHistory` (Line 99-109)
- `deleteReading` (Line 114-126)
- `migrateData` (Line 136-151)

**수정 패턴**:
```java
// Before (잘못된 방식)
User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);

// After (수정된 방식)
try {
    Long userId = Long.parseLong(userDetails.getUsername());
    User user = userRepository.findById(userId).orElse(null);
    // ...
} catch (NumberFormatException e) {
    // username이 숫자가 아닌 경우 (이메일 등) 무시
}
```

### 8.4 검증 결과

**단위 테스트**:
```bash
./gradlew test
```
**결과**: ✅ 성공 (26개 테스트 모두 통과)

**통합 테스트 (프론트엔드)**:
1. 백엔드 서버 시작: `Tomcat started on port 8080`
2. 프론트엔드에서 `http://localhost:5173/tarot/history` 접근
3. **결과**: ✅ 정상 작동 확인

---

## 9. 참고 자료

- [Spring Security Testing Documentation](https://docs.spring.io/spring-security/reference/servlet/test/index.html)
- [collaborationGuide/final_collaboration_guide_backend.md](../../collaborationGuide/final_collaboration_guide_backend.md)
- [geminiGuide/MysticTarot/walkthrough.md](../../geminiGuide/MysticTarot/walkthrough.md)
