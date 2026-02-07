package com.wootae.backend.domain.shop.repository;

import com.wootae.backend.domain.shop.entity.ThemePurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThemePurchaseRepository extends JpaRepository<ThemePurchase, Long> {

      List<ThemePurchase> findByUserId(Long userId);

      boolean existsByUserIdAndThemeKey(Long userId, String themeKey);

      @Modifying
      @Query("DELETE FROM ThemePurchase t WHERE t.user.id = :userId")
      void deleteAllByUserId(@Param("userId") Long userId);
}
