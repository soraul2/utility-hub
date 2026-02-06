package com.wootae.backend.domain.routine.controller;

import com.wootae.backend.domain.routine.dto.DailyPlanCreateRequest;
import com.wootae.backend.domain.routine.dto.DailyPlanDto;
import com.wootae.backend.domain.routine.dto.RoutineTemplateCreateRequest;
import com.wootae.backend.domain.routine.dto.RoutineTemplateDto;
import com.wootae.backend.domain.routine.dto.TaskCreateRequest;
import com.wootae.backend.domain.routine.dto.TaskDto;
import com.wootae.backend.domain.routine.dto.MonthlyGoalRequest;
import com.wootae.backend.domain.routine.dto.MonthlyMemoRequest;
import com.wootae.backend.domain.routine.dto.MonthlyStatusResponse;
import com.wootae.backend.domain.routine.dto.WeeklyReviewDto;
import com.wootae.backend.domain.routine.dto.WeeklyReviewRequest;
import com.wootae.backend.domain.routine.dto.CalendarEventDto;
import com.wootae.backend.domain.routine.dto.CalendarEventCreateRequest;
import com.wootae.backend.domain.routine.service.RoutineService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
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

      @DeleteMapping("/daily-plans/{date}")
      public ResponseEntity<?> deletePlan(
                  @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
            routineService.deletePlan(date);
            return ResponseEntity.ok(Map.of("success", true));
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

      // Template Endpoints

      @GetMapping("/templates")
      public ResponseEntity<?> getTemplates() {
            List<RoutineTemplateDto> templates = routineService.getTemplates();
            return ResponseEntity.ok(Map.of("success", true, "data", templates));
      }

      @GetMapping("/templates/{templateId}")
      public ResponseEntity<?> getTemplate(@PathVariable Long templateId) {
            RoutineTemplateDto template = routineService.getTemplate(templateId);
            return ResponseEntity.ok(Map.of("success", true, "data", template));
      }

      @PostMapping("/templates")
      public ResponseEntity<?> createTemplate(@RequestBody RoutineTemplateCreateRequest request) {
            RoutineTemplateDto template = routineService.createTemplate(request);
            return ResponseEntity.ok(Map.of("success", true, "data", template));
      }

      @PutMapping("/templates/{templateId}")
      public ResponseEntity<?> updateTemplate(@PathVariable Long templateId,
                  @RequestBody RoutineTemplateCreateRequest request) {
            RoutineTemplateDto template = routineService.updateTemplate(templateId, request);
            return ResponseEntity.ok(Map.of("success", true, "data", template));
      }

      @DeleteMapping("/templates/{templateId}")
      public ResponseEntity<?> deleteTemplate(@PathVariable Long templateId) {
            routineService.deleteTemplate(templateId);
            return ResponseEntity.ok(Map.of("success", true));
      }

      @PostMapping("/daily-plans/{planId}/apply-template/{templateId}")
      public ResponseEntity<?> applyTemplate(@PathVariable Long planId, @PathVariable Long templateId) {
            DailyPlanDto plan = routineService.applyTemplate(planId, templateId);
            return ResponseEntity.ok(Map.of("success", true, "data", plan));
      }

      // Monthly Calendar Endpoints

      @GetMapping("/monthly/{year}/{month}")
      public ResponseEntity<?> getMonthlyStatus(@PathVariable int year, @PathVariable int month) {
            MonthlyStatusResponse response = routineService.getMonthlyStatus(year, month);
            return ResponseEntity.ok(Map.of("success", true, "data", response));
      }

      @PostMapping("/monthly/{year}/{month}/goal")
      public ResponseEntity<?> updateMonthlyGoal(@PathVariable int year, @PathVariable int month,
                  @RequestBody MonthlyGoalRequest request) {
            routineService.updateMonthlyGoal(year, month, request.getMonthlyGoal());
            return ResponseEntity.ok(Map.of("success", true));
      }

      @PostMapping("/daily-plans/{date}/memo")
      public ResponseEntity<?> updateMonthlyMemo(
                  @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                  @RequestBody MonthlyMemoRequest request) {
            routineService.updateMonthlyMemo(date, request.getMemo());
            return ResponseEntity.ok(Map.of("success", true));
      }

      // Calendar Event Endpoints

      @GetMapping("/calendar-events")
      public ResponseEntity<?> getCalendarEvents(@RequestParam int year, @RequestParam int month) {
            List<CalendarEventDto> events = routineService.getCalendarEvents(year, month);
            return ResponseEntity.ok(Map.of("success", true, "data", events));
      }

      @PostMapping("/calendar-events")
      public ResponseEntity<?> createCalendarEvent(@RequestBody CalendarEventCreateRequest request) {
            CalendarEventDto event = routineService.createCalendarEvent(request);
            return ResponseEntity.ok(Map.of("success", true, "data", event));
      }

      @PutMapping("/calendar-events/{eventId}")
      public ResponseEntity<?> updateCalendarEvent(@PathVariable Long eventId,
                  @RequestBody CalendarEventCreateRequest request) {
            CalendarEventDto event = routineService.updateCalendarEvent(eventId, request);
            return ResponseEntity.ok(Map.of("success", true, "data", event));
      }

      @DeleteMapping("/calendar-events/{eventId}")
      public ResponseEntity<?> deleteCalendarEvent(@PathVariable Long eventId) {
            routineService.deleteCalendarEvent(eventId);
            return ResponseEntity.ok(Map.of("success", true));
      }
}
