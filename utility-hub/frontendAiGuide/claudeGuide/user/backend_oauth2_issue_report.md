# 백엔드 OAuth2 플로우 리팩토링 이슈 리포트

이 문서는 프론트엔드 로그인 테스트 중 발견된 백엔드 OAuth2 플로우 이슈를 정리한 리포트입니다.

---

## 1. 이슈 개요

| 항목 | 내용 |
|:---|:---|
| **발견 일자** | 2026-02-04 |
| **심각도** | 치명적 (Critical) |
| **영향 범위** | 전체 소셜 로그인 기능 |
| **현재 상태** | 로그인 플로우 정상 동작 불가 |

---

## 2. 발견된 이슈

### 2.1 이슈 #1: Spring Security 기본 로그인 페이지 노출

| 항목 | 내용 |
|:---|:---|
| **증상** | 네이버/구글 버튼 클릭 시 소셜 로그인 페이지로 바로 이동하지 않고, Spring Security OAuth2 클라이언트의 기본 로그인 페이지가 표시됨 |
| **예상 동작** | 버튼 클릭 → 바로 네이버/구글 로그인 화면으로 이동 |
| **실제 동작** | 버튼 클릭 → Spring Security 기본 `/login` 페이지 노출 |
| **원인 추정** | `SecurityConfig`에서 `.oauth2Login().loginPage()` 설정 미흡 또는 기본 로그인 페이지 비활성화 안 됨 |

### 2.2 이슈 #2: 로그인 완료 후 잘못된 리다이렉트

| 항목 | 내용 |
|:---|:---|
| **증상** | 소셜 로그인 완료 후 React 프론트엔드(3000 포트)로 리다이렉트되지 않고 localhost:8080(백엔드)으로 이동함 |
| **예상 동작** | 로그인 완료 → `http://localhost:3000/auth/callback?accessToken=...` 으로 리다이렉트 |
| **실제 동작** | 로그인 완료 → `http://localhost:8080/...` 으로 리다이렉트 |
| **원인 추정** | `OAuth2SuccessHandler`에서 리다이렉트 URL이 프론트엔드가 아닌 백엔드로 설정됨 |

---

## 3. 현재 플로우 vs 정상 플로우

```
[현재 플로우 - 문제]
┌─────────────────────────────────────────────────────────────────┐
│  1. 프론트엔드 버튼 클릭                                          │
│     → /api/oauth2/authorization/{provider}                      │
│                                                                 │
│  2. Spring Security 기본 로그인 페이지 노출 (의도치 않음)           │
│     → /login 페이지가 보임                                        │
│                                                                 │
│  3. 수동으로 네이버/구글 선택 후 로그인                             │
│                                                                 │
│  4. 로그인 완료 후 백엔드 8080으로 리다이렉트                        │
│     → 프론트엔드로 안 감                                          │
└─────────────────────────────────────────────────────────────────┘

[정상 플로우 - 목표]
┌─────────────────────────────────────────────────────────────────┐
│  1. 프론트엔드 버튼 클릭                                          │
│     → /api/oauth2/authorization/{provider}                      │
│                                                                 │
│  2. 바로 네이버/구글 로그인 페이지로 이동                           │
│     → 중간 페이지 없이 직접 이동                                   │
│                                                                 │
│  3. 사용자 소셜 로그인 진행                                        │
│                                                                 │
│  4. 로그인 완료 후 프론트엔드 콜백 페이지로 리다이렉트               │
│     → http://localhost:3000/auth/callback?accessToken=...       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 수정 필요 파일

### 4.1 SecurityConfig.java

**위치:** `backend/src/main/java/.../global/auth/SecurityConfig.java` (추정)

**현재 문제:**
- OAuth2 로그인 시 기본 로그인 페이지(`/login`)가 활성화되어 있음
- 프론트엔드에서 직접 소셜 로그인 URL로 이동할 때 중간 페이지가 뜸

**수정 방향:**
```java
// 수정 전 (추정)
.oauth2Login(oauth2 -> oauth2
    .loginPage("/login")  // 기본 로그인 페이지 사용
    .successHandler(oAuth2SuccessHandler)
)

// 수정 후 (권장)
.oauth2Login(oauth2 -> oauth2
    .authorizationEndpoint(authorization -> authorization
        .baseUri("/api/oauth2/authorization")  // 프론트엔드 요청 경로
    )
    .redirectionEndpoint(redirection -> redirection
        .baseUri("/api/oauth2/callback/*")  // 콜백 경로
    )
    .successHandler(oAuth2SuccessHandler)
)
// 기본 로그인 페이지 비활성화
.formLogin(form -> form.disable())
```

---

### 4.2 OAuth2SuccessHandler.java

**위치:** `backend/src/main/java/.../global/auth/OAuth2SuccessHandler.java` (추정)

**현재 문제:**
- 인증 성공 후 리다이렉트 URL이 백엔드(8080)로 설정됨
- 프론트엔드 콜백 페이지로 토큰을 전달하지 않음

**수정 방향:**
```java
// 수정 전 (추정)
@Override
public void onAuthenticationSuccess(...) {
    // 백엔드 URL로 리다이렉트
    response.sendRedirect("/");
}

// 수정 후 (권장)
@Override
public void onAuthenticationSuccess(...) {
    String accessToken = jwtTokenProvider.createAccessToken(...);
    String refreshToken = jwtTokenProvider.createRefreshToken(...);

    // 프론트엔드 콜백 URL로 리다이렉트 (환경변수 사용)
    String frontendUrl = environment.getProperty("app.frontend.url");
    String redirectUrl = String.format(
        "%s/auth/callback?accessToken=%s&refreshToken=%s",
        frontendUrl,
        accessToken,
        refreshToken
    );

    response.sendRedirect(redirectUrl);
}
```

---

### 4.3 application.properties

**위치:** `backend/src/main/resources/application.properties`

**추가 필요 설정:**
```properties
# 프론트엔드 URL 설정
app.frontend.url=http://localhost:3000

# 프로덕션 환경
# app.frontend.url=${FRONTEND_URL:http://localhost:3000}
```

**application-prod.properties:**
```properties
app.frontend.url=${FRONTEND_URL}
```

---

## 5. 체크리스트

### 5.1 수정 전 확인사항
- [ ] 현재 `SecurityConfig.java` 파일 위치 및 설정 확인
- [ ] 현재 `OAuth2SuccessHandler.java` 파일 위치 및 로직 확인
- [ ] `application.properties`에 프론트엔드 URL 관련 설정 확인

### 5.2 수정 작업
- [ ] `SecurityConfig.java` - 기본 로그인 페이지 비활성화
- [ ] `SecurityConfig.java` - OAuth2 엔드포인트 경로 설정
- [ ] `OAuth2SuccessHandler.java` - 프론트엔드 URL로 리다이렉트 설정
- [ ] `application.properties` - 프론트엔드 URL 환경변수 추가

### 5.3 수정 후 테스트
- [ ] 네이버 버튼 클릭 → 바로 네이버 로그인 페이지 이동 확인
- [ ] 구글 버튼 클릭 → 바로 구글 로그인 페이지 이동 확인
- [ ] 네이버 로그인 완료 → 프론트엔드 콜백 페이지 리다이렉트 확인
- [ ] 구글 로그인 완료 → 프론트엔드 콜백 페이지 리다이렉트 확인
- [ ] 콜백 페이지에서 토큰 수신 및 저장 확인
- [ ] 인증 후 보호된 페이지 접근 확인

---

## 6. 참고: 프론트엔드 연동 코드

### LoginPage.tsx (현재)
```tsx
// 소셜 로그인 버튼 클릭 시 백엔드로 리다이렉트
const handleSocialLogin = (provider: 'naver' | 'google') => {
  window.location.href = `/api/oauth2/authorization/${provider}`;
};
```

### AuthCallbackPage.tsx (현재)
```tsx
// URL 파라미터에서 토큰 추출
const accessToken = searchParams.get('accessToken');
const refreshToken = searchParams.get('refreshToken');
```

---

## 7. 우선순위 및 의존성

```
┌─────────────────────────────────────────────────────────────────┐
│  이 이슈가 해결되어야 다음 작업 진행 가능                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Phase 0] OAuth2 플로우 수정 (본 이슈)                           │
│       ↓                                                         │
│  [Phase 1] 보안 강화 (토큰 저장 방식 변경 등)                       │
│       ↓                                                         │
│  [Phase 2] 코드 품질 개선                                         │
│       ↓                                                         │
│  [Phase 3] 아키텍처 개선                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

> **중요:** 이 OAuth2 플로우 이슈가 해결되지 않으면 프론트엔드 인증 시스템 리팩토링 진행이 불가능합니다.

---

*작성자: Claude (Refiner & Editor)*
*최종 업데이트: 2026-02-04*
*관련 문서: [claude_frontend_deliverables_plan.md](claude_frontend_deliverables_plan.md)*
