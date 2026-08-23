package com.expensetracker.dto.auth;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        String name
) {
}
