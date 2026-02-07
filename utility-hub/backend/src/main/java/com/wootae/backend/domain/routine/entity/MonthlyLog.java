package com.wootae.backend.domain.routine.entity;

import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "monthly_logs", uniqueConstraints = {
            @UniqueConstraint(columnNames = { "user_id", "year", "month" })
})
@EntityListeners(AuditingEntityListener.class)
public class MonthlyLog {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "user_id", nullable = false)
      private User user;

      @Column(nullable = false)
      private Integer year;

      @Column(nullable = false)
      private Integer month;

      @Column(length = 500)
      private String monthlyGoal;

      @Column(nullable = false)
      @Builder.Default
      private Long totalXp = 0L;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public void updateMonthlyGoal(String monthlyGoal) {
            this.monthlyGoal = monthlyGoal;
      }

      public void addXp(Long xp) {
            this.totalXp += xp;
      }

      public void setTotalXp(Long totalXp) {
            this.totalXp = totalXp;
      }
}
