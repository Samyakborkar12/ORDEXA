package com.ordexa.service;

import com.ordexa.counter.Counter;
import com.ordexa.counter.CounterRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-items")
@CrossOrigin(origins = "*")
public class ServiceItemController {

    private final ServiceItemRepository serviceItemRepository;
    private final ServiceItemCounterRepository serviceItemCounterRepository;
    private final CounterRepository counterRepository;

    public ServiceItemController(
            ServiceItemRepository serviceItemRepository,
            ServiceItemCounterRepository serviceItemCounterRepository,
            CounterRepository counterRepository) {

        this.serviceItemRepository = serviceItemRepository;
        this.serviceItemCounterRepository = serviceItemCounterRepository;
        this.counterRepository = counterRepository;
    }

    // =========================================================
    // GET ALL SERVICES OF ORGANIZATION
    // =========================================================

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<?> getOrganizationServices(
            @PathVariable Long organizationId) {

        try {

            List<ServiceItem> services =
                    serviceItemRepository
                            .findByOrganizationIdOrderByNameAsc(
                                    organizationId
                            );

            List<Map<String, Object>> response =
                    new ArrayList<>();

            for (ServiceItem service : services) {

                response.add(
                        buildServiceResponse(service)
                );
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load services");
        }
    }

    // =========================================================
    // GET ACTIVE SERVICES
    // =========================================================

    @GetMapping("/organization/{organizationId}/active")
    public ResponseEntity<?> getActiveServices(
            @PathVariable Long organizationId) {

        try {

            List<ServiceItem> services =
                    serviceItemRepository
                            .findByOrganizationIdAndStatusOrderByNameAsc(
                                    organizationId,
                                    "ACTIVE"
                            );

            List<Map<String, Object>> response =
                    new ArrayList<>();

            for (ServiceItem service : services) {

                response.add(
                        buildServiceResponse(service)
                );
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load active services");
        }
    }

    // =========================================================
    // GET SERVICE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getServiceById(
            @PathVariable Long id) {

        try {

            ServiceItem service =
                    serviceItemRepository
                            .findById(id)
                            .orElse(null);

            if (service == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service not found");
            }

            return ResponseEntity.ok(
                    buildServiceResponse(service)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load service");
        }
    }

    // =========================================================
    // GET COUNTERS ASSIGNED TO SERVICE
    // =========================================================

    @GetMapping("/{serviceItemId}/counters")
    public ResponseEntity<?> getServiceCounters(
            @PathVariable Long serviceItemId) {

        try {

            if (!serviceItemRepository.existsById(serviceItemId)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service not found");
            }

            List<ServiceItemCounter> assignments =
                    serviceItemCounterRepository
                            .findByServiceItemId(serviceItemId);

            List<Counter> counters =
                    new ArrayList<>();

            for (ServiceItemCounter assignment : assignments) {

                counterRepository
                        .findById(assignment.getCounterId())
                        .ifPresent(counters::add);
            }

            return ResponseEntity.ok(counters);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load service counters");
        }
    }

    // =========================================================
    // CREATE SERVICE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createService(
            @RequestBody ServiceRequest request) {

        try {

            if (request.organizationId == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Organization ID is required");
            }

            if (request.name == null ||
                    request.name.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Service name is required");
            }

            if (request.averageServiceTime == null ||
                    request.averageServiceTime <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Average service time must be greater than zero"
                        );
            }

            String name =
                    request.name.trim();

            if (serviceItemRepository
                    .existsByOrganizationIdAndNameIgnoreCase(
                            request.organizationId,
                            name
                    )) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Service already exists");
            }

            String status =
                    request.status == null ||
                    request.status.trim().isEmpty()
                            ? "ACTIVE"
                            : request.status
                                    .trim()
                                    .toUpperCase();

            if (!status.equals("ACTIVE") &&
                    !status.equals("INACTIVE")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Status must be ACTIVE or INACTIVE"
                        );
            }

            ServiceItem service =
                    new ServiceItem(
                            request.organizationId,
                            name,
                            request.description == null
                                    ? ""
                                    : request.description.trim(),
                            request.averageServiceTime,
                            status
                    );

            ServiceItem saved =
                    serviceItemRepository.save(service);

            // Save counter assignments
            saveCounterAssignments(
                    saved.getId(),
                    request.counterIds
            );

            // Return complete response
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            buildServiceResponse(saved)
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to create service: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(
            @PathVariable Long id,
            @RequestBody ServiceRequest request) {

        try {

            ServiceItem service =
                    serviceItemRepository
                            .findById(id)
                            .orElse(null);

            if (service == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service not found");
            }

            if (request.name == null ||
                    request.name.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Service name is required");
            }

            if (request.averageServiceTime == null ||
                    request.averageServiceTime <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Average service time must be greater than zero"
                        );
            }

            String name =
                    request.name.trim();

            if (!service.getName().equalsIgnoreCase(name) &&
                    serviceItemRepository
                            .existsByOrganizationIdAndNameIgnoreCase(
                                    service.getOrganizationId(),
                                    name
                            )) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body("Service already exists");
            }

            String status =
                    request.status == null ||
                    request.status.trim().isEmpty()
                            ? service.getStatus()
                            : request.status
                                    .trim()
                                    .toUpperCase();

            if (!status.equals("ACTIVE") &&
                    !status.equals("INACTIVE")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Status must be ACTIVE or INACTIVE"
                        );
            }

            service.setName(name);

            service.setDescription(
                    request.description == null
                            ? ""
                            : request.description.trim()
            );

            service.setAverageServiceTime(
                    request.averageServiceTime
            );

            service.setStatus(status);

            ServiceItem saved =
                    serviceItemRepository.save(service);

            // Remove old assignments
            serviceItemCounterRepository
                    .deleteByServiceItemId(id);

            // Add new assignments
            saveCounterAssignments(
                    id,
                    request.counterIds
            );

            return ResponseEntity.ok(
                    buildServiceResponse(saved)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to update service: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // DELETE SERVICE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(
            @PathVariable Long id) {

        try {

            if (!serviceItemRepository.existsById(id)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service not found");
            }

            serviceItemCounterRepository
                    .deleteByServiceItemId(id);

            serviceItemRepository.deleteById(id);

            return ResponseEntity.ok(
                    "Service deleted successfully"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to delete service: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // SAVE COUNTER ASSIGNMENTS
    // =========================================================

    private void saveCounterAssignments(
            Long serviceItemId,
            List<Long> counterIds) {

        if (counterIds == null ||
                counterIds.isEmpty()) {

            return;
        }

        for (Long counterId : counterIds) {

            if (counterId == null) {
                continue;
            }

            Counter counter =
                    counterRepository
                            .findById(counterId)
                            .orElse(null);

            if (counter == null) {
                continue;
            }

            if (!serviceItemCounterRepository
                    .existsByServiceItemIdAndCounterId(
                            serviceItemId,
                            counterId
                    )) {

                ServiceItemCounter assignment =
                        new ServiceItemCounter(
                                serviceItemId,
                                counterId
                        );

                serviceItemCounterRepository.save(
                        assignment
                );
            }
        }
    }

    // =========================================================
    // BUILD SERVICE RESPONSE
    // =========================================================

    private Map<String, Object> buildServiceResponse(
            ServiceItem service) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "id",
                service.getId()
        );

        response.put(
                "organizationId",
                service.getOrganizationId()
        );

        response.put(
                "name",
                service.getName()
        );

        response.put(
                "description",
                service.getDescription()
        );

        response.put(
                "averageServiceTime",
                service.getAverageServiceTime()
        );

        response.put(
                "status",
                service.getStatus()
        );

        List<ServiceItemCounter> assignments =
                serviceItemCounterRepository
                        .findByServiceItemId(
                                service.getId()
                        );

        List<Counter> counters =
                new ArrayList<>();

        for (ServiceItemCounter assignment : assignments) {

            counterRepository
                    .findById(
                            assignment.getCounterId()
                    )
                    .ifPresent(
                            counters::add
                    );
        }

        response.put(
                "counters",
                counters
        );

        return response;
    }

    // =========================================================
    // REQUEST DTO
    // =========================================================

    public static class ServiceRequest {

        public Long organizationId;

        public String name;

        public String description;

        public Integer averageServiceTime;

        public String status;

        public List<Long> counterIds =
                new ArrayList<>();
    }
}