# 백엔드 인증 시스템 (Authentication System)

## 📌 중요 변경 사항 (2026-02 Updated)
본 프로젝트의 인증 시스템은 보안 강화를 위해 **V2 아키텍처**로 업데이트되었습니다.
더 이상 Refresh Token을 `localStorage`에 저장하지 않으며, **HttpOnly Cookie**와 **DB**를 사용합니다.

상세한 최신 기술 명세는 아래 문서를 참고하십시오.
👉 **[AUTH_SYSTEM_DOCUMENTATION.md](./AUTH_SYSTEM_DOCUMENTATION.md) (최신 V2 명세서)**

---

## 📂 문서 목록

1.  **[AUTH_SYSTEM_DOCUMENTATION.md](./AUTH_SYSTEM_DOCUMENTATION.md)**
    *   **권장**: 인증 시스템의 전체 구조, 시퀀스 다이어그램, API 명세가 포함된 메인 가이드입니다.
    *   OAuth2 로그인, JWT 재발급(Cookie), 로그아웃 메커니즘을 상세히 설명합니다.

2.  **DESIGN_VS_IMPLEMENTATION.md**
    *   초기 설계와 실제 구현 간의 차이점을 기록한 히스토리성 문서입니다.

3.  **SECURITY_GUIDELINES.md**
    *   일반적인 보안 코딩 규칙 및 가이드라인입니다.

---

## 🚀 빠른 요약 (Quick Summary)

### 인증 방식
*   **Access Token**: 헤더(`Authorization: Bearer ...`)로 전달. (수명: 1시간)
*   **Refresh Token**: **HttpOnly Cookie**로 전달. (수명: 14일, DB 저장)

### 주요 엔드포인트
*   로그인: `/oauth2/authorization/naver` (브라우저 리다이렉트)
*   내 정보: `GET /api/user/me`
*   토큰 갱신: `POST /api/auth/token/refresh` (쿠키 자동 전송)
*   로그아웃: `POST /api/auth/logout`

### 개발자 유미 사항
*   프론트엔드 연동 시 `withCredentials: true` 설정이 필수입니다.
*   로컬 개발 시 `localhost:3000`과 백엔드 포트 간의 CORS 설정에 주의하세요.
