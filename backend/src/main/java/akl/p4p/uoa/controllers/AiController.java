package akl.p4p.uoa.controllers;

import java.util.ArrayList;
import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi.ChatModel;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.ai.chat.messages.Message;

import akl.p4p.uoa.data.Input;
import akl.p4p.uoa.data.Prompts;
import jakarta.servlet.http.HttpSession;

@RestController
class AiController {
  private static final String SESSION_KEY = "twoSumHistory";

  private final ChatClient chatClient;

  public AiController(ChatClient.Builder chatClientBuilder) {
    this.chatClient = chatClientBuilder.build();
  }

  @PostMapping("/ai")
  public String generation(@RequestBody Input request, HttpSession session) {
    @SuppressWarnings("unchecked")
    List<Message> history = (List<Message>) session
        .getAttribute(SESSION_KEY);

    if (history == null) {
      history = new ArrayList<>();

      history.add(new SystemMessage(Prompts.thoughtProcessVerifier()));
      session.setAttribute(SESSION_KEY, history);
    }


    history.add(new UserMessage(request.getInput()));


    String jsonSchema = """
        {
          "type": "object",
          "properties": {
            "is_valid":   { "type": "boolean" },
            "explanation":{ "type": "string"  }
          },
          "required": ["is_valid", "explanation"],
          "additionalProperties": false
        }
        """;

    OpenAiChatOptions options = OpenAiChatOptions.builder()
        .model(ChatModel.GPT_4_O_MINI)
        .responseFormat(
            new ResponseFormat(ResponseFormat.Type.JSON_SCHEMA, jsonSchema))
        .build();


    String assistantReply = chatClient
        .prompt()
        .options(options)
        .messages(history) 
        .call()
        .content();


    history.add(new AssistantMessage(assistantReply));

    return assistantReply; 
  }
}
