package backend.service;

import backend.dto.CreateScheduleEventRequest;
import backend.dto.ScheduleEventDTO;
import backend.entity.ScheduleEvent;
import backend.entity.User;
import backend.repository.ScheduleEventRepository;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleEventRepository scheduleEventRepository;
    private final UserRepository userRepository;

    public ScheduleService(ScheduleEventRepository scheduleEventRepository, UserRepository userRepository) {
        this.scheduleEventRepository = scheduleEventRepository;
        this.userRepository = userRepository;
    }

    public List<ScheduleEventDTO> getEvents(User currentUser, Integer year, Integer month, Long targetUserId) {
        User target = resolveTargetUser(currentUser, targetUserId);

        if (year == null) year = LocalDate.now().getYear();
        if (month == null) month = LocalDate.now().getMonthValue();

        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = monthStart.withDayOfMonth(monthStart.lengthOfMonth());

        List<ScheduleEventDTO> result = new ArrayList<>();

        // 1. Non-recurring events within the month
        List<ScheduleEvent> nonRecurring = scheduleEventRepository
                .findByUserAndEventDateBetweenOrderByEventDateAscStartTimeAsc(target, monthStart, monthEnd)
                .stream()
                .filter(e -> !e.isRecurring())
                .toList();
        for (ScheduleEvent e : nonRecurring) {
            result.add(toDTO(e, e.getEventDate()));
        }

        // 2. Recurring events that may have instances in this month
        List<ScheduleEvent> recurringEvents = scheduleEventRepository
                .findRecurringWithEndDate(target, monthStart);

        for (ScheduleEvent event : recurringEvents) {
            LocalDate baseDate = event.getEventDate();
            LocalDate endBound = event.getRecurringEndDate() != null
                    ? event.getRecurringEndDate().isBefore(monthEnd) ? event.getRecurringEndDate() : monthEnd
                    : monthEnd;

            List<LocalDate> instances = generateInstances(baseDate, monthStart, endBound, event.getRecurringType());
            for (LocalDate d : instances) {
                result.add(toDTO(event, d));
            }
        }

        result.sort((a, b) -> {
            int cmp = a.getDisplayDate().compareTo(b.getDisplayDate());
            if (cmp != 0) return cmp;
            if (a.getStartTime() == null && b.getStartTime() == null) return 0;
            if (a.getStartTime() == null) return -1;
            if (b.getStartTime() == null) return 1;
            return a.getStartTime().compareTo(b.getStartTime());
        });

        return result;
    }

    private List<LocalDate> generateInstances(LocalDate baseDate, LocalDate monthStart, LocalDate monthEnd, String recurringType) {
        List<LocalDate> instances = new ArrayList<>();
        if (recurringType == null) return instances;

        LocalDate cursor = baseDate;
        int maxIterations = 5000;
        int iterations = 0;

        switch (recurringType) {
            case "DAILY" -> {
                while (!cursor.isAfter(monthEnd) && iterations < maxIterations) {
                    if (!cursor.isBefore(monthStart)) {
                        instances.add(cursor);
                    }
                    cursor = cursor.plusDays(1);
                    iterations++;
                }
            }
            case "WEEKLY" -> {
                DayOfWeek dayOfWeek = baseDate.getDayOfWeek();
                cursor = monthStart.with(TemporalAdjusters.nextOrSame(dayOfWeek));
                while (!cursor.isAfter(monthEnd) && iterations < maxIterations) {
                    if (!cursor.isBefore(baseDate) && !cursor.isBefore(monthStart)) {
                        instances.add(cursor);
                    }
                    cursor = cursor.plusWeeks(1);
                    iterations++;
                }
            }
            case "MONTHLY" -> {
                int dayOfMonth = Math.min(baseDate.getDayOfMonth(), monthEnd.lengthOfMonth());
                cursor = LocalDate.of(monthStart.getYear(), monthStart.getMonth(), dayOfMonth);
                while (!cursor.isAfter(monthEnd) && iterations < maxIterations) {
                    if (!cursor.isBefore(baseDate) && !cursor.isBefore(monthStart)) {
                        instances.add(cursor);
                    }
                    cursor = cursor.plusMonths(1);
                    if (cursor.getMonth() == monthStart.getMonth()) break;
                    iterations++;
                }
            }
            case "YEARLY" -> {
                try {
                    int day = Math.min(baseDate.getDayOfMonth(), monthEnd.lengthOfMonth());
                    if (monthStart.getMonthValue() == baseDate.getMonth().getValue() || monthStart.getMonthValue() < baseDate.getMonth().getValue()) {
                        int year = monthStart.getMonthValue() <= baseDate.getMonth().getValue()
                                ? monthStart.getYear()
                                : monthStart.getYear() + 1;
                        cursor = LocalDate.of(year, baseDate.getMonth(), Math.min(day, monthEnd.lengthOfMonth()));
                    } else {
                        cursor = monthEnd.plusDays(1);
                    }
                } catch (Exception e) {
                    cursor = monthEnd.plusDays(1);
                }
                if (!cursor.isBefore(monthStart) && !cursor.isAfter(monthEnd) && !cursor.isBefore(baseDate)) {
                    instances.add(cursor);
                }
            }
        }

        return instances;
    }

    @Transactional
    public ScheduleEventDTO createEvent(User currentUser, CreateScheduleEventRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Title is required");
        }
        if (request.getDate() == null) {
            throw new RuntimeException("Date is required");
        }

        ScheduleEvent event = new ScheduleEvent();
        event.setUser(currentUser);
        event.setTitle(request.getTitle().trim());
        event.setDescription(request.getDescription());
        event.setEventDate(request.getDate());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setColor(request.getColor());
        event.setRecurring(request.getRecurring() != null && request.getRecurring());
        if (event.isRecurring()) {
            if (request.getRecurringType() == null || request.getRecurringType().isBlank()) {
                throw new RuntimeException("Recurring type is required for recurring events");
            }
            event.setRecurringType(request.getRecurringType());
            event.setRecurringEndDate(request.getRecurringEndDate());
        }

        return toDTO(scheduleEventRepository.save(event), event.getEventDate());
    }

    @Transactional
    public ScheduleEventDTO updateEvent(Long id, User currentUser, CreateScheduleEventRequest request) {
        ScheduleEvent event = scheduleEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own events");
        }

        if (request.getTitle() != null) {
            if (request.getTitle().isBlank()) throw new RuntimeException("Title cannot be empty");
            event.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getDate() != null) event.setEventDate(request.getDate());
        if (request.getStartTime() != null) event.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) event.setEndTime(request.getEndTime());
        if (request.getColor() != null) event.setColor(request.getColor());
        if (request.getRecurring() != null) {
            event.setRecurring(request.getRecurring());
            if (request.getRecurring()) {
                if (request.getRecurringType() == null || request.getRecurringType().isBlank()) {
                    throw new RuntimeException("Recurring type is required for recurring events");
                }
                event.setRecurringType(request.getRecurringType());
                event.setRecurringEndDate(request.getRecurringEndDate());
            } else {
                event.setRecurringType(null);
                event.setRecurringEndDate(null);
            }
        }

        return toDTO(scheduleEventRepository.save(event), event.getEventDate());
    }

    @Transactional
    public void deleteEvent(Long id, User currentUser) {
        ScheduleEvent event = scheduleEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own events");
        }

        scheduleEventRepository.delete(event);
    }

    private User resolveTargetUser(User currentUser, Long targetUserId) {
        if (targetUserId != null) {
            return userRepository.findById(targetUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        return currentUser;
    }

    private ScheduleEventDTO toDTO(ScheduleEvent event, LocalDate displayDate) {
        return new ScheduleEventDTO(
                event.getId(), event.getUser().getId(), event.getUser().getUsername(),
                event.getTitle(), event.getDescription(),
                event.getEventDate(), displayDate,
                event.getStartTime(), event.getEndTime(),
                event.getColor(), event.isRecurring(),
                event.getRecurringType(), event.getRecurringEndDate()
        );
    }
}
