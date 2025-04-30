package akl.p4p.uoa.controllers;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import akl.p4p.uoa.data.Input;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
class AiController {
    private final ChatClient chatClient;

    public AiController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/ai")
    String generation(@RequestParam String request) {
        return this.chatClient.prompt()
            .user(request)
            .call()
            .content();
    }
}