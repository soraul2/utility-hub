package com.wootae.backend.domain.lotto.service;

import com.wootae.backend.domain.lotto.dto.LottoGenerateResponse;
import com.wootae.backend.domain.lotto.entity.LottoDraw;
import com.wootae.backend.domain.lotto.entity.LottoRule;
import com.wootae.backend.domain.lotto.repository.LottoDrawRepository;
import com.wootae.backend.domain.lotto.repository.LottoRuleRepository;
import com.wootae.backend.domain.lotto.strategy.LottoStrategy;
import com.wootae.backend.domain.lotto.strategy.LottoStrategyContext;
import com.wootae.backend.domain.lotto.strategy.impl.*;
import com.wootae.backend.global.error.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class LottoGenerateServiceTest {

      private LottoGenerateService lottoGenerateService;

      @Mock
      private LottoRuleRepository lottoRuleRepository;

      @Mock
      private LottoDrawRepository lottoDrawRepository;

      @BeforeEach
      void setUp() {
            List<LottoStrategy> strategies = List.of(
                        new RandomStrategy(), new AttackStrategy(), new StableStrategy(),
                        new BalanceStrategy(), new LowHighStrategy(), new SumRangeStrategy(),
                        new ConsecutiveStrategy(), new NoConsecutiveStrategy(), new PrimeStrategy(),
                        new SpreadStrategy(), new ClusterStrategy(), new DecadeStrategy(),
                        new EdgeStrategy(), new FibonacciStrategy(), new LuckyStrategy(),
                        new DoubleStrategy(), new HotStrategy(), new ColdStrategy(),
                        new HotColdMixStrategy(), new FrequencyStrategy(), new MirrorStrategy(),
                        new ExcludeLastStrategy()
            );
            lottoGenerateService = new LottoGenerateService(
                        lottoRuleRepository, lottoDrawRepository, strategies);
      }

      // ====== 공통 검증 헬퍼 ======

      private void assertValidTickets(LottoGenerateResponse response, int expectedCount) {
            assertThat(response.getTickets()).hasSize(expectedCount);
            response.getTickets().forEach(ticket -> {
                  assertThat(ticket).hasSize(6);
                  assertThat(ticket).isSorted();
                  ticket.forEach(num -> assertThat(num).isBetween(1, 45));
                  assertThat(ticket).doesNotHaveDuplicates();
            });
      }

      private LottoGenerateResponse generateWithType(String type) {
            Long ruleId = 1L;
            LottoRule rule = LottoRule.builder()
                        .id(ruleId).name(type + " Rule").type(type).build();
            given(lottoRuleRepository.findById(ruleId)).willReturn(Optional.of(rule));
            return lottoGenerateService.generate(ruleId, 3);
      }

      private void setupDrawMocks() {
            List<LottoDraw> draws = List.of(
                        createDraw(1, 1, 5, 10, 20, 30, 40, 7),
                        createDraw(2, 2, 8, 15, 25, 35, 43, 12)
            );
            lenient().when(lottoDrawRepository.findRecentDraws(anyInt())).thenReturn(draws);
            lenient().when(lottoDrawRepository.findAllByOrderByDrwNoDesc()).thenReturn(draws);
            lenient().when(lottoDrawRepository.findLatestDraw()).thenReturn(Optional.of(draws.get(0)));
      }

      private LottoDraw createDraw(int drwNo, int n1, int n2, int n3, int n4, int n5, int n6, int bonus) {
            return new LottoDraw(drwNo, LocalDate.of(2025, 1, Math.min(drwNo, 28)),
                        n1, n2, n3, n4, n5, n6, bonus, 1000000000L, 10L);
      }

      // ====== 기존 전략 테스트 ======

      @Test
      @DisplayName("번호 생성 성공 - 6개 번호 5게임 (RANDOM)")
      void generateNumbers_random() {
            setupDrawMocks();
            Long ruleId = 1L;
            LottoRule rule = LottoRule.builder().id(ruleId).name("Test Rule").type("RANDOM").build();
            given(lottoRuleRepository.findById(ruleId)).willReturn(Optional.of(rule));

            LottoGenerateResponse response = lottoGenerateService.generate(ruleId, 5);
            assertThat(response.getRuleId()).isEqualTo(ruleId);
            assertValidTickets(response, 5);
      }

      @Test
      @DisplayName("번호 생성 성공 - ATTACK 타입")
      void generateNumbers_attack() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("ATTACK");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket -> {
                  long highCount = ticket.stream().filter(n -> n >= 30).count();
                  assertThat(highCount).isGreaterThanOrEqualTo(3);
            });
      }

      @Test
      @DisplayName("번호 생성 성공 - STABLE 타입")
      void generateNumbers_stable() {
            setupDrawMocks();
            assertValidTickets(generateWithType("STABLE"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - BALANCE 타입")
      void generateNumbers_balance() {
            setupDrawMocks();
            assertValidTickets(generateWithType("BALANCE"), 3);
      }

      @Test
      @DisplayName("번호 생성 실패 - 존재하지 않는 규칙")
      void generateNumbers_ruleNotFound() {
            Long ruleId = 999L;
            given(lottoRuleRepository.findById(ruleId)).willReturn(Optional.empty());
            assertThatThrownBy(() -> lottoGenerateService.generate(ruleId, 5))
                        .isInstanceOf(BusinessException.class);
      }

      // ====== 수학/패턴 기반 전략 테스트 ======

      @Test
      @DisplayName("번호 생성 성공 - LOW_HIGH 타입 (저3+고3)")
      void generateNumbers_lowHigh() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("LOW_HIGH");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket -> {
                  assertThat(ticket.stream().filter(n -> n <= 22).count()).isGreaterThanOrEqualTo(3);
                  assertThat(ticket.stream().filter(n -> n >= 23).count()).isGreaterThanOrEqualTo(3);
            });
      }

      @Test
      @DisplayName("번호 생성 성공 - SUM_RANGE 타입 (합계 100~175)")
      void generateNumbers_sumRange() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("SUM_RANGE");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket -> {
                  int sum = ticket.stream().mapToInt(Integer::intValue).sum();
                  assertThat(sum).isBetween(100, 175);
            });
      }

      @Test
      @DisplayName("번호 생성 성공 - CONSECUTIVE 타입 (연번 포함)")
      void generateNumbers_consecutive() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("CONSECUTIVE");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket -> {
                  boolean hasConsec = false;
                  for (int i = 0; i < ticket.size() - 1; i++) {
                        if (ticket.get(i + 1) - ticket.get(i) == 1) { hasConsec = true; break; }
                  }
                  assertThat(hasConsec).isTrue();
            });
      }

      @Test
      @DisplayName("번호 생성 성공 - NO_CONSECUTIVE 타입 (연번 없음)")
      void generateNumbers_noConsecutive() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("NO_CONSECUTIVE");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket -> {
                  for (int i = 0; i < ticket.size() - 1; i++)
                        assertThat(ticket.get(i + 1) - ticket.get(i)).isGreaterThan(1);
            });
      }

      @Test
      @DisplayName("번호 생성 성공 - PRIME 타입 (소수 4개 이상)")
      void generateNumbers_prime() {
            setupDrawMocks();
            Set<Integer> primes = Set.of(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43);
            LottoGenerateResponse response = generateWithType("PRIME");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket ->
                        assertThat(ticket.stream().filter(primes::contains).count()).isGreaterThanOrEqualTo(4));
      }

      @Test
      @DisplayName("번호 생성 성공 - SPREAD 타입")
      void generateNumbers_spread() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("SPREAD");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket -> {
                  for (int i = 0; i < ticket.size() - 1; i++)
                        assertThat(ticket.get(i + 1) - ticket.get(i)).isGreaterThanOrEqualTo(3);
            });
      }

      @Test
      @DisplayName("번호 생성 성공 - CLUSTER 타입")
      void generateNumbers_cluster() {
            setupDrawMocks();
            assertValidTickets(generateWithType("CLUSTER"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - DECADE 타입")
      void generateNumbers_decade() {
            setupDrawMocks();
            assertValidTickets(generateWithType("DECADE"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - EDGE 타입 (끝수 다양화)")
      void generateNumbers_edge() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("EDGE");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket -> {
                  Set<Integer> lastDigits = ticket.stream().map(n -> n % 10).collect(Collectors.toSet());
                  assertThat(lastDigits.size()).isGreaterThanOrEqualTo(5);
            });
      }

      @Test
      @DisplayName("번호 생성 성공 - FIBONACCI 타입")
      void generateNumbers_fibonacci() {
            setupDrawMocks();
            Set<Integer> fibAndNeighbors = Set.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 20, 21, 22, 33, 34, 35);
            LottoGenerateResponse response = generateWithType("FIBONACCI");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket ->
                        assertThat(ticket.stream().filter(fibAndNeighbors::contains).count()).isGreaterThanOrEqualTo(4));
      }

      @Test
      @DisplayName("번호 생성 성공 - LUCKY 타입")
      void generateNumbers_lucky() {
            setupDrawMocks();
            Set<Integer> luckySet = Set.of(3, 7, 9, 11, 13, 21, 27, 33, 37, 44);
            LottoGenerateResponse response = generateWithType("LUCKY");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket ->
                        assertThat(ticket.stream().filter(luckySet::contains).count()).isGreaterThanOrEqualTo(3));
      }

      @Test
      @DisplayName("번호 생성 성공 - DOUBLE 타입 (쌍수 포함)")
      void generateNumbers_double() {
            setupDrawMocks();
            Set<Integer> doubles = Set.of(11, 22, 33, 44);
            LottoGenerateResponse response = generateWithType("DOUBLE");
            assertValidTickets(response, 3);
            response.getTickets().forEach(ticket ->
                        assertThat(ticket.stream().filter(doubles::contains).count()).isGreaterThanOrEqualTo(1));
      }

      // ====== 데이터 기반 전략 테스트 ======

      @Test
      @DisplayName("번호 생성 성공 - HOT 타입")
      void generateNumbers_hot() {
            setupDrawMocks();
            assertValidTickets(generateWithType("HOT"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - HOT 타입 (데이터 없으면 RANDOM 폴백)")
      void generateNumbers_hot_noData() {
            given(lottoDrawRepository.findRecentDraws(anyInt())).willReturn(List.of());
            lenient().when(lottoDrawRepository.findAllByOrderByDrwNoDesc()).thenReturn(List.of());
            lenient().when(lottoDrawRepository.findLatestDraw()).thenReturn(Optional.empty());
            assertValidTickets(generateWithType("HOT"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - COLD 타입")
      void generateNumbers_cold() {
            setupDrawMocks();
            assertValidTickets(generateWithType("COLD"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - HOT_COLD_MIX 타입")
      void generateNumbers_hotColdMix() {
            setupDrawMocks();
            assertValidTickets(generateWithType("HOT_COLD_MIX"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - FREQUENCY 타입")
      void generateNumbers_frequency() {
            setupDrawMocks();
            assertValidTickets(generateWithType("FREQUENCY"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - MIRROR 타입")
      void generateNumbers_mirror() {
            setupDrawMocks();
            assertValidTickets(generateWithType("MIRROR"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - MIRROR 타입 (데이터 없으면 RANDOM 폴백)")
      void generateNumbers_mirror_noData() {
            lenient().when(lottoDrawRepository.findRecentDraws(anyInt())).thenReturn(List.of());
            lenient().when(lottoDrawRepository.findAllByOrderByDrwNoDesc()).thenReturn(List.of());
            given(lottoDrawRepository.findLatestDraw()).willReturn(Optional.empty());
            assertValidTickets(generateWithType("MIRROR"), 3);
      }

      @Test
      @DisplayName("번호 생성 성공 - EXCLUDE_LAST 타입 (직전 회차 제외)")
      void generateNumbers_excludeLast() {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType("EXCLUDE_LAST");
            assertValidTickets(response, 3);
            Set<Integer> excluded = Set.of(1, 5, 10, 20, 30, 40);
            response.getTickets().forEach(ticket ->
                        ticket.forEach(num -> assertThat(excluded).doesNotContain(num)));
      }

      // ====== 전체 전략 파라미터 테스트 ======

      @ParameterizedTest
      @ValueSource(strings = {
                  "RANDOM", "ATTACK", "STABLE", "BALANCE",
                  "LOW_HIGH", "SUM_RANGE", "CONSECUTIVE", "NO_CONSECUTIVE",
                  "PRIME", "SPREAD", "CLUSTER", "DECADE", "EDGE",
                  "FIBONACCI", "LUCKY", "DOUBLE",
                  "HOT", "COLD", "HOT_COLD_MIX", "FREQUENCY",
                  "MIRROR", "EXCLUDE_LAST"
      })
      @DisplayName("모든 전략 - 기본 유효성 검증 (6개, 1~45, 정렬, 중복 없음)")
      void generateNumbers_allStrategies(String type) {
            setupDrawMocks();
            LottoGenerateResponse response = generateWithType(type);
            assertValidTickets(response, 3);
      }

      // ====== 전략 패턴 검증 ======

      @Test
      @DisplayName("getAllStrategyTypes - 22개 전략 등록 확인")
      void getAllStrategyTypes() {
            assertThat(lottoGenerateService.getAllStrategyTypes()).hasSize(22);
      }

      @Test
      @DisplayName("resolveStrategy - 미등록 타입은 RANDOM 폴백")
      void resolveStrategy_fallback() {
            LottoStrategy strategy = lottoGenerateService.resolveStrategy("UNKNOWN_TYPE");
            assertThat(strategy.getType()).isEqualTo("RANDOM");
      }

      @Test
      @DisplayName("resolveStrategy - null 타입은 RANDOM 폴백")
      void resolveStrategy_null() {
            LottoStrategy strategy = lottoGenerateService.resolveStrategy(null);
            assertThat(strategy.getType()).isEqualTo("RANDOM");
      }
}
