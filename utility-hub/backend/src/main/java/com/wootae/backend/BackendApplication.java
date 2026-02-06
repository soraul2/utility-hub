package com.wootae.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        System.out.println(">>> Current Working Directory: " + System.getProperty("user.dir"));
        java.io.File envFile = new java.io.File(".env");
        System.out.println(">>> Checking for .env file: " + envFile.getAbsolutePath());
        System.out.println(">>> .env exists?: " + envFile.exists());

        SpringApplication.run(BackendApplication.class, args);
    }

}
