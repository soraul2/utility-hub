package com.wootae.backend.domain.tarot.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum TarotAssistantType {
      SYLVIA("Sylvia", "실비아", "현실적 분석가", "냉철하고 직설적인 현실 조언"),
      LUNA("Luna", "루나", "감성적 치유자", "따뜻한 위로와 공감"),
      ORION("Orion", "오리온", "쾌활한 예언가", "긍정적인 에너지와 유머"),
      NOCTIS("Noctis", "녹티스", "그림자 독설가", "무의식과 본능을 꿰뚫는 통찰"),
      VANCE("Vance", "반스", "야망의 전략가", "성공과 효율을 위한 전략"),
      ELARA("Elara", "엘라라", "몽환적 시인", "아름다운 이야기와 은유"),
      KLAUS("Klaus", "클라우스", "엄격한 규율자", "원칙과 인과응보의 경고"),
      FORTUNA("Fortuna", "마스터 포르투나", "행운의 여신", "무조건적인 행운과 기적의 예언");

      private final String englishName;
      private final String koreanName;
      private final String title;
      private final String description;
}
