package com.wootae.backend.domain.routine.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class RoutineTemplateCreateRequest {
      private String name;
      private String description;
      private Long sourcePlanId;
      private List<TemplateTaskRequest> tasks;
}
