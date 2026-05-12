package backend.repository;

import backend.entity.RefreshToken;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import jakarta.transaction.Transactional;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    @Transactional
    void deleteByUser(User user);
}
