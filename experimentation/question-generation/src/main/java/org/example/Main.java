package org.example;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;

@SpringBootApplication
public class Main implements CommandLineRunner {

	private final ChatService chatService;

	public Main(ChatService chatService) {
		this.chatService = chatService;
	}

	public static void main(String[] args) {
		SpringApplication.run(Main.class, args);
	}

	@Override
	public void run(String... args) throws IOException {
		chatService.run();
	}
}
