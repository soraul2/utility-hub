package com.wootae.backend.domain.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

public class ShopDTOs {

      @Getter
      @Builder
      @AllArgsConstructor
      @NoArgsConstructor
      public static class PointBalanceResponse {
            private Long totalEarned;
            private Long totalSpent;
            private Long available;
      }

      @Getter
      @Builder
      @AllArgsConstructor
      @NoArgsConstructor
      public static class ThemeItemResponse {
            private String key;
            private String name;
            private String description;
            private Long price;
            private String category;
            private String previewColor;
            private boolean owned;
            private boolean active;
      }

      @Getter
      @Builder
      @AllArgsConstructor
      @NoArgsConstructor
      public static class ShopDataResponse {
            private PointBalanceResponse points;
            private List<ThemeItemResponse> themes;
      }

      @Getter
      @NoArgsConstructor
      public static class PurchaseRequest {
            private String themeKey;
      }

      @Getter
      @NoArgsConstructor
      public static class SetActiveThemeRequest {
            private String themeKey;
      }

      @Getter
      @Builder
      @AllArgsConstructor
      @NoArgsConstructor
      public static class PurchaseResponse {
            private String themeKey;
            private Long pointsSpent;
            private Long remainingPoints;
      }
}
