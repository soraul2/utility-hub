2) checklist_security_front_v0.3_text2md.md
1. 입력값 & 모드 검증
 rawText 비어 있을 때:

 로컬/AI 변환 버튼이 비활성화되거나 클릭 시 “텍스트를 입력해 주세요” 메시지를 표시한다.
​

 autoHeading / autoList 상태는 boolean으로만 관리된다.

 Persona 선택은 백엔드 Enum 목록 내 값만 허용한다.
​

 모드 전환 시, 이전 결과/에러 상태가 의도대로 유지 또는 초기화된다.

2. 백엔드 연동 및 에러 처리
 /api/text-to-md Request Body는 { rawText, autoHeading, autoList, persona } 구조를 따른다.
​

 성공 응답에서 markdownText, model, tokensUsed를 올바르게 파싱한다.

 에러 응답에서 code, message를 파싱하여 errorMapper로 사용자 메시지를 생성한다.
​

 TEXT_001 에러:

 입력 영역 하단에 한국어 에러 메시지를 표시한다.

 상단 Alert에는 중복 표시하지 않는다.
​

 AI_001, AI_002, PERSONA_001 및 기타 에러:

 상단 Alert로만 표시한다.

 내부 스택트레이스/시스템 정보는 노출하지 않는다.
​

3. 렌더링 & XSS
 Markdown 미리보기는 신뢰할 수 있는 마크다운 렌더러를 사용하며, 임의 HTML 삽입을 허용하지 않는다.
​

 dangerouslySetInnerHTML 사용 시, 반드시 sanitize된 HTML만 전달한다 (권장: 기본적으로 사용하지 않음).
​

 “복사하기”, “다운로드” 기능은 Markdown 텍스트만 포함하고 추가 스크립트/HTML을 삽입하지 않는다.
​

4. 저장소 & 프라이버시
 로컬스토리지에는 다음 비민감 정보만 저장된다:

 마지막 모드 (local/ai)

 마지막 Persona

 마지막 옵션(autoHeading/autoList).
​

 원본 텍스트 전체를 장기 저장하지 않으며, 새로고침 시 초기화되거나 사용자가 명시적으로 저장해야만 유지된다.

 토큰, API 키, 계정 정보 등은 클라이언트 코드/스토리지 어디에도 존재하지 않는다.

5. 로딩, 재시도, 상태 피드백
 AI 모드 호출 중:

 버튼/입력 일부를 비활성화하여 중복 요청을 방지한다.

 ThinkingIndicator에서 “구조 분석 중.../다듬는 중...” 등의 상태를 순환 표시한다.
​

 재시도 로직:

 무한 루프를 발생시키지 않도록 useRef 기반 카운터로 제한한다.
​

 UI에 재시도 횟수(필요 시) 또는 재시도 여부를 명확히 표시한다.

 에러에서 복구 시:

 성공적인 재호출 후 이전 에러 메시지는 클리어된다.

6. 빌드 & 통합 검증
 npm run build가 성공하고 TypeScript 에러가 없다.
​

 10 Persona 각각에 대한 AI 호출이 정상 동작한다.

 로컬 모드는 v0.2와 동일하게 동작한다 (회귀 없음).
​

