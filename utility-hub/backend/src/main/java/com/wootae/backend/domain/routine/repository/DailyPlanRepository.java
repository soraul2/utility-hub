package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyPlanRepository extends JpaRepository<DailyPlan, Long> {
      Optional<DailyPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);

      List<DailyPlan> findByUserIdOrderByPlanDateDesc(Long userId);

      List<DailyPlan> findByUserIdAndPlanDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
}
