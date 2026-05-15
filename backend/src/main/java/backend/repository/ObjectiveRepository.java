package backend.repository;

import backend.entity.Objective;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjectiveRepository extends JpaRepository<Objective, Long> {
    List<Objective> findByUserAndYearAndMonth(User user, int year, int month);
    List<Objective> findByUser(User user);
}
