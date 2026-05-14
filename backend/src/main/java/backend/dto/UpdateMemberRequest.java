package backend.dto;

public class UpdateMemberRequest {
    private Long positionId;
    private String color;
    private String role;

    public Long getPositionId() { return positionId; }
    public void setPositionId(Long positionId) { this.positionId = positionId; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
