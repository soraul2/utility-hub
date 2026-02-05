package com.wootae.backend.domain.routine.entity;

import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "routine_weekly_reviews", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "week_start"})
})
@EntityListeners(AuditingEntityListener.class)
public class WeeklyReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Column(columnDefinition = "TEXT")
    private String achievement;

    @Column(columnDefinition = "TEXT")
    private String improvement;

    @Column(name = "next_goal")
    private String nextGoal;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public void update(String achievement, String improvement, String nextGoal) {
        this.achievement = achievement;
        this.improvement = improvement;
        this.nextGoal = nextGoal;
    }
}
