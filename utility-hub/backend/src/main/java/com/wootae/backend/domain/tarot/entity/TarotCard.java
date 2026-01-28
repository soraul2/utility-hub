package com.wootae.backend.domain.tarot.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarotCard {
      private String id; // 예: "major_0", "wands_3"
      private String nameKo;
      private String nameEn;
      private String arcana; // "MAJOR" (메이저), "MINOR" (마이너)
      private String suit; // "WANDS", "CUPS", "SWORDS", "PENTACLES", 메이저의 경우 null
      private int number; // 메이저는 0-21, 마이너는 1-14
      private String imagePath; // 예: "/tarot/major_0.jpg"
      private String keywords;
      private String uprightMeaning;
      private String reversedMeaning;
}
