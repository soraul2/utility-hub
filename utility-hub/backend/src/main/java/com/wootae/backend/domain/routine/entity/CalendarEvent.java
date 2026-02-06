package com.wootae.backend.domain.routine.entity;

import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "calendar_events")
@EntityListeners(AuditingEntityListener.class)
public class CalendarEvent {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "user_id", nullable = false)
      private User user;

      @Column(nullable = false, length = 100)
      private String title;

      @Column(length = 500)
      private String description;

      @Column(nullable = false)
      private LocalDate startDate;

      @Column(nullable = false)
      private LocalDate endDate;

      @Column(nullable = false, length = 20)
      @Builder.Default
      private String color = "#6366f1";

      @Enumerated(EnumType.STRING)
      @Column(nullable = false)
      @Builder.Default
      private EventType type = EventType.MEMO;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public enum EventType {
            MEMO, PLAN, HOLIDAY
      }

      public void update(String title, String description, LocalDate startDate, LocalDate endDate, String color, EventType type) {
            this.title = title;
            this.description = description;
            this.startDate = startDate;
            this.endDate = endDate;
            this.color = color;
            this.type = type;
      }
}
