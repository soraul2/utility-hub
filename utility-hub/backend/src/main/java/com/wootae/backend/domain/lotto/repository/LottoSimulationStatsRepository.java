package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.LottoSimulationStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LottoSimulationStatsRepository extends JpaRepository<LottoSimulationStats, Long> {
      Optional<LottoSimulationStats> findByRuleId(Long ruleId);
}
