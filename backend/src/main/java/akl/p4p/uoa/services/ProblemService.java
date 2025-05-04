package akl.p4p.uoa.services;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import akl.p4p.uoa.controllers.repositories.ProblemRepository;
import akl.p4p.uoa.models.Problem;
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.*;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Indexes;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.bson.conversions.Bson;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;


@Service
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.database}")
    String DATABASE_NAME;
    public ProblemService(MongoTemplate mongoTemplate, ProblemRepository problemRepository) {
        this.mongoTemplate = mongoTemplate;
        this.problemRepository = problemRepository;
    }

    public List<Problem> getAllProblems() {
        return problemRepository.findAll();
    }

    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }

    public Problem getMatchingProblemByTitle(String title) {
        return problemRepository.findFirstByTitleIgnoreCase(title.trim());
    }

}
