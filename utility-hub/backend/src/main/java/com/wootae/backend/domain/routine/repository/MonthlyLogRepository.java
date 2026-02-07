package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.MonthlyLog;
import com.wootae.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyLogRepository extends JpaRepository<MonthlyLog, Long> {
      Optional<MonthlyLog> findByUserAndYearAndMonth(User user, Integer year, Integer month);

      List<MonthlyLog> findByUserId(Long userId);

      Optional<MonthlyLog> findByUserIdAndYearAndMonth(Long userId, Integer year, Integer month);

      @Query("SELECT COALESCE(SUM(m.totalXp), 0) FROM MonthlyLog m WHERE m.user.id = :userId")
      Long sumTotalXpByUserId(@Param("userId") Long userId);

      @Modifying
      @Query("DELETE FROM MonthlyLog m WHERE m.user.id = :userId")
      void deleteAllByUserId(@Param("userId") Long userId);
}
