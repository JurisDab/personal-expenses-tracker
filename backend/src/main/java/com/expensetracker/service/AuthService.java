package com.expensetracker.service;

import com.expensetracker.dto.auth.AuthResponse;
import com.expensetracker.dto.auth.LoginRequest;
import com.expensetracker.dto.auth.RegisterRequest;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtService;
import com.expensetracker.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Food#F97316", "Travel#0EA5E9", "Transport#8B5CF6", "Entertainment#EC4899",
            "Bills#EF4444", "Shopping#22C55E", "Health#14B8A6", "Other#6B7280"
    );

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setName(request.name());
        userRepository.save(user);

        seedDefaultCategories(user);

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalStateException("User vanished after authentication"));

        String token = jwtService.generateToken(new UserPrincipal(user));
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName());
    }

    private void seedDefaultCategories(User user) {
        for (String entry : DEFAULT_CATEGORIES) {
            String[] parts = entry.split("#");
            Category category = new Category();
            category.setUser(user);
            category.setName(parts[0]);
            category.setColor("#" + parts[1]);
            categoryRepository.save(category);
        }
    }
}
