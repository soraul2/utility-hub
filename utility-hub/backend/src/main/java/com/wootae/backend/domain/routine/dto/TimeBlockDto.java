package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.TimeBlock;

public class TimeBlockDto {
      private Long id;
      private String period;
      private String label;
      private int startHour;
      private int endHour;
      private Long assignedTaskId;

      public TimeBlockDto() {
      }

      public TimeBlockDto(Long id, String period, String label, int startHour, int endHour, Long assignedTaskId) {
            this.id = id;
            this.period = period;
            this.label = label;
            this.startHour = startHour;
            this.endHour = endHour;
            this.assignedTaskId = assignedTaskId;
      }

      public static TimeBlockDto from(TimeBlock block) {
            if (block == null)
                  return null;
            return new TimeBlockDto(
                        block.getId(),
                        block.getPeriod(),
                        block.getLabel(),
                        block.getStartHour(),
                        block.getEndHour(),
                        block.getAssignedTask() != null ? block.getAssignedTask().getId() : null);
      }

      // Getters and Setters
      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public String getPeriod() {
            return period;
      }

      public void setPeriod(String period) {
            this.period = period;
      }

      public String getLabel() {
            return label;
      }

      public void setLabel(String label) {
            this.label = label;
      }

      public int getStartHour() {
            return startHour;
      }

      public void setStartHour(int startHour) {
            this.startHour = startHour;
      }

      public int getEndHour() {
            return endHour;
      }

      public void setEndHour(int endHour) {
            this.endHour = endHour;
      }

      public Long getAssignedTaskId() {
            return assignedTaskId;
      }

      public void setAssignedTaskId(Long assignedTaskId) {
            this.assignedTaskId = assignedTaskId;
      }

      public static TimeBlockDtoBuilder builder() {
            return new TimeBlockDtoBuilder();
      }

      public static class TimeBlockDtoBuilder {
            private Long id;
            private String period;
            private String label;
            private int startHour;
            private int endHour;
            private Long assignedTaskId;

            public TimeBlockDtoBuilder id(Long id) {
                  this.id = id;
                  return this;
            }

            public TimeBlockDtoBuilder period(String period) {
                  this.period = period;
                  return this;
            }

            public TimeBlockDtoBuilder label(String label) {
                  this.label = label;
                  return this;
            }

            public TimeBlockDtoBuilder startHour(int startHour) {
                  this.startHour = startHour;
                  return this;
            }

            public TimeBlockDtoBuilder endHour(int endHour) {
                  this.endHour = endHour;
                  return this;
            }

            public TimeBlockDtoBuilder assignedTaskId(Long assignedTaskId) {
                  this.assignedTaskId = assignedTaskId;
                  return this;
            }

            public TimeBlockDto build() {
                  return new TimeBlockDto(id, period, label, startHour, endHour, assignedTaskId);
            }
      }
}
