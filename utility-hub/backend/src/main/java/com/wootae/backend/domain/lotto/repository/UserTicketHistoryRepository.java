package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.UserTicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserTicketHistoryRepository extends JpaRepository<UserTicketHistory, Long> {

      List<UserTicketHistory> findByUserIdOrderByCreatedAtDesc(Long userId);

      @Query("SELECT COUNT(h) FROM UserTicketHistory h WHERE h.user.id = :userId")
      Long countByUserId(@Param("userId") Long userId);

      @Query("SELECT COUNT(h) FROM UserTicketHistory h WHERE h.user.id = :userId AND h.rankResult IS NOT NULL AND h.rankResult > 0")
      Long countWinsByUserId(@Param("userId") Long userId);

      @Query("SELECT MIN(h.rankResult) FROM UserTicketHistory h WHERE h.user.id = :userId AND h.rankResult IS NOT NULL AND h.rankResult > 0")
      Integer findBestRankByUserId(@Param("userId") Long userId);

      @Query("SELECT COALESCE(SUM(h.prize), 0) FROM UserTicketHistory h WHERE h.user.id = :userId AND h.prize IS NOT NULL")
      Long sumPrizeByUserId(@Param("userId") Long userId);
}
