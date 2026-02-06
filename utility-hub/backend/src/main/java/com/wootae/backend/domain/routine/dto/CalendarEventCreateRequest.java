package com.wootae.backend.domain.routine.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CalendarEventCreateRequest {
      private String title;
      private String description;
      private String startDate;
      private String endDate;
      private String color;
      private String type;
}
