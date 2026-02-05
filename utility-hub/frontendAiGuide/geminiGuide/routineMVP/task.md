# 📝 Task List - Routine MVP

## 1. 🛠️ Project Setup
- [ ] **Initial Setup and Config**
  - [ ] Initialize Vite project (React + TS) <!-- id: 0 -->
  - [ ] Install dependencies (Tailwind, Router, Zustand, icons) <!-- id: 1 -->
  - [ ] Configure `tailwind.config.js` and `index.css` (Design System) <!-- id: 2 -->
  - [ ] Set up directory structure (components, pages, store, types) <!-- id: 3 -->

## 2. 🧩 State & Logic
- [ ] **Core Data Layer**
  - [ ] Define TypeScript interfaces in `types/routine.d.ts` <!-- id: 4 -->
  - [ ] Implement `storage.ts` utility for localStorage <!-- id: 5 -->
  - [ ] Create `useRoutineStore.ts` with Zustand <!-- id: 6 -->
  - [ ] Implement actions: `addTask`, `updateTimeBlock`, `saveReflection` <!-- id: 7 -->

## 3. 🖥️ UI Implementation
- [ ] **Layout & Common**
  - [ ] Create `Layout` component (Sidebar + Main Content area) <!-- id: 8 -->
  - [ ] Create `Sidebar` navigation logic <!-- id: 9 -->
- [ ] **Home Page (Daily Plan)**
  - [ ] Implement `KeyTaskInput` component <!-- id: 10 -->
  - [ ] Implement `TimeBlock` and Timeline view <!-- id: 11 -->
  - [ ] Connect Drag & Drop logic <!-- id: 12 -->
- [ ] **Tasks Page**
  - [ ] Create Task list view (Pending tasks) <!-- id: 13 -->
- [ ] **Reflection & Archive**
  - [ ] Implement `ReflectionForm` <!-- id: 14 -->
  - [ ] Implement `ArchiveList` view <!-- id: 15 -->
- [ ] **Calendar**
  - [ ] Implement simple Calendar grid view <!-- id: 16 -->

## 4. 🎨 Polish & Verify
- [ ] **Refinement**
  - [ ] Apply specific design details (Glassmorphism, Animations) <!-- id: 17 -->
  - [ ] Verify Mobile responsiveness <!-- id: 18 -->
- [ ] **Testing**
  - [ ] Manual test of full user flow (Morning -> Evening) <!-- id: 19 -->
  - [ ] Verify data persistence <!-- id: 20 -->
