# 인증(Authentication) 보안 리팩토링 구현 요약 (Gemini Team)

이 문서는 기존 OAuth2 인증 시스템의 보안 취약점을 개선하기 위해 수행된 **Refresh Token DB 저장** 및 **HttpOnly Cookie** 적용 내역을 정리한 문서입니다.

## 1. 구현 개요
- **목표**: Refresh Token 탈취 방지(XSS/CSRF 대응) 및 서버 측 세션 제어(로그아웃/토큰 폐기) 기능 확보.
- **기간**: 2026-02-06
- **작업자**: Gemini (Antigravity)
- **상태**: 백엔드/프론트엔드 연동 및 검증 완료 (✅)

## 2. 주요 개선 사항 (Key Improvements)

### 2.1 Refresh Token DB 저장 (Persistence)
- **기존**: JWT 자체에 의존하거나 메모리에 저장 (서버 재시작 시 휘발, 탈취 시 무효화 불가능).
- **개선**: MySQL DB에 `RefreshToken` 엔티티로 저장.
    - `userId`, `token`, `expiryDate` 포함.
    - **Rotation**: 토큰 갱신 시 기존 토큰을 삭제하고 새로운 토큰을 발급하여 보안 강화.

### 2.2 HttpOnly Cookie 전략
- **기존**: Refresh Token을 JSON Body로 응답 -> 프론트엔드 `localStorage` 저장 (XSS 취약).
- **개선**: **HttpOnly, Secure, SameSite=Strict** 쿠키에 담아 전달.
    - 자바스크립트에서 접근 불가 (`document.cookie`로 탈취 불가).
    - API 호출 시 브라우저가 자동으로 쿠키 전송 (`withCredentials: true`).

### 2.3 서버 사이드 로그아웃
- **기존**: 프론트엔드에서 `localStorage`만 비우는 방식 (서버 토큰은 여전히 유효).
- **개선**: `/api/auth/logout` 호출 시 DB에서 해당 유저의 Refresh Token 삭제 + 쿠키 만료 처리.

## 3. 구현 모듈 상세 (Implementation Details)

### 3.1 Domain Entities & Repository
- **`RefreshToken`**: 토큰 정보를 담는 엔티티.
- **`RefreshTokenRepository`**: 토큰 저장, 조회(token 값 기반), 삭제(userId 기반) 기능.

### 3.2 Security Components (`global/auth`)
- **`OAuth2AuthenticationSuccessHandler`**: 
    - 소셜 로그인 성공 후 `RefreshToken` 생성 및 DB 저장.
    - `ResponseCookie` 유틸리티를 사용하여 HttpOnly 쿠키 생성 및 Response Header에 추가.
- **`JwtTokenService`**: JWT 파싱 및 유효성 검증 로직 개선.

### 3.3 Controllers & Services
- **`AuthController`**:
    - `POST /api/auth/token/refresh`: 쿠키에서 `refresh_token`을 추출하여 검증 후 Access Token 재발급.
    - `POST /api/auth/logout`: DB 토큰 삭제 및 쿠키 삭제 응답.
- **`AuthService`**: 실제 토큰 갱신 및 삭제 비즈니스 로직 수행.

## 4. 프론트엔드 연동 가이드 (Frontend Integration)
백엔드 변경에 맞춰 프론트엔드(`axiosInstance.ts`, `tokenStorage.ts`)도 다음과 같이 수정되었습니다.
1.  **`localStorage` 제거**: Refresh Token을 더 이상 클라이언트에 저장하지 않음.
2.  **`withCredentials: true`**: 모든 API 요청 시 쿠키 포함 설정 필수.
3.  **로그아웃**: 반드시 서버 API(`/api/auth/logout`)를 호출해야 함.

## 5. 검증 결과 (Verification)
- **빌드**: `compileJava` 성공.
- **기능 테스트**:
    - 로그인 직후 DB `refresh_tokens` 테이블에 토큰 생성 확인.
    - `/api/auth/token/refresh` 호출 시 쿠키 기반 갱신 성공 확인.
    - 로그아웃 후 DB에서 토큰 삭제 확인.
