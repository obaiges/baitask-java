package backend.dto;

public class FamilyMemberDTO {
    private Long id;
    private String username;
    private String role;
    private Long positionId;
    private String positionName;
    private String color;

    public FamilyMemberDTO() {}

    public FamilyMemberDTO(Long id, String username, String role, Long positionId, String positionName, String color) {
        this.id = id;
        this.username = username;
        this.role = role;
        this.positionId = positionId;
        this.positionName = positionName;
        this.color = color;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Long getPositionId() { return positionId; }
    public void setPositionId(Long positionId) { this.positionId = positionId; }
    public String getPositionName() { return positionName; }
    public void setPositionName(String positionName) { this.positionName = positionName; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
