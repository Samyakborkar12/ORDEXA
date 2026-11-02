package com.ordexa.counter;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/counters")
@CrossOrigin(origins = "*")
public class CounterController {

    private final CounterRepository repository;

    public CounterController(CounterRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<Counter>> getCounters(
            @PathVariable Long organizationId) {

        return ResponseEntity.ok(
                repository.findByOrganizationId(organizationId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCounter(
            @PathVariable Long id) {

        Counter counter = repository.findById(id).orElse(null);

        if (counter == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Counter not found");
        }

        return ResponseEntity.ok(counter);
    }

    @PostMapping
    public ResponseEntity<?> createCounter(
            @RequestBody Counter counter) {

        if (counter.getOrganizationId() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Organization ID is required");
        }

        if (counter.getName() == null ||
                counter.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Counter name is required");
        }

        if (counter.getStatus() == null ||
                counter.getStatus().trim().isEmpty()) {

            counter.setStatus("OPEN");
        }

        counter.setName(counter.getName().trim());

        Counter saved = repository.save(counter);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCounter(
            @PathVariable Long id,
            @RequestBody Counter updatedCounter) {

        Counter existing = repository.findById(id).orElse(null);

        if (existing == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Counter not found");
        }

        if (updatedCounter.getName() == null ||
                updatedCounter.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Counter name is required");
        }

        existing.setName(
                updatedCounter.getName().trim()
        );

        existing.setStaffId(
                updatedCounter.getStaffId()
        );

        if (updatedCounter.getStatus() != null &&
                !updatedCounter.getStatus().trim().isEmpty()) {

            existing.setStatus(
                    updatedCounter.getStatus().trim()
            );
        }

        return ResponseEntity.ok(
                repository.save(existing)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCounter(
            @PathVariable Long id) {

        if (!repository.existsById(id)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Counter not found");
        }

        repository.deleteById(id);

        return ResponseEntity.ok(
                "Counter deleted successfully"
        );
    }
}