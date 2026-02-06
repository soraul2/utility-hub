package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.MonthlyLog;
import com.wootae.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MonthlyLogRepository extends JpaRepository<MonthlyLog, Long> {
      Optional<MonthlyLog> findByUserAndYearAndMonth(User user, Integer year, Integer month);
}
