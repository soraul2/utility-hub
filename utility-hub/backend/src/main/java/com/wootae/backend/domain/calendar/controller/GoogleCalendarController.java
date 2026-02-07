package com.wootae.backend.domain.calendar.controller;

import com.wootae.backend.domain.calendar.service.GoogleCalendarService;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/calendar/google")
@RestController
public class GoogleCalendarController {

      private final GoogleCalendarService googleCalendarService;

      @Value("${oauth2.frontend-callback-url:http://localhost:5173/auth/callback}")
      private String frontendBaseUrl;

      @GetMapping("/auth-url")
      public ResponseEntity<Map<String, String>> getAuthUrl(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }
            Long userId = Long.valueOf(userDetails.getUsername());
            String authUrl = googleCalendarService.getAuthorizationUrl(userId);
            return ResponseEntity.ok(Map.of("authUrl", authUrl));
      }

      @GetMapping("/callback")
      public ResponseEntity<Void> callback(
                  @RequestParam(required = false) String code,
                  @RequestParam(required = false) String state,
                  @RequestParam(required = false) String error) {

            String mypageBase = frontendBaseUrl.replace("/auth/callback", "/mypage");

            // User denied consent or other Google error
            if (error != null || code == null) {
                  log.warn("Google Calendar OAuth failed: error={}", error);
                  return ResponseEntity.status(HttpStatus.FOUND)
                              .location(URI.create(mypageBase + "?gcal=denied"))
                              .build();
            }

            try {
                  googleCalendarService.handleCallback(code, state);
                  return ResponseEntity.status(HttpStatus.FOUND)
                              .location(URI.create(mypageBase + "?gcal=connected"))
                              .build();
            } catch (Exception e) {
                  log.error("Google Calendar callback failed: {}", e.getMessage());
                  return ResponseEntity.status(HttpStatus.FOUND)
                              .location(URI.create(mypageBase + "?gcal=error"))
                              .build();
            }
      }

      @GetMapping("/status")
      public ResponseEntity<Map<String, Boolean>> status(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }
            Long userId = Long.valueOf(userDetails.getUsername());
            boolean connected = googleCalendarService.isConnected(userId);
            return ResponseEntity.ok(Map.of("connected", connected));
      }

      @PostMapping("/disconnect")
      public ResponseEntity<Map<String, Boolean>> disconnect(@AuthenticationPrincipal UserDetails userDetails) {
            if (userDetails == null) {
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }
            Long userId = Long.valueOf(userDetails.getUsername());
            googleCalendarService.disconnect(userId);
            return ResponseEntity.ok(Map.of("success", true));
      }
}
