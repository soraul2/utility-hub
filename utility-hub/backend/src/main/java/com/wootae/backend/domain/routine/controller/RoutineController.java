package com.wootae.backend.domain.routine.controller;

import com.wootae.backend.domain.routine.dto.DailyPlanCreateRequest;
import com.wootae.backend.domain.routine.dto.DailyPlanDto;
import com.wootae.backend.domain.routine.dto.TaskCreateRequest;
import com.wootae.backend.domain.routine.dto.TaskDto;
import com.wootae.backend.domain.routine.dto.WeeklyReviewDto;
import com.wootae.backend.domain.routine.dto.WeeklyReviewRequest;
import com.wootae.backend.domain.routine.service.RoutineService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/routine")
@RequiredArgsConstructor
public class RoutineController {

      private final RoutineService routineService;

      // Daily Plan Endpoints

      @GetMapping("/daily-plans/today")
      public ResponseEntity<?> getTodayPlan() {
            DailyPlanDto plan = routineService.getOrCreateTodayPlan();
            return ResponseEntity.ok(Map.of("success", true, "data", plan));
      }

      @GetMapping("/daily-plans/{date}")
      public ResponseEntity<?> getPlan(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            DailyPlanDto plan = routineService.getPlan(date);
            return ResponseEntity.ok(Map.of("success", true, "data", plan));
      }

      @PostMapping("/daily-plans")
      public ResponseEntity<?> createPlan(@RequestBody DailyPlanCreateRequest request) {
            DailyPlanDto plan = routineService.createPlan(request);
            return ResponseEntity.ok(Map.of("success", true, "data", plan));
      }

      @PostMapping("/daily-plans/{date}/confirm")
      public ResponseEntity<?> confirmPlan(
                  @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            DailyPlanDto plan = routineService.confirmPlan(date);
            return ResponseEntity.ok(Map.of("success", true, "data", plan));
      }

      @PostMapping("/daily-plans/{date}/unconfirm")
      public ResponseEntity<?> unconfirmPlan(
                  @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            DailyPlanDto plan = routineService.unconfirmPlan(date);
            return ResponseEntity.ok(Map.of("success", true, "data", plan));
      }

      // Task Endpoints

      @PostMapping("/daily-plans/{planId}/tasks")
      public ResponseEntity<?> addTask(@PathVariable Long planId, @RequestBody TaskCreateRequest request) {
            TaskDto task = routineService.addTask(planId, request);
            return ResponseEntity.ok(Map.of("success", true, "data", task));
      }

      @PatchMapping("/tasks/{taskId}/toggle")
      public ResponseEntity<?> toggleTask(@PathVariable Long taskId) {
            TaskDto task = routineService.toggleTask(taskId);
            return ResponseEntity.ok(Map.of("success", true, "data", task));
      }

      @PutMapping("/tasks/{taskId}")
      public ResponseEntity<?> updateTask(@PathVariable Long taskId, @RequestBody TaskCreateRequest request) {
            TaskDto task = routineService.updateTask(taskId, request);
            return ResponseEntity.ok(Map.of("success", true, "data", task));
      }

      @DeleteMapping("/tasks/{taskId}")
      public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
            routineService.deleteTask(taskId);
            return ResponseEntity.ok(Map.of("success", true));
      }

      @GetMapping("/stats/weekly")
      public ResponseEntity<?> getWeeklyStats(
                  @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            if (date == null) {
                  date = LocalDate.now();
            }
            com.wootae.backend.domain.routine.dto.WeeklyStatsResponse stats = routineService.getWeeklyStats(date);
            return ResponseEntity.ok(Map.of("success", true, "data", stats));
      }

      // Weekly Review Endpoints

      @PostMapping("/weekly-reviews")
      public ResponseEntity<?> saveWeeklyReview(@RequestBody WeeklyReviewRequest request) {
            WeeklyReviewDto review = routineService.saveWeeklyReview(request);
            return ResponseEntity.ok(Map.of("success", true, "data", review));
      }

      @GetMapping("/weekly-reviews/{weekStart}")
      public ResponseEntity<?> getWeeklyReview(
                  @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart) {
            WeeklyReviewDto review = routineService.getWeeklyReview(weekStart);
            return ResponseEntity.ok(Map.of("success", true, "data", review));
      }
}
