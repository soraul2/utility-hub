package com.wootae.backend.domain.calendar.service;

import com.wootae.backend.domain.routine.entity.CalendarEvent;
import com.wootae.backend.domain.routine.entity.DailyPlan;
import com.wootae.backend.domain.routine.entity.Task;
import com.wootae.backend.domain.routine.repository.CalendarEventRepository;
import com.wootae.backend.domain.routine.repository.DailyPlanRepository;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IcsExportService {

      private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.BASIC_ISO_DATE;
      private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HHmmss");
      private static final String CRLF = "\r\n";

      private final DailyPlanRepository dailyPlanRepository;
      private final CalendarEventRepository calendarEventRepository;
      private final UserRepository userRepository;

      @Transactional(readOnly = true)
      public String exportDailyPlan(Long userId, LocalDate date) {
            DailyPlan plan = dailyPlanRepository.findFirstByUserIdAndPlanDateOrderByIdAsc(userId, date)
                        .orElseThrow(() -> new BusinessException(ErrorCode.PLAN_NOT_FOUND));

            StringBuilder ics = new StringBuilder();
            appendHeader(ics);

            for (Task task : plan.getKeyTasks()) {
                  if (task.getStartTime() != null) {
                        appendTaskEvent(ics, task, date);
                  }
            }

            appendFooter(ics);
            return ics.toString();
      }

      @Transactional(readOnly = true)
      public String exportMonthly(Long userId, int year, int month) {
            LocalDate monthStart = LocalDate.of(year, month, 1);
            LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

            List<DailyPlan> plans = dailyPlanRepository.findByUserIdAndPlanDateBetween(
                        userId, monthStart, monthEnd);
            User user = userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
            List<CalendarEvent> events = calendarEventRepository.findEventsInRange(
                        user, monthStart, monthEnd);

            StringBuilder ics = new StringBuilder();
            appendHeader(ics);

            for (DailyPlan plan : plans) {
                  for (Task task : plan.getKeyTasks()) {
                        if (task.getStartTime() != null) {
                              appendTaskEvent(ics, task, plan.getPlanDate());
                        }
                  }
            }

            for (CalendarEvent event : events) {
                  appendCalendarEvent(ics, event);
            }

            appendFooter(ics);
            return ics.toString();
      }

      private void appendHeader(StringBuilder ics) {
            ics.append("BEGIN:VCALENDAR").append(CRLF);
            ics.append("VERSION:2.0").append(CRLF);
            ics.append("PRODID:-//UtilityHub//RoutineHub//KO").append(CRLF);
            ics.append("CALSCALE:GREGORIAN").append(CRLF);
            ics.append("METHOD:PUBLISH").append(CRLF);
            ics.append("X-WR-TIMEZONE:Asia/Seoul").append(CRLF);
      }

      private void appendFooter(StringBuilder ics) {
            ics.append("END:VCALENDAR").append(CRLF);
      }

      private void appendTaskEvent(StringBuilder ics, Task task, LocalDate date) {
            LocalTime endTime = task.getEndTime();
            if (endTime == null) {
                  endTime = task.getStartTime().plusMinutes(
                              task.getDurationMinutes() != null ? task.getDurationMinutes() : 60);
            }

            ics.append("BEGIN:VEVENT").append(CRLF);
            ics.append("UID:").append(UUID.randomUUID()).append("@utilityhub").append(CRLF);
            ics.append("DTSTART:").append(formatDateTime(date, task.getStartTime())).append(CRLF);
            ics.append("DTEND:").append(formatDateTime(date, endTime)).append(CRLF);
            ics.append("SUMMARY:").append(escapeIcs(task.getTitle())).append(CRLF);
            if (task.getDescription() != null && !task.getDescription().isBlank()) {
                  ics.append("DESCRIPTION:").append(escapeIcs(task.getDescription())).append(CRLF);
            }
            if (task.getCategory() != null) {
                  ics.append("CATEGORIES:").append(task.getCategory()).append(CRLF);
            }
            ics.append("STATUS:").append(task.isCompleted() ? "COMPLETED" : "CONFIRMED").append(CRLF);
            ics.append("END:VEVENT").append(CRLF);
      }

      private void appendCalendarEvent(StringBuilder ics, CalendarEvent event) {
            ics.append("BEGIN:VEVENT").append(CRLF);
            ics.append("UID:").append(UUID.randomUUID()).append("@utilityhub").append(CRLF);
            ics.append("DTSTART;VALUE=DATE:").append(event.getStartDate().format(DATE_FMT)).append(CRLF);
            ics.append("DTEND;VALUE=DATE:").append(event.getEndDate().plusDays(1).format(DATE_FMT)).append(CRLF);
            ics.append("SUMMARY:").append(escapeIcs(event.getTitle())).append(CRLF);
            if (event.getDescription() != null && !event.getDescription().isBlank()) {
                  ics.append("DESCRIPTION:").append(escapeIcs(event.getDescription())).append(CRLF);
            }
            ics.append("END:VEVENT").append(CRLF);
      }

      private String formatDateTime(LocalDate date, LocalTime time) {
            return date.format(DATE_FMT) + "T" + time.format(TIME_FMT);
      }

      private String escapeIcs(String text) {
            return text.replace("\\", "\\\\")
                        .replace(",", "\\,")
                        .replace(";", "\\;")
                        .replace("\n", "\\n");
      }
}
