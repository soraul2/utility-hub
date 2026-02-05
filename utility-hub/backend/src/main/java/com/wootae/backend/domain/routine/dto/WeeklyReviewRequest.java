package com.wootae.backend.domain.routine.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WeeklyReviewRequest {

    private String weekStart; // yyyy-MM-dd format
    private String achievement;
    private String improvement;
    private String nextGoal;
}
