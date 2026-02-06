package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.LottoDraw;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface LottoDrawRepository extends JpaRepository<LottoDraw, Integer> {

      // 가장 최근 회차 조회
      @Query("SELECT l FROM LottoDraw l ORDER BY l.drwNo DESC LIMIT 1")
      Optional<LottoDraw> findLatestDraw();

      Optional<LottoDraw> findByDrwNoDate(LocalDate date);
}
