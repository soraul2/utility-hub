package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.SimulationJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SimulationJobRepository extends JpaRepository<SimulationJob, Long> {

      @Query("SELECT j FROM SimulationJob j WHERE j.status = 'RUNNING' ORDER BY j.startedAt DESC LIMIT 1")
      Optional<SimulationJob> findRunningJob();

      @Query("SELECT j FROM SimulationJob j ORDER BY j.startedAt DESC LIMIT 1")
      Optional<SimulationJob> findLatestJob();
}
