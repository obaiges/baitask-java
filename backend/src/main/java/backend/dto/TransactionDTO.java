package backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TransactionDTO {
    private Long id;
    private Long userId;
    private String username;
    private String type;
    private BigDecimal amount;
    private String category;
    private String description;
    private LocalDate date;

    public TransactionDTO() {}

    public TransactionDTO(Long id, Long userId, String username, String type, BigDecimal amount, String category, String description, LocalDate date) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.description = description;
        this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
