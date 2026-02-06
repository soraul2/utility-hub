package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.RoutineTemplateTask;

import java.time.format.DateTimeFormatter;

public class TemplateTaskDto {
      private Long id;
      private String title;
      private Integer taskOrder;
      private String category;
      private String startTime;
      private String endTime;
      private Integer durationMinutes;
      private String description;
      private String priority;

      public TemplateTaskDto() {
      }

      public TemplateTaskDto(Long id, String title, Integer taskOrder, String category,
                  String startTime, String endTime, Integer durationMinutes,
                  String description, String priority) {
            this.id = id;
            this.title = title;
            this.taskOrder = taskOrder;
            this.category = category;
            this.startTime = startTime;
            this.endTime = endTime;
            this.durationMinutes = durationMinutes;
            this.description = description;
            this.priority = priority;
      }

      public static TemplateTaskDto from(RoutineTemplateTask task) {
            if (task == null) return null;
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");
            return new TemplateTaskDto(
                        task.getId(),
                        task.getTitle(),
                        task.getTaskOrder(),
                        task.getCategory(),
                        task.getStartTime() != null ? task.getStartTime().format(timeFormatter) : null,
                        task.getEndTime() != null ? task.getEndTime().format(timeFormatter) : null,
                        task.getDurationMinutes(),
                        task.getDescription(),
                        task.getPriority());
      }

      public Long getId() { return id; }
      public void setId(Long id) { this.id = id; }
      public String getTitle() { return title; }
      public void setTitle(String title) { this.title = title; }
      public Integer getTaskOrder() { return taskOrder; }
      public void setTaskOrder(Integer taskOrder) { this.taskOrder = taskOrder; }
      public String getCategory() { return category; }
      public void setCategory(String category) { this.category = category; }
      public String getStartTime() { return startTime; }
      public void setStartTime(String startTime) { this.startTime = startTime; }
      public String getEndTime() { return endTime; }
      public void setEndTime(String endTime) { this.endTime = endTime; }
      public Integer getDurationMinutes() { return durationMinutes; }
      public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
      public String getDescription() { return description; }
      public void setDescription(String description) { this.description = description; }
      public String getPriority() { return priority; }
      public void setPriority(String priority) { this.priority = priority; }
}
