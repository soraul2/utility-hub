package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.Reflection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReflectionRepository extends JpaRepository<Reflection, Long> {
      Optional<Reflection> findByDailyPlanId(Long dailyPlanId);

      Page<Reflection> findByDailyPlan_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

      @EntityGraph(attributePaths = {"dailyPlan", "dailyPlan.keyTasks"})
      @Query("SELECT r FROM Reflection r WHERE r.dailyPlan.user.id = :userId ORDER BY r.dailyPlan.planDate DESC")
      Page<Reflection> findArchiveWithTasks(@Param("userId") Long userId, Pageable pageable);
}
