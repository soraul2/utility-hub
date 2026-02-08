package com.wootae.backend.domain.lotto.controller;

import com.wootae.backend.domain.lotto.entity.SimulationJob;
import com.wootae.backend.domain.lotto.service.SimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

      private final SimulationService simulationService;

      @PostMapping("/start")
      public ResponseEntity<Map<String, Object>> startSimulation(
                  @RequestParam(defaultValue = "100000") int ticketsPerDraw) {
            if (simulationService.isRunning()) {
                  return ResponseEntity.badRequest().body(Map.of(
                              "status", "ALREADY_RUNNING",
                              "message", "시뮬레이션이 이미 실행 중입니다."));
            }
            simulationService.startSimulation(ticketsPerDraw);
            return ResponseEntity.ok(Map.of(
                        "status", "STARTED",
                        "ticketsPerDraw", ticketsPerDraw,
                        "message", "시뮬레이션이 시작되었습니다."));
      }

      @GetMapping("/status")
      public ResponseEntity<Map<String, Object>> getStatus() {
            SimulationJob job = simulationService.getLatestJob();
            if (job == null) {
                  return ResponseEntity.ok(Map.of("status", "NO_JOB", "message", "실행된 시뮬레이션이 없습니다."));
            }
            Map<String, Object> status = new LinkedHashMap<>();
            status.put("status", job.getStatus());
            status.put("totalTasks", job.getTotalTasks());
            status.put("completedTasks", job.getCompletedTasks());
            status.put("progressPercent", String.format("%.1f", job.getProgressPercent()));
            status.put("currentStrategy", job.getCurrentStrategy());
            status.put("startedAt", job.getStartedAt());
            status.put("completedAt", job.getCompletedAt());
            if (job.getErrorMessage() != null) status.put("errorMessage", job.getErrorMessage());
            return ResponseEntity.ok(status);
      }

      @PostMapping("/stop")
      public ResponseEntity<Map<String, String>> stopSimulation() {
            simulationService.stopSimulation();
            return ResponseEntity.ok(Map.of("status", "STOPPING", "message", "시뮬레이션 중단 요청되었습니다."));
      }

      @GetMapping("/results")
      public ResponseEntity<List<Map<String, Object>>> getAllResults() {
            return ResponseEntity.ok(simulationService.getAllSummaries());
      }

      @GetMapping("/results/{strategyType}")
      public ResponseEntity<Map<String, Object>> getResultByStrategy(@PathVariable String strategyType) {
            return ResponseEntity.ok(simulationService.getSummary(strategyType.toUpperCase()));
      }

      /**
       * 특정 회차만 주간 시뮬레이션 실행
       * POST /api/simulation/weekly/{drawNo}?ticketsPerDraw=100000
       */
      @PostMapping("/weekly/{drawNo}")
      public ResponseEntity<Map<String, Object>> runWeeklySimulation(
                  @PathVariable int drawNo,
                  @RequestParam(defaultValue = "100000") int ticketsPerDraw) {
            simulationService.runWeeklySimulation(drawNo, ticketsPerDraw);
            return ResponseEntity.ok(Map.of(
                        "status", "COMPLETED",
                        "drawNo", drawNo,
                        "ticketsPerDraw", ticketsPerDraw,
                        "message", drawNo + "회차 주간 시뮬레이션이 완료되었습니다."));
      }
}
