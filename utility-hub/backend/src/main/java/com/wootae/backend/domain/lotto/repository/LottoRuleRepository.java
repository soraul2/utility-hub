package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.LottoRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LottoRuleRepository extends JpaRepository<LottoRule, Long> {

      List<LottoRule> findByType(String type);

      @Query("SELECT r FROM LottoRule r ORDER BY r.rank ASC, r.popularity DESC LIMIT 5")
      List<LottoRule> findTop5Rules();

      List<LottoRule> findAllByOrderByPopularityDesc();

      List<LottoRule> findAllByOrderByRankAsc();
}
