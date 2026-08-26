package com.expensetracker.service;

import com.expensetracker.dto.transaction.ImportResult;
import com.expensetracker.entity.Category;
import com.expensetracker.entity.Transaction;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.CategoryRepository;
import com.expensetracker.repository.TransactionRepository;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PushbackInputStream;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

/**
 * Imports a Swedbank (Baltics) account statement CSV export. The export has no header row;
 * each line is: IBAN, record type, date, counterparty name, description, amount, currency,
 * debit/credit indicator, reference, ...additional bank-internal columns.
 * Only debit ("D") rows of record type "20" (an actual transaction, not an opening/closing
 * balance line) in EUR are imported — this app tracks expenses only.
 */
@Service
@RequiredArgsConstructor
public class TransactionImportService {

    private static final String RECORD_TYPE_TRANSACTION = "20";
    private static final String INDICATOR_DEBIT = "D";
    private static final String CURRENCY = "EUR";
    private static final int MIN_COLUMNS = 8;
    private static final int MAX_DESCRIPTION_LENGTH = 255;

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public ImportResult importCsv(Long userId, MultipartFile file) throws IOException {
        Category fallbackCategory = resolveFallbackCategory(userId);
        User user = userRepository.getReferenceById(userId);

        int totalRows = 0;
        int imported = 0;
        int skipped = 0;
        int duplicates = 0;

        try (Reader reader = openWithoutBom(file);
             CSVParser parser = CSVFormat.DEFAULT.builder().setTrim(true).build().parse(reader)) {

            for (CSVRecord record : parser) {
                totalRows++;

                if (!isImportableExpenseRow(record)) {
                    skipped++;
                    continue;
                }

                LocalDate date;
                BigDecimal amount;
                try {
                    date = LocalDate.parse(record.get(2));
                    amount = new BigDecimal(record.get(5));
                } catch (Exception parseError) {
                    skipped++;
                    continue;
                }

                String description = describeRow(record);

                if (transactionRepository.existsByUserIdAndDateAndAmountAndDescription(
                        userId, date, amount, description)) {
                    duplicates++;
                    continue;
                }

                Transaction transaction = new Transaction();
                transaction.setUser(user);
                transaction.setCategory(fallbackCategory);
                transaction.setAmount(amount);
                transaction.setDescription(description);
                transaction.setDate(date);
                transactionRepository.save(transaction);
                imported++;
            }
        }

        return new ImportResult(totalRows, imported, skipped, duplicates);
    }

    private boolean isImportableExpenseRow(CSVRecord record) {
        if (record.size() < MIN_COLUMNS) {
            return false;
        }
        return RECORD_TYPE_TRANSACTION.equals(record.get(1))
                && CURRENCY.equals(record.get(6))
                && INDICATOR_DEBIT.equals(record.get(7));
    }

    private String describeRow(CSVRecord record) {
        String counterparty = record.get(3).trim();
        String raw = !counterparty.isEmpty() ? counterparty : record.get(4).trim();
        return raw.length() > MAX_DESCRIPTION_LENGTH ? raw.substring(0, MAX_DESCRIPTION_LENGTH) : raw;
    }

    private Category resolveFallbackCategory(Long userId) {
        List<Category> categories = categoryRepository.findAllByUserIdOrderByNameAsc(userId);
        if (categories.isEmpty()) {
            throw new ResourceNotFoundException("Create at least one category before importing transactions");
        }
        return categories.stream()
                .filter(c -> c.getName().equalsIgnoreCase("Other"))
                .findFirst()
                .orElse(categories.get(0));
    }

    private Reader openWithoutBom(MultipartFile file) throws IOException {
        PushbackInputStream stream = new PushbackInputStream(file.getInputStream(), 3);
        byte[] bom = new byte[3];
        int read = stream.read(bom, 0, 3);
        if (read != 3 || bom[0] != (byte) 0xEF || bom[1] != (byte) 0xBB || bom[2] != (byte) 0xBF) {
            stream.unread(bom, 0, Math.max(read, 0));
        }
        return new InputStreamReader(stream, StandardCharsets.UTF_8);
    }
}
