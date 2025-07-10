package akl.p4p.uoa.services;

import akl.p4p.uoa.models.ChatHistory;
import akl.p4p.uoa.repositories.ChatHistoryRepository;
import java.util.ArrayList;
import org.springframework.stereotype.Service;

@Service
public class ChatHistoryService {

  private final ChatHistoryRepository chatHistoryRepository;

  ChatHistoryService(ChatHistoryRepository chatHistoryRepository) {
    this.chatHistoryRepository = chatHistoryRepository;
  }

  /** Loads an existing chat history or creates a new one if none exists yet. */
  public ChatHistory loadOrCreateHistory(String sessionId) {
    return chatHistoryRepository
        .findById(sessionId)
        .orElseGet(
            () -> {
              // no existing session → create & persist a new, empty history
              ChatHistory fresh = new ChatHistory();
              fresh.setSessionId(sessionId);
              fresh.setMessages(new ArrayList<>());
              return chatHistoryRepository.save(fresh);
            });
  }

  public ChatHistory saveHistory(ChatHistory history) {
    return chatHistoryRepository.save(history);
  }
}
