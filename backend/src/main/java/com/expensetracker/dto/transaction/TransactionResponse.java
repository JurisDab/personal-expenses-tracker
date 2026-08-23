package com.expensetracker.dto.transaction;

import com.expensetracker.entity.Transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String categoryColor,
        BigDecimal amount,
        String description,
        LocalDate date
) {
    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getCategory().getId(),
                transaction.getCategory().getName(),
                transaction.getCategory().getColor(),
                transaction.getAmount(),
                transaction.getDescription(),
                transaction.getDate()
        );
    }
}
