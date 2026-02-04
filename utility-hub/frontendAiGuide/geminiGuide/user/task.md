# Gemini 프론트엔드 인증 구현 작업 리스트 (Utility Hub)

이 문서는 `frontend_auth_spec.md` 및 `final_collaboration_guide.md`를 바탕으로 한 프론트엔드 인증 모듈 구현 진행 상황을 추적합니다.

## 진행 현황 개요
- **시작 일자**: 2026-02-04
- **현재 상태**: 계획 수립 및 승인 대기 중
- **목표**: 소셜 로그인(OAuth2) 연동 및 JWT 기반 인증 상태 관리 시스템 구축

## 1. 준비 및 인프라 구축
- [x] 구현 계획서(`implementation_plan.md`) 작성 및 승인
- [x] 인증 컨텍스트(`AuthContext`) 및 훅(`useAuth`) 설계
- [x] 토큰 저장소(`tokenStorage`) 유틸리티 구현
- [x] 필요한 라이브러리 설치 (axios 등)

## 2. HTTP 클라이언트 및 인터셉터
- [x] Axios 인스턴스 설정 및 공통 헤더 주입
- [x] Request 인터셉터: Authorization Bearer 토큰 주입
- [x] Response 인터셉터: 401 에러 감지 및 토큰 재발급(Refresh) 흐름 구현

## 3. 라우팅 및 보호 레이어
- [x] `ProtectedRoute` 컴포넌트 구현 (미인증 사용자 차단)
- [x] 인증 상태 복원 로직 구현 (App 마운트 시 `/api/auth/me` 호출)

## 4. 페이지 및 UI 구현
- [x] 로그인 페이지(`LoginPage`) 구현 (네이버/구글 버튼)
- [x] 콜백 처리 페이지(`AuthCallbackPage`) 구현 (백엔드 연동)
- [x] 마이페이지(`MyPage`) 샘플 구현 (인증 여부 확인용)

## 5. 에러 처리 및 UX 개선
- [x] 인증 관련 에러 코드 매핑 테이블 정의
- [x] 로그인 실패/만료 시 토스트 알림 또는 배너 구현
- [x] 로그아웃 로직 구현 및 UI 연결

## 6. 회원 기능 및 고도화
- [x] 회원 탈퇴 API 연동 및 상태 초기화
- [x] 마이페이지 내 탈퇴 버튼 추가 및 위험 경고 구현

## 7. UI/UX 디자인 고도화 (Premium)
- [x] 커스텀 `ConfirmModal` 구현 (글래스모피즘 스타일)
- [x] React Portal을 활용한 모달 레이어 분리 (위치 오류 해결)
- [x] 로그아웃/탈퇴 액션 시 프리미엄 확인창 적용

## 8. 최종 검증 및 문서화
- [ ] 전체 인증 흐름 테스트 (로그인 -> API 호출 -> 토큰 만료 -> 재발급 -> 로그아웃)
- [ ] 구현 결과 보고서(`walkthrough_frontend.md`) 작성
- [x] 기술 문서 업데이트
