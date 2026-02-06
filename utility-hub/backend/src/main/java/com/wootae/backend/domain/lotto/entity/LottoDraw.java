package com.wootae.backend.domain.lotto.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "lotto_draws")
public class LottoDraw {

      @Id
      private Integer drwNo; // 회차 번호 (PK)

      private LocalDate drwNoDate; // 추첨일

      private int drwtNo1;
      private int drwtNo2;
      private int drwtNo3;
      private int drwtNo4;
      private int drwtNo5;
      private int drwtNo6;
      private int bnusNo;

      private Long firstWinamnt; // 1등 당첨금
      private Long firstPrzwnerCo; // 1등 당첨자 수

      public LottoDraw(Integer drwNo, LocalDate drwNoDate, int drwtNo1, int drwtNo2, int drwtNo3, int drwtNo4,
                  int drwtNo5, int drwtNo6, int bnusNo, Long firstWinamnt, Long firstPrzwnerCo) {
            this.drwNo = drwNo;
            this.drwNoDate = drwNoDate;
            this.drwtNo1 = drwtNo1;
            this.drwtNo2 = drwtNo2;
            this.drwtNo3 = drwtNo3;
            this.drwtNo4 = drwtNo4;
            this.drwtNo5 = drwtNo5;
            this.drwtNo6 = drwtNo6;
            this.bnusNo = bnusNo;
            this.firstWinamnt = firstWinamnt;
            this.firstPrzwnerCo = firstPrzwnerCo;
      }
}
