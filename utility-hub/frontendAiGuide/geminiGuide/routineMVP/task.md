# 📝 Task List - Routine MVP (Utility Hub Integration)

## Phase 0: Analysis & Prep (Crucial)
- [ ] **Analyze Existing Utility Hub Structure** <!-- id: 0 -->
  - [ ] Analyze Frontend structure (routes, state, api patterns) <!-- id: 1 -->
  - [ ] Analyze Backend structure (auth, packages, db) <!-- id: 2 -->
  - [ ] Create `UTILITY_HUB_STRUCTURE.md` report <!-- id: 3 -->

## Phase 1: API Specification
- [ ] **Define API & Contracts** <!-- id: 4 -->
  - [ ] Document REST API endpoints in detail (Swagger/OpenAPI) <!-- id: 5 -->
  - [ ] Define DTO structures matches Frontend types <!-- id: 6 -->

## Phase 2: Frontend Setup (Integration)
- [ ] **Environment & Tools** <!-- id: 7 -->
  - [ ] Install `zustand`, `date-fns`, `lucide-react` <!-- id: 8 -->
  - [ ] Create directory structure (`components/routine`, `pages/routine`) <!-- id: 9 -->
  - [ ] Update `App.tsx` with `/routine` routes and Layout <!-- id: 10 -->
  - [ ] Implement `useRoutineStore.ts` (Zustand) <!-- id: 11 -->

## Phase 3: Backend Domain (Core)
- [ ] **Domain Implementation** <!-- id: 12 -->
  - [ ] Create Entities (`DailyPlan`, `Task`, `TimeBlock`, `Reflection`) <!-- id: 13 -->
  - [ ] Create Repositories (`DailyPlanRepository`, etc.) <!-- id: 14 -->
  - [ ] Implement `DailyPlanService` (with User auth) <!-- id: 15 -->
  - [ ] Implement `ReflectionService` <!-- id: 16 -->

## Phase 4: API & Integration
- [ ] **API Implementation** <!-- id: 17 -->
  - [ ] Implement `RoutineController` & `ReflectionController` <!-- id: 18 -->
  - [ ] Connect Frontend `useRoutineStore` to Real API <!-- id: 19 -->

## Phase 5: Polish & Verify
- [ ] **UI & Testing** <!-- id: 20 -->
  - [ ] Apply Glassmorphism & Animations <!-- id: 21 -->
  - [ ] Verify End-to-End Flow (Create -> Complete -> Reflect -> Archive) <!-- id: 22 -->
