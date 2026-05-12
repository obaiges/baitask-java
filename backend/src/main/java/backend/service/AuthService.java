package backend.service;

import backend.dto.AuthResponse;
import backend.dto.LoginRequest;
import backend.dto.RegisterRequest;
import backend.entity.RefreshToken;
import backend.entity.User;
import backend.repository.RefreshTokenRepository;
import backend.repository.UserRepository;
import backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final int maxAttempts;
    private final long lockDurationMinutes;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            @Value("${rate-limit.max-attempts}") int maxAttempts,
            @Value("${rate-limit.lock-duration-minutes}") long lockDurationMinutes) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.maxAttempts = maxAttempts;
        this.lockDurationMinutes = lockDurationMinutes;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User(request.getUsername(), passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = createRefreshToken(user);

        return new AuthResponse(user.getId(), user.getUsername(), accessToken, refreshToken, "User registered successfully");
    }

    @Transactional(noRollbackFor = RuntimeException.class)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!user.isAccountNonLocked()) {
            if (user.getLockTime() != null && user.getLockTime().plusMinutes(lockDurationMinutes).isBefore(LocalDateTime.now())) {
                user.setAccountNonLocked(true);
                user.setFailedAttempt(0);
                user.setLockTime(null);
                userRepository.save(user);
            } else {
                throw new RuntimeException("Account is locked due to too many failed attempts. Try again later.");
            }
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedAttempt(user.getFailedAttempt() + 1);
            if (user.getFailedAttempt() >= maxAttempts) {
                user.setAccountNonLocked(false);
                user.setLockTime(LocalDateTime.now());
            }
            userRepository.save(user);
            throw new RuntimeException("Invalid username or password");
        }

        user.setFailedAttempt(0);
        user.setLockTime(null);
        user.setAccountNonLocked(true);
        userRepository.save(user);

        refreshTokenRepository.deleteByUser(user);

        String accessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = createRefreshToken(user);

        return new AuthResponse(user.getId(), user.getUsername(), accessToken, refreshToken, "Login successful");
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken stored = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (stored.isRevoked()) {
            throw new RuntimeException("Refresh token has been revoked");
        }

        if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(stored);
            throw new RuntimeException("Refresh token has expired");
        }

        User user = stored.getUser();

        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        String newAccessToken = jwtUtils.generateAccessToken(user.getId(), user.getUsername());
        String newRefreshToken = createRefreshToken(user);

        return new AuthResponse(user.getId(), user.getUsername(), newAccessToken, newRefreshToken, "Token refreshed successfully");
    }

    private String createRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString() + "-" + jwtUtils.generateRefreshToken(user.getId());
        RefreshToken refreshToken = new RefreshToken(
                tokenValue,
                user,
                LocalDateTime.now().plus(java.time.Duration.ofMillis(jwtUtils.getRefreshTokenExpMs()))
        );
        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }
}
