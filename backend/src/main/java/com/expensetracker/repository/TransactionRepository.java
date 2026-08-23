package com.expensetracker.repository;

import com.expensetracker.dto.summary.CategorySummary;
import com.expensetracker.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    boolean existsByCategoryIdAndUserId(Long categoryId, Long userId);

    @Query("""
            SELECT t FROM Transaction t
            WHERE t.user.id = :userId
              AND t.date BETWEEN :start AND :end
              AND (:categoryId IS NULL OR t.category.id = :categoryId)
            ORDER BY t.date DESC, t.id DESC
            """)
    Page<Transaction> findForUser(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("categoryId") Long categoryId,
            Pageable pageable
    );

    @Query("""
            SELECT new com.expensetracker.dto.summary.CategorySummary(
                c.id, c.name, c.color, COALESCE(SUM(t.amount), 0)
            )
            FROM Category c
            LEFT JOIN Transaction t
                ON t.category = c
                AND t.user.id = :userId
                AND t.date BETWEEN :start AND :end
            WHERE c.user.id = :userId
            GROUP BY c.id, c.name, c.color
            ORDER BY c.name ASC
            """)
    java.util.List<CategorySummary> summarizeByCategory(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );
}
