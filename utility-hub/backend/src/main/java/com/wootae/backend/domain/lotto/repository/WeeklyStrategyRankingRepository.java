package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.WeeklyStrategyRanking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WeeklyStrategyRankingRepository extends JpaRepository<WeeklyStrategyRanking, Long> {

      // 특정 회차의 모든 전략 랭킹 (순위순)
      List<WeeklyStrategyRanking> findByDrawNoOrderByRankPositionAsc(Integer drawNo);

      // 특정 회차 + 전략
      Optional<WeeklyStrategyRanking> findByDrawNoAndStrategyType(Integer drawNo, String strategyType);

      // 특정 전략의 히스토리 (최신순)
      List<WeeklyStrategyRanking> findByStrategyTypeOrderByDrawNoDesc(String strategyType);

      // 가장 최근 랭킹이 있는 회차 번호
      @Query("SELECT MAX(r.drawNo) FROM WeeklyStrategyRanking r")
      Optional<Integer> findLatestRankedDrawNo();

      // 특정 전략의 최근 N회차 주간 점수 조회 (가중 평균 계산용)
      @Query("SELECT r FROM WeeklyStrategyRanking r WHERE r.strategyType = :strategyType " +
                  "AND r.drawNo <= :drawNo ORDER BY r.drawNo DESC")
      List<WeeklyStrategyRanking> findRecentRankings(
                  @Param("strategyType") String strategyType,
                  @Param("drawNo") Integer drawNo);

      // 이전 회차의 특정 전략 순위 조회
      @Query("SELECT r.rankPosition FROM WeeklyStrategyRanking r " +
                  "WHERE r.strategyType = :strategyType AND r.drawNo = :drawNo")
      Optional<Integer> findRankByStrategyTypeAndDrawNo(
                  @Param("strategyType") String strategyType,
                  @Param("drawNo") Integer drawNo);

      // 특정 회차의 Top N 랭킹
      @Query("SELECT r FROM WeeklyStrategyRanking r WHERE r.drawNo = :drawNo " +
                  "ORDER BY r.rankPosition ASC")
      List<WeeklyStrategyRanking> findTopRankings(@Param("drawNo") Integer drawNo);

      boolean existsByDrawNo(Integer drawNo);
}
