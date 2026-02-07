package com.wootae.backend.domain.shop.entity;

import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "theme_purchases", uniqueConstraints = {
            @UniqueConstraint(name = "uk_user_theme", columnNames = {"user_id", "theme_key"})
})
@EntityListeners(AuditingEntityListener.class)
public class ThemePurchase {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "user_id", nullable = false)
      private User user;

      @Column(name = "theme_key", nullable = false, length = 50)
      private String themeKey;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime purchasedAt;

      @Builder
      public ThemePurchase(User user, String themeKey) {
            this.user = user;
            this.themeKey = themeKey;
      }
}
