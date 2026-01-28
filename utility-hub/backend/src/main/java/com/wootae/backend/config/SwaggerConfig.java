package com.wootae.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

      @Bean
      public OpenAPI openAPI() {
            return new OpenAPI()
                        .info(new Info()
                                    .title("미스틱 타로 (Mystic Tarot) API")
                                    .description("AI 기반 타로 리딩 서비스 API 명세서입니다.")
                                    .version("v0.1"));
      }
}
