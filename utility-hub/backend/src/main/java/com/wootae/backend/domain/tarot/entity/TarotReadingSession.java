package com.wootae.backend.domain.tarot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "tarot_reading_sessions", indexes = {
            @Index(name = "idx_tarot_session_member_id", columnList = "memberId"),
            @Index(name = "idx_tarot_session_share_uuid", columnList = "shareUuid")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class TarotReadingSession {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @Column(nullable = false, length = 500)
      private String question;

      // 스프레드 타입
      @Enumerated(EnumType.STRING)
      private TarotSpread spreadType;

      // 사용자 프로필 (선택 사항)
      private String userName;
      private Integer userAge;
      private String userGender;

      @Column(columnDefinition = "TEXT")
      private String drawnCardsJson; // JSON 형식으로 저장

      @Column(columnDefinition = "TEXT")
      private String aiReading;

      @CreatedDate
      private LocalDateTime createdAt;

      @Column
      private Long memberId;

      @Column(unique = true)
      private String shareUuid;

      @Builder
      public TarotReadingSession(String question, TarotSpread spreadType,
                  String userName, Integer userAge, String userGender,
                  String drawnCardsJson, String aiReading, Long memberId) {
            this.question = question;
            this.spreadType = spreadType;
            this.userName = userName;
            this.userAge = userAge;
            this.userGender = userGender;
            this.drawnCardsJson = drawnCardsJson;
            this.aiReading = aiReading;
            this.memberId = memberId;
            this.shareUuid = java.util.UUID.randomUUID().toString();
      }

      public void assignMember(Long memberId) {
            this.memberId = memberId;
      }
}
