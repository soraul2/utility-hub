package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.WeeklyReview;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class WeeklyReviewDto {

    private Long id;
    private LocalDate weekStart;
    private String achievement;
    private String improvement;
    private String nextGoal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WeeklyReviewDto from(WeeklyReview review) {
        return WeeklyReviewDto.builder()
                .id(review.getId())
                .weekStart(review.getWeekStart())
                .achievement(review.getAchievement())
                .improvement(review.getImprovement())
                .nextGoal(review.getNextGoal())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
