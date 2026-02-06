package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.RoutineTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class RoutineTemplateDto {
      private Long id;
      private String name;
      private String description;
      private List<TemplateTaskDto> tasks;
      private LocalDateTime createdAt;
      private LocalDateTime updatedAt;

      public RoutineTemplateDto() {
      }

      public RoutineTemplateDto(Long id, String name, String description,
                  List<TemplateTaskDto> tasks, LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.tasks = tasks;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
      }

      public static RoutineTemplateDto from(RoutineTemplate template) {
            if (template == null) return null;
            return new RoutineTemplateDto(
                        template.getId(),
                        template.getName(),
                        template.getDescription(),
                        template.getTasks().stream()
                                    .map(TemplateTaskDto::from)
                                    .collect(Collectors.toList()),
                        template.getCreatedAt(),
                        template.getUpdatedAt());
      }

      public Long getId() { return id; }
      public void setId(Long id) { this.id = id; }
      public String getName() { return name; }
      public void setName(String name) { this.name = name; }
      public String getDescription() { return description; }
      public void setDescription(String description) { this.description = description; }
      public List<TemplateTaskDto> getTasks() { return tasks; }
      public void setTasks(List<TemplateTaskDto> tasks) { this.tasks = tasks; }
      public LocalDateTime getCreatedAt() { return createdAt; }
      public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
      public LocalDateTime getUpdatedAt() { return updatedAt; }
      public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
