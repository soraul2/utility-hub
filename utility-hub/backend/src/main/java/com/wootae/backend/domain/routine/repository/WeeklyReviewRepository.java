package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.WeeklyReview;
import com.wootae.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface WeeklyReviewRepository extends JpaRepository<WeeklyReview, Long> {

    Optional<WeeklyReview> findByUserAndWeekStart(User user, LocalDate weekStart);
}
