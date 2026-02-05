package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.TimeBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimeBlockRepository extends JpaRepository<TimeBlock, Long> {
      List<TimeBlock> findByDailyPlanId(Long dailyPlanId);
}
