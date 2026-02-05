package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.Task;
import java.time.format.DateTimeFormatter;

public class TaskDto {
      private Long id;
      private String title;
      private String description;
      private boolean completed;
      private Integer taskOrder;
      private String category;
      private String startTime;
      private String endTime;
      private Integer durationMinutes;
      private String priority;

      public TaskDto() {
      }

      public TaskDto(Long id, String title, String description, boolean completed, Integer taskOrder,
                  String category, String startTime, String endTime, Integer durationMinutes, String priority) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.completed = completed;
            this.taskOrder = taskOrder;
            this.category = category;
            this.startTime = startTime;
            this.endTime = endTime;
            this.durationMinutes = durationMinutes;
            this.priority = priority;
      }

      public static TaskDto from(Task task) {
            if (task == null)
                  return null;

            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

            return new TaskDto(
                        task.getId(),
                        task.getTitle(),
                        task.getDescription(),
                        task.isCompleted(),
                        task.getTaskOrder(),
                        task.getCategory(),
                        task.getStartTime() != null ? task.getStartTime().format(timeFormatter) : null,
                        task.getEndTime() != null ? task.getEndTime().format(timeFormatter) : null,
                        task.getDurationMinutes(),
                        task.getPriority());
      }

      // Getters and Setters
      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public String getTitle() {
            return title;
      }

      public void setTitle(String title) {
            this.title = title;
      }

      public String getDescription() {
            return description;
      }

      public void setDescription(String description) {
            this.description = description;
      }

      public boolean isCompleted() {
            return completed;
      }

      public void setCompleted(boolean completed) {
            this.completed = completed;
      }

      public Integer getTaskOrder() {
            return taskOrder;
      }

      public void setTaskOrder(Integer taskOrder) {
            this.taskOrder = taskOrder;
      }

      public String getCategory() {
            return category;
      }

      public void setCategory(String category) {
            this.category = category;
      }

      public String getStartTime() {
            return startTime;
      }

      public void setStartTime(String startTime) {
            this.startTime = startTime;
      }

      public String getEndTime() {
            return endTime;
      }

      public void setEndTime(String endTime) {
            this.endTime = endTime;
      }

      public Integer getDurationMinutes() {
            return durationMinutes;
      }

      public void setDurationMinutes(Integer durationMinutes) {
            this.durationMinutes = durationMinutes;
      }

      public String getPriority() {
            return priority;
      }

      public void setPriority(String priority) {
            this.priority = priority;
      }

      public static TaskDtoBuilder builder() {
            return new TaskDtoBuilder();
      }

      public static class TaskDtoBuilder {
            private Long id;
            private String title;
            private String description;
            private boolean completed;
            private Integer taskOrder;
            private String category;
            private String startTime;
            private String endTime;
            private Integer durationMinutes;
            private String priority;

            public TaskDtoBuilder id(Long id) {
                  this.id = id;
                  return this;
            }

            public TaskDtoBuilder title(String title) {
                  this.title = title;
                  return this;
            }

            public TaskDtoBuilder description(String description) {
                  this.description = description;
                  return this;
            }

            public TaskDtoBuilder completed(boolean completed) {
                  this.completed = completed;
                  return this;
            }

            public TaskDtoBuilder taskOrder(Integer taskOrder) {
                  this.taskOrder = taskOrder;
                  return this;
            }

            public TaskDtoBuilder category(String category) {
                  this.category = category;
                  return this;
            }

            public TaskDtoBuilder startTime(String startTime) {
                  this.startTime = startTime;
                  return this;
            }

            public TaskDtoBuilder endTime(String endTime) {
                  this.endTime = endTime;
                  return this;
            }

            public TaskDtoBuilder durationMinutes(Integer durationMinutes) {
                  this.durationMinutes = durationMinutes;
                  return this;
            }

            public TaskDtoBuilder priority(String priority) {
                  this.priority = priority;
                  return this;
            }

            public TaskDto build() {
                  return new TaskDto(id, title, description, completed, taskOrder, category, startTime, endTime,
                              durationMinutes, priority);
            }
      }
}
