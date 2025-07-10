package akl.p4p.uoa.repositories;

import akl.p4p.uoa.models.ChatHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatHistoryRepository extends MongoRepository<ChatHistory, String> {
}
