# Phase 0: OAuth2 플로우 수정 완료 보고서

> **작성자**: Claude (Refiner & Editor)
> **작성일**: 2026-02-04
> **버전**: v1.0

---

## 1. 개요

소셜 로그인(네이버/구글) 플로우에서 발생한 치명적 이슈를 해결했습니다.

### 해결된 문제
1. 네이버/구글 버튼 클릭 시 Spring Security 기본 로그인 페이지 노출
2. 소셜 로그인 완료 후 프론트엔드로 리다이렉트되지 않음
3. 네이버 로그인 시 닉네임 null 오류

---

## 2. 수정된 파일

| 파일 | 경로 | 수정 내용 |
|------|------|----------|
| SecurityConfig.java | `global/auth/SecurityConfig.java` | OAuth2 엔드포인트 경로 설정 |
| application.properties | `resources/application.properties` | 콜백 URL, redirect-uri 설정 |
| OAuthAttributesExtractor.java | `domain/user/util/OAuthAttributesExtractor.java` | 닉네임 fallback 로직 |

---

## 3. 상세 변경 내역

### 3.1 SecurityConfig.java

**문제**: 프론트엔드가 `/api/oauth2/authorization/{provider}`로 요청하지만, Spring Security 기본값은 `/oauth2/authorization/{provider}`

**해결**:
```java
.oauth2Login(oauth2 -> oauth2
      // OAuth2 인증 요청 경로 설정 (프론트엔드와 일치)
      .authorizationEndpoint(authorization -> authorization
            .baseUri("/api/oauth2/authorization"))
      .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
      .successHandler(oAuth2AuthenticationSuccessHandler))
```

**추가된 허용 경로**:
```java
.requestMatchers("/api/oauth2/authorization/**").permitAll()
.requestMatchers("/oauth2/authorization/**").permitAll()
```

### 3.2 application.properties

**문제 1**: 콜백 URL이 포트 3000으로 설정되어 있었으나, Vite는 5173 사용

**해결**:
```properties
# Before
oauth2.frontend-callback-url=http://localhost:3000/auth/callback

# After
oauth2.frontend-callback-url=http://localhost:5173/auth/callback
```

**문제 2**: 네이버 OAuth2 인증 방식 누락

**해결**:
```properties
spring.security.oauth2.client.registration.naver.client-authentication-method=client_secret_post
```

**redirect-uri 통일**:
```properties
# Naver
spring.security.oauth2.client.registration.naver.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}

# Google
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
```

### 3.3 OAuthAttributesExtractor.java

**문제**: 네이버 API가 `nickname` 대신 `name`만 반환하는 경우 오류 발생

**해결**:
```java
// nickname이 없으면 name 사용, 둘 다 없으면 "네이버사용자" 기본값
String displayName = nickname;
if (displayName == null || displayName.isBlank()) {
      displayName = name;
}
if (displayName == null || displayName.isBlank()) {
      displayName = "네이버사용자";
}
```

---

## 4. OAuth2 플로우 (수정 후)

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. 프론트엔드                                                        │
│     사용자가 "네이버로 로그인" 버튼 클릭                                 │
│     → window.location.href = '/api/oauth2/authorization/naver'       │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Spring Security (SecurityConfig.java)                           │
│     authorizationEndpoint.baseUri("/api/oauth2/authorization")      │
│     → 네이버/구글 로그인 페이지로 리다이렉트                              │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. OAuth Provider (네이버/구글)                                      │
│     사용자 인증 완료                                                   │
│     → {baseUrl}/login/oauth2/code/{registrationId} 로 콜백           │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. CustomOAuth2UserService                                          │
│     사용자 정보 추출 (OAuthAttributesExtractor 사용)                    │
│     DB에 사용자 생성/조회                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. OAuth2AuthenticationSuccessHandler                               │
│     JWT 토큰 생성                                                     │
│     → 프론트엔드 콜백 URL로 리다이렉트                                   │
│        http://localhost:5173/auth/callback?accessToken=...           │
└─────────────────────────────────────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. 프론트엔드 (AuthCallbackPage.tsx)                                 │
│     URL에서 토큰 추출 → tokenStorage에 저장                            │
│     → 홈페이지로 리다이렉트                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. 테스트 결과

| 테스트 항목 | 결과 |
|------------|------|
| 네이버 로그인 버튼 → 네이버 로그인 페이지 이동 | ✅ 성공 |
| 구글 로그인 버튼 → 구글 로그인 페이지 이동 | ✅ 성공 |
| 네이버 로그인 완료 → 프론트엔드 콜백 페이지 | ✅ 성공 |
| 구글 로그인 완료 → 프론트엔드 콜백 페이지 | ✅ 성공 |
| 토큰 저장 및 세션 복원 | ✅ 성공 |

---

## 6. 설정 파일 전체 참조

### application.properties (OAuth2 관련 섹션)

```properties
# --- JWT ---
spring.jwt.secret=${JWT_SECRET}
spring.jwt.access-token-expiry=3600000
spring.jwt.refresh-token-expiry=1209600000

# --- OAuth2 Frontend Callback URL ---
oauth2.frontend-callback-url=http://localhost:5173/auth/callback

# --- CORS ---
cors.allowed-origins=*

# --- Naver OAuth2 ---
spring.security.oauth2.client.registration.naver.client-name=naver
spring.security.oauth2.client.registration.naver.client-id=${NAVER_CLIENT_ID}
spring.security.oauth2.client.registration.naver.client-secret=${NAVER_CLIENT_SECRET}
spring.security.oauth2.client.registration.naver.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.naver.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.naver.client-authentication-method=client_secret_post
spring.security.oauth2.client.registration.naver.scope=name,email

# --- Google OAuth2 ---
spring.security.oauth2.client.registration.google.client-name=google
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.registration.google.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.google.scope=profile,email

# --- Naver Provider ---
spring.security.oauth2.client.provider.naver.authorization-uri=https://nid.naver.com/oauth2.0/authorize
spring.security.oauth2.client.provider.naver.token-uri=https://nid.naver.com/oauth2.0/token
spring.security.oauth2.client.provider.naver.user-info-uri=https://openapi.naver.com/v1/nid/me
spring.security.oauth2.client.provider.naver.user-name-attribute=response
```

---

## 7. 프로덕션 배포 시 주의사항

1. **콜백 URL 변경 필요**
   ```properties
   # application-prod.properties
   oauth2.frontend-callback-url=https://yourdomain.com/auth/callback
   ```

2. **CORS 설정 변경 필요**
   ```properties
   cors.allowed-origins=https://yourdomain.com
   ```

3. **OAuth Provider 콘솔 설정**
   - 네이버/구글 개발자 콘솔에서 Redirect URI 추가
   - `https://api.yourdomain.com/login/oauth2/code/naver`
   - `https://api.yourdomain.com/login/oauth2/code/google`

---

*작성자: Claude (Refiner & Editor)*
*최종 업데이트: 2026-02-04*
