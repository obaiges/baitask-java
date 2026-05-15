package backend.controller;

import backend.dto.CreateObjectiveRequest;
import backend.dto.ObjectiveDTO;
import backend.entity.User;
import backend.service.ObjectiveService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/money/objectives")
public class ObjectiveController {

    private final ObjectiveService objectiveService;

    public ObjectiveController(ObjectiveService objectiveService) {
        this.objectiveService = objectiveService;
    }

    @GetMapping
    public ResponseEntity<List<ObjectiveDTO>> getObjectives(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(objectiveService.getObjectives(currentUser, month, year, userId));
    }

    @PostMapping
    public ResponseEntity<?> createObjective(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateObjectiveRequest request) {
        try {
            ObjectiveDTO created = objectiveService.createObjective(currentUser, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateObjective(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateObjectiveRequest request) {
        try {
            ObjectiveDTO updated = objectiveService.updateObjective(id, currentUser, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObjective(@PathVariable Long id,
                                                 @AuthenticationPrincipal User currentUser) {
        try {
            objectiveService.deleteObjective(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
