package com.wootae.backend.global.auth;

import com.wootae.backend.domain.user.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

      private final JwtAuthenticationFilter jwtAuthenticationFilter;
      private final CustomOAuth2UserService customOAuth2UserService;
      private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
      // [개선] 프로파일별 CORS 설정을 위해 Environment 주입
      private final Environment environment;

      @Bean
      public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
      }

      @Bean
      public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http
                        .csrf(AbstractHttpConfigurer::disable)
                        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                        .formLogin(AbstractHttpConfigurer::disable)
                        .httpBasic(AbstractHttpConfigurer::disable)

                        .authorizeHttpRequests(auth -> auth
                                    // Auth
                                    .requestMatchers("/api/auth/**").permitAll()
                                    .requestMatchers("/login/oauth2/**").permitAll()
                                    // OAuth2 인증 엔드포인트 허용
                                    .requestMatchers("/api/oauth2/authorization/**").permitAll()
                                    .requestMatchers("/oauth2/authorization/**").permitAll()
                                    // Public
                                    .requestMatchers("/", "/css/**", "/images/**", "/js/**", "/favicon.ico").permitAll()
                                    // Google Calendar OAuth callback (public - uses state JWT for auth)
                                    .requestMatchers("/api/calendar/google/callback").permitAll()
                                    // Features (Public for now)
                                    .requestMatchers("/api/tarot/**", "/api/text-to-md/**").permitAll()
                                    // Swagger
                                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                                    // Others: Authenticated
                                    .anyRequest().authenticated())

                        .oauth2Login(oauth2 -> oauth2
                                    // OAuth2 인증 요청 경로 설정 (프론트엔드와 일치)
                                    .authorizationEndpoint(authorization -> authorization
                                                .baseUri("/api/oauth2/authorization"))
                                    .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                                    .successHandler(oAuth2AuthenticationSuccessHandler))

                        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
      }

      @Bean
      public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration configuration = new CorsConfiguration();
            
            // [개선] CORS 설정을 프로파일별로 분리 (@Value 사용)
            String allowedOrigins = environment.getProperty("cors.allowed-origins", "*");
            
            if ("*".equals(allowedOrigins)) {
                  // dev 환경: 모든 도메인 허용
                  configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
            } else {
                  // prod 환경: 화이트리스트 기반 도메인만 허용
                  List<String> origins = Arrays.asList(allowedOrigins.split(","));
                  configuration.setAllowedOrigins(origins);
            }
            
            configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(Collections.singletonList("*"));
            configuration.setAllowCredentials(true);

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", configuration);
            return source;
      }
}
