package com.wootae.backend.domain.routine.dto;

import com.wootae.backend.domain.routine.entity.Reflection;

import java.time.LocalDateTime;

public class ReflectionDto {
      private Long id;
      private Long dailyPlanId;
      private int rating;
      private String mood;
      private String whatWentWell;
      private String whatDidntGoWell;
      private String tomorrowFocus;
      private Integer energyLevel;
      private String morningGoal;
      private LocalDateTime createdAt;

      public ReflectionDto() {
      }

      public ReflectionDto(Long id, Long dailyPlanId, int rating, String mood, String whatWentWell,
                  String whatDidntGoWell, String tomorrowFocus, Integer energyLevel, String morningGoal,
                  LocalDateTime createdAt) {
            this.id = id;
            this.dailyPlanId = dailyPlanId;
            this.rating = rating;
            this.mood = mood;
            this.whatWentWell = whatWentWell;
            this.whatDidntGoWell = whatDidntGoWell;
            this.tomorrowFocus = tomorrowFocus;
            this.energyLevel = energyLevel;
            this.morningGoal = morningGoal;
            this.createdAt = createdAt;
      }

      public static ReflectionDto from(Reflection reflection) {
            if (reflection == null)
                  return null;
            return new ReflectionDto(
                        reflection.getId(),
                        reflection.getDailyPlan() != null ? reflection.getDailyPlan().getId() : null,
                        reflection.getRating(),
                        reflection.getMood(),
                        reflection.getWhatWentWell(),
                        reflection.getWhatDidntGoWell(),
                        reflection.getTomorrowFocus(),
                        reflection.getEnergyLevel(),
                        reflection.getMorningGoal(),
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

      public LocalDateTime getCreatedAt() {
            return createdAt;
      }

      public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
      }

      public static ReflectionDtoBuilder builder() {
            return new ReflectionDtoBuilder();
      }

      public static class ReflectionDtoBuilder {
            private Long id;
            private Long dailyPlanId;
            private int rating;
            private String mood;
            private String whatWentWell;
            private String whatDidntGoWell;
            private String tomorrowFocus;
            private Integer energyLevel;
            private String morningGoal;
            private LocalDateTime createdAt;

            public ReflectionDtoBuilder id(Long id) {
                  this.id = id;
                  return this;
            }

            public ReflectionDtoBuilder dailyPlanId(Long dailyPlanId) {
                  this.dailyPlanId = dailyPlanId;
                  return this;
            }

            public ReflectionDtoBuilder rating(int rating) {
                  this.rating = rating;
                  return this;
            }

            public ReflectionDtoBuilder mood(String mood) {
                  this.mood = mood;
                  return this;
            }

            public ReflectionDtoBuilder whatWentWell(String whatWentWell) {
                  this.whatWentWell = whatWentWell;
                  return this;
            }

            public ReflectionDtoBuilder whatDidntGoWell(String whatDidntGoWell) {
                  this.whatDidntGoWell = whatDidntGoWell;
                  return this;
            }

            public ReflectionDtoBuilder tomorrowFocus(String tomorrowFocus) {
                  this.tomorrowFocus = tomorrowFocus;
                  return this;
            }

            public ReflectionDtoBuilder energyLevel(Integer energyLevel) {
                  this.energyLevel = energyLevel;
                  return this;
            }

            public ReflectionDtoBuilder morningGoal(String morningGoal) {
                  this.morningGoal = morningGoal;
                  return this;
            }

            public ReflectionDtoBuilder createdAt(LocalDateTime createdAt) {
                  this.createdAt = createdAt;
                  return this;
            }

            public ReflectionDto build() {
                  return new ReflectionDto(id, dailyPlanId, rating, mood, whatWentWell, whatDidntGoWell, tomorrowFocus,
                              energyLevel, morningGoal, createdAt);
            }
      }
}
