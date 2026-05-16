package backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class ScheduleEventDTO {
    private Long id;
    private Long userId;
    private String username;
    private String title;
    private String description;
    private LocalDate eventDate;
    private LocalDate displayDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String color;
    private boolean recurring;
    private String recurringType;
    private LocalDate recurringEndDate;

    public ScheduleEventDTO() {}

    public ScheduleEventDTO(Long id, Long userId, String username, String title, String description,
                             LocalDate eventDate, LocalDate displayDate, LocalTime startTime, LocalTime endTime,
                             String color, boolean isRecurring, String recurringType, LocalDate recurringEndDate) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.title = title;
        this.description = description;
        this.eventDate = eventDate;
        this.displayDate = displayDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.color = color;
        this.recurring = isRecurring;
        this.recurringType = recurringType;
        this.recurringEndDate = recurringEndDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }
    public LocalDate getDisplayDate() { return displayDate; }
    public void setDisplayDate(LocalDate displayDate) { this.displayDate = displayDate; }
    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }
    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public boolean isRecurring() { return recurring; }
    public void setRecurring(boolean recurring) { this.recurring = recurring; }
    public String getRecurringType() { return recurringType; }
    public void setRecurringType(String recurringType) { this.recurringType = recurringType; }
    public LocalDate getRecurringEndDate() { return recurringEndDate; }
    public void setRecurringEndDate(LocalDate recurringEndDate) { this.recurringEndDate = recurringEndDate; }
}
