package backend.service;

import backend.dto.CreateObjectiveRequest;
import backend.dto.ObjectiveDTO;
import backend.entity.Objective;
import backend.entity.Transaction;
import backend.entity.User;
import backend.repository.ObjectiveRepository;
import backend.repository.TransactionRepository;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ObjectiveService {

    private final ObjectiveRepository objectiveRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public ObjectiveService(ObjectiveRepository objectiveRepository,
                            TransactionRepository transactionRepository,
                            UserRepository userRepository) {
        this.objectiveRepository = objectiveRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public List<ObjectiveDTO> getObjectives(User currentUser, Integer month, Integer year, Long targetUserId) {
        User target = resolveTargetUser(currentUser, targetUserId);
        int m = month != null ? month : LocalDate.now().getMonthValue();
        int y = year != null ? year : LocalDate.now().getYear();

        return objectiveRepository.findByUserAndYearAndMonth(target, y, m).stream()
                .map(obj -> toDTO(obj, target))
                .toList();
    }

    @Transactional
    public ObjectiveDTO createObjective(User currentUser, CreateObjectiveRequest request) {
        if (!"MONTHLY_EXPENSE_LIMIT".equals(request.getType()) && !"MONTHLY_SAVINGS_GOAL".equals(request.getType())
                && !"CATEGORY_LIMIT".equals(request.getType())) {
            throw new RuntimeException("Invalid objective type");
        }
        if (request.getTargetAmount() == null || request.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Target amount must be positive");
        }

        Objective obj = new Objective();
        obj.setUser(currentUser);
        obj.setType(request.getType());
        obj.setCategory(request.getCategory());
        obj.setTargetAmount(request.getTargetAmount());
        obj.setMonth(request.getMonth());
        obj.setYear(request.getYear());

        return toDTO(objectiveRepository.save(obj), currentUser);
    }

    @Transactional
    public ObjectiveDTO updateObjective(Long id, User currentUser, CreateObjectiveRequest request) {
        Objective obj = objectiveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Objective not found"));

        if (!obj.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own objectives");
        }

        if (request.getTargetAmount() != null) {
            if (request.getTargetAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Target amount must be positive");
            }
            obj.setTargetAmount(request.getTargetAmount());
        }
        if (request.getCategory() != null) obj.setCategory(request.getCategory());
        if (request.getType() != null) obj.setType(request.getType());
        if (request.getMonth() > 0) obj.setMonth(request.getMonth());
        if (request.getYear() > 0) obj.setYear(request.getYear());

        return toDTO(objectiveRepository.save(obj), currentUser);
    }

    @Transactional
    public void deleteObjective(Long id, User currentUser) {
        Objective obj = objectiveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Objective not found"));

        if (!obj.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own objectives");
        }

        objectiveRepository.delete(obj);
    }

    private ObjectiveDTO toDTO(Objective obj, User target) {
        LocalDate start = LocalDate.of(obj.getYear(), obj.getMonth(), 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        BigDecimal currentAmount = BigDecimal.ZERO;
        if ("MONTHLY_EXPENSE_LIMIT".equals(obj.getType()) || "CATEGORY_LIMIT".equals(obj.getType())) {
            if (obj.getCategory() != null) {
                List<Transaction> txns = transactionRepository
                        .findByUserAndDateBetweenOrderByDateDesc(target, start, end);
                currentAmount = txns.stream()
                        .filter(t -> "EXPENSE".equals(t.getType()) && obj.getCategory().equals(t.getCategory()))
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            } else {
                currentAmount = transactionRepository.sumByUserAndTypeBetween(target, "EXPENSE", start, end);
            }
        } else if ("MONTHLY_SAVINGS_GOAL".equals(obj.getType())) {
            BigDecimal income = transactionRepository.sumByUserAndTypeBetween(target, "INCOME", start, end);
            BigDecimal expense = transactionRepository.sumByUserAndTypeBetween(target, "EXPENSE", start, end);
            currentAmount = income.subtract(expense);
            if (currentAmount.compareTo(BigDecimal.ZERO) < 0) currentAmount = BigDecimal.ZERO;
        }

        return new ObjectiveDTO(obj.getId(), target.getId(), target.getUsername(),
                obj.getCategory(), obj.getType(), obj.getTargetAmount(), currentAmount,
                obj.getMonth(), obj.getYear());
    }

    private User resolveTargetUser(User currentUser, Long targetUserId) {
        if ("ADMIN".equals(currentUser.getRole()) && targetUserId != null) {
            return userRepository.findById(targetUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        return currentUser;
    }
}
