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
 * 사용자 엔티티
 * 
 * [개선] 클래스 주석 추가로 목적 명확화
 * OAuth2 소셜 로그인을 통해 생성된 사용자 정보를 저장하는 엔티티
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "users", uniqueConstraints = {
            @UniqueConstraint(name = "uk_user_provider_provider_id", columnNames = { "provider", "providerId" })
})
@EntityListeners(AuditingEntityListener.class)
public class User {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = true)
      private String email;

      @Column(nullable = false)
      private String nickname;

      @Enumerated(EnumType.STRING)
      @Column(nullable = false)
      private AuthProvider provider;

      @Column(nullable = false)
      private String providerId;

      @Enumerated(EnumType.STRING)
      @Column(nullable = false)
      private UserRole role;

      @Column(nullable = false)
      private Long spentPoints = 0L;

      @Column(length = 50)
      private String activeThemeKey;

      @Column(nullable = false)
      private boolean onboardingCompleted = false;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      @Builder
      public User(String email, String nickname, AuthProvider provider, String providerId, UserRole role) {
            this.email = email;
            this.nickname = nickname;
            this.provider = provider;
            this.providerId = providerId;
            this.role = role;
            this.spentPoints = 0L;
      }

      /**
       * 사용자 정보 업데이트
       * 닉네임과 이메일만 업데이트 가능
       * 
       * @param nickname 새로운 닉네임
       * @param email 새로운 이메일
       */
      public void update(String nickname, String email) {
            if (nickname != null && !nickname.isBlank()) {
                  this.nickname = nickname;
            }
            if (email != null && !email.isBlank()) {
                  this.email = email;
            }
      }

      /**
       * 사용자 권한을 문자열로 반환
       * @return 권한 이름 (ROLE_USER, ROLE_ADMIN 등)
       */
      public String getRoleKey() {
            return this.role.name();
      }

      public void spendPoints(Long amount) {
            this.spentPoints += amount;
      }

      public void setActiveThemeKey(String themeKey) {
            this.activeThemeKey = themeKey;
      }

      public void completeOnboarding() {
            this.onboardingCompleted = true;
      }
}
