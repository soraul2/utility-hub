package com.wootae.backend.domain.calendar.entity;

import com.wootae.backend.domain.calendar.converter.EncryptConverter;
import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "google_calendar_tokens")
@EntityListeners(AuditingEntityListener.class)
public class GoogleCalendarToken {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @OneToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "user_id", nullable = false, unique = true)
      private User user;

      @Column(length = 2048, nullable = false)
      @Convert(converter = EncryptConverter.class)
      private String accessToken;

      @Column(length = 2048, nullable = false)
      @Convert(converter = EncryptConverter.class)
      private String refreshToken;

      @Column(nullable = false)
      private LocalDateTime expiresAt;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      @Builder
      public GoogleCalendarToken(User user, String accessToken, String refreshToken, LocalDateTime expiresAt) {
            this.user = user;
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresAt = expiresAt;
      }

      public void updateTokens(String accessToken, String refreshToken, LocalDateTime expiresAt) {
            this.accessToken = accessToken;
            if (refreshToken != null) {
                  this.refreshToken = refreshToken;
            }
            this.expiresAt = expiresAt;
      }

      public boolean isExpired() {
            return LocalDateTime.now().isAfter(this.expiresAt);
      }
}
