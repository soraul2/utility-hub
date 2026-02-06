package com.wootae.backend.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 리프레시 토큰 엔티티
 * 보안 강화를 위해 DB에 저장하여 관리
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "refresh_tokens")
@EntityListeners(AuditingEntityListener.class)
public class RefreshToken {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = false)
      private Long userId;

      @Column(nullable = false, length = 512)
      private String token;

      @Column(nullable = false)
      private LocalDateTime expiryDate;

      @CreatedDate
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      @Builder
      public RefreshToken(Long userId, String token, LocalDateTime expiryDate) {
            this.userId = userId;
            this.token = token;
            this.expiryDate = expiryDate;
      }

      public void updateToken(String token, LocalDateTime expiryDate) {
            this.token = token;
            this.expiryDate = expiryDate;
      }
}
