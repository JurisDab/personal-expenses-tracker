package com.expensetracker.controller;

import com.expensetracker.dto.summary.MonthlySummaryResponse;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping("/monthly")
    public MonthlySummaryResponse monthly(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month
    ) {
        return summaryService.monthlySummary(principal.getId(), month);
    }
}
