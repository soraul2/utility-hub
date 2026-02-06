package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.RoutineTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineTemplateRepository extends JpaRepository<RoutineTemplate, Long> {
      List<RoutineTemplate> findByUserIdOrderByCreatedAtDesc(Long userId);

      Optional<RoutineTemplate> findByIdAndUserId(Long id, Long userId);
}
