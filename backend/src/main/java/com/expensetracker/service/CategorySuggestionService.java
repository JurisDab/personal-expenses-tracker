package com.expensetracker.service;

import com.expensetracker.service.ai.TransactionCategorizer;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.service.AiServices;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

/**
 * Suggests a category for a transaction using a local LLM via Ollama. This is a best-effort
 * enhancement, not a dependency: if Ollama isn't installed/running on the machine (the default
 * for anyone who just clones this repo), every call fails fast and callers fall back to their
 * own default category. Nothing about this service ever calls out to the network or costs money.
 */
@Service
public class CategorySuggestionService {

    private static final Logger log = LoggerFactory.getLogger(CategorySuggestionService.class);

    private final TransactionCategorizer categorizer;

    public CategorySuggestionService(
            @Value("${app.ai.ollama.base-url}") String baseUrl,
            @Value("${app.ai.ollama.model}") String model,
            @Value("${app.ai.ollama.timeout-seconds}") long timeoutSeconds
    ) {
        ChatLanguageModel chatModel = OllamaChatModel.builder()
                .baseUrl(baseUrl)
                .modelName(model)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .build();
        this.categorizer = AiServices.create(TransactionCategorizer.class, chatModel);
    }

    /**
     * Returns the best-matching category name from {@code availableCategories}, or empty if
     * the local model is unreachable or returned something that doesn't match any category.
     */
    public Optional<String> suggestCategory(String description, List<String> availableCategories) {
        try {
            String categoriesJoined = String.join(", ", availableCategories);
            String suggestion = categorizer.categorize(description, categoriesJoined).strip();

            return availableCategories.stream()
                    .filter(category -> category.equalsIgnoreCase(suggestion))
                    .findFirst();
        } catch (Exception e) {
            log.debug("Local AI categorization unavailable ({}), falling back to default category", e.getMessage());
            return Optional.empty();
        }
    }
}
