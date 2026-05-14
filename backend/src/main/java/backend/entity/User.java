package backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'MEMBER'")
    private String role = "MEMBER";

    @Column(length = 7, columnDefinition = "VARCHAR(7) DEFAULT '#667eea'")
    private String color = "#667eea";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private FamilyPosition position;

    @Column(name = "date_add", nullable = false, updatable = false)
    private LocalDateTime dateAdd;

    @Column(name = "account_non_locked", nullable = false)
    private boolean accountNonLocked = true;

    @Column(name = "failed_attempt", nullable = false)
    private int failedAttempt = 0;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @PrePersist
    protected void onCreate() {
        this.dateAdd = LocalDateTime.now();
    }

    public User() {}

    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public FamilyPosition getPosition() { return position; }
    public void setPosition(FamilyPosition position) { this.position = position; }
    public LocalDateTime getDateAdd() { return dateAdd; }
    public void setDateAdd(LocalDateTime dateAdd) { this.dateAdd = dateAdd; }
    public boolean isAccountNonLocked() { return accountNonLocked; }
    public void setAccountNonLocked(boolean accountNonLocked) { this.accountNonLocked = accountNonLocked; }
    public int getFailedAttempt() { return failedAttempt; }
    public void setFailedAttempt(int failedAttempt) { this.failedAttempt = failedAttempt; }
    public LocalDateTime getLockTime() { return lockTime; }
    public void setLockTime(LocalDateTime lockTime) { this.lockTime = lockTime; }
}
