package com.expensetracker.service;

import com.expensetracker.dto.summary.CategorySummary;
import com.expensetracker.dto.summary.MonthlySummaryResponse;
import com.expensetracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final TransactionRepository transactionRepository;

    public MonthlySummaryResponse monthlySummary(Long userId, YearMonth month) {
        List<CategorySummary> categories = transactionRepository.summarizeByCategory(
                userId, month.atDay(1), month.atEndOfMonth()
        );

        BigDecimal grandTotal = categories.stream()
                .map(CategorySummary::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new MonthlySummaryResponse(month, categories, grandTotal);
    }
}
