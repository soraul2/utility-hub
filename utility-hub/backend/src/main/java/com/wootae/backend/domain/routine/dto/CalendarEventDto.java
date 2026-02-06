package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.CalendarEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventDto {
      private Long id;
      private String title;
      private String description;
      private LocalDate startDate;
      private LocalDate endDate;
      private String color;
      private String type;

      public static CalendarEventDto from(CalendarEvent entity) {
            if (entity == null) return null;
            return CalendarEventDto.builder()
                        .id(entity.getId())
                        .title(entity.getTitle())
                        .description(entity.getDescription())
                        .startDate(entity.getStartDate())
                        .endDate(entity.getEndDate())
                        .color(entity.getColor())
                        .type(entity.getType().name())
                        .build();
      }
}
