package org.example;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;

@SpringBootApplication
public class Main implements CommandLineRunner {

    private final CodeService codeService;

    public Main(CodeService codeService) {
        this.codeService = codeService;
    }

    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
    }

    @Override
    public void run(String... args) throws IOException, InterruptedException {
        codeService.run();
    }
}
