package backend.repository;

import backend.entity.Transaction;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserOrderByDateDesc(User user);

    List<Transaction> findByUserAndDateBetweenOrderByDateDesc(User user, LocalDate start, LocalDate end);

    List<Transaction> findByUserIdInOrderByDateDesc(List<Long> userIds);

    List<Transaction> findByUserIdInAndDateBetweenOrderByDateDesc(List<Long> userIds, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.date BETWEEN :start AND :end")
    BigDecimal sumByUserAndTypeBetween(@Param("user") User user, @Param("type") String type, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id IN :userIds AND t.type = :type AND t.date BETWEEN :start AND :end")
    BigDecimal sumByUserIdsAndTypeBetween(@Param("userIds") List<Long> userIds, @Param("type") String type, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.date BETWEEN :start AND :end GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategoryForUserAndTypeBetween(@Param("user") User user, @Param("type") String type, @Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id IN :userIds AND t.type = :type AND t.date BETWEEN :start AND :end GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategoryForUserIdsAndTypeBetween(@Param("userIds") List<Long> userIds, @Param("type") String type, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
