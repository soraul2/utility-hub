package com.wootae.backend.domain.lotto.entity;

import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Table(name = "user_ticket_history")
public class UserTicketHistory {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "user_id", nullable = false)
      private User user;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "rule_id")
      private LottoRule rule;

      private Integer drawId;

      @Column(nullable = false)
      private String ticket; // JSON array e.g. "[1,2,3,4,5,6]"

      private Integer rankResult; // null if not yet checked, 0 if no win, 1-5 for prizes

      private Long prize;

      private LocalDate drawDate;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @Builder
      public UserTicketHistory(User user, LottoRule rule, Integer drawId,
                  String ticket, Integer rankResult, Long prize, LocalDate drawDate) {
            this.user = user;
            this.rule = rule;
            this.drawId = drawId;
            this.ticket = ticket;
            this.rankResult = rankResult;
            this.prize = prize;
            this.drawDate = drawDate;
      }

      public void updateResult(Integer rankResult, Long prize) {
            this.rankResult = rankResult;
            this.prize = prize;
      }
}
