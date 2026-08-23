package com.expensetracker.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(max = 50) String name,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "color must be a hex code like #RRGGBB")
        String color
) {
}
