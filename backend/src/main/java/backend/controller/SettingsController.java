package backend.controller;

import backend.dto.FamilyMemberDTO;
import backend.dto.FamilyPositionDTO;
import backend.dto.UpdateMemberRequest;
import backend.service.SettingsService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/members")
    public ResponseEntity<List<FamilyMemberDTO>> getMembers() {
        return ResponseEntity.ok(settingsService.getMembers());
    }

    @GetMapping("/positions")
    public ResponseEntity<List<FamilyPositionDTO>> getPositions() {
        return ResponseEntity.ok(settingsService.getPositions());
    }

    @PutMapping("/members/{id}")
    public ResponseEntity<FamilyMemberDTO> updateMember(@PathVariable Long id,
                                                         @RequestBody UpdateMemberRequest request) {
        try {
            FamilyMemberDTO updated = settingsService.updateMember(id, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id) {
        try {
            settingsService.removeMember(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/positions")
    public ResponseEntity<?> createPosition(@RequestBody FamilyPositionDTO request) {
        try {
            FamilyPositionDTO created = settingsService.createPosition(request.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/positions/{id}")
    public ResponseEntity<Void> deletePosition(@PathVariable Long id) {
        try {
            settingsService.deletePosition(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
