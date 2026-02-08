package com.wootae.backend.domain.lotto.scheduler;

import com.wootae.backend.domain.lotto.entity.LottoDraw;
import com.wootae.backend.domain.lotto.entity.WeeklyStrategyRanking;
import com.wootae.backend.domain.lotto.repository.LottoDrawRepository;
import com.wootae.backend.domain.lotto.service.SimulationService;
import com.wootae.backend.domain.lotto.service.WeeklyRankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * 로또 추첨 후 자동 시뮬레이션 + 랭킹 갱신 스케줄러
 *
 * 동작 흐름:
 * 1. 매주 토요일 21:30 KST (추첨 완료 후) 실행
 * 2. 최신 추첨 데이터 확인
 * 3. 해당 회차 주간 시뮬레이션 실행 (모든 전략 × 10만장)
 * 4. 주간 랭킹 계산 및 저장
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LottoDrawScheduler {

      private final LottoDrawRepository lottoDrawRepository;
      private final SimulationService simulationService;
      private final WeeklyRankingService weeklyRankingService;

      @Value("${lotto.simulation.tickets-per-draw:100000}")
      private int ticketsPerDraw;

      @Value("${lotto.scheduler.enabled:true}")
      private boolean schedulerEnabled;

      /**
       * 매주 토요일 21:30 KST 실행
       * 로또 추첨(20:45) 후 45분 여유를 두고 실행
       */
      @Scheduled(cron = "0 30 21 ? * SAT", zone = "Asia/Seoul")
      public void weeklySimulationAndRanking() {
            if (!schedulerEnabled) {
                  log.info("스케줄러가 비활성화되어 있습니다.");
                  return;
            }

            log.info("=== 주간 자동 시뮬레이션 & 랭킹 갱신 시작 ===");

            try {
                  // 1. 최신 추첨 회차 확인
                  Optional<LottoDraw> latestDrawOpt = lottoDrawRepository.findLatestDraw();
                  if (latestDrawOpt.isEmpty()) {
                        log.warn("추첨 데이터가 없습니다. 스킵합니다.");
                        return;
                  }

                  int latestDrawNo = latestDrawOpt.get().getDrwNo();
                  log.info("최신 추첨 회차: {}회", latestDrawNo);

                  // 2. 주간 시뮬레이션 실행
                  runWeeklySimulation(latestDrawNo);

                  // 3. 주간 랭킹 계산
                  calculateWeeklyRanking(latestDrawNo);

                  log.info("=== 주간 자동 시뮬레이션 & 랭킹 갱신 완료: {}회차 ===", latestDrawNo);

            } catch (Exception e) {
                  log.error("주간 자동 처리 실패", e);
            }
      }

      /**
       * 주간 시뮬레이션 실행
       */
      private void runWeeklySimulation(int drawNo) {
            log.info("주간 시뮬레이션 실행: {}회차, {}티켓", drawNo, ticketsPerDraw);
            long startTime = System.currentTimeMillis();

            simulationService.runWeeklySimulation(drawNo, ticketsPerDraw);

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("주간 시뮬레이션 소요 시간: {}ms", elapsed);
      }

      /**
       * 주간 랭킹 계산 및 저장
       */
      private void calculateWeeklyRanking(int drawNo) {
            log.info("주간 랭킹 계산 시작: {}회차", drawNo);

            List<WeeklyStrategyRanking> rankings = weeklyRankingService.calculateAndSaveRankings(drawNo);

            if (!rankings.isEmpty()) {
                  log.info("주간 랭킹 결과 (Top 3):");
                  rankings.stream().limit(3).forEach(r ->
                              log.info("  {}위: {} (점수: {}, 변동: {})",
                                          r.getRankPosition(), r.getStrategyType(),
                                          String.format("%.1f", r.getWeightedScore()),
                                          r.getRankChange() > 0 ? "+" + r.getRankChange() :
                                                      r.getRankChange() == 0 ? "-" : r.getRankChange()));
            }
      }

      /**
       * 수동 실행 메서드 (컨트롤러에서 호출 가능)
       */
      public void manualRun(int drawNo) {
            log.info("수동 실행: {}회차", drawNo);
            runWeeklySimulation(drawNo);
            calculateWeeklyRanking(drawNo);
      }

      /**
       * 과거 회차 일괄 랭킹 계산 (초기 데이터 구축용)
       * 시뮬레이션 결과가 이미 있는 회차에 대해 랭킹만 계산
       */
      public void backfillRankings(int fromDrawNo, int toDrawNo) {
            log.info("랭킹 백필 시작: {}회차 ~ {}회차", fromDrawNo, toDrawNo);

            int count = 0;
            for (int drawNo = fromDrawNo; drawNo <= toDrawNo; drawNo++) {
                  List<WeeklyStrategyRanking> rankings = weeklyRankingService.calculateAndSaveRankings(drawNo);
                  if (!rankings.isEmpty()) count++;
            }

            log.info("랭킹 백필 완료: {}개 회차 처리", count);
      }
}
