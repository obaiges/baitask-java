package backend.repository;

import backend.entity.FamilyPosition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FamilyPositionRepository extends JpaRepository<FamilyPosition, Long> {
    boolean existsByName(String name);
}
