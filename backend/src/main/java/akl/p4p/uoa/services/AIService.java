package akl.p4p.uoa.services;

import com.mongodb.lang.Nullable;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AIService {

	private final ChatClient chatClient;

	public AIService(ChatClient.Builder chatClientBuilder) {
		this.chatClient = chatClientBuilder.build();
	}

	/**
	 * Used for executing an LLM call one time, chat history is not maintained.
	 * @param systemPrompt is the system prompt to send to the LLM to execute request.
	 * @param responseSchema is the schema type of the response format which are defined in {@link akl.p4p.uoa.data.JsonSchemaDefinition}
	 * if not supplied (null) the response format defaults to a string.
	 */
	public String executeOneTimeLLMCall(String systemPrompt, @Nullable String responseSchema) {

		var responseFormat = getResponseType(responseSchema);

		List<Message> history = new ArrayList<>();
		history.add(new SystemMessage(systemPrompt));
		OpenAiChatOptions options = OpenAiChatOptions.builder()
			.model(OpenAiApi.ChatModel.O3)
			.temperature(1D)
			.responseFormat(responseFormat)
			.build();
		String assistantReply = chatClient.prompt().options(options).messages(history).call().content();

		//TODO: correctly deserialize json format when not text.

		return assistantReply;
	}

	public ResponseFormat getResponseType(String responseSchema) {
		ResponseFormat responseFormat = new ResponseFormat();
		if (responseSchema != null) {
			responseFormat.setType(ResponseFormat.Type.JSON_SCHEMA);
			responseFormat.setSchema(responseSchema);
		} else {
			responseFormat.setType(ResponseFormat.Type.TEXT);
		}
		return responseFormat;
	}



}
