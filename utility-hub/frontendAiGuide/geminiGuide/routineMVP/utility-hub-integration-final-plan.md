# 🚀 Routine MVP - Utility Hub 통합 최종 구현 계획

**기준**: 제미나이팀 문서 + Claude 검토/개선안 + 이전 보완 가이드 통합  
**목표**: Utility Hub에 Routine 모듈을 완전 통합하여 운영 가능한 MVP 완성 (25-35일)

---

## Phase 0️⃣: 사전 분석 (1-2일) ⭐ 필수

### 0-1. 기존 Utility Hub 구조 완전 파악

#### Frontend 분석 체크리스트
```
구조:
  [ ] src/ 폴더 내 pages/, components/ 구조 확인
  [ ] App.tsx에서 라우팅 패턴 (React Router v6 설정)
  [ ] 기존 layouts/ 또는 Sidebar 있는가?

상태 관리:
  [ ] Context API 사용 중?
  [ ] Zustand 이미 도입되어 있나?
  [ ] Redux 사용?
  [ ] 다른 상태 관리 도구?
  [ ] 상태 초기값 설정 방식

API 통신:
  [ ] API base URL 설정 위치 (.env? config?)
  [ ] axios/fetch 어떤 것 사용?
  [ ] API 호출 hook (useApi? useFetch?)
  [ ] 에러 처리 방식 (Toast? Modal?)

스타일:
  [ ] Tailwind 설정 (tailwind.config.js 내용)
  [ ] 색상 팔레트 (primary, secondary, ... 정의)
  [ ] 폰트 설정
  [ ] 컴포넌트 스타일 패턴 (classNames? clsx?)
  [ ] 기존 UI 컴포넌트 (Button, Input, Modal, Toast)

환경변수:
  [ ] .env / .env.local / .env.example 구조
  [ ] VITE_API_URL 같은 변수 이름 규칙

기타:
  [ ] 로그인 방식 (세션? JWT? API 키?)
  [ ] 사용자 정보 저장 위치 (localStorage? sessionStorage? Zustand?)
  [ ] 테스트 설정 (Vitest? Jest?)
```

#### Backend 분석 체크리스트
```
패키지 구조:
  [ ] com.wootae.backend.? 기존 패키지 목록
  [ ] User/Auth 관련 패키지 위치
  [ ] 기존 도메인 패키지 (예: com.wootae.backend.dashboard)
  [ ] 어떤 패턴의 패키지 이름 규칙?

Spring 설정:
  [ ] Spring Security 적용?
  [ ] JWT? Session-based?
  [ ] CORS 설정 위치 (CorsConfig.java?)
  [ ] 기존 API prefix (/api/v1? /api?)

DB & ORM:
  [ ] MySQL 데이터베이스 이름
  [ ] 기존 User 테이블 구조
  [ ] JPA 사용 (Hibernate 버전)
  [ ] 마이그레이션 도구 (Flyway? Liquibase? 없음?)
  [ ] application.properties/yml 설정 내용

기본 클래스 & 패턴:
  [ ] BaseEntity 있는가? (id, createdAt, updatedAt)
  [ ] BaseController 있는가?
  [ ] ApiResponse 형식 정의 있는가?
  [ ] Exception 처리 패턴 (GlobalExceptionHandler?)
  [ ] Validation 애노테이션 (Bean Validation?)
  [ ] Mapper/Converter (MapStruct? ModelMapper?)
  [ ] DTO 명명 규칙

테스트:
  [ ] JUnit 버전
  [ ] Mockito 사용?
  [ ] 기존 테스트 구조
  [ ] H2 in-memory DB 설정?

기타:
  [ ] 로깅 방식 (SLF4J? Log4j?)
  [ ] 기존 Validation 에러 응답 형식
  [ ] 기존 업로드 파일 저장 위치
```

### 0-2. 분석 결과 정리

**생성할 문서**: `UTILITY_HUB_STRUCTURE.md`
```
- Frontend 구조 현황
- Backend 구조 현황
- 기존 패턴 정리
- Routine 통합 시 주의점
```

---

## Phase 1️⃣: API 명세 작성 (1-2일)

### 1-1. REST API 완전 정의

#### Daily Plan API
```yaml
# Daily Plan - 일일 계획 조회/생성/수정

GET /api/v1/routine/daily-plans/today
  설명: 오늘 일일 계획 조회 (없으면 자동 생성)
  응답:
    {
      "success": true,
      "data": {
        "id": 1,
        "userId": 100,
        "planDate": "2025-02-05",
        "keyTasks": [
          { "id": 1, "title": "팀 미팅", "completed": false, "createdAt": "..." }
        ],
        "timeBlocks": [
          { "id": 1, "period": "morning", "label": "🌅 아침 (5-9am)", "assignedTaskId": null }
        ],
        "reflection": null,
        "createdAt": "2025-02-05T08:00:00",
        "updatedAt": "2025-02-05T08:00:00"
      }
    }
  에러:
    401: { "success": false, "message": "인증이 필요합니다." }
    500: { "success": false, "message": "서버 오류" }

GET /api/v1/routine/daily-plans/{date}
  설명: 특정 날짜 계획 조회
  경로: date=2025-02-05 (YYYY-MM-DD)
  응답: 위와 동일

POST /api/v1/routine/daily-plans
  설명: 새로운 계획 생성
  요청:
    {
      "planDate": "2025-02-06",
      "keyTasks": [
        { "title": "운동" }
      ]
    }
  응답: 생성된 DailyPlan 객체
  에러:
    400: { "success": false, "message": "유효하지 않은 요청" }
    409: { "success": false, "message": "이미 해당 날짜의 계획이 존재합니다." }

PUT /api/v1/routine/daily-plans/{id}
  설명: 계획 수정
  요청:
    {
      "keyTasks": [ ... ],
      "timeBlocks": [ ... ]
    }
  응답: 수정된 DailyPlan 객체

DELETE /api/v1/routine/daily-plans/{id}
  설명: 계획 삭제
  응답: { "success": true, "message": "삭제되었습니다." }
```

#### Task API
```yaml
POST /api/v1/routine/daily-plans/{planId}/tasks
  설명: Task 추가
  요청: { "title": "새 작업" }
  응답: { "id": 2, "title": "새 작업", "completed": false }

PUT /api/v1/routine/tasks/{id}
  설명: Task 수정
  요청: { "title": "수정된 작업", "completed": true }

DELETE /api/v1/routine/tasks/{id}
  설명: Task 삭제

PATCH /api/v1/routine/tasks/{id}/toggle
  설명: Task 완료 여부 토글
  응답: { "id": 2, "completed": true }
```

#### Reflection API
```yaml
POST /api/v1/routine/reflections
  설명: 회고 저장 (또는 수정)
  요청:
    {
      "planId": 1,
      "rating": 4,
      "mood": "😊",
      "whatWentWell": "팀 미팅 성공",
      "whatDidntGoWell": "운동 못함",
      "tomorrowFocus": "운동 우선"
    }
  응답: 저장된 Reflection 객체

GET /api/v1/routine/reflections/{planId}
  설명: 특정 계획의 회고 조회

GET /api/v1/routine/reflections/archive
  설명: 회고 아카이브 조회 (페이징)
  쿼리: ?from=2025-01-01&to=2025-02-05&page=0&size=20
  응답:
    {
      "data": [ ... ],
      "totalElements": 30,
      "totalPages": 2,
      "currentPage": 0
    }

DELETE /api/v1/routine/reflections/{id}
  설명: 회고 삭제
```

### 1-2. Swagger/OpenAPI 설정

```yaml
# SpringDoc OpenAPI 의존성 추가
# pom.xml 또는 build.gradle
springdoc-openapi-starter-webmvc-ui: 2.x

# application.yml에 설정 추가
springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
    urls:
      - url: /api-docs
        name: Routine API
```

---

## Phase 2️⃣: Frontend 통합 설정 (1-2일)

### 2-1. 디렉토리 구조 생성

```bash
cd frontend

# 필요한 폴더 생성
mkdir -p src/components/routine/{DailyPlan,Reflection,Layout}
mkdir -p src/pages/routine
mkdir -p src/stores
mkdir -p src/services/routine
mkdir -p src/types
mkdir -p src/hooks
```

### 2-2. 의존성 설치

```bash
npm install zustand date-fns lucide-react axios

# TypeScript 타입도 설치
npm install --save-dev @types/node
```

### 2-3. 라우팅 설정 (App.tsx 수정)

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoutineLayout from './pages/routine/RoutineLayout';
import DailyPlanPage from './pages/routine/DailyPlanPage';
import ReflectionPage from './pages/routine/ReflectionPage';
import ArchivePage from './pages/routine/ArchivePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 기존 라우트들 */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Routine 라우트 추가 */}
        <Route path="/routine" element={<RoutineLayout />}>
          <Route index element={<DailyPlanPage />} />
          <Route path="reflection" element={<ReflectionPage />} />
          <Route path="archive" element={<ArchivePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### 2-4. 환경변수 설정

```bash
# .env 또는 .env.local에 추가
VITE_API_BASE_URL=http://localhost:8080
VITE_API_PREFIX=/api/v1
```

### 2-5. API 클라이언트 구성

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_PREFIX}`,
  timeout: 10000,
});

// 요청 인터셉터 (인증 헤더 추가)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // 로그아웃 처리
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```typescript
// src/services/routine/dailyPlanApi.ts
import api from '../api';

export const dailyPlanAPI = {
  getTodayPlan: () => api.get('/routine/daily-plans/today'),
  getPlan: (date: string) => api.get(`/routine/daily-plans/${date}`),
  createPlan: (data: any) => api.post('/routine/daily-plans', data),
  updatePlan: (id: number, data: any) => api.put(`/routine/daily-plans/${id}`, data),
  deletePlan: (id: number) => api.delete(`/routine/daily-plans/${id}`),
  
  // Task
  addTask: (planId: number, task: any) => 
    api.post(`/routine/daily-plans/${planId}/tasks`, task),
  updateTask: (id: number, data: any) => 
    api.put(`/routine/tasks/${id}`, data),
  deleteTask: (id: number) => 
    api.delete(`/routine/tasks/${id}`),
  toggleTask: (id: number) => 
    api.patch(`/routine/tasks/${id}/toggle`),
};

export const reflectionAPI = {
  saveReflection: (data: any) => 
    api.post('/routine/reflections', data),
  getReflection: (planId: number) => 
    api.get(`/routine/reflections/${planId}`),
  getArchive: (from?: string, to?: string, page = 0) => 
    api.get(`/routine/reflections/archive`, { params: { from, to, page } }),
  deleteReflection: (id: number) => 
    api.delete(`/routine/reflections/${id}`),
};
```

### 2-6. Zustand Store 구현

```typescript
// src/stores/useRoutineStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dailyPlanAPI, reflectionAPI } from '../services/routine/dailyPlanApi';
import type { DailyPlan, Reflection } from '../types/routine';

interface RoutineStore {
  // State
  today: DailyPlan | null;
  reflections: Reflection[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadToday: () => Promise<void>;
  loadPlan: (date: string) => Promise<void>;
  addTask: (title: string) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;
  toggleTask: (taskId: number) => Promise<void>;
  saveReflection: (reflection: Reflection) => Promise<void>;
  loadArchive: (from?: string, to?: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set, get) => ({
      today: null,
      reflections: [],
      isLoading: false,
      error: null,
      
      loadToday: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await dailyPlanAPI.getTodayPlan();
          set({ today: data.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      loadPlan: async (date: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await dailyPlanAPI.getPlan(date);
          set({ today: data.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      addTask: async (title: string) => {
        if (!get().today) return;
        try {
          const newTask = await dailyPlanAPI.addTask(get().today!.id, { title });
          set((state) => ({
            today: state.today ? {
              ...state.today,
              keyTasks: [...state.today.keyTasks, newTask.data],
            } : null,
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      
      deleteTask: async (taskId: number) => {
        try {
          await dailyPlanAPI.deleteTask(taskId);
          set((state) => ({
            today: state.today ? {
              ...state.today,
              keyTasks: state.today.keyTasks.filter(t => t.id !== taskId),
            } : null,
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      
      toggleTask: async (taskId: number) => {
        try {
          const updated = await dailyPlanAPI.toggleTask(taskId);
          set((state) => ({
            today: state.today ? {
              ...state.today,
              keyTasks: state.today.keyTasks.map(t =>
                t.id === taskId ? updated.data : t
              ),
            } : null,
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      
      saveReflection: async (reflection: Reflection) => {
        try {
          const saved = await reflectionAPI.saveReflection(reflection);
          set((state) => ({
            reflections: [saved.data, ...state.reflections],
            today: state.today ? {
              ...state.today,
              reflection: saved.data,
            } : null,
          }));
        } catch (error: any) {
          set({ error: error.message });
        }
      },
      
      loadArchive: async (from?: string, to?: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await reflectionAPI.getArchive(from, to);
          set({ reflections: data.data.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      setError: (error: string | null) => set({ error }),
    }),
    {
      name: 'routine-store',
      partialize: (state) => ({
        reflections: state.reflections,
      }),
    }
  )
);
```

---

## Phase 3️⃣: Backend 도메인 구현 (2-3일)

### 3-1. Entity 작성

```java
// com.wootae.backend.routine.domain/DailyPlan.java
@Entity
@Table(name = "routine_daily_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPlan extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;  // 기존 User entity 참조
    
    @Column(nullable = false)
    private LocalDate planDate;
    
    @OneToMany(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> keyTasks = new ArrayList<>();
    
    @OneToMany(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimeBlock> timeBlocks = new ArrayList<>();
    
    @OneToOne(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private Reflection reflection;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

```java
// com.wootae.backend.routine.domain/Task.java
@Entity
@Table(name = "routine_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_plan_id", nullable = false)
    private DailyPlan dailyPlan;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private Boolean completed = false;
    
    @Column(name = "task_order")
    private Integer taskOrder = 0;
}
```

```java
// com.wootae.backend.routine.domain/TimeBlock.java
@Entity
@Table(name = "routine_time_blocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeBlock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_plan_id", nullable = false)
    private DailyPlan dailyPlan;
    
    @Column(nullable = false)
    private String period;  // "morning", "midday", "afternoon", "evening"
    
    @Column(nullable = false)
    private String label;   // "🌅 아침 (5-9am)"
    
    @Column(nullable = false)
    private Integer startHour;
    
    @Column(nullable = false)
    private Integer endHour;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_task_id")
    private Task assignedTask;
}
```

```java
// com.wootae.backend.routine.domain/Reflection.java
@Entity
@Table(name = "routine_reflections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reflection extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_plan_id", nullable = false, unique = true)
    private DailyPlan dailyPlan;
    
    @Column(nullable = false)
    private Integer rating;  // 1-5
    
    @Column(length = 10)
    private String mood;  // "😊", "😐", "😔"
    
    @Column(columnDefinition = "TEXT")
    private String whatWentWell;
    
    @Column(columnDefinition = "TEXT")
    private String whatDidntGoWell;
    
    @Column(columnDefinition = "TEXT")
    private String tomorrowFocus;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
```

### 3-2. Repository 작성

```java
// com.wootae.backend.routine.repository/DailyPlanRepository.java
@Repository
public interface DailyPlanRepository extends JpaRepository<DailyPlan, Long> {
    Optional<DailyPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);
    List<DailyPlan> findByUserIdOrderByPlanDateDesc(Long userId);
    List<DailyPlan> findByUserIdAndPlanDateBetweenOrderByPlanDateDesc(
        Long userId, LocalDate startDate, LocalDate endDate);
}

// com.wootae.backend.routine.repository/TaskRepository.java
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByDailyPlanIdOrderByTaskOrder(Long planId);
}

// com.wootae.backend.routine.repository/ReflectionRepository.java
@Repository
public interface ReflectionRepository extends JpaRepository<Reflection, Long> {
    Optional<Reflection> findByDailyPlanId(Long planId);
    List<Reflection> findByDailyPlan_UserIdOrderByCreatedAtDesc(Long userId);
    Page<Reflection> findByDailyPlan_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
```

### 3-3. Service 작성 (기본 로직)

```java
// com.wootae.backend.routine.service/DailyPlanService.java
@Service
@RequiredArgsConstructor
@Transactional
public class DailyPlanService {
    
    private final DailyPlanRepository dailyPlanRepository;
    private final TaskRepository taskRepository;
    private final TimeBlockRepository timeBlockRepository;
    private final SecurityUtil securityUtil;  // 현재 사용자 조회
    
    @Transactional(readOnly = true)
    public DailyPlanDto getDailyPlan(LocalDate date) {
        Long userId = securityUtil.getCurrentUserId();
        DailyPlan plan = dailyPlanRepository.findByUserIdAndPlanDate(userId, date)
            .orElseGet(() -> createNewPlan(userId, date));
        return DailyPlanMapper.toDto(plan);
    }
    
    public DailyPlanDto createNewPlan(Long userId, LocalDate date) {
        User user = new User();
        user.setId(userId);
        
        DailyPlan plan = DailyPlan.builder()
            .user(user)
            .planDate(date)
            .build();
        
        // 4개 기본 TimeBlock 생성
        List<TimeBlock> blocks = List.of(
            createTimeBlock(plan, "morning", "🌅 아침 (5-9am)", 5, 9),
            createTimeBlock(plan, "midday", "☀️ 낮 (9am-12pm)", 9, 12),
            createTimeBlock(plan, "afternoon", "🌤️ 오후 (12-5pm)", 12, 17),
            createTimeBlock(plan, "evening", "🌙 저녁 (5-11pm)", 17, 23)
        );
        plan.setTimeBlocks(blocks);
        
        return DailyPlanMapper.toDto(dailyPlanRepository.save(plan));
    }
    
    private TimeBlock createTimeBlock(DailyPlan plan, String period, String label, int start, int end) {
        return TimeBlock.builder()
            .dailyPlan(plan)
            .period(period)
            .label(label)
            .startHour(start)
            .endHour(end)
            .build();
    }
    
    public void addTask(Long planId, TaskDto taskDto) {
        DailyPlan plan = dailyPlanRepository.findById(planId)
            .orElseThrow(() -> new ResourceNotFoundException("계획을 찾을 수 없습니다."));
        
        Task task = Task.builder()
            .dailyPlan(plan)
            .title(taskDto.getTitle())
            .taskOrder(plan.getKeyTasks().size())
            .build();
        
        taskRepository.save(task);
    }
}
```

### 3-4. DTO & Mapper

```java
// com.wootae.backend.routine.dto/DailyPlanDto.java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPlanDto {
    private Long id;
    private LocalDate planDate;
    private List<TaskDto> keyTasks;
    private List<TimeBlockDto> timeBlocks;
    private ReflectionDto reflection;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// 매핑
public class DailyPlanMapper {
    public static DailyPlanDto toDto(DailyPlan entity) {
        if (entity == null) return null;
        return DailyPlanDto.builder()
            .id(entity.getId())
            .planDate(entity.getPlanDate())
            .keyTasks(entity.getKeyTasks().stream()
                .map(TaskMapper::toDto)
                .collect(Collectors.toList()))
            .timeBlocks(entity.getTimeBlocks().stream()
                .map(TimeBlockMapper::toDto)
                .collect(Collectors.toList()))
            .reflection(entity.getReflection() != null ? ReflectionMapper.toDto(entity.getReflection()) : null)
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
```

---

## Phase 4️⃣: Backend API 구현 (2-3일)

### 4-1. Controller 작성

```java
// com.wootae.backend.routine.controller/DailyPlanController.java
@RestController
@RequestMapping("/api/v1/routine/daily-plans")
@RequiredArgsConstructor
public class DailyPlanController {
    
    private final DailyPlanService dailyPlanService;
    
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<DailyPlanDto>> getTodayPlan() {
        DailyPlanDto plan = dailyPlanService.getDailyPlan(LocalDate.now());
        return ResponseEntity.ok(new ApiResponse<>(true, "오늘 계획 조회 성공", plan));
    }
    
    @GetMapping("/{date}")
    public ResponseEntity<ApiResponse<DailyPlanDto>> getPlan(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        DailyPlanDto plan = dailyPlanService.getDailyPlan(localDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "계획 조회 성공", plan));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<DailyPlanDto>> createPlan(@Valid @RequestBody DailyPlanDto dto) {
        DailyPlanDto created = dailyPlanService.createPlan(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "계획 생성 성공", created));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DailyPlanDto>> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody DailyPlanDto dto) {
        DailyPlanDto updated = dailyPlanService.updatePlan(id, dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "계획 수정 성공", updated));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        dailyPlanService.deletePlan(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "계획 삭제 성공", null));
    }
}

// com.wootae.backend.routine.controller/ReflectionController.java
@RestController
@RequestMapping("/api/v1/routine/reflections")
@RequiredArgsConstructor
public class ReflectionController {
    
    private final ReflectionService reflectionService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<ReflectionDto>> saveReflection(
            @Valid @RequestBody ReflectionDto dto) {
        ReflectionDto saved = reflectionService.save(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "회고 저장 성공", saved));
    }
    
    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<ReflectionDto>> getReflection(@PathVariable Long planId) {
        ReflectionDto reflection = reflectionService.getByPlanId(planId);
        return ResponseEntity.ok(new ApiResponse<>(true, "회고 조회 성공", reflection));
    }
    
    @GetMapping("/archive")
    public ResponseEntity<ApiResponse<Page<ReflectionDto>>> getArchive(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReflectionDto> archive = reflectionService.getArchive(from, to, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "아카이브 조회 성공", archive));
    }
}
```

### 4-2. 예외 처리 & 검증

```java
// com.wootae.backend.routine.config/RoutineExceptionHandler.java
@RestControllerAdvice(basePackages = "com.wootae.backend.routine")
public class RoutineExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors()
            .stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse<>(false, message, null));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse<>(false, e.getMessage(), null));
    }
}
```

---

## Phase 5️⃣: Frontend-Backend 통합 (2-3일)

### 5-1. 환경 설정 확인

```bash
# .env 파일 확인/수정
VITE_API_BASE_URL=http://localhost:8080
VITE_API_PREFIX=/api/v1
```

### 5-2. API 엔드포인트 최종 검증

**Postman/Swagger에서 테스트:**
- [x] GET /api/v1/routine/daily-plans/today
- [x] POST /api/v1/routine/daily-plans/{planId}/tasks
- [x] POST /api/v1/routine/reflections

### 5-3. Frontend 컴포넌트 구현 (Phase 2 진행)

```typescript
// src/pages/routine/DailyPlanPage.tsx
import { useEffect } from 'react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import KeyTaskInput from '../../components/routine/DailyPlan/KeyTaskInput';
import TimeBlockSection from '../../components/routine/DailyPlan/TimeBlockSection';

export default function DailyPlanPage() {
  const { today, isLoading, error, loadToday } = useRoutineStore();
  
  useEffect(() => {
    loadToday();
  }, [loadToday]);
  
  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>오류: {error}</div>;
  if (!today) return <div>데이터를 불러올 수 없습니다.</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">오늘의 계획</h1>
      <KeyTaskInput />
      <TimeBlockSection timeBlocks={today.timeBlocks} />
    </div>
  );
}
```

---

## Phase 6️⃣: 테스트 & 배포 (1-2일)

### 6-1. Backend 테스트

```java
@SpringBootTest
public class DailyPlanControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    public void testGetTodayPlan() throws Exception {
        mockMvc.perform(get("/api/v1/routine/daily-plans/today"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
```

### 6-2. Frontend 테스트

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useRoutineStore } from '../stores/useRoutineStore';

describe('useRoutineStore', () => {
  it('should load today plan', async () => {
    const { result } = renderHook(() => useRoutineStore());
    
    await waitFor(() => {
      expect(result.current.today).toBeDefined();
    });
  });
});
```

### 6-3. 배포

```bash
# Frontend 빌드
npm run build

# Backend 빌드
./mvnw clean package

# Docker 배포 (선택)
docker-compose up
```

---

## 📋 최종 체크리스트

```
Phase 0: 사전 분석
  [ ] Utility Hub Frontend 구조 파악
  [ ] Utility Hub Backend 구조 파악
  [ ] 기존 User/Auth 시스템 이해
  [ ] 기존 패턴 정리

Phase 1: API 명세
  [ ] REST API 완전 정의
  [ ] Swagger 설정
  [ ] 팀과 API 명세 공유

Phase 2: Frontend 설정
  [ ] 의존성 설치 (zustand, date-fns, lucide-react)
  [ ] 라우팅 구성
  [ ] API 클라이언트 설정
  [ ] Zustand store 구현

Phase 3: Backend Entity
  [ ] Entity 클래스 작성
  [ ] Repository 인터페이스
  [ ] Database migration script
  [ ] 테이블 생성

Phase 4: Backend API
  [ ] Controller 구현
  [ ] Service 구현
  [ ] DTO & Mapper
  [ ] 예외 처리

Phase 5: 통합
  [ ] 환경 설정 확인
  [ ] API 엔드포인트 검증
  [ ] Frontend 컴포넌트 구현
  [ ] 전체 통합 테스트

Phase 6: 배포
  [ ] Backend 테스트 & 빌드
  [ ] Frontend 테스트 & 빌드
  [ ] 배포 환경 설정
  [ ] 최종 검증

```

---

## 🎯 예상 타임라인

```
Week 1:
  Days 1-2: Phase 0 (분석) + Phase 1 (API 명세)
  Days 3-4: Phase 2 (Frontend 설정)
  Days 5: Phase 3 (Backend Entity 시작)

Week 2:
  Days 1-2: Phase 3 (Entity 완성) + Phase 4 (API 구현)
  Days 3-4: Phase 5 (통합)
  Day 5: Phase 6 (테스트 & 배포)

총: 10-12일 (병렬 작업)
```

---

## 🚀 최종 권장

이 계획은:
✅ 제미나이팀 문서 기반
✅ Utility Hub 기존 구조 고려
✅ 상세한 코드 예시 포함
✅ 명확한 API 명세
✅ 실제 구현 가능한 수준
**권장: 이 계획을 기반으로 Phase 0부터 시작**
