package com.wootae.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

      @Override
      public void addResourceHandlers(ResourceHandlerRegistry registry) {
            registry.addResourceHandler("/images/**")
                        .addResourceLocations("classpath:/static/images/");
      }

      @Override
      public void addCorsMappings(CorsRegistry registry) {
            registry.addMapping("/**")
                        .allowedOriginPatterns("http://localhost:3000", "http://localhost:5173",
                                    "https://hub.wootae.com","http://127.0.0.1:5173", "http://*:5173") // React Dev Server
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowCredentials(true); // Essential for Cookies
      }
}
