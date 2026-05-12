package backend.dto;

public class AuthResponse {
    private Long id;
    private String username;
    private String accessToken;
    private String refreshToken;
    private String message;

    public AuthResponse() {}

    public AuthResponse(Long id, String username, String accessToken, String refreshToken, String message) {
        this.id = id;
        this.username = username;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.message = message;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
