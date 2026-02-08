package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.SimulationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {

      List<SimulationResult> findByStrategyType(String strategyType);

      List<SimulationResult> findByStrategyTypeOrderByDrawNoAsc(String strategyType);

      boolean existsByStrategyTypeAndDrawNo(String strategyType, Integer drawNo);

      @Query("SELECT DISTINCT r.strategyType FROM SimulationResult r")
      List<String> findDistinctStrategyTypes();

      void deleteByStrategyType(String strategyType);

      // 특정 회차 + 전략 결과 조회 (주간 랭킹 계산용)
      Optional<SimulationResult> findByStrategyTypeAndDrawNo(String strategyType, Integer drawNo);

      // 특정 회차의 모든 전략 결과 조회
      List<SimulationResult> findByDrawNo(Integer drawNo);
}
