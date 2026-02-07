package com.wootae.backend.domain.shop.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

public class ThemeCatalog {

      @Getter
      @AllArgsConstructor
      public static class ThemeDefinition {
            private final String key;
            private final String name;
            private final String description;
            private final Long price;
            private final String category; // COLOR, PATTERN, PREMIUM
            private final String previewColor;
      }

      private static final Map<String, ThemeDefinition> THEMES = new LinkedHashMap<>();

      static {
            // Free defaults
            THEMES.put("default", new ThemeDefinition("default", "Default", "기본 테마", 0L, "COLOR", "#f8f9fa"));
            THEMES.put("dark", new ThemeDefinition("dark", "Dark", "다크 모드", 0L, "COLOR", "#050816"));

            // Color Themes
            THEMES.put("ocean", new ThemeDefinition("ocean", "Ocean Blue", "깊은 바다의 고요함", 100L, "COLOR", "#0c4a6e"));
            THEMES.put("forest", new ThemeDefinition("forest", "Forest Green", "숲속의 평화로움", 100L, "COLOR", "#14532d"));
            THEMES.put("sunset", new ThemeDefinition("sunset", "Sunset Glow", "석양의 따뜻함", 150L, "COLOR", "#9a3412"));
            THEMES.put("lavender", new ThemeDefinition("lavender", "Lavender Dream", "라벤더 꿈결", 150L, "COLOR", "#581c87"));
            THEMES.put("rose_gold", new ThemeDefinition("rose_gold", "Rose Gold", "로즈골드 프리미엄", 200L, "COLOR", "#be185d"));

            // Background Pattern Themes
            THEMES.put("stars", new ThemeDefinition("stars", "Starfield", "별빛 하늘 패턴", 200L, "PATTERN", "#1e1b4b"));
            THEMES.put("geometric", new ThemeDefinition("geometric", "Geometric", "기하학 패턴", 200L, "PATTERN", "#1e293b"));
            THEMES.put("sakura", new ThemeDefinition("sakura", "Sakura", "벚꽃 패턴", 250L, "PATTERN", "#fce7f3"));

            // Premium Themes (Color + Pattern)
            THEMES.put("aurora", new ThemeDefinition("aurora", "Aurora Borealis", "오로라 프리미엄", 500L, "PREMIUM", "#064e3b"));
            THEMES.put("nebula", new ThemeDefinition("nebula", "Cosmic Nebula", "우주 성운 프리미엄", 500L, "PREMIUM", "#2e1065"));
      }

      public static ThemeDefinition get(String key) {
            return THEMES.get(key);
      }

      public static Collection<ThemeDefinition> getAll() {
            return THEMES.values();
      }

      public static boolean exists(String key) {
            return THEMES.containsKey(key);
      }

      public static boolean isFree(String key) {
            ThemeDefinition def = THEMES.get(key);
            return def != null && def.getPrice() == 0L;
      }
}
