package backend.service;

import backend.dto.CreateTransactionRequest;
import backend.dto.TransactionDTO;
import backend.dto.TransactionSummaryDTO;
import backend.entity.Transaction;
import backend.entity.User;
import backend.repository.TransactionRepository;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class MoneyService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public MoneyService(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<TransactionDTO> getTransactions(User currentUser, Integer year, Integer month) {
        if ("ADMIN".equals(currentUser.getRole())) {
            List<User> allUsers = userRepository.findAll();
            List<Long> userIds = allUsers.stream().map(User::getId).toList();
            if (year != null && month != null) {
                LocalDate start = LocalDate.of(year, month, 1);
                LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
                return transactionRepository.findByUserIdInAndDateBetweenOrderByDateDesc(userIds, start, end).stream().map(this::toDTO).toList();
            }
            return transactionRepository.findByUserIdInOrderByDateDesc(userIds).stream().map(this::toDTO).toList();
        }

        if (year != null && month != null) {
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
            return transactionRepository.findByUserAndDateBetweenOrderByDateDesc(currentUser, start, end).stream().map(this::toDTO).toList();
        }
        return transactionRepository.findByUserOrderByDateDesc(currentUser).stream().map(this::toDTO).toList();
    }

    public TransactionSummaryDTO getSummary(User currentUser, Integer year, Integer month) {
        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        BigDecimal totalIncome;
        BigDecimal totalExpense;
        List<Object[]> incomeByCategoryRaw;
        List<Object[]> expenseByCategoryRaw;

        if ("ADMIN".equals(currentUser.getRole())) {
            List<User> allUsers = userRepository.findAll();
            List<Long> userIds = allUsers.stream().map(User::getId).toList();

            totalIncome = transactionRepository.sumByUserIdsAndTypeBetween(userIds, "INCOME", start, end);
            totalExpense = transactionRepository.sumByUserIdsAndTypeBetween(userIds, "EXPENSE", start, end);
            incomeByCategoryRaw = transactionRepository.sumByCategoryForUserIdsAndTypeBetween(userIds, "INCOME", start, end);
            expenseByCategoryRaw = transactionRepository.sumByCategoryForUserIdsAndTypeBetween(userIds, "EXPENSE", start, end);
        } else {
            totalIncome = transactionRepository.sumByUserAndTypeBetween(currentUser, "INCOME", start, end);
            totalExpense = transactionRepository.sumByUserAndTypeBetween(currentUser, "EXPENSE", start, end);
            incomeByCategoryRaw = transactionRepository.sumByCategoryForUserAndTypeBetween(currentUser, "INCOME", start, end);
            expenseByCategoryRaw = transactionRepository.sumByCategoryForUserAndTypeBetween(currentUser, "EXPENSE", start, end);
        }

        List<TransactionSummaryDTO.CategorySummary> incomeByCategory = incomeByCategoryRaw.stream()
                .map(row -> new TransactionSummaryDTO.CategorySummary((String) row[0], (BigDecimal) row[1]))
                .toList();

        List<TransactionSummaryDTO.CategorySummary> expenseByCategory = expenseByCategoryRaw.stream()
                .map(row -> new TransactionSummaryDTO.CategorySummary((String) row[0], (BigDecimal) row[1]))
                .toList();

        BigDecimal profit = totalIncome.subtract(totalExpense);

        return new TransactionSummaryDTO(totalIncome, totalExpense, profit, incomeByCategory, expenseByCategory);
    }

    @Transactional
    public TransactionDTO createTransaction(User currentUser, CreateTransactionRequest request) {
        if (!"INCOME".equals(request.getType()) && !"EXPENSE".equals(request.getType())) {
            throw new RuntimeException("Type must be INCOME or EXPENSE");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be positive");
        }
        if (request.getCategory() == null || request.getCategory().isBlank()) {
            throw new RuntimeException("Category is required");
        }

        Transaction transaction = new Transaction();
        transaction.setUser(currentUser);
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setDescription(request.getDescription());
        transaction.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());

        return toDTO(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionDTO updateTransaction(Long id, User currentUser, CreateTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own transactions");
        }

        if (request.getType() != null) {
            if (!"INCOME".equals(request.getType()) && !"EXPENSE".equals(request.getType())) {
                throw new RuntimeException("Type must be INCOME or EXPENSE");
            }
            transaction.setType(request.getType());
        }
        if (request.getAmount() != null) {
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Amount must be positive");
            }
            transaction.setAmount(request.getAmount());
        }
        if (request.getCategory() != null) {
            transaction.setCategory(request.getCategory());
        }
        if (request.getDescription() != null) {
            transaction.setDescription(request.getDescription());
        }
        if (request.getDate() != null) {
            transaction.setDate(request.getDate());
        }

        return toDTO(transactionRepository.save(transaction));
    }

    @Transactional
    public void deleteTransaction(Long id, User currentUser) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own transactions");
        }

        transactionRepository.delete(transaction);
    }

    private TransactionDTO toDTO(Transaction t) {
        return new TransactionDTO(
                t.getId(), t.getUser().getId(), t.getUser().getUsername(),
                t.getType(), t.getAmount(), t.getCategory(),
                t.getDescription(), t.getDate()
        );
    }
}
