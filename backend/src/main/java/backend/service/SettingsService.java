package backend.service;

import backend.dto.FamilyMemberDTO;
import backend.dto.FamilyPositionDTO;
import backend.dto.UpdateMemberRequest;
import backend.entity.FamilyPosition;
import backend.entity.User;
import backend.repository.FamilyPositionRepository;
import backend.repository.RefreshTokenRepository;
import backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class SettingsService {

    private final UserRepository userRepository;
    private final FamilyPositionRepository familyPositionRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public SettingsService(UserRepository userRepository,
                           FamilyPositionRepository familyPositionRepository,
                           RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.familyPositionRepository = familyPositionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public List<FamilyMemberDTO> getMembers() {
        return userRepository.findAll().stream()
                .sorted(Comparator.comparing(User::getId))
                .map(this::toMemberDTO)
                .toList();
    }

    public List<FamilyPositionDTO> getPositions() {
        return familyPositionRepository.findAll().stream()
                .sorted(Comparator.comparing(FamilyPosition::getId))
                .map(p -> new FamilyPositionDTO(p.getId(), p.getName()))
                .toList();
    }

    @Transactional
    public FamilyMemberDTO updateMember(Long id, UpdateMemberRequest request, User requestingUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        boolean changingPosition = false;

        if (request.getPositionId() != null) {
            if (!"ADMIN".equals(requestingUser.getRole())) {
                throw new RuntimeException("Only ADMIN can change member position");
            }
            FamilyPosition position = familyPositionRepository.findById(request.getPositionId())
                    .orElseThrow(() -> new RuntimeException("Position not found"));
            user.setPosition(position);
            changingPosition = true;
        }

        if (request.getColor() != null) {
            user.setColor(request.getColor());
        }

        if (request.getRole() != null) {
            validateRole(request.getRole());
            user.setRole(request.getRole());
        }

        if (!changingPosition && request.getColor() == null && request.getRole() == null) {
            if (!"ADMIN".equals(requestingUser.getRole())) {
                throw new RuntimeException("Only ADMIN can change member position");
            }
            user.setPosition(null);
        }

        userRepository.save(user);
        return toMemberDTO(user);
    }

    @Transactional
    public void removeMember(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        refreshTokenRepository.deleteByUser(user);
        userRepository.delete(user);
    }

    @Transactional
    public FamilyPositionDTO createPosition(String name) {
        if (familyPositionRepository.existsByName(name)) {
            throw new RuntimeException("Position already exists");
        }
        FamilyPosition position = familyPositionRepository.save(new FamilyPosition(name));
        return new FamilyPositionDTO(position.getId(), position.getName());
    }

    @Transactional
    public void deletePosition(Long id) {
        FamilyPosition position = familyPositionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        List<User> usersWithPosition = userRepository.findAll().stream()
                .filter(u -> u.getPosition() != null && u.getPosition().getId().equals(id))
                .toList();

        for (User user : usersWithPosition) {
            user.setPosition(null);
            userRepository.save(user);
        }

        familyPositionRepository.delete(position);
    }

    private FamilyMemberDTO toMemberDTO(User user) {
        return new FamilyMemberDTO(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                user.getPosition() != null ? user.getPosition().getId() : null,
                user.getPosition() != null ? user.getPosition().getName() : null,
                user.getColor()
        );
    }

    private void validateRole(String role) {
        if (!"ADMIN".equals(role) && !"MEMBER".equals(role)) {
            throw new RuntimeException("Invalid role: must be ADMIN or MEMBER");
        }
    }
}
