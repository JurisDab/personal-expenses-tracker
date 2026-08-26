package com.expensetracker.service.ai;

import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

/**
 * LangChain4j AI Service: a dynamic proxy that turns this interface into calls against
 * whatever chat model it's built with (a local Ollama model, in this app's case).
 */
public interface TransactionCategorizer {

    @UserMessage("""
            You are categorizing a personal bank transaction for an expense tracker app.
            Transaction description: "{{description}}"

            Choose exactly one category from this list, and respond with ONLY the category
            name exactly as written below, nothing else - no punctuation, no explanation:
            {{categories}}
            """)
    String categorize(@V("description") String description, @V("categories") String categories);
}
