package com.wootae.backend.domain.routine.entity;

import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "routine_daily_plans")
@EntityListeners(AuditingEntityListener.class)
public class DailyPlan {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "user_id", nullable = false)
      private User user;

      @Column(nullable = false)
      private LocalDate planDate;

      @Enumerated(EnumType.STRING)
      @Column(nullable = false)
      @Builder.Default
      private PlanStatus status = PlanStatus.PLANNING;

      @Column(nullable = false)
      @Builder.Default
      private boolean isRest = false;

      @OneToMany(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
      @Builder.Default
      private List<Task> keyTasks = new ArrayList<>();

      @OneToMany(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
      @Builder.Default
      private List<TimeBlock> timeBlocks = new ArrayList<>();

      @OneToOne(mappedBy = "dailyPlan", cascade = CascadeType.ALL, orphanRemoval = true)
      private Reflection reflection;

      @Column(length = 500)
      private String monthlyMemo;

      @Column(length = 100)
      private String appliedTemplateName;

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public void setTimeBlocks(List<TimeBlock> timeBlocks) {
            this.timeBlocks = timeBlocks;
      }

      public void addTask(Task task) {
            this.keyTasks.add(task);
      }

      // Manual Getters/Setters for critical fields
      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public PlanStatus getStatus() {
            return status;
      }

      public void setStatus(PlanStatus status) {
            this.status = status;
      }

      public LocalDate getPlanDate() {
            return planDate;
      }

      public void setPlanDate(LocalDate planDate) {
            this.planDate = planDate;
      }

      public List<Task> getKeyTasks() {
            return keyTasks;
      }

      public void setKeyTasks(List<Task> keyTasks) {
            this.keyTasks = keyTasks;
      }

      public List<TimeBlock> getTimeBlocks() {
            return timeBlocks;
      }

      public void updateMonthlyMemo(String monthlyMemo) {
            this.monthlyMemo = monthlyMemo;
      }

      public boolean isRest() {
            return isRest;
      }

      public void setRest(boolean rest) {
            isRest = rest;
      }
}
