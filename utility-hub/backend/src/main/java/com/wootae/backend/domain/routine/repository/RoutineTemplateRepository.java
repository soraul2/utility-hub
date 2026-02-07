package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.RoutineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineTemplateRepository extends JpaRepository<RoutineTemplate, Long> {
      List<RoutineTemplate> findByUserIdOrderByCreatedAtDesc(Long userId);

      Optional<RoutineTemplate> findByIdAndUserId(Long id, Long userId);

      @Modifying
      @Query("DELETE FROM RoutineTemplateTask t WHERE t.template.id IN (SELECT rt.id FROM RoutineTemplate rt WHERE rt.user.id = :userId)")
      void deleteTemplateTasksByUserId(@Param("userId") Long userId);

      @Modifying
      @Query("DELETE FROM RoutineTemplate rt WHERE rt.user.id = :userId")
      void deleteAllByUserId(@Param("userId") Long userId);
}
