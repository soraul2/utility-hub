package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.WeeklyReview;
import com.wootae.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface WeeklyReviewRepository extends JpaRepository<WeeklyReview, Long> {

    Optional<WeeklyReview> findByUserAndWeekStart(User user, LocalDate weekStart);

    @Modifying
    @Query("DELETE FROM WeeklyReview w WHERE w.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
