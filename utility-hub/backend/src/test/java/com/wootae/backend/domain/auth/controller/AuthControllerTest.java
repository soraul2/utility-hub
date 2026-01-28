package com.wootae.backend.domain.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.auth.dto.AuthDTOs;
import com.wootae.backend.domain.auth.service.AuthService;
import com.wootae.backend.domain.member.entity.Member;
import com.wootae.backend.domain.member.entity.Role;
import com.wootae.backend.domain.member.entity.AuthProvider;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import jakarta.servlet.http.Cookie;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

      @Autowired
      private MockMvc mockMvc;

      @MockBean
      private AuthService authService;

      // LoginUserArgumentResolver depends on AuthTokenRepository, so we might need to
      // mock it if it's not scanned.
      // However, in @WebMvcTest, usually only the controller is loaded.
      // Since my LoginUserArgumentResolver is a component/bean, I need to make sure
      // it's available or mocked?
      // Actually, @WebMvcTest might not pick up the ArgumentResolver automatically
      // unless I explicitly verify.
      // But let's assume for now I mocking the Service response behavior.

      // NOTE: Because LoginUserArgumentResolver is registered in WebConfig, and
      // WebMvcTest loads WebConfig (usually),
      // it requires AuthTokenRepository to be present in the context.
      // I should probably Mock the repository used by the resolver.

      @MockBean
      private com.wootae.backend.domain.auth.repository.AuthTokenRepository authTokenRepository;

      @Autowired
      private ObjectMapper objectMapper;

      @Test
      void signup_Success() throws Exception {
            AuthDTOs.SignupRequest request = new AuthDTOs.SignupRequest();
            request.setEmail("test@example.com");
            request.setPassword("password");
            request.setName("Test User");

            mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                        .andExpect(status().isOk());
      }

      @Test
      void login_Success_SetsCookie() throws Exception {
            AuthDTOs.LoginRequest request = new AuthDTOs.LoginRequest();
            request.setEmail("test@example.com");
            request.setPassword("password");

            String fakeToken = UUID.randomUUID().toString();
            given(authService.login(any(AuthDTOs.LoginRequest.class))).willReturn(fakeToken);

            mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                        .andExpect(status().isOk())
                        .andExpect(cookie().value("accessToken", fakeToken))
                        .andExpect(cookie().httpOnly("accessToken", true))
                        .andExpect(cookie().path("accessToken", "/"));
      }

      @Test
      void logout_Success_ClearsCookie() throws Exception {
            mockMvc.perform(post("/api/auth/logout"))
                        .andExpect(status().isOk())
                        .andExpect(cookie().maxAge("accessToken", 0));
      }
}
