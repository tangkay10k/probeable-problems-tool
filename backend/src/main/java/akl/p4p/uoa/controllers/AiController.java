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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.ai.chat.messages.Message;

import akl.p4p.uoa.data.ThoughtProcess;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.data.JsonSchemaDefinition;
import akl.p4p.uoa.data.Prompts;
import akl.p4p.uoa.services.ProblemService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/ai")
class AiController {
  private static final String SESSION_KEY = "twoSumHistory";

  private final ChatClient chatClient;

  private final ProblemService problemService;

  public AiController(ChatClient.Builder chatClientBuilder, ProblemService problemService) {
    this.chatClient = chatClientBuilder.build();
    this.problemService = problemService;
  }

  @PostMapping()
  public String generation(@RequestBody ThoughtProcess thought, HttpSession session) {
    @SuppressWarnings("unchecked")
    List<Message> history = (List<Message>) session
        .getAttribute(SESSION_KEY);

    if (history == null) {
      history = new ArrayList<>();

      // Format system prompt:
      String sysPrompt = Prompts.thoughtProcessVerifier();
      String problemId = thought.getProblemId();
      Problem problem = problemService.getProblemById(problemId);

      String prompt = sysPrompt.replace("//VAR_MODEL_ANSWER", problem.getModelAnswer());

      history.add(new SystemMessage(prompt));
      session.setAttribute(SESSION_KEY, history);
    }

    history.add(new UserMessage(thought.getInput()));

    String jsonSchema = JsonSchemaDefinition.getProbeSchema();

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
