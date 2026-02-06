package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import com.wootae.backend.domain.routine.entity.Reflection;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReflectionDto {
      private Long id;
      private Long dailyPlanId;
      private LocalDate planDate;
      private int rating;
      private String mood;
      private String whatWentWell;
      private String whatDidntGoWell;
      private String tomorrowFocus;
      private Integer energyLevel;
      private String morningGoal;
      private int totalTasks;
      private int completedTasks;
      private LocalDateTime createdAt;

      public ReflectionDto() {
      }

      public ReflectionDto(Long id, Long dailyPlanId, LocalDate planDate, int rating, String mood,
                  String whatWentWell, String whatDidntGoWell, String tomorrowFocus,
                  Integer energyLevel, String morningGoal,
                  int totalTasks, int completedTasks, LocalDateTime createdAt) {
            this.id = id;
            this.dailyPlanId = dailyPlanId;
            this.planDate = planDate;
            this.rating = rating;
            this.mood = mood;
            this.whatWentWell = whatWentWell;
            this.whatDidntGoWell = whatDidntGoWell;
            this.tomorrowFocus = tomorrowFocus;
            this.energyLevel = energyLevel;
            this.morningGoal = morningGoal;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.createdAt = createdAt;
      }

      public static ReflectionDto from(Reflection reflection) {
            if (reflection == null)
                  return null;

            DailyPlan plan = reflection.getDailyPlan();
            LocalDate planDate = null;
            int totalTasks = 0;
            int completedTasks = 0;

            if (plan != null) {
                  planDate = plan.getPlanDate();
                  if (plan.getKeyTasks() != null) {
                        totalTasks = plan.getKeyTasks().size();
                        completedTasks = (int) plan.getKeyTasks().stream()
                                    .filter(t -> t.isCompleted())
                                    .count();
                  }
            }

            return new ReflectionDto(
                        reflection.getId(),
                        plan != null ? plan.getId() : null,
                        planDate,
                        reflection.getRating(),
                        reflection.getMood(),
                        reflection.getWhatWentWell(),
                        reflection.getWhatDidntGoWell(),
                        reflection.getTomorrowFocus(),
                        reflection.getEnergyLevel(),
                        reflection.getMorningGoal(),
                        totalTasks,
                        completedTasks,
                        reflection.getCreatedAt());
      }

      // Getters and Setters
      public Long getId() {
            return id;
      }

      public void setId(Long id) {
            this.id = id;
      }

      public Long getDailyPlanId() {
            return dailyPlanId;
      }

      public void setDailyPlanId(Long dailyPlanId) {
            this.dailyPlanId = dailyPlanId;
      }

      public LocalDate getPlanDate() {
            return planDate;
      }

      public void setPlanDate(LocalDate planDate) {
            this.planDate = planDate;
      }

      public int getRating() {
            return rating;
      }

      public void setRating(int rating) {
            this.rating = rating;
      }

      public String getMood() {
            return mood;
      }

      public void setMood(String mood) {
            this.mood = mood;
      }

      public String getWhatWentWell() {
            return whatWentWell;
      }

      public void setWhatWentWell(String whatWentWell) {
            this.whatWentWell = whatWentWell;
      }

      public String getWhatDidntGoWell() {
            return whatDidntGoWell;
      }

      public void setWhatDidntGoWell(String whatDidntGoWell) {
            this.whatDidntGoWell = whatDidntGoWell;
      }

      public String getTomorrowFocus() {
            return tomorrowFocus;
      }

      public void setTomorrowFocus(String tomorrowFocus) {
            this.tomorrowFocus = tomorrowFocus;
      }

      public Integer getEnergyLevel() {
            return energyLevel;
      }

      public void setEnergyLevel(Integer energyLevel) {
            this.energyLevel = energyLevel;
      }

      public String getMorningGoal() {
            return morningGoal;
      }

      public void setMorningGoal(String morningGoal) {
            this.morningGoal = morningGoal;
      }

      public int getTotalTasks() {
            return totalTasks;
      }

      public void setTotalTasks(int totalTasks) {
            this.totalTasks = totalTasks;
      }

      public int getCompletedTasks() {
            return completedTasks;
      }

      public void setCompletedTasks(int completedTasks) {
            this.completedTasks = completedTasks;
      }

      public LocalDateTime getCreatedAt() {
            return createdAt;
      }

      public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
      }
}
