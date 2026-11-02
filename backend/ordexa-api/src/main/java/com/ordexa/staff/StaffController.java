package com.ordexa.staff;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffRepository repository;

    public StaffController(StaffRepository repository) {
        this.repository = repository;
    }

    // =========================
    // GET ALL STAFF
    // =========================

    @GetMapping("/organization/{organizationId}")
    public List<Staff> getStaffByOrganization(
            @PathVariable Long organizationId) {

        return repository.findByOrganizationId(
                organizationId
        );
    }

    // =========================
    // CREATE STAFF
    // =========================

    @PostMapping
    public ResponseEntity<?> createStaff(
            @RequestBody Staff staff) {

        if (staff.getOrganizationId() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Organization ID is required");
        }

        if (staff.getName() == null ||
                staff.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Staff name is required");
        }

        if (staff.getEmail() == null ||
                staff.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Staff email is required");
        }

        if (staff.getRole() == null ||
                staff.getRole().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Staff role is required");
        }

        String email = staff.getEmail()
                .trim()
                .toLowerCase();

        // Check duplicate email inside same organization
        if (repository.existsByEmailAndOrganizationId(
                email,
                staff.getOrganizationId())) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Staff with this email already exists");
        }

        staff.setName(
                staff.getName().trim()
        );

        staff.setEmail(email);

        staff.setRole(
                staff.getRole().trim()
        );

        if (staff.getStatus() == null ||
                staff.getStatus().trim().isEmpty()) {

            staff.setStatus("ACTIVE");

        } else {

            staff.setStatus(
                    staff.getStatus()
                            .trim()
                            .toUpperCase()
            );
        }

        Staff saved = repository.save(staff);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    // =========================
    // UPDATE STAFF
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStaff(
            @PathVariable Long id,
            @RequestBody Staff updatedStaff) {

        Staff existing =
                repository.findById(id).orElse(null);

        if (existing == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Staff not found");
        }

        // Name validation
        if (updatedStaff.getName() == null ||
                updatedStaff.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Staff name is required");
        }

        // Email validation
        if (updatedStaff.getEmail() == null ||
                updatedStaff.getEmail().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Staff email is required");
        }

        // Role validation
        if (updatedStaff.getRole() == null ||
                updatedStaff.getRole().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Staff role is required");
        }

        String email =
                updatedStaff.getEmail()
                        .trim()
                        .toLowerCase();

        // Check duplicate email
        if (!email.equalsIgnoreCase(existing.getEmail())
                && repository.existsByEmailAndOrganizationId(
                        email,
                        existing.getOrganizationId())) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Staff with this email already exists");
        }

        // Update fields
        existing.setName(
                updatedStaff.getName().trim()
        );

        existing.setEmail(email);

        existing.setPhone(
                updatedStaff.getPhone()
        );

        existing.setRole(
                updatedStaff.getRole().trim()
        );

        // Update status only if provided
        if (updatedStaff.getStatus() != null &&
                !updatedStaff.getStatus().trim().isEmpty()) {

            existing.setStatus(
                    updatedStaff.getStatus()
                            .trim()
                            .toUpperCase()
            );
        }

        Staff saved =
                repository.save(existing);

        return ResponseEntity.ok(saved);
    }

    // =========================
    // DELETE STAFF
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStaff(
            @PathVariable Long id) {

        if (!repository.existsById(id)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Staff not found");
        }

        repository.deleteById(id);

        return ResponseEntity.ok(
                "Staff deleted successfully"
        );
    }
}