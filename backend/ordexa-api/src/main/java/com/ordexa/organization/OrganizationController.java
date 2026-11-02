package com.ordexa.organization;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@CrossOrigin(origins = "*")
public class OrganizationController {

    private final OrganizationRepository repository;

    public OrganizationController(OrganizationRepository repository) {
        this.repository = repository;
    }

    // Get all organizations
    @GetMapping
    public List<Organization> getAllOrganizations() {
        return repository.findAll();
    }

    // Get organization by admin ID
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<?> getOrganizationByAdmin(
            @PathVariable Long adminId) {

        Organization organization =
                repository.findByAdminId(adminId).orElse(null);

        if (organization == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Organization not found");
        }

        return ResponseEntity.ok(organization);
    }

    // Get organization by organization ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrganizationById(
            @PathVariable Long id) {

        Organization organization =
                repository.findById(id).orElse(null);

        if (organization == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Organization not found");
        }

        return ResponseEntity.ok(organization);
    }

    // Create organization
    @PostMapping
    public ResponseEntity<?> createOrganization(
            @RequestBody Organization organization) {

        if (organization.getAdminId() == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Admin ID is required");
        }

        if (organization.getName() == null ||
                organization.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization name is required");
        }

        if (organization.getType() == null ||
                organization.getType().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Organization type is required");
        }

        if (repository.existsByAdminId(
                organization.getAdminId())) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("Organization already exists for this admin");
        }

        Organization saved =
                repository.save(organization);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    // Update organization
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrganization(
            @PathVariable Long id,
            @RequestBody Organization updateData) {

        Organization org = repository.findById(id).orElse(null);
        if (org == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Organization not found");
        }

        if (updateData.getName() != null && !updateData.getName().trim().isEmpty()) {
            org.setName(updateData.getName().trim());
        }

        if (updateData.getType() != null && !updateData.getType().trim().isEmpty()) {
            org.setType(updateData.getType().trim());
        }

        if (updateData.getDescription() != null) {
            org.setDescription(updateData.getDescription().trim());
        }

        Organization saved = repository.save(org);
        return ResponseEntity.ok(saved);
    }
}