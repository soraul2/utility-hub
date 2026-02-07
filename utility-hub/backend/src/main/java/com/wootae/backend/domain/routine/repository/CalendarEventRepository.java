package com.wootae.backend.domain.routine.repository;

import com.wootae.backend.domain.routine.entity.CalendarEvent;
import com.wootae.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {

      @Query("SELECT e FROM CalendarEvent e WHERE e.user = :user AND e.startDate <= :endDate AND e.endDate >= :startDate ORDER BY e.startDate")
      List<CalendarEvent> findEventsInRange(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

      Optional<CalendarEvent> findByIdAndUserId(Long id, Long userId);

      @Modifying
      @Query("DELETE FROM CalendarEvent e WHERE e.user.id = :userId")
      void deleteAllByUserId(@Param("userId") Long userId);
}
