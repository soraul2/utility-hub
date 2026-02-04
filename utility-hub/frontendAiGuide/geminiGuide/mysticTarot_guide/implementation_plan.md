# 미스틱 타로 공유 및 저장 구현 계획

이 계획은 로그인 로직 분석 결과를 바탕으로 미스틱 타로 결과의 "저장(계정 연동)" 및 "공유" 기능을 구현하기 위한 것입니다.

## 분석 결과

### 1. 인증 상태 (Authentication Status)
- **백엔드**: Spring Security + OAuth2 (구글/네이버) + JWT를 사용 중입니다.
- **프론트엔드**: `AuthContext`가 전역 인증 상태를 관리합니다.
- **문제점**: 현재 타로 서비스는 `Memeber` 엔티티와 연동되지 않고, 단순히 `userName` 문자열만 사용하고 있어 로그인한 사용자의 기록으로 남지 않습니다.

### 2. 저장 메커니즘 (Persistence)
- **현재 상태**: `TarotReadingService`는 이미 모든 리딩 결과를 `TarotReadingSession` 테이블에 **저장하고 있습니다**.
- **누락된 연결**: 저장된 세션들이 특정 회원과 연결되지 않은 채 '고아(orphan)' 상태로 남습니다.
- **목표**: 사용자가 로그인한 상태라면 `TarotReadingSession`을 `Member`와 연결합니다.

### 3. 공유 메커니즘 (Sharing Mechanism)
- **현재 상태**: 공유 기능이 없습니다.
- **목표**: 사용자가 자신의 리딩 결과를 고유 링크(URL)를 통해 다른 사람과 공유할 수 있게 합니다.
- **설계**:
    - 공개 엔드포인트: `/api/tarot/share/{sessionId}` (읽기 전용)
    - 프론트엔드 라우트: `/tarot/share/:sessionId`

## 사용자 검토 필요

> [!IMPORTANT]
> **개인정보 보호 (Privacy Consideration)**
> 공유된 링크는 해당 링크를 가진 **누구나 볼 수 있는 공개 상태**가 됩니다 (UUID 등으로 예측 불가능하게 만들 예정). 이 방식이 괜찮으신가요? (MVP 단계에서는 일반적인 방식입니다.)

> [!WARNING]
> **데이터베이스 변경 (Database Change)**
> `TarotReadingSession` 테이블에 `Member`와의 관계(Foreign Key)를 추가해야 하므로 스키마 변경이 필요합니다.

## 변경 제안 (Proposed Changes)

### 백엔드 (Backend)

#### [수정] 타로 엔티티 및 DTO
- **파일**: `backend/src/main/java/com/wootae/backend/domain/tarot/entity/TarotReadingSession.java`
    - `private Long memberId;` 필드 추가 (모듈 간 결합도를 낮추기 위해 ID 참조 방식 사용 권장, 혹은 JPA 연관관계 매핑).

- **파일**: `backend/src/main/java/com/wootae/backend/domain/tarot/dto/TarotDTOs.java`
    - `ShareResponse` DTO 추가 (리딩 데이터의 일부만 포함).

#### [수정] 타로 서비스 및 컨트롤러
- **파일**: `backend/src/main/java/com/wootae/backend/domain/tarot/controller/TarotController.java`
    - `createThreeCardReading` / `createDailyReading` 메서드에 `@AuthenticationPrincipal`을 파라미터로 추가하여 로그인 사용자 정보를 받습니다.
    - `@GetMapping("/share/{sessionId}")` 엔드포인트를 추가합니다.

- **파일**: `backend/src/main/java/com/wootae/backend/domain/tarot/service/TarotReadingService.java`
    - 세션 저장 시, 로그인 정보가 있다면 `memberId`를 함께 저장하도록 로직을 수정합니다.
    - `getSharedReading(String sessionId)` 메서드를 구현합니다.

### 프론트엔드 (Frontend)

#### [신규] 공유 페이지 (Share Page)
- **파일**: `frontend/src/pages/tarot/TarotSharePage.tsx`
    - 결과 화면의 읽기 전용 버전입니다.
    - `/api/tarot/share/:sessionId`에서 데이터를 가져와 표시합니다.

#### [수정] 결과 화면 (Result Views)
- **파일**: `frontend/src/pages/tarot/components/DailyCardResultView.tsx`
- **파일**: `frontend/src/pages/tarot/components/ResultStep.tsx` (3카드용)
    - "결과 공유하기" 버튼을 추가합니다.
    - 로직: `navigator.clipboard.writeText(...)`를 사용하여 링크 복사 및 토스트 알림 표시.

#### [수정] 앱 라우팅 (App Routing)
- **파일**: `frontend/src/App.tsx`
    - 라우트 추가: `/tarot/share/:sessionId`

## 작업 규모 추정 (Work Estimate)

### 백엔드 (Backend)
- **난이도**: 하 (Low)
- **파일 변경**: 약 4개 (`TarotReadingSession`, `TarotDTOs`, `TarotController`, `TarotReadingService`)
- **작업 내용**: DB 스키마에 컬럼 하나 추가 및 간단한 조회/저장 로직 수정입니다.

### 프론트엔드 (Frontend)
- **난이도**: 중 (Medium)
- **파일 변경**: 약 5개 (`App.tsx`, `TarotSharePage.tsx`, 기존 결과 컴포넌트 2개, API 클라이언트)
- **작업 내용**:
    - 공유 페이지(`TarotSharePage`)는 기존 결과 뷰를 재활용하겠지만, 읽기 전용 모드로 동작해야 하므로 약간의 분기 처리가 필요합니다.
    - "공유하기" 버튼과 URL 복사 기능은 간단합니다.

### 총평
- **예상 소요 시간**: 약 1~2 task blocks (집중하면 금방 끝날 수준)
- **리스크**: DB 업데이트 시 기존 데이터와의 호환성 (nullable 필드이므로 문제없음).

## 검증 계획

### 자동화 테스트
- **백엔드 통합 테스트**:
    - 로그인한 사용자로 리딩 생성 시나리오 테스트.
    - `TarotReadingSession`에 `memberId`가 올바르게 저장되는지 검증.
    - 공유 엔드포인트 호출 시 데이터가 올바르게 반환되는지 검증.

### 수동 검증
1. **로그인 및 저장**:
    - 구글/네이버로 로그인합니다.
    - 타로 리딩을 진행합니다.
    - DB 콘솔에서 해당 세션이 사용자 ID와 연결되었는지 확인합니다.
2. **공유하기**:
    - 리딩을 완료합니다.
    - "공유하기" 버튼을 클릭합니다.
    - 시크릿 탭(로그아웃 상태)에서 복사한 링크로 접속하여 결과가 잘 보이는지 확인합니다.
