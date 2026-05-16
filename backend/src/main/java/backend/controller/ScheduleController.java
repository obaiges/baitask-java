package backend.controller;

import backend.dto.CreateScheduleEventRequest;
import backend.dto.ScheduleEventDTO;
import backend.entity.User;
import backend.service.ScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schedule")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/events")
    public ResponseEntity<List<ScheduleEventDTO>> getEvents(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(scheduleService.getEvents(currentUser, year, month, userId));
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateScheduleEventRequest request) {
        try {
            ScheduleEventDTO created = scheduleService.createEvent(currentUser, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody CreateScheduleEventRequest request) {
        try {
            ScheduleEventDTO updated = scheduleService.updateEvent(id, currentUser, request);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        try {
            scheduleService.deleteEvent(id, currentUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
