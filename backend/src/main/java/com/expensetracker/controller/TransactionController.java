package com.expensetracker.controller;

import com.expensetracker.dto.transaction.TransactionRequest;
import com.expensetracker.dto.transaction.TransactionResponse;
import com.expensetracker.security.UserPrincipal;
import com.expensetracker.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public Page<TransactionResponse> list(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month,
                                          @RequestParam(required = false) Long categoryId,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return transactionService.list(principal.getId(), month, categoryId, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody TransactionRequest request
    ) {
        return transactionService.create(principal.getId(), request);
    }

    @PutMapping("/{id}")
    public TransactionResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request
    ) {
        return transactionService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        transactionService.delete(principal.getId(), id);
    }
}
