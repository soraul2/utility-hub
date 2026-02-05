# 🔍 Utility Hub 통합 구현 계획 (Routine MVP) - 검토 및 개선안

**검토일**: 2025-02-05  
**검토 대상**: 제미나이팀 작성 "Implementation Plan - Routine MVP (Utility Hub Integration)"  
**종합 평가**: ⭐⭐⭐⭐☆ (4.5/5) - 좋은 문서이나 중요 부분 누락

---

## 1. 📋 검토 결과: 강점 & 약점

### ✅ 강점 (Strengths)

#### A. 통합 전략이 명확함
```
+ 기존 프로젝트 구조 준수
+ Frontend/Backend 패키지 구조 명시
+ Utility Hub와의 일관성 유지
+ 점진적 통합 접근 (Phase별)
```

#### B. 기존 기술 스택 활용
```
+ React 18, Spring Boot 3.x 유지
+ TailwindCSS 재사용
+ Zustand 신규 도입 (Context 대신 - 좋은 선택)
```

#### C. 구현 순서가 합리적
```
Phase 1: 환경 설정
Phase 2: Frontend 기능
Phase 3: Backend 도메인
Phase 4: API 연동
```

---

### ❌ 약점 (Weaknesses)

#### 1️⃣ **세부 구현 코드 부재** 🔴 Critical

```
문제점:
- Entity 클래스 예시 없음
- Controller/Service 샘플 코드 없음
- Zustand 스토어 구현 불명확
- API 엔드포인트 명세 없음

영향:
→ 개발자가 처음부터 모두 작성해야 함
→ 앞서 제공한 "보완 가이드"와 일관성 문제
```

#### 2️⃣ **기존 Utility Hub 구조 미상세** 🔴 Critical

```
문제점:
- 기존 Frontend 프로젝트 구조 불명확
  (pages/, components/ 구조가 어떻게 되어있는지?)
- 기존 Backend 패키지 구조 불명확
  (어떤 공통 유틸이 있는지?, 기존 Controller 패턴은?)
- 기존 State Management 구조 (zustand 이미 사용 중인가?)
- 기존 API 호출 패턴 (axios? 어디에 있는가?)

영향:
→ 통합이 모호함
→ 기존 코드와 충돌 가능성
→ 인터페이스 설계가 불명확
```

#### 3️⃣ **사용자 인증/다중 사용자 고려 없음** 🟡 High

```
현재 문서:
- User 개념 없음
- 모든 사용자가 같은 Daily Plan 조회 가능
- 데이터 격리 전략 미정의

필요:
- 현재 로그인한 사용자 개념 추가
- API 요청에 userId 포함 방식
- Backend에서 userId 필터링
```

#### 4️⃣ **기존 공통 컴포넌트/유틸 재사용 전략 없음** 🟡 High

```
문제점:
- Utility Hub의 기존 Button, Input, Modal 등 있는가?
- 기존 API 호출 패턴이 있는가?
- 기존 에러 처리 방식은?
- 기존 로깅 전략은?

예상 문제:
→ 새로운 컴포넌트를 중복으로 만들 수 있음
→ 기존 설정과 충돌
→ 일관성 없는 코드
```

#### 5️⃣ **상태 관리 전략 불명확** 🟡 Medium

```
현재:
- "Zustand를 신규 도입"이라고만 함
- 기존 상태 관리 방식 미언급
- useRoutineStore 구현 방식 불명확
- 로컬 스토리지 영속성 담당 주체 불명확

필요:
- Zustand vs 기존 방식 비교
- 다른 모듈과의 state 공유 필요성?
- persist 플러그인 사용 여부?
- DevTools 설정?
```

#### 6️⃣ **API 명세 완전히 부재** 🔴 Critical

```
누락:
- 엔드포인트 목록 없음 (예: GET /api/routine/today)
- 요청/응답 형식 없음
- 에러 응답 형식 없음
- HTTP 상태 코드 없음

영향:
→ Frontend-Backend 협업 어려움
→ API 계약(Contract) 미정의
→ 테스트 불가능
```

#### 7️⃣ **데이터베이스 통합 전략 모호** 🟡 High

```
문제점:
- 기존 Utility Hub의 DB 스키마는?
- User 테이블은 이미 있는가?
- 어떤 User/Auth 시스템을 사용 중인가?
- 외래키 설정 어떻게 할 건가?
- 마이그레이션 도구 (Flyway/Liquibase) 사용 여부?

현재 상태:
- "MySQL 테이블 생성 쿼리 작성" 이라고만 함
- JPA ddl-auto 언급만 있음
```

#### 8️⃣ **CORS & API 엔드포인트 위치 불명확** 🟡 Medium

```
문제점:
- Backend API prefix는 뭔가? `/api/routine`인가? `/api/v1/routine`인가?
- CORS 설정이 기존에 있는가?
- Frontend에서 기존 API base URL은 뭔가?
- 환경변수 관리는 어떻게 하는가?
```

#### 9️⃣ **테스트 전략 매우 단순** 🟡 Medium

```
현재:
```
1. Frontend 단독 테스트 (로컬 스토리지)
2. API 테스트 (Postman)
3. 통합 테스트
```

부족:
- JUnit 테스트 없음
- Frontend 컴포넌트 테스트 없음
- E2E 테스트 없음
- DB 마이그레이션 테스트 없음
```

#### 🔟 **배포 & 기존 CI/CD 연동 안내 없음** 🔴 Critical

```
누락:
- 기존 Utility Hub의 배포 파이프라인?
- GitHub Actions CI/CD 구성?
- Docker 빌드 설정?
- 환경별 설정 (dev, prod, test)?

영향:
→ 배포 불확실성
→ 기존 파이프라인 파괴 가능
```

---

## 2. 🛠️ 구체적인 추가/수정 필요 사항

### 우선순위 1️⃣: Critical (필수)

#### 1. API 명세 정의

**추가해야 할 것:**

```yaml
# REST API Endpoints

Daily Plan API:
  GET /api/v1/routine/daily-plans/today
    Response: { id, planDate, keyTasks, timeBlocks, createdAt }
  
  GET /api/v1/routine/daily-plans/{date}
    Params: date=YYYY-MM-DD
  
  POST /api/v1/routine/daily-plans
    Body: { planDate, keyTasks }
  
  PUT /api/v1/routine/daily-plans/{id}
    Body: { keyTasks, timeBlocks }

Task API:
  POST /api/v1/routine/daily-plans/{planId}/tasks
    Body: { title }
  
  PATCH /api/v1/routine/tasks/{id}
    Body: { title, completed }
  
  DELETE /api/v1/routine/tasks/{id}

Reflection API:
  POST /api/v1/routine/reflections
    Body: { planId, rating, mood, whatWentWell, ... }
  
  GET /api/v1/routine/reflections/archive
    Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
```

#### 2. 기존 Utility Hub 구조 파악 & 명시

**추가 섹션:**

```markdown
### 기존 Utility Hub 구조 확인

#### Frontend 구조
- 기존 pages/ 디렉토리 구조?
- 기존 components/common/ 에 있는 컴포넌트들?
- 기존 API 호출 방식 (hooks/useApi.ts 같은 것?)
- 기존 상태 관리 (Context, Redux, Zustand 이미 사용?)
- 기존 환경변수 설정 방식?

#### Backend 구조
- 기존 패키지 구조 (com.wootae.backend.??)
- 기존 User/Auth 시스템
- 기존 DTO, Entity 패턴
- 기존 Exception Handling
- 기존 API prefix (/api/v1? /api?)
- 기존 CORS 설정 위치
- 기존 DB 스키마 (User 테이블 구조?)
```

#### 3. 사용자 인증 전략 추가

**추가 섹션:**

```markdown
### 사용자 인증 & 데이터 격리 전략

#### Backend
- 기존 User entity 활용 또는 신규 생성?
- SecurityUtil에서 현재 사용자 ID 추출 (SecurityContextHolder or custom)
- DailyPlanRepository.findByUserIdAndDate() 같은 필터링
- API 요청에서 자동 userId 주입 (AOP or Interceptor)

#### Frontend
- 기존 로그인 방식 (세션? JWT?)
- API 호출 시 userId 자동 포함 방식
- 로그아웃 시 Zustand store 초기화 방식
```

#### 4. 기존 컴포넌트/유틸 재사용 가이드

**추가 섹션:**

```markdown
### 기존 Utility Hub 자산 재사용

#### Frontend
- [ ] 기존 Button/Input/Modal 컴포넌트 확인
- [ ] 기존 API 호출 패턴 확인
- [ ] 기존 에러 처리 컴포넌트 (Toast, Alert)
- [ ] 기존 로딩 UI 패턴
- [ ] 기존 스타일 유틸 (색상, 폰트, 간격)

#### Backend
- [ ] 기존 BaseEntity/BaseController 패턴
- [ ] 기존 ApiResponse 형식
- [ ] 기존 Exception Handling
- [ ] 기존 Logging 전략
- [ ] 기존 Validation 애노테이션
```

---

### 우선순위 2️⃣: High (권장)

#### 5. 상태 관리 상세화

**Zustand 스토어 구현 예시 추가:**

```typescript
// stores/useRoutineStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DailyPlan {
  id?: number;
  planDate: string;
  keyTasks: Task[];
  timeBlocks: TimeBlock[];
}

interface RoutineStore {
  today: DailyPlan;
  reflections: Reflection[];
  isLoading: boolean;
  
  // Actions
  loadToday: (date: string) => Promise<void>;
  addTask: (task: Task) => void;
  saveReflection: (reflection: Reflection) => Promise<void>;
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set) => ({
      today: { planDate: new Date().toISOString().split('T')[0], keyTasks: [], timeBlocks: [] },
      reflections: [],
      isLoading: false,
      
      loadToday: async (date) => {
        // API 호출 또는 로컬 스토리지에서 로드
      },
      
      addTask: (task) => {
        set((state) => ({
          today: {
            ...state.today,
            keyTasks: [...state.today.keyTasks, task],
          },
        }));
      },
      
      saveReflection: async (reflection) => {
        // API 호출
      },
    }),
    {
      name: 'routine-store',
      // 필요시 localstorage에만 저장
    }
  )
);
```

#### 6. 데이터베이스 통합 전략

**추가 섹션:**

```markdown
### 데이터베이스 통합 가이드

#### User 테이블 연결
- 기존 User 테이블 존재 여부 확인
- DailyPlan.user_id → users.id 외래키 설정
- ON DELETE CASCADE 정책 명시

#### 마이그레이션 전략
- Flyway 또는 Liquibase 사용 여부 결정
- 초기 migration 스크립트: V1__create_routine_tables.sql
- 기존 마이그레이션과의 순서 조정

#### JPA ddl-auto 설정
- development: create-drop 또는 create
- production: validate
- test: create-drop

#### 스키마 예시
\`\`\`sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255)
);

CREATE TABLE daily_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  plan_date DATE NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
\`\`\`
```

#### 7. 테스트 전략 추가

**추가 섹션:**

```markdown
### 테스트 전략

#### Backend
- Service 유닛 테스트 (Mockito)
  [ ] RoutineService.getDailyPlan()
  [ ] RoutineService.saveReflection()
  
- Repository 테스트 (H2 인메모리 DB)
- Controller 통합 테스트 (MockMvc)

#### Frontend
- Component 유닛 테스트 (Vitest)
  [ ] KeyTaskInput 렌더링
  [ ] TimeBlockSection 렌더링
  
- Hook 테스트 (useRoutineStore)
  [ ] addTask 작동 확인
  [ ] saveReflection 작동 확인

#### 통합 테스트
- E2E 시나리오 (Cypress/Playwright)
  1. Daily Plan 생성
  2. Task 추가
  3. Reflection 저장
  4. Archive 조회
```

---

### 우선순위 3️⃣: Medium (선택)

#### 8. CORS & API 게이트웨이 설정

```markdown
### CORS 및 API 설정

#### Backend CORS 설정
\`\`\`java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:5173")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
\`\`\`

#### Frontend API Base URL 설정
- .env 파일: VITE_API_BASE_URL=http://localhost:8080
- 기존 axios 인스턴스에서 baseURL 설정
```

#### 9. 배포 & CI/CD 통합

```markdown
### 기존 CI/CD와의 통합

#### 확인사항
- 기존 GitHub Actions 워크플로우는?
- Docker 빌드 설정은 기존에 있는가?
- 배포 환경 (Staging, Production) 설정?

#### Routine 모듈 추가 시
- Backend Dockerfile: 기존 설정 유지, 새 패키지 포함
- Frontend build: 기존 vite build 명령 유지
- GitHub Actions: 기존 워크플로우에 Routine 테스트 추가
```

---

## 3. 📝 개선된 전체 구조 제안

### Frontend 구조 상세화

```
src/
├── components/
│   ├── common/                     # 기존 공통 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   └── routine/                    # [NEW] 루틴 모듈
│       ├── DailyPlan/
│       │   ├── KeyTaskInput.tsx
│       │   ├── TimeBlockSection.tsx
│       │   └── DailyPlanView.tsx
│       ├── Reflection/
│       │   ├── ReflectionForm.tsx
│       │   └── ReflectionCard.tsx
│       ├── common/                 # 루틴 내 공용 컴포넌트
│       │   └── (기존 common 컴포넌트 재사용)
│       └── Layout/
│           └── RoutineLayout.tsx
├── hooks/                          # [Check] 기존 hooks
│   ├── useApi.ts                   # 기존 API 호출 훅 있는가?
│   └── useRoutine.ts               # [NEW] 루틴 전용 훅
├── pages/
│   ├── dashboard/                  # 기존 페이지
│   └── routine/                    # [NEW] 루틴 페이지
│       ├── DailyPlanPage.tsx
│       ├── ReflectionPage.tsx
│       └── ArchivePage.tsx
├── services/                       # [Check/New]
│   ├── api.ts                      # 기존 API 설정 or 신규
│   └── routine/                    # [NEW] 루틴 API 함수
│       ├── dailyPlanApi.ts
│       └── reflectionApi.ts
├── stores/                         # [NEW] Zustand
│   ├── useRoutineStore.ts
│   └── (기존 다른 store?)
├── types/
│   ├── common.d.ts                 # 기존 타입
│   └── routine.d.ts                # [NEW] 루틴 타입
├── App.tsx                         # 라우팅 수정 필요
└── main.tsx
```

### Backend 구조 상세화

```
com.wootae.backend.routine/
├── controller/
│   ├── RoutineController.java      # 통합 또는 DailyPlanController.java
│   └── ReflectionController.java
├── service/
│   ├── RoutineService.java         # DailyPlan 비즈니스 로직
│   └── ReflectionService.java      # Reflection 비즈니스 로직
├── repository/
│   ├── DailyPlanRepository.java
│   ├── TaskRepository.java
│   ├── TimeBlockRepository.java
│   └── ReflectionRepository.java
├── domain/                         # or entity/
│   ├── DailyPlan.java
│   ├── Task.java
│   ├── TimeBlock.java
│   └── Reflection.java
├── dto/
│   ├── DailyPlanDto.java
│   ├── ReflectionDto.java
│   └── ApiResponse.java            # 기존 있는가?
├── mapper/
│   ├── DailyPlanMapper.java
│   └── ReflectionMapper.java
├── exception/
│   └── (기존 exception 활용?)
└── config/
    └── (기존 config 활용?)
```

---

## 4. 📋 체크리스트: 전에 해야 할 작업

### Phase 0: 사전 조사 (1-2일)

```
Utility Hub 프로젝트 분석:

Frontend:
  [ ] 현재 pages/ 디렉토리 구조 파악
  [ ] 현재 components/ 구조 파악
  [ ] 현재 상태 관리 방식 (Context? Redux? Zustand?)
  [ ] 현재 API 호출 패턴
  [ ] 현재 환경변수 관리 방식 (.env? .env.local?)
  [ ] 현재 Router 설정 (App.tsx 구조)
  [ ] 현재 스타일 시스템 (Tailwind 설정, 컬러 토큰)
  [ ] 기존 에러 처리/로딩 UI 패턴
  [ ] 기존 Button, Input, Modal 컴포넌트

Backend:
  [ ] 현재 패키지 구조 전체 파악
  [ ] 현재 User/Auth 시스템 (Spring Security? Custom?)
  [ ] 현재 DB 스키마 (User 테이블 구조)
  [ ] 현재 API prefix (/api/v1? /api?)
  [ ] 현재 BaseEntity, BaseController 패턴
  [ ] 현재 ApiResponse 형식
  [ ] 현재 Exception Handling 방식
  [ ] 현재 Validation 전략
  [ ] CORS 설정 위치
  [ ] 마이그레이션 도구 사용 (Flyway? Liquibase? 아무것도 안 함?)
  [ ] 테스트 설정 (JUnit 버전, Mockito 버전)
```

### Phase 1: 통합 설정 (확인된 후)

이 작업은 Phase 0 결과에 따라 달라짐

---

## 5. 🎯 최종 평가 및 권장

### 종합 평가

| 항목 | 평가 | 비고 |
|------|------|------|
| 통합 아이디어 | ⭐⭐⭐⭐⭐ | 명확하고 합리적 |
| 기술 스택 선택 | ⭐⭐⭐⭐☆ | Zustand 좋은 선택 |
| 구현 순서 | ⭐⭐⭐⭐☆ | Phase별로 합리적 |
| 상세도 | ⭐⭐⭐☆☆ | 코드 예시 부족 |
| 기존 구조 고려 | ⭐⭐☆☆☆ | 기존 시스템 파악 필요 |
| API 명세 | ⭐☆☆☆☆ | 전혀 없음 |
| 테스트 전략 | ⭐⭐☆☆☆ | 너무 단순함 |
| 배포/CI/CD | ⭐☆☆☆☆ | 전혀 없음 |

### 권장 접근

```
1. 이 문서를 기반으로 하되,
2. 먼저 기존 Utility Hub 구조 완전히 파악 (Phase 0)
3. 그 후 구체적인 API 명세 작성
4. 기존 패턴 준수하면서 구현
5. 테스트 전략 추가로 보강
```

---

## 6. 📄 추가로 필요한 문서

### 1. "Utility Hub 기존 구조 분석 가이드"
- Frontend 구조 현황
- Backend 구조 현황
- 기존 패턴 정리

### 2. "Routine 모듈 API 명세서"
- 엔드포인트 완전 정의
- 요청/응답 예시
- 에러 응답 정의
- Swagger 설정

### 3. "Routine 모듈 사용자 인증 가이드"
- 기존 Auth 시스템과의 연동
- userId 추출 방식
- API 요청에서 권한 검사

### 4. "기존 자산 재사용 가이드"
- 어떤 컴포넌트 재사용할 것인가
- 어떤 유틸 재사용할 것인가
- 색상, 폰트 시스템

---

## 📌 결론

**제미나이팀 문서의 평가:**

✅ **좋은 점**
- 통합 전략 명확
- 기존 시스템 존중
- 구현 순서 합리적
- Zustand 좋은 선택

❌ **부족한 점**
- API 명세 완전히 부재
- 기존 구조 파악 필요
- 사용자 인증 전략 미흡
- 상세 코드 예시 없음
- 테스트 전략 단순
- 배포 전략 없음

**권장:**
- Phase 0 추가 (기존 구조 분석)
- API 명세서 작성
- 이전에 제공한 "보완 가이드"와 병합
- 구체적인 코드 예시 추가

이 검토 결과를 바탕으로 **최종 통합 계획**을 작성하겠습니다.
