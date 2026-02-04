# 미스틱 타로 부적 (Mystic Talisman) 기능 명세서

## 1. 개요
사용자의 타로 리딩 결과와 소망을 담은 **'고퀄리티 디지털 부적'**을 생성하여 제공합니다.
생성형 AI 대신 **통제된 템플릿 방식**을 사용하여 안정적인 퀄리티를 보장하며, `html-to-image`를 활용해 클라이언트 측에서 이미지를 생성합니다.

## 2. 핵심 컨셉
- **"운명을 봉인하다"**: 타로 결과의 기운을 간직하는 디지털 굿즈.
- **조수별 테마**: 선택한 조수(Assistant)에 따라 다른 디자인의 부적이 생성되어 수집 욕구를 자극.
- **SNS 공유 최적화**: 캘리그라피 폰트와 낙관(도장)을 활용한 '인스타 감성' 디자인.

## 3. 상세 기획

### 3.1 디자인 구성 요소 (Template Structure)
부적 이미지는 **9:16 비율 (모바일 배경화면 최적화)**로 제작됩니다.

1.  **배경 (Background)**: 조수별 고해상도 텍스처 (Gradient + Pattern).
2.  **문양 (Symbol)**: 중앙에 배치될 신비로운 기하학적 문양 (SVG 활용).
3.  **메인 텍스트 (Main Text)**: 사용자가 입력한 소망 (예: "취업 성공", "건강 기원").
    -   *Styling*: 세로 쓰기 (Vertical writing-mode), 붓글씨(Calligraphy) 폰트.
4.  **보조 텍스트 (Sub Text)**: 타로 리딩 핵심 키워드 (예: "The Sun - 밝은 미래").
5.  **낙관 (Stamp)**: 붉은색 [소원성취] 혹은 [미스틱] 도장 이미지.

### 3.2 조수별 테마 매핑 (Theme Mapping)

| 조수 Type | 테마명 | 메인 컬러 | 분위기 키워드 |
| :--- | :--- | :--- | :--- |
| **MYSTIC** (Default) | 진실의 거울 | Deep Navy / Gold | 신비, 우주, 통찰 |
| **ORION** | 태양의 축복 | Amber / Orange | 긍정, 활력, 재물 |
| **LUNA** | 달의 위로 | Silver / Blue | 치유, 평온, 정화 |
| **SYLVIA** | 냉철한 이성 | Cool Grey / White | 지성, 결단, 합격 |
| **NOCTIS** | 그림자 통찰 | Black / Purple | 반전, 각성, 보호 |
| **FORTUNA** (Hidden) | 운명의 수레바퀴 | Holographic / Rainbow | 절대 행운, 기적 |

### 3.3 기술적 구현 (Technical Specs)

-   **라이브러리**: `html-to-image` (안정적인 DOM -> Image 변환).
-   **폰트**: Google Fonts `Gowun Batang` (고운바탕) 또는 `Nanum Brush Script`.
-   **저장 프로세스 (Mobile Web Compatible)**:
    1.  사용자가 [부적 생성하기] 버튼 클릭.
    2.  숨겨진 DOM 요소(`ref`)를 `toPng`로 변환 (Scale x2 ~ x3 적용하여 고화질).
    3.  생성된 이미지 Blob URL을 **모달(Modal)**에 `<img />` 태그로 표시.
    4.  사용자에게 **"이미지를 길게 눌러 저장하세요"** 안내 (인앱 브라우저 호환성 확보).
    5.  (Optional) `navigator.share` API가 지원되는 환경이면 [공유하기] 버튼 노출.

## 4. 구현 단계 (Work Plan)

### Phase 1: 자원 준비 및 컴포넌트 구현
- [ ] `html-to-image` 설치 및 폰트 설정.
- [ ] `TalismanCard` 컴포넌트 구현 (디자인 템플릿).

### Phase 2: 기능 연동
- [ ] 3카드 리딩 결과 페이지(`DailyCardResultView`, `ThreeCardResultView`)에 [부적 생성] 버튼 추가.
- [ ] 소망 입력 모달 구현.
- [ ] 이미지 생성 및 결과 모달 구현.

### Phase 3: 디테일 업
- [ ] 조수별 테마(CSS 변수 또는 클래스) 적용.
- [ ] 애니메이션(생성 시 빛나는 효과) 추가.

## 5. 기대 효과
- 사용자가 자신의 타로 결과를 이미지로 소장함으로써 서비스 애착 형성.
- 인스타그램 스토리 등에 공유되기 쉬운 형태로 바이럴 마케팅 효과 증대.
