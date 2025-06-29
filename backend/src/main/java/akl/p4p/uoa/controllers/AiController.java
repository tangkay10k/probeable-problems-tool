package akl.p4p.uoa.controllers;

import akl.p4p.uoa.data.JsonSchemaDefinition;
import akl.p4p.uoa.data.Prompts;
import akl.p4p.uoa.data.QuestionRequest;
import akl.p4p.uoa.models.Problem;
import akl.p4p.uoa.services.AIService;
import akl.p4p.uoa.services.ProblemService;

import jakarta.servlet.http.HttpSession;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.OpenAiApi.ChatModel;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/ai")
class AiController {
    private final ChatClient chatClient;

	@Autowired
	AIService aiService;

	@Autowired
	ProblemService problemService;

    public AiController(ChatClient.Builder chatClientBuilder, ProblemService problemService) {
        this.chatClient = chatClientBuilder.build();
        this.problemService = problemService;
    }

	/**
	 * Endpoint to generate constraints for a given question. Note that this endpoint does not persist the
	 * constraints generated in any database, but is sent back to the client for review / iteration.
	 * */
    @PostMapping("/constraints")
    public ResponseEntity<Problem> generateProblemConstraints(@RequestBody Problem problem) {
        String modelAnswer = problem.getModelAnswer();

		String basePrompt = Prompts.getConstraintsGenerationPrompt();
		String sysPrompt = basePrompt.replace("//VAR_MODEL_SOLUTION", modelAnswer);
		String constraints = aiService.executeOneTimeLLMCall(sysPrompt, null);

		problem.setConstraints(constraints);
		return ResponseEntity.ok(problem);
    }



    @PostMapping("/duplicate")
    public String checkDuplicateQuestion(@RequestBody QuestionRequest request) {
        String jsonSchema = JsonSchemaDefinition.getDuplicateQuestionSchema();

        OpenAiChatOptions options =
                OpenAiChatOptions.builder()
                        .model(ChatModel.O1)
                        .temperature(1D)
                        .responseFormat(
                                new ResponseFormat(ResponseFormat.Type.JSON_SCHEMA, jsonSchema))
                        .build();

        String prompt =
                Prompts.duplicateQuestionVerifier()
                        .formatted(
                                String.join(", ", request.getQuestionsAsked()), request.getProbe());

        String assistantReply = chatClient.prompt(prompt).options(options).call().content();

        return assistantReply;
    }
}
