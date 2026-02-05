package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public class DailyPlanDto {
      private Long id;
      private LocalDate planDate;
      private List<TaskDto> keyTasks;
      private List<TimeBlockDto> timeBlocks;
      private ReflectionDto reflection;
      private String status;

      public DailyPlanDto() {
      }

      public DailyPlanDto(Long id, LocalDate planDate, List<TaskDto> keyTasks, List<TimeBlockDto> timeBlocks,
                  ReflectionDto reflection, String status) {
            this.id = id;
            this.planDate = planDate;
            this.keyTasks = keyTasks;
            this.timeBlocks = timeBlocks;
            this.reflection = reflection;
            this.status = status;
      }

      public static DailyPlanDto from(DailyPlan plan) {
            if (plan == null)
                  return null;

            DailyPlanDto dto = new DailyPlanDto();
            dto.setId(plan.getId());
            dto.setPlanDate(plan.getPlanDate());
            dto.setStatus(plan.getStatus() != null ? plan.getStatus().name() : "PLANNING");

            if (plan.getKeyTasks() != null) {
                  dto.setKeyTasks(plan.getKeyTasks().stream()
                              .map(TaskDto::from)
                              .collect(Collectors.toList()));
            }

            if (plan.getTimeBlocks() != null) {
                  dto.setTimeBlocks(plan.getTimeBlocks().stream()
                              .map(TimeBlockDto::from)
                              .collect(Collectors.toList()));
            }

            if (plan.getReflection() != null) {
                  dto.setReflection(ReflectionDto.from(plan.getReflection()));
            }

            return dto;
      }

      // Getters and Setters
      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public LocalDate getPlanDate() {
            return planDate;
      }

      public void setPlanDate(LocalDate planDate) {
            this.planDate = planDate;
      }

      public List<TaskDto> getKeyTasks() {
            return keyTasks;
      }

      public void setKeyTasks(List<TaskDto> keyTasks) {
            this.keyTasks = keyTasks;
      }

      public List<TimeBlockDto> getTimeBlocks() {
            return timeBlocks;
      }

      public void setTimeBlocks(List<TimeBlockDto> timeBlocks) {
            this.timeBlocks = timeBlocks;
      }

      public ReflectionDto getReflection() {
            return reflection;
      }

      public void setReflection(ReflectionDto reflection) {
            this.reflection = reflection;
      }

      public String getStatus() {
            return status;
      }

      public void setStatus(String status) {
            this.status = status;
      }

      // Builder pattern for compatibility if needed elsewhere
      public static DailyPlanDtoBuilder builder() {
            return new DailyPlanDtoBuilder();
      }

      public static class DailyPlanDtoBuilder {
            private Long id;
            private LocalDate planDate;
            private List<TaskDto> keyTasks;
            private List<TimeBlockDto> timeBlocks;
            private ReflectionDto reflection;
            private String status;

            public DailyPlanDtoBuilder id(Long id) {
                  this.id = id;
                  return this;
            }

            public DailyPlanDtoBuilder planDate(LocalDate planDate) {
                  this.planDate = planDate;
                  return this;
            }

            public DailyPlanDtoBuilder keyTasks(List<TaskDto> keyTasks) {
                  this.keyTasks = keyTasks;
                  return this;
            }

            public DailyPlanDtoBuilder timeBlocks(List<TimeBlockDto> timeBlocks) {
                  this.timeBlocks = timeBlocks;
                  return this;
            }

            public DailyPlanDtoBuilder reflection(ReflectionDto reflection) {
                  this.reflection = reflection;
                  return this;
            }

            public DailyPlanDtoBuilder status(String status) {
                  this.status = status;
                  return this;
            }

            public DailyPlanDto build() {
                  return new DailyPlanDto(id, planDate, keyTasks, timeBlocks, reflection, status);
            }
      }
}
