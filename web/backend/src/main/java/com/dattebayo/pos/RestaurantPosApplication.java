package com.dattebayo.pos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.util.TimeZone;

@SpringBootApplication
public class RestaurantPosApplication {
    public static void main(String[] args) {
        // Ensure JVM default timezone is set for the application
        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
        SpringApplication.run(RestaurantPosApplication.class, args);
    }
}
