package com.wootae.backend.domain.routine.util;

import com.wootae.backend.domain.routine.entity.DailyPlan;
import com.wootae.backend.domain.routine.entity.Task;

import java.util.List;

public class XpCalculator {

      public static long calculate(List<DailyPlan> plans, String monthlyGoal) {
            long xp = 0;
            for (DailyPlan plan : plans) {
                  if (plan.isRest()) {
                        xp += 5;
                  } else if (plan.getKeyTasks() != null && !plan.getKeyTasks().isEmpty()) {
                        xp += 5; // Plan created
                        int completed = (int) plan.getKeyTasks().stream().filter(Task::isCompleted).count();
                        int total = plan.getKeyTasks().size();
                        xp += completed * 10L; // Per completed task
                        if (total > 0) {
                              double rate = (double) completed / total * 100;
                              if (rate >= 100) {
                                    xp += 50;
                              } else if (rate >= 80) {
                                    xp += 20;
                              }
                        }
                  }
                  if (plan.getReflection() != null) {
                        xp += 20;
                  }
            }
            if (monthlyGoal != null && !monthlyGoal.isBlank()) {
                  xp += 10;
            }
            return xp;
      }
}
