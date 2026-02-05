# 📋 Routine MVP API Specification

**Base URL**: `/api/v1/routine`
**Auth**: Bearer Token (JWT) required for all endpoints

## 1. Daily Plan API

### 1-1. Get Today's Plan
오늘의 계획을 조회합니다. 존재하지 않으면 빈 계획을 반환하거나 404를 내보낼 수 있으나, 비즈니스 로직상 자동 생성을 권장합니다.
- **URL**: `GET /api/v1/routine/daily-plans/today`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "planDate": "2025-02-05",
    "keyTasks": [],
    "timeBlocks": [
       { "id": 10, "period": "morning", "label": "🌅 아침 (5-9am)", "startHour": 5, "endHour": 9, "assignedTaskId": null }
    ],
    "reflection": null
  }
}
```

### 1-2. Get Specific Date Plan
특정 날짜의 계획을 조회합니다.
- **URL**: `GET /api/v1/routine/daily-plans/{date}`
- **Params**: `date` (YYYY-MM-DD)
- **Response**: `200 OK` (structure same as above)

### 1-3. Create/Init Plan (Optional)
명시적으로 계획을 생성할 때 사용합니다.
- **URL**: `POST /api/v1/routine/daily-plans`
- **Body**:
```json
{
  "planDate": "2025-02-06"
}
```

## 2. Task API

### 2-1. Add Key Task
Key Task를 추가합니다 (최대 3개 제한은 서비스 로직에서 체크).
- **URL**: `POST /api/v1/routine/daily-plans/{planId}/tasks`
- **Body**:
```json
{
  "title": "운동하기"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 101,
    "title": "운동하기",
    "completed": false,
    "taskOrder": 0
  }
}
```

### 2-2. Toggle Task
- **URL**: `PATCH /api/v1/routine/tasks/{taskId}/toggle`
- **Response**: `200 OK`

### 2-3. Delete Task
- **URL**: `DELETE /api/v1/routine/tasks/{taskId}`
- **Response**: `200 OK`

## 3. Reflection API

### 3-1. Save Reflection
회고를 저장하거나 수정합니다.
- **URL**: `POST /api/v1/routine/reflections`
- **Body**:
```json
{
  "planId": 1,
  "rating": 5,
  "mood": "😊",
  "whatWentWell": "좋았던 점...",
  "whatDidntGoWell": "아쉬운 점...",
  "tomorrowFocus": "내일의 다짐..."
}
```
- **Response**: `200 OK`

### 3-2. Get Archive
과거 회고 목록을 페이징하여 조회합니다.
- **URL**: `GET /api/v1/routine/reflections/archive`
- **Query**: `page=0&size=10`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 50,
        "planDate": "2025-02-04",
        "rating": 4,
        "mood": "😊",
        "summary": "좋았던 점..."
      }
    ],
    "totalPages": 5,
    "totalElements": 48
  }
}
```

## 4. DTO Structures (Java)

```java
package com.wootae.backend.domain.routine.dto;

public class DailyPlanResponse {
    private Long id;
    private LocalDate planDate;
    private List<TaskResponse> keyTasks;
    private List<TimeBlockResponse> timeBlocks;
    private ReflectionResponse reflection;
}

public class TaskResponse {
    private Long id;
    private String title;
    private boolean completed;
    private Integer taskOrder;
}

public class ReflectionRequest {
    private Long planId;
    private Integer rating;
    private String mood;
    private String whatWentWell;
    private String whatDidntGoWell;
    private String tomorrowFocus;
}
```
