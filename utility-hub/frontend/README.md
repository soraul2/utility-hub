# 🎯 Utility Hub v0.2

> Apple 스타일 Glassmorphism 디자인의 프리미엄 유틸리티 허브

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)

## ✨ 주요 기능

### 🍅 뽀모도로 타이머
- 원형 진행 바 UI로 직관적인 시간 확인
- 집중/휴식 모드 자동 전환
- 사용자 정의 가능한 시간 설정
- 오디오 알림 지원

### 🌱 농업용 멀칭 비닐 계산기
- 밭 면적 기반 필요 롤 수 자동 계산
- 예상 비용 산출
- 상세 계산 내역 표시
- 최근 5건 계산 기록 저장

### 📝 텍스트 → Markdown 변환기
- 실시간 변환 미리보기
- 자동 제목/리스트 변환 옵션
- 클립보드 복사 및 .md 파일 다운로드
- 다크모드 완벽 지원

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18.0 이상
- npm 9.0 이상

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

개발 서버는 http://localhost:5173 에서 실행됩니다.

## 🏗️ 프로젝트 구조

```
utility-hub/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   └── ui/             # Glass 디자인 시스템 컴포넌트
│   │       ├── GlassCard.tsx
│   │       ├── GlassButton.tsx
│   │       └── GlassInput.tsx
│   ├── context/            # React Context (테마 등)
│   │   └── ThemeContext.tsx
│   ├── hooks/              # 커스텀 훅
│   │   ├── useMulchingHistory.ts
│   │   ├── usePomodoro.ts
│   │   └── useTextToMd.ts
│   ├── layouts/            # 레이아웃 컴포넌트
│   │   ├── MainLayout.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── lib/                # 비즈니스 로직 (순수 함수)
│   │   ├── mulchingFilm.ts
│   │   ├── pomodoro.ts
│   │   └── textToMd.ts
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Dashboard.tsx
│   │   └── tools/
│   │       ├── Pomodoro.tsx
│   │       ├── MulchingFilm.tsx
│   │       └── TextToMd.tsx
│   ├── App.tsx
│   └── main.tsx
├── perplexityGuide/        # 설계 문서
│   ├── design_spec.md
│   ├── collaborations_rule.md
│   └── checklist_security.md
└── geminiGuide/            # 구현 문서
    ├── implementation_plan.md
    ├── task.md
    └── walkthrough.md
```

## 🎨 디자인 시스템

### Apple-Style Glassmorphism

이 프로젝트는 Apple의 디자인 언어에서 영감을 받은 Glassmorphism 스타일을 사용합니다:

- **반투명 카드**: `backdrop-blur-xl`, `bg-white/40`
- **부드러운 그림자**: `shadow-2xl`
- **큰 라운드**: `rounded-3xl`
- **다크모드 완벽 지원**: 라이트/다크 모드 모두에서 최적화된 가독성

### 주요 컴포넌트

#### GlassCard
```tsx
import { GlassCard } from '@/components/ui/GlassCard';

<GlassCard title="제목" footer={<div>푸터</div>}>
  내용
</GlassCard>
```

#### GlassButton
```tsx
import { GlassButton } from '@/components/ui/GlassButton';

<GlassButton variant="primary" size="md" onClick={handleClick}>
  클릭
</GlassButton>
```

#### GlassInput
```tsx
import { GlassInput } from '@/components/ui/GlassInput';

<GlassInput
  label="라벨"
  value={value}
  onChange={handleChange}
  suffix="단위"
/>
```

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# 커버리지 확인
npm run test:coverage
```

## 📚 아키텍처

### 비즈니스 로직 분리

모든 핵심 비즈니스 로직은 `src/lib` 디렉토리에 순수 함수로 분리되어 있습니다:

- **테스트 가능성**: UI와 독립적으로 테스트 가능
- **재사용성**: 여러 컴포넌트에서 동일한 로직 사용 가능
- **유지보수성**: 로직 변경 시 한 곳만 수정

### 커스텀 훅 패턴

복잡한 상태 로직은 커스텀 훅으로 추출하여 컴포넌트를 간결하게 유지합니다:

```tsx
// 컴포넌트는 UI 렌더링에만 집중
function Pomodoro() {
  const {
    mode,
    timeLeft,
    isRunning,
    toggleTimer,
    resetTimer,
  } = usePomodoro();

  return (
    // JSX...
  );
}
```

## 🌍 국제화

현재 한국어로 완전히 현지화되어 있습니다. 향후 다국어 지원 계획이 있습니다.

## 🔒 보안

- ✅ 입력값 검증 (모든 숫자 필드)
- ✅ XSS 방지 (React의 기본 보호)
- ✅ 민감 정보 비저장 (로컬스토리지에는 테마와 최근 기록만 저장)
- ✅ WCAG 2.1 AA 접근성 기준 준수

자세한 내용은 [보안 체크리스트](./perplexityGuide/checklist_security.md)를 참조하세요.

## 📖 문서

- [설계 명세서](./perplexityGuide/design_spec.md) - 전체 시스템 설계
- [협업 규칙](./perplexityGuide/collaborations_rule.md) - 팀 협업 가이드
- [보안 체크리스트](./perplexityGuide/checklist_security.md) - 보안 검증 항목
- [구현 워크스루](./geminiGuide/walkthrough.md) - 구현 세부 내역

## 🤝 기여

이 프로젝트는 AI 협업 워크플로우를 따릅니다:

1. **Perplexity** - 설계 및 QA
2. **Gemini** - 구현
3. **Claude** - 리팩터링 및 문서화

자세한 내용은 [협업 규칙](./perplexityGuide/collaborations_rule.md)을 참조하세요.

## 📝 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🙏 감사의 말

- [Vite](https://vitejs.dev/) - 빠른 빌드 도구
- [React](https://reactjs.org/) - UI 라이브러리
- [Tailwind CSS](https://tailwindcss.com/) - 유틸리티 CSS 프레임워크
- [Font Awesome](https://fontawesome.com/) - 아이콘 라이브러리

---

**Made with ❤️ by AI Collaboration Team**
