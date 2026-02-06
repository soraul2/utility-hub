package com.wootae.backend.domain.routine.entity;

import com.wootae.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "routine_templates")
@EntityListeners(AuditingEntityListener.class)
public class RoutineTemplate {

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      private Long id;

      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "user_id", nullable = false)
      private User user;

      @Column(nullable = false, length = 100)
      private String name;

      @Column(length = 255)
      private String description;

      @Enumerated(EnumType.STRING)
      @Column(nullable = false)
      @Builder.Default
      private TemplateType type = TemplateType.NORMAL;

      @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
      @Builder.Default
      private List<RoutineTemplateTask> tasks = new ArrayList<>();

      @CreatedDate
      @Column(updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      private LocalDateTime updatedAt;

      public void updateName(String name) {
            this.name = name;
      }

      public void updateDescription(String description) {
            this.description = description;
      }

      public void setTasks(List<RoutineTemplateTask> tasks) {
            this.tasks.clear();
            this.tasks.addAll(tasks);
      }

      public void updateType(TemplateType type) {
            this.type = type;
      }
}
