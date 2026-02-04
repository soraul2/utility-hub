backend_checklist_dev.md
text
# backend_checklist_dev.md

## 1. Auth 도메인 구현 체크리스트

- [ ] User 엔티티, AuthProvider, UserRole enum 구현
- [ ] UserRepository (provider + providerId 로 조회)
- [ ] DB 마이그레이션 스크립트 (User 테이블)

## 2. Security / OAuth2 / JWT

- [ ] SecurityConfig: stateless, JWT 필터 등록, URL별 권한 설정
- [ ] OAuth2 Client 설정 (NAVER, GOOGLE) – application.yml
- [ ] CustomOAuth2UserService 구현 (소셜 프로필 → User 매핑)
- [ ] JWT 토큰 생성/검증 서비스 (JwtTokenService)
- [ ] AuthenticationPrincipal 로 현재 User 주입 확인

## 3. Controller / Service

- [ ] AuthController
  - [ ] POST /api/auth/oauth2/{provider}/login
  - [ ] POST /api/auth/token/refresh
  - [ ] GET /api/auth/me
- [ ] AuthService
  - [ ] 소셜 로그인 처리 (유저 조회/생성/갱신)
  - [ ] JWT 발급/재발급 로직

## 4. Error / Validation

- [ ] ErrorCode, BusinessException, GlobalExceptionHandler 구현
- [ ] 지원하지 않는 provider 에 AUTH_001 반환
- [ ] 토큰 관련 오류에 TOKEN_001, TOKEN_002 반환
- [ ] 공통 에러 응답 포맷 적용 확인

## 5. Test

- [ ] AuthService 단위 테스트 (정상 로그인, 신규 유저 생성, 예외 케이스)
- [ ] JWT 검증 유닛 테스트 (유효/만료/변조 토큰)
- [ ] AuthController 통합 테스트 (WebMvcTest 또는 SpringBootTest)
- [ ] mvn test, mvn package 성공