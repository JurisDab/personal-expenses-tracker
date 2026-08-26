package com.expensetracker.dto.transaction;

public record ImportResult(
        int totalRows,
        int imported,
        int skipped,
        int duplicates
) {
}
