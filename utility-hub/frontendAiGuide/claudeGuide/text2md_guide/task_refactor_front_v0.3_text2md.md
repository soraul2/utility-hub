# TextToMd v0.3.x Frontend Refactoring Tasks

## Phase 1: Backend Contract Compliance (필수)
- [ ] Error Handling Enhancement <!-- id: 1 -->
    - [ ] Create error code mapper utility (`lib/api/errorMapper.ts`) <!-- id: 2 -->
    - [ ] Update `textToMdApi.ts` to use error code mapping <!-- id: 3 -->
    - [ ] Add backend response types (Response interface) <!-- id: 4 -->
    - [ ] Implement TEXT_001 special UX (input area error display) <!-- id: 5 -->
- [ ] Backend Metadata Integration <!-- id: 6 -->
    - [ ] Display model name in output area <!-- id: 7 -->
    - [ ] Display tokens used in output area (optional) <!-- id: 8 -->
    - [ ] Update Response type to include model and tokensUsed <!-- id: 9 -->

## Phase 2: Code Quality Improvement (권장)
- [ ] Code Deduplication <!-- id: 10 -->
    - [ ] Create unified copy utility (`lib/utils/clipboard.ts`) <!-- id: 11 -->
    - [ ] Create unified download utility (`lib/utils/fileDownload.ts`) <!-- id: 12 -->
    - [ ] Refactor `TextToMd.tsx` to use unified utilities <!-- id: 13 -->
    - [ ] Remove duplicate code from `useTextToMd.ts` <!-- id: 14 -->
- [ ] Smart Retry Logic Improvement <!-- id: 15 -->
    - [ ] Refactor retry mechanism in `useTextToMdAi.ts` <!-- id: 16 -->
    - [ ] Add exponential backoff (optional) <!-- id: 17 -->
    - [ ] Add retry count display in UI <!-- id: 18 -->
- [ ] State Management Consolidation <!-- id: 19 -->
    - [ ] Unify copy status state management <!-- id: 20 -->
    - [ ] Create custom hook for copy/download actions <!-- id: 21 -->

## Phase 3: UX Enhancement (선택)
- [ ] LocalStorage Integration <!-- id: 22 -->
    - [ ] Save last used mode (local/ai) <!-- id: 23 -->
    - [ ] Save last selected persona <!-- id: 24 -->
    - [ ] Save last used options (autoHeading/autoList) <!-- id: 25 -->
- [ ] Accessibility Improvements <!-- id: 26 -->
    - [ ] Add ARIA labels to PersonaSelector buttons <!-- id: 27 -->
    - [ ] Add aria-pressed to selected persona <!-- id: 28 -->
    - [ ] Add keyboard navigation hints <!-- id: 29 -->

## Verification
- [ ] Build Check <!-- id: 30 -->
    - [ ] Run `npm run build` successfully <!-- id: 31 -->
    - [ ] No TypeScript errors <!-- id: 32 -->
- [ ] Backend Integration Test <!-- id: 33 -->
    - [ ] Test all 10 personas with backend <!-- id: 34 -->
    - [ ] Test error scenarios (empty text, network error) <!-- id: 35 -->
    - [ ] Verify error code mapping works correctly <!-- id: 36 -->
- [ ] Functional Verification <!-- id: 37 -->
    - [ ] Local mode works as before <!-- id: 38 -->
    - [ ] AI mode works with all personas <!-- id: 39 -->
    - [ ] Error messages display correctly <!-- id: 40 -->
    - [ ] Model/token info displays correctly <!-- id: 41 -->
