package backend.dto;

import java.math.BigDecimal;

public class ObjectiveDTO {
    private Long id;
    private Long userId;
    private String username;
    private String category;
    private String type;
    private BigDecimal targetAmount;
    private BigDecimal currentAmount;
    private int month;
    private int year;

    public ObjectiveDTO() {}

    public ObjectiveDTO(Long id, Long userId, String username, String category, String type,
                         BigDecimal targetAmount, BigDecimal currentAmount, int month, int year) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.category = category;
        this.type = type;
        this.targetAmount = targetAmount;
        this.currentAmount = currentAmount;
        this.month = month;
        this.year = year;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }
    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
}
