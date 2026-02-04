# Claude 팀 협업 가이드 기반 산출물 계획

**작성 일자**: 2026-02-04  
**기준 문서**: `final_collaboration_guide_backend.md` (AI 협업 표준 가이드)

---

## 1. 협업 가이드에서 정의한 Claude의 역할

### 역할: Refiner & Editor (최종 정제자)

협업 가이드의 **Step 4 [Refine]**에 따르면:

> **Claude는 검증이 끝난 코드를 받아, 다음 작업을 맡긴다:**
> - **구조 개선** (서비스/도메인 구조 개선, 중복 제거)
> - **테스트 보강** (테스트 커버리지 확대)
> - **문서화** (API 명세 정리, README_backend, 설계 vs 구현 차이 정리)
> - **안전 리팩터링 원칙**: 외부 동작(엔드포인트, JSON 스키마, 에러 코드/메시지)을 절대 바꾸지 않음

---

## 2. 협업 가이드 기반 Claude의 산출물 (의무 제출)

협업 가이드 **Section 1의 R&R 테이블**에서 Claude의 산출물은:

| 구분 | Perplexity | Gemini | **Claude** |
|------|-----------|--------|----------|
| 역할 | Backend Architect & QA | Backend Main Builder | **Refiner & Editor** |
| 산출물 | design_spec_backend.md, collaborations_rule_backend.md, checklist_security_backend.md | Backend Source Code, implementation_plan.md, walkthrough_backend.md | **Refactored Backend Modules, Technical Docs** |

### Claude가 반드시 제출해야 할 산출물:

1. **Refactored Backend Modules** (리팩토링된 소스 코드)
   - 현재: JwtAuthenticationFilter, CustomOAuth2UserService 등 보안 강화
   - 설정 외부화: JwtTokenService, OAuth2AuthenticationSuccessHandler
   - 클래스 분리: UserProfile, OAuthAttributesExtractor
   - 테스트 코드: JwtAuthenticationFilterTest, CustomOAuth2UserServiceTest 등

2. **Technical Docs** (기술 문서)
   - `README_BACKEND_AUTH.md`: 인증 시스템 개요, 설정 가이드
   - `API_SPECIFICATION_AUTH.md`: API 엔드포인트 명세
   - `SECURITY_GUIDELINES.md`: 보안 가이드
   - `DESIGN_VS_IMPLEMENTATION.md`: 설계 준수 확인 문서

---

## 3. 협업 가이드 **Section 3의 아키텍처 레벨 규칙** 준수

### 3.1 레이어 아키텍처 (이미 준수 중)
✅ **Claude는 다음 구조를 유지**:
- **Controller** (Web/API 레이어): UserController, AuthController
- **Service** (도메인/비즈니스 로직): AuthService, CustomOAuth2UserService
- **Repository** (DB 액세스): UserRepository
- **Global** (Global Error/Config): JwtAuthenticationFilter, SecurityConfig, JwtTokenService

### 3.2 Naming & Lombok (이미 준수 중)
✅ **Claude는 다음 컨벤션 유지**:
- **클래스**: PascalCase (예: `JwtAuthenticationFilter`, `CustomOAuth2UserService`)
- **변수/메서드**: camelCase (예: `accessToken`, `validateToken()`)
- **Lombok**: @RequiredArgsConstructor + private final 필드 구성

---

## 4. 협업 가이드 **Section 4의 에러 처리/보안/테스트 정책** 준수

### 4.1 Error Handling & API 응답 포맷 ✅
Claude는 **현재 구조 유지 + 강화**:
- 공통 에러 포맷: `{ "code": "AUTH_001", "message": "..." }`
- ErrorCode enum + BusinessException + GlobalExceptionHandler (유지)
- **추가**: 새로운 에러 코드 정의 (예: `AUTH_INVALID_PROVIDER`, `TOKEN_REFRESH_FAILED`)

### 4.2 Security & Logging ⚠️ (개선 필요)
Claude는 다음 항목 강화:
- **Secret 관리**: application-prod.yml에서 환경변수로 관리
- **로깅**: 모든 주요 클래스에 @Slf4j 추가, 토큰 검증 로그 추가
- **CORS 설정**: dev/prod 프로파일 분리, prod에서 화이트리스트 기반 설정

### 4.3 Testing Policy 🔴 (대폭 강화 필요)
Claude는 다음 테스트 작성:
- **단위 테스트**: JwtAuthenticationFilter, CustomOAuth2UserService, OAuth2AuthenticationSuccessHandler (신규)
- **통합 테스트**: UserController, AuthController (강화)
- **목표**: 핵심 Service/Domain 로직 **80% 이상** 커버리지

---

## 5. 협업 가이드 **Section 5의 평가 지표 (Metrics)** 기준

협업 가이드에서 정의한 메트릭을 Claude 리팩토링 후 개선:

| Metric | 목표 | Claude의 기여 |
|--------|------|----------|
| **Bug Recurrence** | 0회 | 보안 강화로 예방 (JWT 필터 예외 처리, 입력 검증) |
| **API Contract Drift** | 0회 | DESIGN_VS_IMPLEMENTATION.md로 명세 준수 확인 |
| **Test Coverage** | 80% 이상 | 새로운 테스트 케이스 작성 (JwtAuthenticationFilterTest 등) |
| **Build Stability** | 점진적 감소 | 예외 처리 강화로 런타임 에러 감소 |

---

## 6. Claude 팀이 내용별로 제출할 최종 산출물 (파일 목록)

### A. 리팩토링된 소스 코드 (`refactored_source_code/` 폴더)

```
refactored_source_code/
├── 보안 강화 (Tier 1)
│   ├── JwtAuthenticationFilter.java
│   │   └── [변경] Exception Handling 추가, 로깅 강화
│   │
│   ├── CustomOAuth2UserService.java
│   │   └── [변경] OAuthAttributes에 입력 검증 추가
│   │
│   ├── OAuthAttributesExtractor.java (신규)
│   │   └── [신규] OAuthAttributes를 별도 유틸리티 클래스로 추출
│   │
│   └── UserProfile.java (신규)
│       └── [신규] UserProfile을 별도 DTO로 추출
│
├── 설정 외부화 (Tier 2)
│   ├── JwtTokenService.java
│   │   └── [변경] 토큰 만료 시간을 @Value로 외부화
│   │
│   ├── OAuth2AuthenticationSuccessHandler.java
│   │   └── [변경] 콜백 URL을 @Value로 외부화
│   │
│   ├── SecurityConfig.java
│   │   └── [변경] CORS 설정을 프로파일 기반으로 분리
│   │
│   ├── application.yml
│   │   └── [수정] JWT, OAuth2, CORS 설정 추가
│   │
│   ├── application-dev.yml
│   │   └── [신규] 개발 환경용 설정
│   │
│   └── application-prod.yml
│       └── [신규] 운영 환경용 설정 템플릿
│
├── 코드 품질 개선 (Tier 3)
│   ├── UserController.java
│   │   └── [변경] Optional 체이닝, 로깅 추가
│   │
│   └── (기타 서비스) 로깅 강화
│       └── [변경] @Slf4j 추가, 주요 메서드 로깅
```

### B. 향상된 테스트 코드 (`enhanced_test_code/` 폴더)

```
enhanced_test_code/
├── JwtAuthenticationFilterTest.java (신규)
│   ├── testValidToken()
│   ├── testExpiredToken()
│   ├── testInvalidToken()
│   └── testMissingHeader()
│
├── CustomOAuth2UserServiceTest.java (신규)
│   ├── testLoadUserWithNaver()
│   ├── testLoadUserWithGoogle()
│   ├── testSaveNewUser()
│   ├── testUpdateExistingUser()
│   └── testInvalidResponse()
│
├── OAuth2AuthenticationSuccessHandlerTest.java (신규)
│   ├── testTokenGeneration()
│   ├── testRedirectUrl()
│   └── testTokenInResponse()
│
└── UserControllerTest.java (강화)
    ├── testUnauthorizedAccess()
    ├── testGetMeWithValidToken()
    └── testRefreshToken()
```

### C. 기술 문서 (`technical_documentation/` 폴더)

```
technical_documentation/
├── README_BACKEND_AUTH.md
│   ├── 인증 시스템 아키텍처
│   ├── 주요 클래스 설명
│   ├── 설정 방법 (dev/prod)
│   └── 문제 해결 가이드
│
├── API_SPECIFICATION_AUTH.md
│   ├── GET /api/user/me
│   │   ├── Request/Response Schema
│   │   ├── Example curl
│   │   └── Error Codes
│   │
│   ├── POST /api/auth/token/refresh
│   │   ├── Request/Response Schema
│   │   ├── Example curl
│   │   └── Token Rotation Policy
│   │
│   └── OAuth2 플로우 설명
│
├── SECURITY_GUIDELINES.md
│   ├── JWT 토큰 클라이언트 저장 방법
│   ├── CSRF 보호 전략
│   ├── CORS 정책 설명
│   └── 프로덕션 배포 보안 체크리스트
│
└── DESIGN_VS_IMPLEMENTATION.md
    ├── design_spec_backend.md vs 실제 구현 비교
    ├── 명세 준수 테이블
    ├── 개선된 부분 설명
    └── 미반영 사항 및 향후 계획
```

### D. 리팩토링 계획 및 보고서

```
├── claude_refactoring_plan.md
│   ├── Tier 1~3별 상세 설명
│   ├── 현재 코드 → 개선 코드 비교
│   ├── 순서 및 의존성 분석
│   └── 예상 소요 시간
│
└── claude_walkthrough.md
    ├── 리팩토링 완료 현황 (체크리스트)
    ├── 각 항목별 변경 내용 요약
    ├── 테스트 실행 결과
    │   └── ./gradlew clean test 성공 여부, 커버리지 수치
    │
    ├── 명세 준수 최종 검증
    │   ├── design_spec_backend.md 준수 확인
    │   ├── collaborations_rule_backend.md 준수 확인
    │   └── 기존 API 동작 변경 없음 확인
    │
    └── Perplexity 검증 전 자가 점검 (Self-Review)
```

---

## 7. Claude 팀 산출물이 충족해야 할 협업 가이드의 원칙

협업 가이드 **Section 4의 핵심 원칙**:

### ✅ 안전 리팩터링 원칙
> **"외부 동작(엔드포인트, JSON 스키마, 에러 코드/메시지)을 절대 바꾸지 않는 안전 리팩터링을 기본으로 한다."**

**Claude는 다음을 보장**:
- [ ] `/api/user/me`, `/api/auth/token/refresh` 엔드포인트 변경 없음
- [ ] Request/Response JSON 스키마 변경 없음
- [ ] 에러 코드/메시지 변경 없음 (새로운 코드 추가만 가능)
- [ ] `./gradlew clean test` 모두 통과
- [ ] 기존 통합 테스트 실패 없음

### ✅ 설계 우선 원칙
> **"설계 변경이 필요하다면 Perplexity가 design_spec_backend.md를 먼저 업데이트하고, 그 후 구현에 반영한다."**

**Claude는 다음을 따름**:
- [ ] 설계에 벗어나는 변경 없음
- [ ] 필요 시 Perplexity에 설계 변경 요청 (DESIGN_VS_IMPLEMENTATION.md에 문서화)
- [ ] 설계 변경 후 구현 반영 (순서 지킴)

---

## 8. 협업 가이드 **Section 7: Backend Prompting Tips** 적용

협업 가이드에서 추천하는 좋은 프롬프트 패턴:

**Claude가 리팩토링할 때 다음을 명시**:
- ✅ 변경할 파일명 구체화
- ✅ 어떤 메서드/클래스를 개선할지 명시
- ✅ 에러 코드는 변경하지 않음을 명시
- ✅ 외부 API 계약 유지를 명시

예시:
```
JwtAuthenticationFilter에서:
- resolveToken() → 토큰 추출 (현재 로직 유지)
- doFilterInternal() → Exception Handling 강화 (BusinessException 던지기)
- 에러 응답: 기존 GlobalExceptionHandler로 처리 (변경 없음)
```

---

## 9. Claude 팀의 진행 체크포인트

협업 가이드 **Section 7: Backend Daily Routine** 준용:

| 시기 | 활동 | 결과 |
|------|------|------|
| 🌅 Morning | Claude와 리팩토링 항목 정리 (체크리스트 검토) | 모든 Phase 이해 |
| ☀️ Day | 코드 리팩토링 + 테스트 작성 (Phase 1~4) | 소스 코드 + 테스트 완성 |
| 🌇 Afternoon | 자체 테스트 실행 (`./gradlew clean test`) | 모든 테스트 통과 |
| 🌙 Evening | 문서화 작성 (Phase 5) | 4개 기술 문서 완성 |
| 🌅+1 Morning | Perplexity 검증 요청 준비 | claude_walkthrough.md 작성 |

---

## 10. 최종 검증 (Perplexity 팀)

Claude 팀 완료 후 Perplexity 팀은:

**협업 가이드 Section 3 (아키텍처) 기준**:
- [ ] 레이어 아키텍처 유지 (Controller/Service/Repository)
- [ ] Naming 규칙 준수 (PascalCase/camelCase)
- [ ] Lombok 활용 일관성

**협업 가이드 Section 4 (에러/보안/테스트) 기준**:
- [ ] Error Handling & API 응답 포맷 유지
- [ ] Security: 토큰 검증 강화, 입력 검증 추가
- [ ] Testing: 80% 커버리지 달성
- [ ] CORS/CSRF 설정 보안 개선

**협업 가이드 Section 5 (평가 지표) 기준**:
- [ ] Bug Recurrence: 0회 (보안 강화로 예방)
- [ ] API Contract Drift: 0회 (외부 계약 유지)
- [ ] Test Coverage: 80% 이상
- [ ] Build Stability: 모든 빌드/테스트 성공

---

## 11. 협업 가이드 요약: Claude의 Position

```
┌─────────────────────────────────────────────────────────┐
│  Role: Refiner & Editor (최종 정제자)                    │
│  ────────────────────────────────────────────────────── │
│  Input:  Gemini 팀이 완성한 인증 v1 구현                │
│           + Perplexity의 설계 명세 + 보안 체크리스트    │
│  ────────────────────────────────────────────────────── │
│  Task:   1. 보안 강화 (JWT 필터, OAuth2 입력 검증)      │
│          2. 설정 외부화 (profile별 설정)                │
│          3. 테스트 작성 (80% 커버리지)                  │
│          4. 문서화 (API명세, 보안가이드, README)        │
│  ────────────────────────────────────────────────────── │
│  Output: Refactored Backend Modules                      │
│          + Technical Docs                               │
│          + Enhanced Test Code                           │
│  ────────────────────────────────────────────────────── │
│  검증자: Perplexity (설계/보안 최종 확인)               │
│         → 외부 API 계약 유지 + 테스트 통과 확인       │
└─────────────────────────────────────────────────────────┘
```

---

**문서 작성**: Claude AI  
**기준**: final_collaboration_guide_backend.md (AI 협업 표준 가이드)  
**제출처**: `backendAiGuide/claudeGuide/User/`  
**유효기간**: 본 리팩토링 프로젝트 기간 동안
