package backend.repository;

import backend.entity.ScheduleEvent;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, Long> {

    List<ScheduleEvent> findByUserAndEventDateBetweenOrderByEventDateAscStartTimeAsc(User user, LocalDate start, LocalDate end);

    @Query("SELECT e FROM ScheduleEvent e WHERE e.user = :user AND e.eventDate < :date AND e.isRecurring = true AND (e.recurringEndDate IS NULL OR e.recurringEndDate >= :endDate) ORDER BY e.eventDate ASC")
    List<ScheduleEvent> findRecurringBeforeDate(@Param("user") User user, @Param("date") LocalDate date, @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM ScheduleEvent e WHERE e.user = :user AND e.isRecurring = true AND (e.recurringEndDate IS NULL OR e.recurringEndDate >= :endDate) ORDER BY e.eventDate ASC")
    List<ScheduleEvent> findRecurringWithEndDate(@Param("user") User user, @Param("endDate") LocalDate endDate);

    List<ScheduleEvent> findByUserAndEventDate(User user, LocalDate date);
}
