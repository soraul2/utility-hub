# 📝 Task List - Routine MVP (Integration)

## 1. 🛠️ Frontend Setup & Structure
- [ ] **Integration Setup**
  - [ ] Install dependencies (`zustand`, `date-fns`, `lucide-react`) at `frontend/` <!-- id: 0 -->
  - [ ] Create directory structure (`pages/routine`, `components/routine`, `stores`, `types`) <!-- id: 1 -->
  - [ ] Define `Routine` types in `types/routine.d.ts` <!-- id: 2 -->
  - [ ] Create `RoutineLayout.tsx` and update `App.tsx` routing <!-- id: 3 -->

## 2. 🧩 Frontend Logic & UI (MVP)
- [ ] **State & Logic**
  - [ ] Implement `useRoutineStore.ts` with mock data/localStorage support <!-- id: 4 -->
- [ ] **Daily Plan Page**
  - [ ] Implement `KeyTaskInput` (Max 3 tasks) <!-- id: 5 -->
  - [ ] Implement `TimeBlockSection` (Visual timeline) <!-- id: 6 -->
  - [ ] Assemble `HomePage.tsx` <!-- id: 7 -->
- [ ] **Reflection Page**
  - [ ] Implement `ReflectionForm` <!-- id: 8 -->
  - [ ] Assemble `ReflectionPage.tsx` <!-- id: 9 -->
- [ ] **Archive & Polish**
  - [ ] Implement `ArchivePage.tsx` (List view) <!-- id: 10 -->
  - [ ] Apply specific styling (Glassmorphism) <!-- id: 11 -->

## 3. 🛡️ Backend Domain (Spring Boot)
- [ ] **Domain Model**
  - [ ] Create `DailyPlan`, `Task`, `TimeBlock`, `Reflection` Entities in `com.wootae.backend.routine` <!-- id: 12 -->
  - [ ] Create JpaRepositories (`DailyPlanRepository` etc.) <!-- id: 13 -->
- [ ] **Business Logic**
  - [ ] Create `RoutineService` (CRUD logic) <!-- id: 14 -->
  - [ ] Create `RoutineController` (API Endpoints) <!-- id: 15 -->

## 4. 🔗 Integration
- [ ] **API Connection**
  - [ ] Update `useRoutineStore` to fetch from API instead of localStorage <!-- id: 16 -->
  - [ ] Test full flow (FE -> BE -> DB) <!-- id: 17 -->
