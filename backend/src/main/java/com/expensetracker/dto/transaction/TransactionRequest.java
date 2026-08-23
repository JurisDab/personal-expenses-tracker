package com.expensetracker.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull Long categoryId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @Size(max = 255) String description,
        @NotNull LocalDate date
) {
}
