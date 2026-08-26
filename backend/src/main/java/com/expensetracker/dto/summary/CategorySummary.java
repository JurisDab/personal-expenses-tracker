package com.expensetracker.dto.summary;

import java.math.BigDecimal;

public record CategorySummary(Long categoryId, String categoryName, String categoryColor, BigDecimal total) {
}
