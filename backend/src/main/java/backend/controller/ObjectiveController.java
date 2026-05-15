package backend.controller;

import backend.dto.CreateObjectiveRequest;
import backend.dto.ObjectiveDTO;
import backend.entity.User;
import backend.service.ObjectiveService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    public ResponseEntity<ObjectiveDTO> createObjective(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateObjectiveRequest request) {
        return ResponseEntity.ok(objectiveService.createObjective(currentUser, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObjectiveDTO> updateObjective(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateObjectiveRequest request) {
        return ResponseEntity.ok(objectiveService.updateObjective(id, currentUser, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObjective(@PathVariable Long id,
                                                 @AuthenticationPrincipal User currentUser) {
        objectiveService.deleteObjective(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
