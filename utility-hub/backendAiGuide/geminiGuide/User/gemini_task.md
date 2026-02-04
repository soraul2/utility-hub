# Gemini Backend Implementation Task List

이 문서는 `gemini_deliverables_spec.md`에 정의된 백엔드 구현 작업의 진행 상황을 추적합니다.

## Status Overview
- **Start Date**: 2026-02-04
- **Current Status**: Ready to Start
- **Goal**: Implement auth v1 based on design_spec_backend.md

## 1. Preparation & Planning
- [ ] Create `implementation_plan.md` (Detailed technical plan)
- [ ] Review `design_spec_backend.md` and `checklist_security_backend.md`
- [ ] Set up Project Structure (`com.lottomarket.auth` packages)

## 2. Domain & DB Implementation
- [ ] Implement `User` Entity
- [ ] Implement `AuthProvider`, `UserRole` Enums
- [ ] Implement `UserRepository`
- [ ] Create DB Migration Script (if needed) or verify `ddl-auto`

## 3. Security & Auth Implementation
- [ ] Implement `CustomOAuth2UserService`
- [ ] Implement `JwtTokenService` (Generate, Validate, Parse)
- [ ] Implement `JwtAuthenticationFilter`
- [ ] Configure `SecurityConfig` (CORS, CSRF, Route Protections)

## 4. API Implementation (Controller)
- [ ] `POST /api/auth/oauth2/{provider}/login`
- [ ] `GET /api/auth/me`
- [ ] `POST /api/auth/token/refresh`

## 5. Global Error Handling
- [ ] Implement `ErrorCode` Enum (AUTH_001, etc.)
- [ ] Implement `BusinessException`
- [ ] Implement `GlobalExceptionHandler` and Common Response DTO

## 6. Verification & Documentation
- [ ] Unit Tests (Service Layer)
- [ ] Integration Tests (Controller Layer)
- [ ] Run `mvn test` -> Pass
- [ ] Create/Update `walkthrough_backend.md`
- [ ] Verify against `checklist_security_backend.md`

