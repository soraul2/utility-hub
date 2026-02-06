package com.wootae.backend.domain.lotto.repository;

import com.wootae.backend.domain.lotto.entity.LottoRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LottoRuleRepository extends JpaRepository<LottoRule, Long> {
      List<LottoRule> findByType(String type);
}
