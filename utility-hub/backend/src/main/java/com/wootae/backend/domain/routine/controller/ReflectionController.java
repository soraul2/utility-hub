package com.wootae.backend.domain.routine.controller;

import com.wootae.backend.domain.routine.dto.ReflectionDto;
import com.wootae.backend.domain.routine.dto.ReflectionRequest;
import com.wootae.backend.domain.routine.service.RoutineService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/routine/reflections")
@RequiredArgsConstructor
public class ReflectionController {

      private final RoutineService routineService;

      @PostMapping
      public ResponseEntity<?> saveReflection(@RequestBody ReflectionRequest request) {
            ReflectionDto reflection = routineService.saveReflection(request);
            return ResponseEntity.ok(Map.of("success", true, "data", reflection));
      }

      @GetMapping("/archive")
      public ResponseEntity<?> getArchive(
                  @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
            Page<ReflectionDto> archive = routineService.getArchive(pageable);
            return ResponseEntity.ok(Map.of("success", true, "data", archive));
      }
}
