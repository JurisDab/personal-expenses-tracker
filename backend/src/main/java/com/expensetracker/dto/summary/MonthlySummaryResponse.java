package com.expensetracker.dto.summary;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public record MonthlySummaryResponse(YearMonth month, List<CategorySummary> categories, BigDecimal grandTotal) {
}
