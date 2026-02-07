package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyPlanRepository extends JpaRepository<DailyPlan, Long> {
      Optional<DailyPlan> findByUserIdAndPlanDate(Long userId, LocalDate planDate);

      // Safe version: returns first match even if duplicates exist
      Optional<DailyPlan> findFirstByUserIdAndPlanDateOrderByIdAsc(Long userId, LocalDate planDate);

      // For cleanup: returns all plans for a date (including duplicates)
      List<DailyPlan> findAllByUserIdAndPlanDate(Long userId, LocalDate planDate);

      List<DailyPlan> findByUserIdOrderByPlanDateDesc(Long userId);

      @EntityGraph(attributePaths = {"keyTasks", "reflection"})
      List<DailyPlan> findByUserIdAndPlanDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

      // Bulk delete child entities first, then plans
      @Modifying
      @Query("DELETE FROM Task t WHERE t.dailyPlan.id IN (SELECT dp.id FROM DailyPlan dp WHERE dp.user.id = :userId)")
      void deleteTasksByUserId(@Param("userId") Long userId);

      @Modifying
      @Query("DELETE FROM TimeBlock tb WHERE tb.dailyPlan.id IN (SELECT dp.id FROM DailyPlan dp WHERE dp.user.id = :userId)")
      void deleteTimeBlocksByUserId(@Param("userId") Long userId);

      @Modifying
      @Query("DELETE FROM Reflection r WHERE r.dailyPlan.id IN (SELECT dp.id FROM DailyPlan dp WHERE dp.user.id = :userId)")
      void deleteReflectionsByUserId(@Param("userId") Long userId);

      @Modifying
      @Query("DELETE FROM DailyPlan dp WHERE dp.user.id = :userId")
      void deleteAllByUserId(@Param("userId") Long userId);
}
