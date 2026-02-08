package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.entity.LottoDraw;
import com.wootae.backend.domain.lotto.entity.SimulationJob;
import com.wootae.backend.domain.lotto.entity.SimulationResult;
import com.wootae.backend.domain.lotto.repository.LottoDrawRepository;
import com.wootae.backend.domain.lotto.repository.SimulationJobRepository;
import com.wootae.backend.domain.lotto.repository.SimulationResultRepository;
import com.wootae.backend.domain.lotto.strategy.LottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SimulationService {

      private final LottoDrawRepository lottoDrawRepository;
      private final SimulationResultRepository simulationResultRepository;
      private final SimulationJobRepository simulationJobRepository;
      private final LottoGenerateService lottoGenerateService;
      private final LottoMatchService lottoMatchService;

      private final AtomicBoolean running = new AtomicBoolean(false);
      private final AtomicInteger completedTasks = new AtomicInteger(0);
      private volatile SimulationJob currentJob;

      @Async
      public void startSimulation(int ticketsPerDraw) {
            if (!running.compareAndSet(false, true)) {
                  log.warn("시뮬레이션이 이미 실행 중입니다.");
                  return;
            }

            try {
                  List<LottoDraw> allDraws = lottoDrawRepository.findAllByOrderByDrwNoDesc();
                  if (allDraws.isEmpty()) {
                        log.warn("추첨 데이터가 없어 시뮬레이션을 실행할 수 없습니다.");
                        return;
                  }

                  Map<String, LottoStrategy> strategies = lottoGenerateService.getStrategyMap();
                  List<String> strategyTypes = strategies.keySet().stream().sorted().collect(Collectors.toList());

                  // 이미 완료된 (전략, 회차) 건너뛰기 위한 체크
                  int totalTasks = strategyTypes.size() * allDraws.size();
                  int skipped = 0;

                  SimulationJob job = SimulationJob.create(totalTasks);
                  currentJob = simulationJobRepository.save(job);
                  completedTasks.set(0);

                  log.info("시뮬레이션 시작: {}개 전략 × {}회차 × {}티켓 = {}건",
                              strategyTypes.size(), allDraws.size(), ticketsPerDraw, totalTasks);

                  ExecutorService executor = Executors.newFixedThreadPool(
                              Math.min(Runtime.getRuntime().availableProcessors(), 8));

                  for (String strategyType : strategyTypes) {
                        if (!running.get()) break;

                        LottoStrategy strategy = strategies.get(strategyType);
                        List<Future<?>> futures = new java.util.ArrayList<>();

                        for (LottoDraw targetDraw : allDraws) {
                              if (!running.get()) break;

                              // 이미 처리된 건 건너뛰기
                              if (simulationResultRepository.existsByStrategyTypeAndDrawNo(
                                          strategyType, targetDraw.getDrwNo())) {
                                    skipped++;
                                    completedTasks.incrementAndGet();
                                    continue;
                              }

                              final LottoDraw draw = targetDraw;
                              futures.add(executor.submit(() ->
                                          runSingleSimulation(strategy, draw, allDraws, ticketsPerDraw)));
                        }

                        // 전략별 완료 대기
                        for (Future<?> future : futures) {
                              try {
                                    future.get();
                              } catch (Exception e) {
                                    log.error("시뮬레이션 작업 실패: {} - {}", strategyType, e.getMessage());
                              }
                        }

                        updateJobProgress(strategyType);
                  }

                  executor.shutdown();
                  completeJob(skipped);

            } catch (Exception e) {
                  log.error("시뮬레이션 실패", e);
                  failJob(e.getMessage());
            } finally {
                  running.set(false);
            }
      }

      private void runSingleSimulation(LottoStrategy strategy, LottoDraw targetDraw,
                  List<LottoDraw> allDrawsSorted, int ticketsPerDraw) {
            LottoStrategyContext context = lottoGenerateService.buildContextForDraw(
                        targetDraw.getDrwNo(), allDrawsSorted);

            int[] rankCounts = new int[6]; // index 0=미당첨, 1~5=등수
            long totalPrize = 0;

            for (int i = 0; i < ticketsPerDraw; i++) {
                  List<Integer> ticket = strategy.generate(context);
                  int rank = lottoMatchService.matchRank(ticket, targetDraw);
                  if (rank >= 1 && rank <= 5) {
                        rankCounts[rank]++;
                        totalPrize += lottoMatchService.estimatePrize(rank, targetDraw);
                  } else {
                        rankCounts[0]++;
                  }
            }

            SimulationResult result = SimulationResult.builder()
                        .strategyType(strategy.getType())
                        .drawNo(targetDraw.getDrwNo())
                        .totalTickets(ticketsPerDraw)
                        .rank1Count(rankCounts[1])
                        .rank2Count(rankCounts[2])
                        .rank3Count(rankCounts[3])
                        .rank4Count(rankCounts[4])
                        .rank5Count(rankCounts[5])
                        .noWinCount(rankCounts[0])
                        .estimatedPrize(totalPrize)
                        .build();

            saveResult(result);
            completedTasks.incrementAndGet();
      }

      @Transactional
      public void saveResult(SimulationResult result) {
            simulationResultRepository.save(result);
      }

      private void updateJobProgress(String strategyType) {
            if (currentJob != null) {
                  currentJob.updateProgress(strategyType, 0, completedTasks.get());
                  simulationJobRepository.save(currentJob);
                  log.info("전략 {} 완료 - 진행률: {}%", strategyType, String.format("%.1f", currentJob.getProgressPercent()));
            }
      }

      private void completeJob(int skipped) {
            if (currentJob != null) {
                  currentJob.complete();
                  simulationJobRepository.save(currentJob);
                  log.info("시뮬레이션 완료! 총 {}건 처리, {}건 스킵",
                              completedTasks.get() - skipped, skipped);
            }
      }

      private void failJob(String errorMessage) {
            if (currentJob != null) {
                  currentJob.fail(errorMessage);
                  simulationJobRepository.save(currentJob);
            }
      }

      public void stopSimulation() {
            running.set(false);
            if (currentJob != null) {
                  currentJob.pause();
                  simulationJobRepository.save(currentJob);
            }
            log.info("시뮬레이션 중단 요청됨");
      }

      /**
       * 특정 회차만 시뮬레이션 (주간 자동 실행용)
       * 모든 전략에 대해 해당 회차만 시뮬레이션 실행
       */
      public void runWeeklySimulation(int drawNo, int ticketsPerDraw) {
            LottoDraw targetDraw = lottoDrawRepository.findById(drawNo).orElse(null);
            if (targetDraw == null) {
                  log.warn("{}회차 추첨 데이터가 없어 주간 시뮬레이션을 실행할 수 없습니다.", drawNo);
                  return;
            }

            List<LottoDraw> allDraws = lottoDrawRepository.findAllByOrderByDrwNoDesc();
            Map<String, LottoStrategy> strategies = lottoGenerateService.getStrategyMap();

            log.info("주간 시뮬레이션 시작: {}회차, {}개 전략, {}티켓",
                        drawNo, strategies.size(), ticketsPerDraw);

            int processed = 0;
            int skipped = 0;

            for (Map.Entry<String, LottoStrategy> entry : strategies.entrySet()) {
                  String strategyType = entry.getKey();
                  LottoStrategy strategy = entry.getValue();

                  if (simulationResultRepository.existsByStrategyTypeAndDrawNo(strategyType, drawNo)) {
                        skipped++;
                        continue;
                  }

                  runSingleSimulation(strategy, targetDraw, allDraws, ticketsPerDraw);
                  processed++;
            }

            log.info("주간 시뮬레이션 완료: {}회차 - {}건 처리, {}건 스킵", drawNo, processed, skipped);
      }

      public boolean isRunning() {
            return running.get();
      }

      public SimulationJob getLatestJob() {
            return simulationJobRepository.findLatestJob().orElse(null);
      }

      @Transactional(readOnly = true)
      public Map<String, Object> getSummary(String strategyType) {
            List<SimulationResult> results = simulationResultRepository
                        .findByStrategyTypeOrderByDrawNoAsc(strategyType);
            if (results.isEmpty()) return Map.of("strategyType", strategyType, "status", "NO_DATA");

            long totalTickets = results.stream().mapToLong(SimulationResult::getTotalTickets).sum();
            long totalR1 = results.stream().mapToLong(SimulationResult::getRank1Count).sum();
            long totalR2 = results.stream().mapToLong(SimulationResult::getRank2Count).sum();
            long totalR3 = results.stream().mapToLong(SimulationResult::getRank3Count).sum();
            long totalR4 = results.stream().mapToLong(SimulationResult::getRank4Count).sum();
            long totalR5 = results.stream().mapToLong(SimulationResult::getRank5Count).sum();
            long totalPrize = results.stream().mapToLong(SimulationResult::getEstimatedPrize).sum();
            long totalWins = totalR1 + totalR2 + totalR3 + totalR4 + totalR5;
            long totalCost = totalTickets * 1000L; // 1장당 1,000원

            Map<String, Object> summary = new java.util.LinkedHashMap<>();
            summary.put("strategyType", strategyType);
            summary.put("totalDraws", results.size());
            summary.put("totalTickets", totalTickets);
            summary.put("rank1", totalR1);
            summary.put("rank2", totalR2);
            summary.put("rank3", totalR3);
            summary.put("rank4", totalR4);
            summary.put("rank5", totalR5);
            summary.put("totalWins", totalWins);
            summary.put("winRate", totalTickets > 0 ? (double) totalWins / totalTickets * 100 : 0);
            summary.put("totalPrize", totalPrize);
            summary.put("totalCost", totalCost);
            summary.put("roi", totalCost > 0 ? (double) (totalPrize - totalCost) / totalCost * 100 : 0);
            return summary;
      }

      @Transactional(readOnly = true)
      public List<Map<String, Object>> getAllSummaries() {
            List<String> types = simulationResultRepository.findDistinctStrategyTypes();
            return types.stream().map(this::getSummary).collect(Collectors.toList());
      }
}
