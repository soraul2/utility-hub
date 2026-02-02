1. 서비스 개요
   서비스명: Lotto Lab (로또랩)

컨셉:

한국 로또 6/45에 대해 여러 규칙(랜덤, Hot/Cold, 십단위 등)으로 번호를 생성하고,

과거 회차 데이터를 기반으로 규칙별 성과를 시뮬레이션·비교하는 “로또 번호 연구·실험 플랫폼”.

MVP 포지션:

“고급 AI 연구소” 풀버전이 아니라,

핵심 규칙 + 기본 백테스트 + Preset 관리에 집중한 경량 버전.

2. 기능 범위 (MVP)
   2-1. 사용자·공통
   이메일/비밀번호 회원가입, 로그인(JWT)

기본 프로필(닉네임 정도)

메인 네비게이션:

대시보드

번호 생성기

규칙별 성과

내 전략 Preset

2-2. 대시보드 (Dashboard Home)
최신 회차 정보 표시

회차 번호, 추첨일, 예상 당첨금(정적 또는 외부 제공값), 남은 시간(Count-down은 Phase 2 가능)

“이번 회차 번호 생성” 버튼

요약 메트릭 카드

최근 N회(예: 100회) 기준 전체 테스트 조합 수 (요약값)

규칙별 5등 이상 히트율 상위 1~2개 규칙

간단 “AI 느낌” 요약 카드 (실제는 룰 기반)

최근 자주 사용한 규칙,

최근 50회에서 히트율이 높은 규칙 1개를 문장 템플릿으로 보여줌

기본 그래프

최근 50회 전체 히트율 추세 또는 랜덤 vs Top 규칙 라인차트 (1개 정도)

2-3. 번호 생성기 (Number Generator)
입력: 선택 규칙 + 간단 옵션

지원 규칙 (MVP)

완전 랜덤(Random)

Hot (최근 20~50회에서 출현 빈도 높은 숫자에 가중치)

Cold (최근 N회 미출현 숫자 우선)

십단위 비율(Tens) – 간단 버전: 최근 N회 분포 비율에 맞춰 구간별 개수만 조정

옵션(필터 – MVP 버전)

합계 범위: 슬라이더 1개 (예: 90–190)

홀짝 비율: 3:3 / 4:2 / 제한 없음 중 선택

연속 번호 허용 여부: on/off

출력: 6개 번호 칩 UI, “다시 생성” 버튼

로그 기록: user_activity에 저장 (추천·분석 기초데이터)

2-4. 규칙별 성과 (Rule Analytics)
범위 선택: 최근 50회 / 최근 100회 정도 (select box)

라인차트 1개

규칙별 5등 이상 히트율(%) 추세 (최대 3개 규칙까지 동시에)

하단 테이블

열: 규칙 이름, 테스트 조합 수, 3등 이상 적중 횟수, 5등 이상 적중률(%)

정렬: 히트율 기준 정렬(내림차순)

2-5. 전략 Preset (Strategy Presets)
내 Preset 목록

각 카드에: 이름, 규칙 조합 요약(Hot + 홀짝 3:3 + 합계 120–180), 최근 50회 히트율 요약(있으면), “번호 생성” 버튼

Preset 최대 개수: MVP에서는 3개까지

Preset 생성/수정

이름 입력

규칙 선택 (최대 2~3개 조합)

옵션 설정(합계 범위, 홀짝, 연속 허용 여부 등)

저장/삭제

2-6. “AI/추천” 관련 (MVP 축소 버전)
실제 LLM 호출 대신 룰 기반 추천

최근 한 달 동안 가장 많이 사용한 규칙 계산

최근 50회 기준 히트율이 가장 높은 규칙 계산

이를 이용해

대시보드 상단 “AI 개인화 요약” 카드에 2~3줄 텍스트로 노출

번호 생성기에서 “추천 규칙” 배지 하나 표시

3. 기술 스택 및 아키텍처
   3-1. 전체 구조
   백엔드: Spring Boot (단일 애플리케이션, 부분형 모놀리스)

프론트엔드: React (CSR)

DB: MySQL

배포: 단일 인스턴스(초기) – 이후 스케일 아웃 가능

3-2. 백엔드 도메인 모듈
하나의 Spring Boot 프로젝트 내 패키지 분리:

com.lottolab.user

회원, 인증(JWT), 프로필

com.lottolab.lotto

회차(lotto_draw), 번호 생성, 시뮬·통계(lotto_simulation_summary)

com.lottolab.strategy

Preset 도메인(strategy_preset), 관련 서비스

com.lottolab.recommend

단순 추천 로직(최근 사용 규칙, 성과 상위 규칙 계산)

com.lottolab.common

예외, 응답 포맷, 보안 설정, 공용 유틸

3-3. 데이터 모델(요약)
lotto_draw

id, round_no, draw_date, n1..n6, bonus

lotto_rule

id, code(RANDOM/HOT/COLD/TENS), name, description, active

lotto_simulation_summary

id, rule_id, round_start, round_end

test_count, hit_1, hit_2, hit_3, hit_4, hit_5, created_at

user

id, email, password_hash, nickname, created_at

strategy_preset

id, user_id, name, rules_json (규칙+옵션), created_at, updated_at

user_activity (선택)

id, user_id, type, payload, created_at

주의: MVP에서는 개별 조합을 저장하지 않고, 요약 통계만 저장해 DB 과부하를 피함.

3-4. 배치/시뮬레이션
스케줄러 (Spring @Scheduled)

새 회차 데이터 수집 후:

규칙별로 10만건 시뮬 수행

등수별 count 집계 → lotto_simulation_summary에 저장

연산 시간: 회차당 3~5개 규칙 기준 수십 초 수준(서버 1대, 비동기 수행)

4. API 개요
   인증

POST /api/auth/signup

POST /api/auth/login

대시보드

GET /api/dashboard/summary

최신 회차 정보, 전체 테스트 수 요약, 추천 규칙 정보 반환

번호 생성

POST /api/lotto/generate

body: { ruleCode, options }

response: { numbers: number[] }

규칙 통계

GET /api/rules/stats?period=50

규칙별 test_count, hit_3, hit_5, hit_rate_5 등

전략 Preset

GET /api/presets

POST /api/presets

PUT /api/presets/{id}

DELETE /api/presets/{id}

추천(가짜 AI)

GET /api/recommend/summary

최근 사용 규칙, 성과 상위 규칙 등(대시보드·AI 카드용)

5. 프론트엔드 구조 (React CSR)
   /pages

Dashboard.tsx

NumberGenerator.tsx

RuleAnalytics.tsx

StrategyPresets.tsx

Login.tsx, Signup.tsx

/components

카드형 컴포넌트: RoundCard, MetricsCard, StrategyCard, PresetCard, AISummaryCard, RuleChart

/api

axios 기반 API 클라이언트

/store

auth 상태, 사용자 기본 정보, 선택 규칙 등

UI는 이미 만든 목업(대시보드, 번호 생성, 룰 분석, Preset 화면) 레이아웃을 그대로 사용하되, AI 질문형 패널·복잡한 필터는 숨기고, 요약 카드·배지 수준만 노출.

6. 비기능 요구사항
   초기 트래픽: 수천~수만 MAU 가정, 단일 인스턴스로 대응 가능

응답 시간:

번호 생성 API: < 300ms

통계 조회 API: 인덱싱 기준 < 500ms

로그:

시뮬 배치 로그, API 에러 로그 필수

보안:

JWT 기반 인증, 비밀번호 해시(BCrypt), CORS 설정

확장성:

도메인별 패키지 경계 유지 → 향후 마이크로서비스 분리 여지 확보

