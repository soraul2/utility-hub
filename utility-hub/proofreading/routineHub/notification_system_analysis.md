# Routine Hub 알림 시스템 분석 및 설계

> 작성일: 2026-02-07
> 분석 범위: Frontend (React + Vite + Zustand) / Backend (Spring Boot + JPA)
> 대상 사용자: 20~30대 직장인 (Daily Planner + Monthly Calendar + Weekly Review + Theme Shop)
> 현재 상태: 알림 시스템 미구현, Service Worker 미등록, PWA 미적용

---

## I. 기술 옵션 비교

루틴 허브에 적용 가능한 5가지 알림 기술을 비교한다.

### 1. Web Push API (Service Worker + VAPID Keys)

**개요**: W3C 표준 Push API를 사용하여 Service Worker가 백그라운드에서 Push 이벤트를 수신하고 시스템 알림을 표시하는 방식이다. VAPID(Voluntary Application Server Identification) 키를 사용해 서버를 식별한다.

| 항목 | 내용 |
|------|------|
| 장점 | - W3C 표준으로 vendor lock-in 없음 |
|      | - 브라우저가 닫혀 있어도 알림 수신 가능 (데스크톱) |
|      | - 무료 (Push Service 자체는 브라우저 벤더가 운영) |
|      | - VAPID 키는 자체 생성 가능, 외부 서비스 의존 없음 |
|      | - 사용자별 Subscription 관리로 세밀한 타게팅 가능 |
| 단점 | - iOS Safari 지원이 2023년부터 시작되어 아직 제한적 (PWA로 설치한 경우에만 동작) |
|      | - 사용자의 알림 허용이 필수 (permission prompt 거부율 40~60%) |
|      | - Service Worker 라이프사이클 관리 복잡도 있음 |
|      | - Subscription이 만료되거나 변경될 수 있어 갱신 로직 필요 |
| 구현 복잡도 | **중** - Service Worker 등록 + VAPID 키 생성 + 백엔드 Push 전송 로직 + Subscription 저장 Entity |
| 비용 | **무료** - Push Service는 Chrome(FCM 기반), Firefox(Mozilla Push), Safari(APNs) 각 벤더가 무상 제공 |

**현재 프로젝트 적합성**: Vite 기반 React 앱에 Service Worker를 추가 등록해야 한다. 현재 `vite.config.ts`에 PWA 플러그인이 없으므로 `vite-plugin-pwa` 도입 또는 수동 등록이 필요하다.

---

### 2. Firebase Cloud Messaging (FCM)

**개요**: Google의 Firebase 플랫폼이 제공하는 메시징 서비스다. 내부적으로 Web Push API를 래핑하여 제공하며, 모바일 네이티브(Android/iOS) 지원이 강점이다.

| 항목 | 내용 |
|------|------|
| 장점 | - Android에서 안정적이고 배터리 최적화된 Push 제공 |
|      | - Firebase Console에서 A/B 테스트, 세그먼트 타게팅 등 마케팅 도구 내장 |
|      | - Topic 기반 그룹 메시징 지원 |
|      | - 웹/Android/iOS 통합 API 제공 |
|      | - 풍부한 문서와 커뮤니티 |
| 단점 | - Google 종속 (vendor lock-in) |
|      | - Firebase SDK 추가로 번들 사이즈 증가 (firebase-messaging ~50KB gzipped) |
|      | - 웹에서의 동작은 결국 Web Push API 래핑이므로 근본적 제약 동일 |
|      | - Firebase 프로젝트 생성 및 설정 필요 |
|      | - 한국 사용자 대상 iOS Push는 APNs 직접 연동이 더 안정적일 수 있음 |
| 구현 복잡도 | **중~상** - Firebase 프로젝트 설정 + SDK 통합 + Server Key 관리 + FCM Admin SDK(Java) 백엔드 연동 |
| 비용 | **무료** (Spark Plan 기준, 메시지 수 무제한) - 단, Firebase 전체 사용량이 커지면 Blaze Plan 필요 |

**현재 프로젝트 적합성**: 현재 백엔드가 Spring Boot이므로 `firebase-admin` Java SDK를 의존성에 추가해야 한다. 웹 전용이라면 오버엔지니어링이 될 수 있으나, 향후 모바일 앱(React Native 등) 확장 시 가치가 높다.

---

### 3. Email 알림

**개요**: 사용자의 이메일 주소로 알림 메일을 발송하는 전통적인 방식이다. Spring Boot의 `JavaMailSender`로 구현한다.

| 항목 | 내용 |
|------|------|
| 장점 | - 모든 플랫폼에서 동작 (브라우저, OS 제약 없음) |
|      | - 사용자가 알림 허용을 별도로 할 필요 없음 |
|      | - 이메일 자체가 기록으로 남음 (월간 리포트 등에 적합) |
|      | - Spring Boot에서 `spring-boot-starter-mail`로 간단하게 구현 가능 |
| 단점 | - 실시간성 부족 (이메일 확인까지 시간 차이 발생) |
|      | - 스팸함으로 분류될 위험 (특히 Gmail, Naver) |
|      | - 20~30대 직장인의 이메일 확인 빈도가 낮을 수 있음 (카카오톡/슬랙 중심) |
|      | - 별도 SMTP 서버 또는 외부 서비스(SendGrid, AWS SES) 필요 |
|      | - 아침 루틴 시작 같은 즉시성 알림에는 부적합 |
| 구현 복잡도 | **하** - `JavaMailSender` + HTML 템플릿 정도 |
| 비용 | **저~중** - SendGrid 무료 티어 100통/일, AWS SES $0.10/1000통 |

**현재 프로젝트 적합성**: `User` Entity에 `email` 필드가 이미 존재한다. OAuth 로그인 시 이메일을 수집하고 있으므로 별도 수집 없이 바로 활용 가능하다. 다만 `email`이 `nullable = true`이므로 이메일 미제공 사용자 처리 로직이 필요하다.

---

### 4. PWA Notification API

**개요**: `Notification` Web API를 사용하여 브라우저가 포그라운드(활성 탭)에 있을 때 시스템 알림을 표시하는 방식이다. Service Worker 없이도 동작하지만, 백그라운드 알림을 위해서는 Service Worker가 필요하다.

| 항목 | 내용 |
|------|------|
| 장점 | - 구현이 매우 단순 (`new Notification('title', options)`) |
|      | - Service Worker 없이 포그라운드 알림 가능 |
|      | - Web Push와 결합 시 완전한 Push 알림 체계 완성 |
|      | - 크롬, 파이어폭스, 엣지에서 안정적 동작 |
| 단점 | - 포그라운드 전용이므로 브라우저/탭이 닫히면 알림 불가 |
|      | - PWA로 설치하지 않으면 iOS에서 동작하지 않음 |
|      | - Service Worker + Web Push와 혼동되기 쉬움 (실제로는 별개 API) |
|      | - 단독 사용 시 "앱을 켜놔야 알림이 온다"는 치명적 제약 |
| 구현 복잡도 | **하** - 프론트엔드 JavaScript만으로 가능, 백엔드 변경 불필요 |
| 비용 | **무료** |

**현재 프로젝트 적합성**: 현재 앱이 SPA(Single Page Application)이므로 사용자가 앱 탭을 열어놓은 상태에서의 타이머 기반 알림(예: 포커스 타이머 종료 알림)에는 즉시 적용 가능하다. 하지만 아침 루틴 알림처럼 앱 비활성 상태에서의 알림에는 부적합하다.

---

### 5. In-app 알림 (Toast / Badge)

**개요**: 앱 내부에서 Toast 메시지, Badge 카운터, 알림 센터 UI 등을 통해 사용자에게 정보를 전달하는 방식이다. OS 수준의 Push가 아닌 앱 레벨의 UI 피드백이다.

| 항목 | 내용 |
|------|------|
| 장점 | - 구현이 가장 단순 (프론트엔드 UI 컴포넌트만 추가) |
|      | - OS 알림 권한 불필요 (허용 거부율 0%) |
|      | - 모든 브라우저/OS에서 100% 동작 |
|      | - 앱 내 맥락에 맞는 풍부한 UI 표현 가능 (액션 버튼, 링크 등) |
|      | - 실시간 알림(WebSocket 연동) 가능 |
|      | - 연속 달성 축하, 포인트 마일스톤 등 감성적 알림에 최적 |
| 단점 | - 앱을 열어야만 알림 확인 가능 (근본적 한계) |
|      | - 아침 알림, 리마인더 등 능동적 알림에는 사용 불가 |
|      | - 앱 이탈 방지 효과는 있으나 재방문 유도 효과는 없음 |
| 구현 복잡도 | **하** - Toast 라이브러리(react-hot-toast, sonner 등) + 알림 센터 컴포넌트 |
| 비용 | **무료** |

**현재 프로젝트 적합성**: 현재 프론트엔드에 Toast 시스템이 없다. 에러 처리 시 Zustand의 `error` state를 사용하고 있으나 통합된 알림 UI가 없다. 이 부분은 알림 시스템과 무관하게 UX 개선 차원에서 즉시 도입이 권장된다.

---

### 기술 옵션 종합 비교표

| 기술 | 브라우저 닫힘 시 | iOS 지원 | 알림 허용 필요 | 구현 복잡도 | 비용 | 재방문 유도 |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| Web Push API | O | 제한적 (PWA 설치 시) | O | 중 | 무료 | **강** |
| FCM | O | 제한적 (웹) / O (네이티브) | O | 중~상 | 무료 | **강** |
| Email | O | O | X | 하 | 저~중 | 중 |
| PWA Notification | X (포그라운드만) | X (일반 브라우저) | O | 하 | 무료 | 약 |
| In-app (Toast/Badge) | X | O | X | 하 | 무료 | 약 |

---

## II. 루틴 허브에 적합한 알림 시나리오

20~30대 직장인의 일과 패턴(target_persona.md 참고)과 현재 앱의 기능 구조를 바탕으로 의미 있는 알림 시나리오를 정의한다.

### 시나리오 1: 아침 루틴 시작 알림

| 항목 | 내용 |
|------|------|
| 발송 시점 | 매일 오전 06:00 (사용자 설정 가능) |
| 메시지 예시 | "좋은 아침이에요! 오늘의 플랜을 확인하세요." |
| 트리거 조건 | 오늘 날짜의 DailyPlan이 존재하는 사용자 전체 |
| 클릭 시 이동 | `/routine/daily` (DailyPlanPage) |
| 적합한 기술 | Web Push API, FCM |
| 기대 효과 | DAU(Daily Active Users) 증가, 아침 접속 습관 형성 |

**연관 코드**: `RoutineService.getOrCreateTodayPlan()` - 사용자가 접속하면 자동으로 오늘 플랜을 생성하는 로직이 이미 존재한다. 알림은 이 메서드를 호출하는 것이 아니라 단순히 "접속을 유도"하는 역할이다.

---

### 시나리오 2: 플랜 미확정 리마인더

| 항목 | 내용 |
|------|------|
| 발송 시점 | 매일 오전 09:00 (업무 시작 시간) |
| 메시지 예시 | "오늘의 플랜이 아직 확정되지 않았어요. 확정하고 실행 모드로 전환하세요!" |
| 트리거 조건 | 오늘 DailyPlan의 `status == PLANNING`인 사용자 |
| 클릭 시 이동 | `/routine/daily` (확정 버튼 하이라이트) |
| 적합한 기술 | Web Push API, In-app Toast (앱 내 접속 시) |
| 기대 효과 | 플랜 확정률 향상, Kinetic Timeline 활용도 증가 |

**연관 코드**: `PlanStatus` enum이 `PLANNING`과 `CONFIRMED` 두 상태를 가진다. `DailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc()`로 상태를 조회하여 조건부 발송한다.

---

### 시나리오 3: 주간 리뷰 알림

| 항목 | 내용 |
|------|------|
| 발송 시점 | 매주 일요일 오후 20:00 |
| 메시지 예시 | "이번 주를 돌아볼 시간이에요. 주간 리뷰를 작성해보세요." |
| 트리거 조건 | 해당 주 WeeklyReview가 작성되지 않은 사용자 |
| 클릭 시 이동 | `/routine/weekly` (WeeklyReviewPage) |
| 적합한 기술 | Web Push API, Email (주간 리포트 겸용) |
| 기대 효과 | 주간 리뷰 작성률 향상, 주말 앱 사용 습관 형성 |

**연관 코드**: `WeeklyReviewRepository.findByUserAndWeekStart()`로 해당 주 리뷰 존재 여부를 확인할 수 있다. 현재 `WeeklyReview` Entity에는 `weekStart`(LocalDate)가 있어 주 시작일 기준 조회가 가능하다.

---

### 시나리오 4: 연속 달성 축하

| 항목 | 내용 |
|------|------|
| 발송 시점 | 태스크 전체 완료 시 실시간 / 다음 날 접속 시 |
| 메시지 예시 | "3일 연속 100% 달성! 대단해요, 이 흐름을 이어가세요!" |
| 트리거 조건 | N일 연속 모든 keyTasks가 completed인 경우 |
| 클릭 시 이동 | `/routine/monthly` (달성 streak 시각화) |
| 적합한 기술 | In-app Toast + Badge (즉시), Web Push (다음 날 아침) |
| 기대 효과 | 성취감 극대화, 연속 사용 동기 부여, 리텐션 핵심 |

**연관 코드**: `calculateDailyRate()` 메서드가 일별 달성률을 계산한다. Streak 계산 로직은 현재 없으므로 새로 구현해야 한다. `MonthlyStatusResponse.DailySummary`의 `completionRate`를 연속으로 확인하여 streak을 산출할 수 있다.

**Streak 계산 로직 (신규 필요)**:
```
1. 사용자의 최근 N일 DailyPlan을 조회
2. 연속으로 completionRate == 100 (또는 isRest == true)인 일수 계산
3. streak >= 3이면 축하 알림 발송
4. 마일스톤 (3일, 7일, 14일, 30일)마다 특별 알림
```

---

### 시나리오 5: 포인트/테마 관련 알림

| 항목 | 내용 |
|------|------|
| 발송 시점 | XP 마일스톤 달성 시 / 새 테마 구매 가능 시 |
| 메시지 예시 (a) | "XP 500 달성! 새로운 테마를 구매할 수 있어요." |
| 메시지 예시 (b) | "축하해요! 'Aurora Borealis' 테마를 구매할 수 있는 포인트가 모였어요." |
| 트리거 조건 | `totalEarned - totalSpent`가 특정 테마 가격 이상이 된 시점 |
| 클릭 시 이동 | `/shop` (ShopPage) |
| 적합한 기술 | In-app Toast + Badge |
| 기대 효과 | 테마 샵 방문 유도, 포인트 시스템 인지도 향상, 게이미피케이션 강화 |

**연관 코드**: `XpCalculator.calculate()`가 월별 XP를 산출한다. `ShopService.buildPointBalance()`가 가용 포인트를 계산한다. `ThemeCatalog`에 정의된 테마별 가격과 비교하여 구매 가능 테마를 판별할 수 있다.

**XP 마일스톤 기준 (ThemeCatalog 가격 기반)**:
| 마일스톤 XP | 구매 가능 테마 예시 |
|---|---|
| 100 | Ocean Blue, Forest Green |
| 150 | Sunset Glow, Lavender Dream |
| 200 | Rose Gold, Starfield, Geometric |
| 250 | Sakura |
| 500 | Aurora Borealis, Cosmic Nebula |

---

### 시나리오 6: 월간 리포트 알림

| 항목 | 내용 |
|------|------|
| 발송 시점 | 매월 1일 오전 09:00 |
| 메시지 예시 | "1월 리포트가 준비되었어요! 지난 달 달성률 78%, 총 1,250 XP를 획득했어요." |
| 트리거 조건 | 전월에 1개 이상의 DailyPlan이 존재하는 사용자 |
| 클릭 시 이동 | `/routine/monthly?year=YYYY&month=MM` (전월) |
| 적합한 기술 | Email + Web Push (병행) |
| 기대 효과 | 월초 재방문 유도, 성장 인식, 장기 리텐션 |

**연관 코드**: `RoutineService.getMonthlyStatus()`가 월별 통계를 산출한다. `MonthlyLog` Entity에 `totalXp`가 캐시되어 있어 전월 XP를 빠르게 조회 가능하다. `monthlyCompletionRate` 계산 로직도 이미 존재한다.

---

### 시나리오 7: 하루 회고 리마인더

| 항목 | 내용 |
|------|------|
| 발송 시점 | 매일 오후 22:00 (사용자 설정 가능) |
| 메시지 예시 | "오늘 하루 수고했어요. 간단히 회고를 남겨보세요." |
| 트리거 조건 | 오늘 DailyPlan이 `CONFIRMED`이지만 Reflection이 null인 사용자 |
| 클릭 시 이동 | `/routine/reflection` (ReflectionPage) |
| 적합한 기술 | Web Push API |
| 기대 효과 | 회고 작성률 향상, XP 추가 획득 유도 (회고 1건 = +20 XP) |

**연관 코드**: `DailyPlan.reflection` 필드가 null인지 확인하면 된다. `Reflection` 작성 시 `XpCalculator`에서 +20 XP가 부여되므로 "회고 작성으로 +20 XP를 획득하세요"라는 메시지로 동기 부여가 가능하다.

---

## III. 구현 복잡도 vs 사용자 가치 매트릭스

### 평가 기준

- **구현 난이도**: 현재 코드베이스 기준으로 필요한 변경 범위 (Entity 추가, 인프라 변경, 신규 서비스 등)
- **사용자 가치**: 타겟 페르소나(20~30대 직장인)의 리텐션과 만족도에 미치는 영향

### 매트릭스

| 시나리오 | 구현 난이도 | 사용자 가치 | 우선순위 | 비고 |
|----------|:---:|:---:|:---:|------|
| 시나리오 4: 연속 달성 축하 | **하** | **상** | **P0 (최우선)** | In-app Toast로 즉시 구현 가능. Streak 계산만 추가하면 됨. 리텐션 핵심 드라이버. |
| 시나리오 5: 포인트/테마 알림 | **하** | **중** | **P1** | In-app Toast로 즉시 구현 가능. 게이미피케이션 강화. ShopService에 로직 추가. |
| 시나리오 2: 플랜 미확정 리마인더 | **중** | **상** | **P1** | In-app(접속 시) + Web Push(미접속 시) 이중 전략. 핵심 기능 활용도 향상. |
| 시나리오 1: 아침 루틴 시작 알림 | **중** | **상** | **P1** | Web Push 인프라가 전제. DAU 직접 영향. |
| 시나리오 7: 하루 회고 리마인더 | **중** | **중** | **P2** | Web Push 인프라 구축 후 추가 비용 낮음. XP 연동으로 동기 부여 효과. |
| 시나리오 3: 주간 리뷰 알림 | **중** | **중** | **P2** | 주 1회 발송으로 스팸 부담 없음. 주말 리텐션 강화. |
| 시나리오 6: 월간 리포트 | **상** | **중** | **P3** | Email 인프라 + HTML 템플릿 + 통계 집계 필요. 장기 리텐션 효과는 높으나 구현 비용도 높음. |

### 시각적 매트릭스

```
사용자 가치
    상 |  [시나리오1]  [시나리오2]  |  [시나리오4]
       |              아침알림     미확정리마인더  |  연속달성축하
       |                                        |
    중 |  [시나리오6]  [시나리오3]  |  [시나리오5]
       |  월간리포트    주간리뷰알림  [시나리오7]  |  포인트알림
       |                          회고리마인더   |
    하 |                                        |
       +-------------------+--------------------+
                상                중                하
                         구현 난이도 (좌측이 어려움)
```

**핵심 인사이트**: 우측 상단(구현 쉬움 + 가치 높음)에 위치한 **연속 달성 축하(시나리오 4)**가 가장 먼저 구현해야 할 알림이다. In-app Toast만으로 즉시 구현 가능하면서 리텐션에 가장 직접적인 영향을 미친다.

---

## IV. 추천 방안: 3-Phase 접근

루틴 허브의 현재 아키텍처(Vite + React SPA, Spring Boot 백엔드)와 타겟 사용자의 주 사용 환경(데스크톱 브라우저 + 모바일 브라우저)을 고려하여 단계적 도입을 추천한다.

### Phase 1: In-app 알림 시스템 (즉시 구현 가능)

**목표**: 앱 내 접속 상태에서의 피드백 강화

**범위**:
- Toast 알림 컴포넌트 도입 (react-hot-toast 또는 sonner)
- 알림 센터 UI (Header에 Bell 아이콘 + 읽지 않은 알림 Badge)
- 연속 달성 축하 알림 (시나리오 4)
- 포인트 마일스톤 알림 (시나리오 5)
- 플랜 미확정 In-app 리마인더 (시나리오 2의 부분 구현)

**구현 사항**:

```
Frontend:
  - Toast Provider 추가 (App.tsx)
  - NotificationCenter 컴포넌트 (Header 우측)
  - useNotification 커스텀 Hook
  - 알림 상태 관리 (Zustand store 또는 별도 store)

Backend:
  - Streak 계산 유틸리티 (XpCalculator 옆에 StreakCalculator)
  - 알림 이벤트 DTO
  - 기존 API 응답에 알림 데이터 포함 (예: toggleTask 시 streak 정보)
```

**예상 소요 기간**: 2~3일

**기대 효과**:
- 태스크 완료 시 즉각적 성취감 피드백
- 포인트 시스템 인지도 향상으로 테마 샵 방문 증가
- 기존 에러 상태(`error` in Zustand)를 Toast로 통합하여 UX 일관성 확보

---

### Phase 2: PWA + Web Push API (핵심 단계)

**목표**: 브라우저가 닫혀 있어도 알림을 전달하여 재방문 유도

**범위**:
- Service Worker 등록 (vite-plugin-pwa)
- Web App Manifest 설정 (PWA 설치 가능하게)
- VAPID 키 생성 및 관리
- Push Subscription 저장 (새 Entity)
- 백엔드 스케줄러 (@Scheduled)
- 아침 루틴 알림 (시나리오 1)
- 플랜 미확정 Push 리마인더 (시나리오 2)
- 하루 회고 리마인더 (시나리오 7)
- 주간 리뷰 알림 (시나리오 3)
- 사용자별 알림 설정 UI

**구현 사항**:

```
Frontend:
  - vite-plugin-pwa 설치 및 설정
  - manifest.json (앱 이름, 아이콘, 테마 색상)
  - Service Worker (push event handler)
  - Push Subscription 등록/해제 로직
  - 알림 설정 페이지 (NotificationSettingsPage)

Backend:
  - PushSubscription Entity (user_id, endpoint, p256dh, auth, created_at)
  - NotificationPreference Entity (user_id, type, enabled, schedule_time)
  - VAPID 키 생성 (web-push 라이브러리 또는 nl.martijndwars:web-push-java)
  - PushNotificationService (구독 관리, 알림 전송)
  - NotificationScheduler (@Scheduled cron jobs)
    - 06:00: 아침 알림 배치
    - 09:00: 플랜 미확정 리마인더 배치
    - 20:00 (일요일): 주간 리뷰 알림 배치
    - 22:00: 회고 리마인더 배치
```

**예상 소요 기간**: 1~2주

**기대 효과**:
- DAU 20~30% 증가 예상 (Push 알림의 평균 재방문율)
- 아침 접속 습관 형성 (알림 -> 플랜 확인 -> 실행 사이클)
- 플랜 확정률 및 회고 작성률 향상
- PWA 설치 유도로 앱 접근성 향상

---

### Phase 3: FCM 연동 (선택적 확장)

**목표**: 모바일 Push 안정성 향상 및 향후 네이티브 앱 대비

**범위**:
- Firebase 프로젝트 설정
- FCM SDK 프론트엔드 통합
- firebase-admin Java SDK 백엔드 연동
- FCM Token 관리
- Web Push와 FCM 이중 발송 또는 선택적 발송

**구현 사항**:

```
Frontend:
  - firebase SDK 설치 (firebase, firebase/messaging)
  - FCM Token 발급 및 백엔드 전송
  - Service Worker에 FCM 메시지 핸들러 추가

Backend:
  - firebase-admin SDK 의존성 추가
  - FCM Token 저장 (PushSubscription Entity 확장 또는 별도 Entity)
  - FcmNotificationService (FCM 전송 전용)
  - NotificationService에서 Web Push / FCM 분기 처리
```

**예상 소요 기간**: 3~5일 (Phase 2 완료 후)

**도입 조건**: 다음 중 하나 이상 충족 시 도입 권장
- 모바일 사용자 비율이 50% 이상일 때
- React Native/Flutter 등 네이티브 앱 개발 계획이 있을 때
- Web Push API의 iOS Safari 제한이 비즈니스에 유의미한 영향을 줄 때

---

## V. 필요 인프라

### 5.1 Service Worker 등록

현재 `vite.config.ts`에 PWA 관련 설정이 없다. `vite-plugin-pwa`를 도입한다.

```
// 설치
npm install -D vite-plugin-pwa

// vite.config.ts에 추가할 설정 개요
- VitePWA 플러그인 등록
- registerType: 'autoUpdate'
- manifest 설정 (name, short_name, theme_color, icons)
- Service Worker 전략: generateSW (Workbox) 또는 injectManifest (커스텀 SW)
- Push Event Handler는 커스텀 SW가 필요하므로 injectManifest 권장
```

**Service Worker 핵심 역할**:
1. Push Event 수신 -> Notification 표시
2. Notification Click -> 해당 페이지로 라우팅
3. (선택) 오프라인 캐싱으로 앱 로딩 속도 향상

---

### 5.2 VAPID 키 생성/관리

```
VAPID (Voluntary Application Server Identification):
- 공개키 (Public Key): 프론트엔드에서 Push 구독 시 사용
- 비밀키 (Private Key): 백엔드에서 Push 메시지 서명 시 사용
- 1회 생성 후 application.yml에 저장 (또는 환경 변수)
```

**Java 라이브러리**: `nl.martijndwars:web-push-java` (가장 널리 사용되는 Java Web Push 라이브러리)

```
// build.gradle에 추가
implementation 'nl.martijndwars:web-push-java:5.1.1'
implementation 'org.bouncycastle:bcprov-jdk18on:1.78'

// application.yml
vapid:
  public-key: ${VAPID_PUBLIC_KEY}
  private-key: ${VAPID_PRIVATE_KEY}
  subject: mailto:admin@routinehub.app
```

---

### 5.3 백엔드 스케줄러 (Spring @Scheduled)

현재 프로젝트에 스케줄러 설정이 없으므로 새로 구성해야 한다.

```
필요 구성:
1. @EnableScheduling 어노테이션 추가 (Application 클래스 또는 별도 Config)
2. NotificationScheduler 클래스 생성
3. 각 알림 시나리오별 @Scheduled 메서드

스케줄 계획:
- 0 0 6 * * *     : 아침 루틴 알림 (매일 06:00)
- 0 0 9 * * MON-FRI: 플랜 미확정 리마인더 (평일 09:00)
- 0 0 20 * * SUN  : 주간 리뷰 알림 (일요일 20:00)
- 0 0 22 * * *    : 하루 회고 리마인더 (매일 22:00)
- 0 0 9 1 * *     : 월간 리포트 알림 (매월 1일 09:00)
```

**주의사항**:
- `@Scheduled`는 단일 인스턴스에서만 동작한다. 서버 다중 인스턴스 배포 시 ShedLock 또는 Redis 분산 잠금 필요.
- 사용자별 커스텀 시간대를 지원하려면 사용자 timezone 저장이 필요하다. 초기에는 KST 고정으로 시작.
- 대량 Push 발송 시 비동기 처리 필요 (`@Async` 또는 CompletableFuture).

---

### 5.4 사용자별 Push Subscription 저장 (새 Entity)

현재 프로젝트에 없는 새로운 Entity가 필요하다.

**Entity 1: PushSubscription**

```
@Entity
@Table(name = "push_subscriptions")
PushSubscription:
  - id (Long, PK)
  - user (ManyToOne -> User)
  - endpoint (String, 500자, NOT NULL)    // Push Service endpoint URL
  - p256dh (String, 200자, NOT NULL)       // 클라이언트 공개키
  - auth (String, 200자, NOT NULL)         // 인증 시크릿
  - userAgent (String, 500자)              // 디바이스 식별용
  - createdAt (LocalDateTime)
  - lastUsedAt (LocalDateTime)             // 마지막 Push 성공 시점

  UNIQUE CONSTRAINT: (user_id, endpoint)
```

**Entity 2: NotificationPreference**

```
@Entity
@Table(name = "notification_preferences")
NotificationPreference:
  - id (Long, PK)
  - user (ManyToOne -> User)
  - notificationType (Enum: MORNING_ROUTINE, PLAN_REMINDER, WEEKLY_REVIEW,
                             STREAK_CELEBRATION, POINT_MILESTONE,
                             MONTHLY_REPORT, REFLECTION_REMINDER)
  - enabled (boolean, default true)
  - customTime (LocalTime, nullable)       // 사용자 커스텀 알림 시간
  - createdAt (LocalDateTime)
  - updatedAt (LocalDateTime)

  UNIQUE CONSTRAINT: (user_id, notification_type)
```

**Entity 3: NotificationLog (선택)**

```
@Entity
@Table(name = "notification_logs")
NotificationLog:
  - id (Long, PK)
  - user (ManyToOne -> User)
  - notificationType (Enum)
  - title (String)
  - body (String)
  - sentAt (LocalDateTime)
  - clickedAt (LocalDateTime, nullable)    // 알림 클릭 시 기록 (효과 측정)
  - status (Enum: SENT, DELIVERED, CLICKED, FAILED)
```

---

### 5.5 알림 설정 UI

사용자가 원하는 알림만 선택적으로 받을 수 있는 설정 화면이 필요하다.

**화면 구성**:

```
알림 설정 (NotificationSettingsPage)
├── Push 알림 허용 (토글)
│   └── [허용하기] 버튼 -> Notification.requestPermission()
│
├── 알림 유형별 설정
│   ├── 아침 루틴 알림          [ON/OFF]  시간 설정: [06:00]
│   ├── 플랜 미확정 리마인더     [ON/OFF]  시간 설정: [09:00]
│   ├── 하루 회고 리마인더       [ON/OFF]  시간 설정: [22:00]
│   ├── 주간 리뷰 알림          [ON/OFF]
│   ├── 연속 달성 축하          [ON/OFF]
│   ├── 포인트/테마 알림        [ON/OFF]
│   └── 월간 리포트             [ON/OFF]
│
└── 방해금지 시간 (선택)
    └── [23:00] ~ [07:00] 사이 알림 차단
```

**UI 위치**: 기존 `RoutineLayout`의 사이드바 또는 Header의 프로필 메뉴에서 접근 가능하도록 배치. 현재 `Header.tsx`에 사용자 메뉴가 있으므로 그 하위에 "알림 설정" 메뉴를 추가한다.

---

## VI. 결론 및 로드맵

### 핵심 결론

1. **즉시 구현 가능한 In-app 알림부터 시작**하는 것이 ROI가 가장 높다. Toast 컴포넌트 도입과 연속 달성 축하 알림은 2~3일 투자로 유의미한 리텐션 개선을 기대할 수 있다.

2. **Web Push API가 루틴 허브에 가장 적합한 기술**이다. FCM은 현재 웹 전용 서비스에서는 과도한 의존성이며, Email은 20~30대 직장인의 행동 패턴과 맞지 않는다. 표준 Web Push + VAPID가 비용, 복잡도, 효과 모든 면에서 최적이다.

3. **알림은 "성취감 피드백"과 "행동 유도" 두 축**으로 설계해야 한다. 연속 달성 축하/포인트 알림은 성취감 피드백이고, 아침 알림/미확정 리마인더는 행동 유도다. 두 유형을 균형 있게 갖춰야 사용자가 알림을 "도움이 되는 것"으로 인식한다.

4. **사용자 제어권 확보는 필수**다. 알림 빈도와 유형을 사용자가 직접 관리할 수 있어야 한다. 알림 설정 UI 없이 Push를 보내면 이탈을 오히려 가속시킨다.

---

### 구현 로드맵

```
Phase 1 (Week 1)                Phase 2 (Week 2~3)              Phase 3 (선택, Week 4~)
In-app 알림 기반                  Web Push 인프라                  FCM / Email 확장
─────────────────               ─────────────────               ─────────────────
[1] Toast 라이브러리 도입          [5] vite-plugin-pwa 설정         [9] Firebase 프로젝트 설정
[2] 연속 달성 축하 알림            [6] VAPID 키 + SW 등록           [10] FCM SDK 통합
[3] 포인트 마일스톤 알림           [7] PushSubscription Entity      [11] 월간 리포트 Email
[4] 플랜 미확정 In-app 알림       [8] 스케줄러 + Push 발송          [12] 분석 대시보드
                                  [8a] 아침 루틴 알림
                                  [8b] 회고 리마인더
                                  [8c] 주간 리뷰 알림
                                  [8d] 알림 설정 UI
```

### Phase별 기대 성과

| Phase | 핵심 지표 | 기대 효과 |
|-------|-----------|-----------|
| Phase 1 | 세션 내 태스크 완료율 | +15~20% (즉각적 피드백으로 완료 동기 강화) |
| Phase 2 | DAU, 플랜 확정률, 회고 작성률 | DAU +20~30%, 확정률 +25%, 회고율 +30% |
| Phase 3 | 모바일 사용자 리텐션, 월간 재방문 | 모바일 Push 도달률 향상, 장기 리텐션 개선 |

### 최종 우선순위 요약

| 순위 | 작업 | 난이도 | 효과 |
|:---:|------|:---:|:---:|
| 1 | Toast 알림 시스템 + 연속 달성 축하 | 하 | 상 |
| 2 | 포인트 마일스톤 + 미확정 In-app 리마인더 | 하 | 중 |
| 3 | PWA 설정 + Service Worker 등록 | 중 | 상 |
| 4 | VAPID + PushSubscription Entity | 중 | 상 |
| 5 | 아침/회고/주간 스케줄러 Push 발송 | 중 | 상 |
| 6 | 알림 설정 UI + NotificationPreference Entity | 중 | 중 |
| 7 | FCM 통합 (모바일 사용자 증가 시) | 중~상 | 중 |
| 8 | Email 월간 리포트 | 상 | 중 |

---

> 본 문서는 루틴 허브의 현재 코드베이스(Spring Boot + React + Vite + Zustand)를 직접 분석하여 작성되었다. 구체적인 Entity 구조, 기존 서비스 메서드와의 연동 지점, XP 계산 로직 등 실제 구현 가능한 수준의 설계를 포함한다.
