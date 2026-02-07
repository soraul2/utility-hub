package com.wootae.backend.domain.calendar.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.calendar.entity.GoogleCalendarToken;
import com.wootae.backend.domain.calendar.repository.GoogleCalendarTokenRepository;
import com.wootae.backend.domain.routine.entity.Task;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GoogleCalendarService {

      private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
      private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
      private static final String GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";
      private static final String GOOGLE_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
      private static final String CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";
      private static final long STATE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

      private final GoogleCalendarTokenRepository tokenRepository;
      private final UserRepository userRepository;
      private final RestTemplate restTemplate;
      private final ObjectMapper objectMapper;
      private final SecretKey stateKey;

      private final String clientId;
      private final String clientSecret;
      private final String redirectUri;

      public GoogleCalendarService(
                  GoogleCalendarTokenRepository tokenRepository,
                  UserRepository userRepository,
                  @Value("${google.calendar.client-id:}") String clientId,
                  @Value("${google.calendar.client-secret:}") String clientSecret,
                  @Value("${google.calendar.redirect-uri:http://localhost:8080/api/calendar/google/callback}") String redirectUri,
                  @Value("${spring.jwt.secret}") String jwtSecret) {
            this.tokenRepository = tokenRepository;
            this.userRepository = userRepository;
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.redirectUri = redirectUri;
            this.restTemplate = new RestTemplate();
            this.objectMapper = new ObjectMapper();
            this.stateKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
      }

      public String getAuthorizationUrl(Long userId) {
            String state = Jwts.builder()
                        .subject(String.valueOf(userId))
                        .expiration(new Date(System.currentTimeMillis() + STATE_EXPIRY_MS))
                        .signWith(stateKey)
                        .compact();

            return GOOGLE_AUTH_URL
                        + "?client_id=" + clientId
                        + "&redirect_uri=" + redirectUri
                        + "&response_type=code"
                        + "&scope=" + CALENDAR_SCOPE
                        + "&access_type=offline"
                        + "&prompt=consent"
                        + "&state=" + state;
      }

      public Long parseState(String state) {
            try {
                  String subject = Jwts.parser()
                              .verifyWith(stateKey)
                              .build()
                              .parseSignedClaims(state)
                              .getPayload()
                              .getSubject();
                  return Long.valueOf(subject);
            } catch (Exception e) {
                  log.warn("Invalid Google Calendar OAuth state: {}", e.getMessage());
                  throw new BusinessException(ErrorCode.TOKEN_INVALID);
            }
      }

      @Transactional
      public void handleCallback(String code, String state) {
            Long userId = parseState(state);
            User user = userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            // Exchange code for tokens
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("code", code);
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("redirect_uri", redirectUri);
            params.add("grant_type", "authorization_code");

            ResponseEntity<String> response = restTemplate.postForEntity(
                        GOOGLE_TOKEN_URL,
                        new HttpEntity<>(params, headers),
                        String.class);

            try {
                  JsonNode body = objectMapper.readTree(response.getBody());
                  String accessToken = body.get("access_token").asText();
                  String refreshToken = body.has("refresh_token") ? body.get("refresh_token").asText() : null;
                  int expiresIn = body.get("expires_in").asInt();

                  LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expiresIn);

                  GoogleCalendarToken existing = tokenRepository.findByUserId(userId).orElse(null);
                  if (existing != null) {
                        existing.updateTokens(accessToken, refreshToken, expiresAt);
                  } else {
                        if (refreshToken == null) {
                              throw new BusinessException(ErrorCode.GCAL_SYNC_FAILED);
                        }
                        tokenRepository.save(GoogleCalendarToken.builder()
                                    .user(user)
                                    .accessToken(accessToken)
                                    .refreshToken(refreshToken)
                                    .expiresAt(expiresAt)
                                    .build());
                  }

                  log.info("Google Calendar connected: userId={}", userId);
            } catch (BusinessException e) {
                  throw e;
            } catch (Exception e) {
                  log.error("Google Calendar token exchange failed: {}", e.getMessage());
                  throw new BusinessException(ErrorCode.GCAL_SYNC_FAILED);
            }
      }

      public boolean isConnected(Long userId) {
            return tokenRepository.findByUserId(userId).isPresent();
      }

      @Transactional
      public void disconnect(Long userId) {
            tokenRepository.findByUserId(userId).ifPresent(token -> {
                  // Best-effort revoke
                  try {
                        restTemplate.postForEntity(
                                    GOOGLE_REVOKE_URL + "?token=" + token.getRefreshToken(),
                                    null, String.class);
                  } catch (Exception e) {
                        log.warn("Google token revoke failed: {}", e.getMessage());
                  }
                  tokenRepository.delete(token);
            });
            log.info("Google Calendar disconnected: userId={}", userId);
      }

      @Transactional
      public void createEvents(Long userId, List<Task> tasks, LocalDate planDate) {
            GoogleCalendarToken token = tokenRepository.findByUserId(userId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.GCAL_NOT_CONNECTED));

            String accessToken = getValidAccessToken(token);

            for (Task task : tasks) {
                  if (task.getStartTime() == null) continue;

                  LocalTime endTime = task.getEndTime();
                  if (endTime == null && task.getDurationMinutes() != null) {
                        endTime = task.getStartTime().plusMinutes(task.getDurationMinutes());
                  }
                  if (endTime == null) {
                        endTime = task.getStartTime().plusHours(1);
                  }

                  String startDt = planDate.atTime(task.getStartTime())
                              .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                  String endDt = planDate.atTime(endTime)
                              .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

                  Map<String, Object> event = Map.of(
                              "summary", task.getTitle(),
                              "start", Map.of("dateTime", startDt, "timeZone", "Asia/Seoul"),
                              "end", Map.of("dateTime", endDt, "timeZone", "Asia/Seoul")
                  );

                  try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.setBearerAuth(accessToken);

                        restTemplate.postForEntity(
                                    GOOGLE_CALENDAR_API + "/calendars/primary/events",
                                    new HttpEntity<>(event, headers),
                                    String.class);
                  } catch (Exception e) {
                        log.warn("Failed to create Google Calendar event for task {}: {}", task.getId(), e.getMessage());
                  }
            }
      }

      /**
       * 종일 이벤트 생성 (CalendarEvent용)
       * Google Calendar API에서 종일 이벤트 end.date는 exclusive이므로 +1일
       * @return Google Calendar event ID, 또는 미연동/실패 시 null
       */
      @Transactional
      public String createAllDayEvent(Long userId, String title, String description, LocalDate startDate, LocalDate endDate) {
            GoogleCalendarToken token = tokenRepository.findByUserId(userId).orElse(null);
            if (token == null) return null;

            String accessToken = getValidAccessToken(token);

            java.util.Map<String, Object> event = new java.util.HashMap<>();
            event.put("summary", title);
            event.put("start", Map.of("date", startDate.toString()));
            event.put("end", Map.of("date", endDate.plusDays(1).toString()));
            if (description != null && !description.isBlank()) {
                  event.put("description", description);
            }

            try {
                  HttpHeaders headers = new HttpHeaders();
                  headers.setContentType(MediaType.APPLICATION_JSON);
                  headers.setBearerAuth(accessToken);

                  ResponseEntity<String> response = restTemplate.postForEntity(
                              GOOGLE_CALENDAR_API + "/calendars/primary/events",
                              new HttpEntity<>(event, headers),
                              String.class);

                  JsonNode body = objectMapper.readTree(response.getBody());
                  return body.get("id").asText();
            } catch (Exception e) {
                  log.warn("Failed to create Google Calendar all-day event: {}", e.getMessage());
                  return null;
            }
      }

      /**
       * Google Calendar 이벤트 수정
       */
      public void updateGoogleEvent(Long userId, String googleEventId, String title, String description, LocalDate startDate, LocalDate endDate) {
            if (googleEventId == null) return;

            GoogleCalendarToken token = tokenRepository.findByUserId(userId).orElse(null);
            if (token == null) return;

            String accessToken = getValidAccessToken(token);

            java.util.Map<String, Object> event = new java.util.HashMap<>();
            event.put("summary", title);
            event.put("start", Map.of("date", startDate.toString()));
            event.put("end", Map.of("date", endDate.plusDays(1).toString()));
            if (description != null && !description.isBlank()) {
                  event.put("description", description);
            }

            try {
                  HttpHeaders headers = new HttpHeaders();
                  headers.setContentType(MediaType.APPLICATION_JSON);
                  headers.setBearerAuth(accessToken);

                  restTemplate.exchange(
                              GOOGLE_CALENDAR_API + "/calendars/primary/events/" + googleEventId,
                              HttpMethod.PUT,
                              new HttpEntity<>(event, headers),
                              String.class);
            } catch (Exception e) {
                  log.warn("Failed to update Google Calendar event {}: {}", googleEventId, e.getMessage());
            }
      }

      /**
       * Google Calendar 이벤트 삭제
       */
      public void deleteGoogleEvent(Long userId, String googleEventId) {
            if (googleEventId == null) return;

            GoogleCalendarToken token = tokenRepository.findByUserId(userId).orElse(null);
            if (token == null) return;

            String accessToken = getValidAccessToken(token);

            try {
                  HttpHeaders headers = new HttpHeaders();
                  headers.setBearerAuth(accessToken);

                  restTemplate.exchange(
                              GOOGLE_CALENDAR_API + "/calendars/primary/events/" + googleEventId,
                              HttpMethod.DELETE,
                              new HttpEntity<>(headers),
                              Void.class);
            } catch (Exception e) {
                  log.warn("Failed to delete Google Calendar event {}: {}", googleEventId, e.getMessage());
            }
      }

      private String getValidAccessToken(GoogleCalendarToken token) {
            if (!token.isExpired()) {
                  return token.getAccessToken();
            }

            // Refresh the token
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("client_id", clientId);
            params.add("client_secret", clientSecret);
            params.add("refresh_token", token.getRefreshToken());
            params.add("grant_type", "refresh_token");

            try {
                  ResponseEntity<String> response = restTemplate.postForEntity(
                              GOOGLE_TOKEN_URL,
                              new HttpEntity<>(params, headers),
                              String.class);

                  JsonNode body = objectMapper.readTree(response.getBody());
                  String newAccessToken = body.get("access_token").asText();
                  int expiresIn = body.get("expires_in").asInt();

                  token.updateTokens(newAccessToken, null, LocalDateTime.now().plusSeconds(expiresIn));
                  return newAccessToken;
            } catch (Exception e) {
                  log.error("Google Calendar token refresh failed: {}", e.getMessage());
                  tokenRepository.delete(token);
                  throw new BusinessException(ErrorCode.GCAL_TOKEN_EXPIRED);
            }
      }
}
