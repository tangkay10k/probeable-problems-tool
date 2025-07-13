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

  public ChatHistory loadHistory(String sessionId) {
    return chatHistoryRepository.findById(sessionId).orElse(null);
  }

  public ChatHistory saveHistory(ChatHistory history) {
    return chatHistoryRepository.save(history);
  }
}
