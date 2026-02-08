package com.wootae.backend.domain.lotto.strategy;

import com.wootae.backend.domain.lotto.entity.LottoDraw;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public abstract class AbstractLottoStrategy implements LottoStrategy {

      protected static final int MIN_NUMBER = 1;
      protected static final int MAX_NUMBER = 45;
      protected static final int PICK_COUNT = 6;
      protected final Random random = new Random();

      protected List<Integer> generateRandom() {
            List<Integer> numbers = IntStream.rangeClosed(MIN_NUMBER, MAX_NUMBER)
                        .boxed().collect(Collectors.toList());
            Collections.shuffle(numbers, random);
            return numbers.subList(0, PICK_COUNT).stream().sorted().collect(Collectors.toList());
      }

      protected boolean hasConsecutive(List<Integer> ticket) {
            for (int i = 0; i < ticket.size() - 1; i++) {
                  if (ticket.get(i + 1) - ticket.get(i) == 1) return true;
            }
            return false;
      }

      protected boolean hasMinGap(List<Integer> ticket, int minGap) {
            for (int i = 0; i < ticket.size() - 1; i++) {
                  if (ticket.get(i + 1) - ticket.get(i) < minGap) return false;
            }
            return true;
      }

      protected List<Integer> extractNumbers(LottoDraw draw) {
            return List.of(
                        draw.getDrwtNo1(), draw.getDrwtNo2(), draw.getDrwtNo3(),
                        draw.getDrwtNo4(), draw.getDrwtNo5(), draw.getDrwtNo6());
      }

      protected Map<Integer, Integer> buildFrequencyMap(List<LottoDraw> draws) {
            Map<Integer, Integer> freqMap = new HashMap<>();
            for (LottoDraw draw : draws) {
                  for (int num : extractNumbers(draw)) {
                        freqMap.merge(num, 1, Integer::sum);
                  }
            }
            return freqMap;
      }

      protected List<Integer> getTopNumbers(Map<Integer, Integer> freqMap, int topN) {
            return freqMap.entrySet().stream()
                        .sorted(Map.Entry.<Integer, Integer>comparingByValue().reversed())
                        .limit(topN)
                        .map(Map.Entry::getKey)
                        .collect(Collectors.toList());
      }

      protected List<Integer> pickFromPool(List<Integer> pool) {
            List<Integer> shuffled = new ArrayList<>(pool);
            Collections.shuffle(shuffled, random);
            return shuffled.subList(0, Math.min(PICK_COUNT, shuffled.size()))
                        .stream().sorted().collect(Collectors.toList());
      }

      protected List<Integer> toSortedList(Set<Integer> selected) {
            return new ArrayList<>(new TreeSet<>(selected));
      }

      protected void fillRemaining(Set<Integer> selected) {
            while (selected.size() < PICK_COUNT) {
                  selected.add(random.nextInt(MAX_NUMBER) + 1);
            }
      }
}
