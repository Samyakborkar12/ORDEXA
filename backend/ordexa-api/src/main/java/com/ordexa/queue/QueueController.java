package com.ordexa.queue;

import com.ordexa.counter.Counter;
import com.ordexa.counter.CounterRepository;
import com.ordexa.notification.NotificationService;
import com.ordexa.organization.Organization;
import com.ordexa.organization.OrganizationRepository;
import com.ordexa.service.ServiceItem;
import com.ordexa.service.ServiceItemCounterRepository;
import com.ordexa.service.ServiceItemRepository;
import com.ordexa.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueController {

    private final QueueTokenRepository queueRepository;
    private final CounterRepository counterRepository;
    private final ServiceItemRepository serviceItemRepository;
    private final ServiceItemCounterRepository serviceItemCounterRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OrganizationRepository organizationRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public QueueController(
            QueueTokenRepository queueRepository,
            CounterRepository counterRepository,
            ServiceItemRepository serviceItemRepository,
            ServiceItemCounterRepository serviceItemCounterRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            OrganizationRepository organizationRepository) {

        this.queueRepository = queueRepository;
        this.counterRepository = counterRepository;
        this.serviceItemRepository = serviceItemRepository;
        this.serviceItemCounterRepository = serviceItemCounterRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.organizationRepository = organizationRepository;
    }


    // =========================================================
    // TOKEN CODE GENERATOR
    // =========================================================

    private String generatePrefix(String name) {

        if (name == null) {
            return "XXX";
        }

        String lettersOnly =
                name.replaceAll("[^a-zA-Z]", "")
                        .toUpperCase();

        if (lettersOnly.length() >= 3) {
            return lettersOnly.substring(0, 3);
        }

        return (lettersOnly + "XXX")
                .substring(0, 3);
    }


    private String generateTokenCode(
            Organization organization,
            ServiceItem service,
            Long tokenNumber) {

        String organizationCode =
                generatePrefix(
                        organization.getName()
                );

        String serviceCode =
                generatePrefix(
                        service.getName()
                );

        return String.format(
                "%s-%s-%03d",
                organizationCode,
                serviceCode,
                tokenNumber
        );
    }


    // =========================================================
    // GET COMPLETE COUNTER QUEUE
    // =========================================================

    @GetMapping("/counter/{counterId}")
    public ResponseEntity<?> getCounterQueue(
            @PathVariable Long counterId) {

        if (!counterRepository.existsById(counterId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Counter not found");
        }

        return ResponseEntity.ok(
                queueRepository
                        .findByCounterIdOrderByTokenNumberAsc(counterId)
        );
    }


    // =========================================================
    // CUSTOMER - VIEW SERVICE QUEUE STATUS
    // =========================================================
    //
    // Used by CUSTOMER "View Q" page.
    //
    // URL:
    // GET /api/queue/organization/{organizationId}/service/{serviceId}/status
    //
    // Gives:
    // - Current serving token
    // - Total lines
    // - Open lines
    // - Total waiting people
    // - People ahead if customer joins now
    // - Estimated waiting time
    // - Individual counter/line information
    //
    // =========================================================

    @GetMapping("/organization/{organizationId}/service/{serviceId}/status")
    public ResponseEntity<?> getServiceQueueStatus(
            @PathVariable Long organizationId,
            @PathVariable Long serviceId) {

        try {

            // -------------------------------------------------
            // ORGANIZATION
            // -------------------------------------------------

            Organization organization =
                    organizationRepository
                            .findById(organizationId)
                            .orElse(null);

            if (organization == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Organization not found");
            }


            // -------------------------------------------------
            // SERVICE
            // -------------------------------------------------

            ServiceItem service =
                    serviceItemRepository
                            .findById(serviceId)
                            .orElse(null);

            if (service == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service not found");
            }


            // -------------------------------------------------
            // CHECK SERVICE BELONGS TO ORGANIZATION
            // -------------------------------------------------

            if (service.getOrganizationId() == null ||
                    !service.getOrganizationId()
                            .equals(organizationId)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Service does not belong to organization"
                        );
            }


            // -------------------------------------------------
            // GET ALL ORGANIZATION COUNTERS
            // -------------------------------------------------

            List<Counter> allCounters =
                    counterRepository
                            .findByOrganizationId(
                                    organizationId
                            );


            // -------------------------------------------------
            // VARIABLES
            // -------------------------------------------------

            List<Map<String, Object>> lines =
                    new ArrayList<>();

            List<String> currentServingTokens =
                    new ArrayList<>();

            int totalLines = 0;
            int openLines = 0;
            int totalWaiting = 0;

            Counter selectedCounter = null;

            int selectedCounterWaiting = 0;


            // -------------------------------------------------
            // CHECK EACH COUNTER
            // -------------------------------------------------

            for (Counter counter : allCounters) {

                boolean assigned =
                        serviceItemCounterRepository
                                .existsByServiceItemIdAndCounterId(
                                        serviceId,
                                        counter.getId()
                                );

                // Service is not assigned to this counter
                if (!assigned) {
                    continue;
                }

                totalLines++;


                boolean isOpen =
                        "OPEN".equalsIgnoreCase(
                                counter.getStatus()
                        );

                if (!isOpen) {
                    continue;
                }

                openLines++;


                // -------------------------------------------------
                // GET QUEUE OF THIS COUNTER
                // -------------------------------------------------

                List<QueueToken> queueTokens =
                        queueRepository
                                .findByCounterIdOrderByTokenNumberAsc(
                                        counter.getId()
                                );


                int waitingCount = 0;

                String currentServingToken = null;


                // -------------------------------------------------
                // FILTER ONLY THIS SERVICE
                // -------------------------------------------------

                for (QueueToken queueToken : queueTokens) {

                    if (queueToken.getServiceId() == null ||
                            !queueToken.getServiceId()
                                    .equals(serviceId)) {

                        continue;
                    }


                    // WAITING
                    if ("WAITING".equalsIgnoreCase(
                            queueToken.getStatus())) {

                        waitingCount++;
                    }


                    // SERVING
                    if ("SERVING".equalsIgnoreCase(
                            queueToken.getStatus())) {

                        if (currentServingToken == null) {

                            currentServingToken =
                                    queueToken.getTokenCode();
                        }
                    }
                }


                totalWaiting += waitingCount;


                // -------------------------------------------------
                // CURRENT SERVING TOKENS
                // -------------------------------------------------

                if (currentServingToken != null) {

                    currentServingTokens.add(
                            currentServingToken
                    );
                }


                // -------------------------------------------------
                // FIRST OPEN COUNTER
                //
                // This matches joinQueue() logic.
                // The customer will be assigned to the
                // first suitable OPEN counter.
                // -------------------------------------------------

                if (selectedCounter == null) {

                    selectedCounter = counter;

                    selectedCounterWaiting =
                            waitingCount;
                }


                // -------------------------------------------------
                // LINE RESPONSE
                // -------------------------------------------------

                Map<String, Object> line =
                        new HashMap<>();

                line.put(
                        "counterId",
                        counter.getId()
                );

                line.put(
                        "counterName",
                        counter.getName()
                );

                line.put(
                        "status",
                        counter.getStatus()
                );

                line.put(
                        "open",
                        isOpen
                );

                line.put(
                        "waitingCount",
                        waitingCount
                );

                line.put(
                        "currentServingToken",
                        currentServingToken
                );


                lines.add(line);
            }


            // -------------------------------------------------
            // ESTIMATED WAITING TIME
            // -------------------------------------------------
            //
            // The customer will currently enter the first
            // available OPEN counter, so estimate is based
            // on people ahead in that counter.
            //
            // Example:
            // 3 people ahead × 10 min = 30 min
            //
            // -------------------------------------------------

            int averageServiceTime =
                    service.getAverageServiceTime() == null
                            ? 0
                            : service.getAverageServiceTime();

            int estimatedWaitMinutes =
                    selectedCounterWaiting *
                            averageServiceTime;


            // -------------------------------------------------
            // SELECTED COUNTER DETAILS
            // -------------------------------------------------

            Long selectedCounterId =
                    selectedCounter == null
                            ? null
                            : selectedCounter.getId();

            String selectedCounterName =
                    selectedCounter == null
                            ? null
                            : selectedCounter.getName();


            // -------------------------------------------------
            // CAN JOIN?
            // -------------------------------------------------

            boolean canJoin =
                    "ACTIVE".equalsIgnoreCase(
                            service.getStatus()
                    )
                    && selectedCounter != null;


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            Map<String, Object> response =
                    new HashMap<>();


            response.put(
                    "organizationId",
                    organizationId
            );

            response.put(
                    "organizationName",
                    organization.getName()
            );

            response.put(
                    "serviceId",
                    serviceId
            );

            response.put(
                    "serviceName",
                    service.getName()
            );

            response.put(
                    "serviceStatus",
                    service.getStatus()
            );

            response.put(
                    "averageServiceTime",
                    averageServiceTime
            );


            // -------------------------------------------------
            // QUEUE INFORMATION
            // -------------------------------------------------

            response.put(
                    "totalLines",
                    totalLines
            );

            response.put(
                    "openLines",
                    openLines
            );

            response.put(
                    "totalWaiting",
                    totalWaiting
            );


            // -------------------------------------------------
            // PEOPLE AHEAD
            // -------------------------------------------------

            response.put(
                    "peopleAheadIfJoin",
                    selectedCounterWaiting
            );

            // Also provide this generic key so frontend
            // can simply use "peopleAhead".
            response.put(
                    "peopleAhead",
                    selectedCounterWaiting
            );


            // -------------------------------------------------
            // ESTIMATED WAIT
            // -------------------------------------------------

            response.put(
                    "estimatedWaitMinutes",
                    estimatedWaitMinutes
            );


            // -------------------------------------------------
            // CURRENT SERVING
            // -------------------------------------------------

            response.put(
                    "currentServingTokens",
                    currentServingTokens
            );

            response.put(
                    "currentServingToken",
                    currentServingTokens.isEmpty()
                            ? null
                            : currentServingTokens.get(0)
            );


            // -------------------------------------------------
            // SELECTED LINE
            // -------------------------------------------------

            response.put(
                    "selectedCounterId",
                    selectedCounterId
            );

            response.put(
                    "selectedCounterName",
                    selectedCounterName
            );


            // -------------------------------------------------
            // JOIN STATUS
            // -------------------------------------------------

            response.put(
                    "canJoin",
                    canJoin
            );


            // -------------------------------------------------
            // ALL LINES
            // -------------------------------------------------

            response.put(
                    "lines",
                    lines
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Unable to get queue status: " +
                                    e.getMessage()
                    );
        }
    }


    // =========================================================
    // CUSTOMER - JOIN QUEUE
    // =========================================================

    @PostMapping("/join")
    public ResponseEntity<?> joinQueue(
            @RequestBody JoinQueueRequest request) {

        try {

            if (request == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Request body is required");
            }

            if (request.userId == null) {
                return ResponseEntity
                        .badRequest()
                        .body("User ID is required");
            }

            if (request.organizationId == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Organization ID is required");
            }

            if (request.serviceId == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Service ID is required");
            }


            // -------------------------------------------------
            // USER
            // -------------------------------------------------

            if (!userRepository.existsById(request.userId)) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }


            // -------------------------------------------------
            // ORGANIZATION
            // -------------------------------------------------

            Organization organization =
                    organizationRepository
                            .findById(request.organizationId)
                            .orElse(null);

            if (organization == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Organization not found");
            }


            // -------------------------------------------------
            // SERVICE
            // -------------------------------------------------

            ServiceItem service =
                    serviceItemRepository
                            .findById(request.serviceId)
                            .orElse(null);

            if (service == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service not found");
            }

            if (service.getOrganizationId() == null ||
                    !service.getOrganizationId()
                            .equals(request.organizationId)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Service does not belong to organization"
                        );
            }

            if (!"ACTIVE".equalsIgnoreCase(
                    service.getStatus())) {

                return ResponseEntity
                        .badRequest()
                        .body("Service is not active");
            }


            // -------------------------------------------------
            // CHECK EXISTING ACTIVE QUEUE
            // -------------------------------------------------

            List<String> activeStatuses =
                    Arrays.asList(
                            "WAITING",
                            "SERVING"
                    );

            Optional<QueueToken> existingQueue =
                    queueRepository
                            .findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
                                    request.userId,
                                    activeStatuses
                            );

            if (existingQueue.isPresent()) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                "You already have an active queue"
                        );
            }


            // -------------------------------------------------
            // FIND OPEN COUNTER
            // -------------------------------------------------

            List<Counter> counters =
                    counterRepository
                            .findByOrganizationIdAndStatus(
                                    request.organizationId,
                                    "OPEN"
                            );

            Counter selectedCounter = null;

            for (Counter counter : counters) {

                boolean assigned =
                        serviceItemCounterRepository
                                .existsByServiceItemIdAndCounterId(
                                        request.serviceId,
                                        counter.getId()
                                );

                if (assigned) {
                    selectedCounter = counter;
                    break;
                }
            }

            if (selectedCounter == null) {

                return ResponseEntity
                        .status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(
                                "No open counter is assigned to this service"
                        );
            }


            // -------------------------------------------------
            // GENERATE NUMERIC SEQUENCE
            // -------------------------------------------------

            Long maxToken =
                    queueRepository
                            .findMaxTokenNumberByOrganizationIdAndServiceId(
                                    request.organizationId,
                                    request.serviceId
                            );

            Long nextToken =
                    maxToken == null
                            ? 1L
                            : maxToken + 1L;


            // -------------------------------------------------
            // GENERATE DISPLAY TOKEN
            // -------------------------------------------------

            String tokenCode =
                    generateTokenCode(
                            organization,
                            service,
                            nextToken
                    );


            // -------------------------------------------------
            // CREATE TOKEN
            // -------------------------------------------------

            QueueToken token =
                    new QueueToken(
                            request.organizationId,
                            selectedCounter.getId(),
                            request.userId,
                            request.serviceId,
                            nextToken,
                            "WAITING"
                    );

            token.setTokenCode(tokenCode);


            QueueToken saved =
                    queueRepository.save(token);


            // -------------------------------------------------
            // NOTIFICATION
            // -------------------------------------------------

            notificationService.queueJoined(
                    request.userId,
                    saved.getTokenNumber()
            );


            // -------------------------------------------------
            // RESPONSE
            // -------------------------------------------------

            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Queue joined successfully"
            );

            response.put(
                    "token",
                    saved.getTokenCode()
            );

            response.put(
                    "tokenCode",
                    saved.getTokenCode()
            );

            response.put(
                    "tokenNumber",
                    saved.getTokenNumber()
            );

            response.put(
                    "queueId",
                    saved.getId()
            );

            response.put(
                    "organizationId",
                    saved.getOrganizationId()
            );

            response.put(
                    "counterId",
                    saved.getCounterId()
            );

            response.put(
                    "serviceId",
                    saved.getServiceId()
            );

            response.put(
                    "status",
                    saved.getStatus()
            );

            response.put(
                    "createdAt",
                    saved.getCreatedAt()
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Unable to join queue: " +
                                    e.getMessage()
                    );
        }
    }


    // =========================================================
    // WALK-IN - CREATE TOKEN
    // =========================================================

    @PostMapping("/counter/{counterId}/walk-in")
    public ResponseEntity<?> createWalkIn(
            @PathVariable Long counterId,
            @RequestBody WalkInRequest request) {

        try {

            if (request == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Request body is required");
            }

            if (request.organizationId == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Organization ID is required");
            }

            if (request.serviceId == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Service ID is required");
            }

            if (request.name == null ||
                    request.name.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Customer name is required");
            }

            if (request.phone == null ||
                    !request.phone.trim()
                            .matches("[6-9][0-9]{9}")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Valid 10-digit mobile number is required"
                        );
            }


            // -------------------------------------------------
            // ORGANIZATION
            // -------------------------------------------------

            Organization organization =
                    organizationRepository
                            .findById(request.organizationId)
                            .orElse(null);

            if (organization == null) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Organization not found");
            }


            // -------------------------------------------------
            // COUNTER
            // -------------------------------------------------

            Counter counter =
                    counterRepository
                            .findById(counterId)
                            .orElse(null);

            if (counter == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Counter not found");
            }

            if (counter.getOrganizationId() == null ||
                    !counter.getOrganizationId()
                            .equals(request.organizationId)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Counter does not belong to this organization"
                        );
            }

            if (!"OPEN".equalsIgnoreCase(
                    counter.getStatus())) {

                return ResponseEntity
                        .badRequest()
                        .body("Counter is not open");
            }


            // -------------------------------------------------
            // SERVICE
            // -------------------------------------------------

            ServiceItem service =
                    serviceItemRepository
                            .findById(request.serviceId)
                            .orElse(null);

            if (service == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Service not found");
            }

            if (service.getOrganizationId() == null ||
                    !service.getOrganizationId()
                            .equals(request.organizationId)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Service does not belong to this organization"
                        );
            }

            if (!"ACTIVE".equalsIgnoreCase(
                    service.getStatus())) {

                return ResponseEntity
                        .badRequest()
                        .body("Service is not active");
            }


            // -------------------------------------------------
            // SERVICE ↔ COUNTER
            // -------------------------------------------------

            boolean assigned =
                    serviceItemCounterRepository
                            .existsByServiceItemIdAndCounterId(
                                    request.serviceId,
                                    counterId
                            );

            if (!assigned) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Selected service is not assigned to this counter"
                        );
            }


            // -------------------------------------------------
            // GENERATE NUMERIC SEQUENCE
            // -------------------------------------------------

            Long maxToken =
                    queueRepository
                            .findMaxTokenNumberByOrganizationIdAndServiceId(
                                    request.organizationId,
                                    request.serviceId
                            );

            Long nextToken =
                    maxToken == null
                            ? 1L
                            : maxToken + 1L;


            // -------------------------------------------------
            // GENERATE DISPLAY TOKEN
            // -------------------------------------------------

            String tokenCode =
                    generateTokenCode(
                            organization,
                            service,
                            nextToken
                    );


            // -------------------------------------------------
            // CREATE WALK-IN
            // -------------------------------------------------

            QueueToken token =
                    new QueueToken(
                            request.organizationId,
                            counterId,
                            null,
                            request.serviceId,
                            nextToken,
                            "WAITING"
                    );

            token.setTokenCode(tokenCode);

            token.setWalkInName(
                    request.name.trim()
            );

            token.setWalkInPhone(
                    request.phone.trim()
            );

            token.setWalkInNote(
                    request.note == null
                            ? ""
                            : request.note.trim()
            );


            QueueToken saved =
                    queueRepository.save(token);


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(saved);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Unable to create walk-in token: " +
                                    e.getMessage()
                    );
        }
    }


    // =========================================================
    // GET ORGANIZATION WALK-INS
    // =========================================================

    @GetMapping("/organization/{organizationId}/walk-ins")
    public ResponseEntity<?> getOrganizationWalkIns(
            @PathVariable Long organizationId) {

        return ResponseEntity.ok(
                queueRepository
                        .findWalkInsByOrganizationId(
                                organizationId
                        )
        );
    }


    // =========================================================
    // CUSTOMER - ACTIVE QUEUE
    // =========================================================

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<?> getActiveQueue(
            @PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        List<String> activeStatuses =
                Arrays.asList(
                        "WAITING",
                        "SERVING"
                );

        Optional<QueueToken> optionalToken =
                queueRepository
                        .findFirstByUserIdAndStatusInOrderByCreatedAtDesc(
                                userId,
                                activeStatuses
                        );

        if (optionalToken.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("No active queue");
        }

        QueueToken token =
                optionalToken.get();


        // -------------------------------------------------
        // WAITING TOKENS
        // -------------------------------------------------

        List<QueueToken> waitingTokens =
                queueRepository
                        .findByCounterIdAndStatusOrderByTokenNumberAsc(
                                token.getCounterId(),
                                "WAITING"
                        );

        int peopleAhead = 0;

        for (QueueToken waitingToken : waitingTokens) {

            if (waitingToken.getTokenNumber()
                    < token.getTokenNumber()) {

                peopleAhead++;
            }
        }


        // -------------------------------------------------
        // CURRENT SERVING
        // -------------------------------------------------

        Optional<QueueToken> currentServing =
                queueRepository
                        .findFirstByCounterIdAndStatusOrderByTokenNumberAsc(
                                token.getCounterId(),
                                "SERVING"
                        );


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "queueId",
                token.getId()
        );

        response.put(
                "tokenNumber",
                token.getTokenNumber()
        );

        response.put(
                "tokenCode",
                token.getTokenCode()
        );

        response.put(
                "token",
                token.getTokenCode()
        );

        response.put(
                "organizationId",
                token.getOrganizationId()
        );

        response.put(
                "counterId",
                token.getCounterId()
        );

        response.put(
                "serviceId",
                token.getServiceId()
        );

        response.put(
                "status",
                token.getStatus()
        );

        response.put(
                "createdAt",
                token.getCreatedAt()
        );

        response.put(
                "peopleAhead",
                peopleAhead
        );

        response.put(
                "currentServingToken",
                currentServing.isPresent()
                        ? currentServing.get()
                                .getTokenCode()
                        : null
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // CUSTOMER - LEAVE QUEUE
    // =========================================================

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveQueue(
            @PathVariable Long id,
            @RequestBody(required = false)
            LeaveQueueRequest request,
            @RequestParam(required = false)
            Long userId) {

        try {

            Long actualUserId = null;

            if (request != null &&
                    request.userId != null) {

                actualUserId = request.userId;

            } else if (userId != null) {

                actualUserId = userId;
            }


            QueueToken token =
                    queueRepository
                            .findById(id)
                            .orElse(null);

            if (token == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Queue token not found");
            }


            if (actualUserId == null && token.getUserId() != null) {
                actualUserId = token.getUserId();
            }

            if (actualUserId != null && token.getUserId() != null &&
                    !token.getUserId().equals(actualUserId)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                "You cannot leave this queue"
                        );
            }

            String tokenStatus = token.getStatus() != null ? token.getStatus().toUpperCase() : "";

            if (!"WAITING".equals(tokenStatus) &&
                    !"HOLD".equals(tokenStatus) &&
                    !"SERVING".equals(tokenStatus) &&
                    !"REJOINED".equals(tokenStatus)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "This queue is no longer active"
                        );
            }

            if ("SERVING".equals(tokenStatus)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "You cannot leave while your token is being served"
                        );
            }

            token.setStatus("CANCELLED");

            QueueToken saved =
                    queueRepository.save(token);


            try {

                notificationService.queueCompleted(
                        saved.getUserId(),
                        saved.getTokenNumber()
                );

            } catch (Exception notificationError) {

                notificationError.printStackTrace();
            }


            Map<String, Object> response =
                    new HashMap<>();

            response.put(
                    "message",
                    "Queue left successfully"
            );

            response.put(
                    "queueId",
                    saved.getId()
            );

            response.put(
                    "tokenNumber",
                    saved.getTokenNumber()
            );

            response.put(
                    "tokenCode",
                    saved.getTokenCode()
            );

            response.put(
                    "status",
                    saved.getStatus()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            "Unable to leave queue: " +
                                    e.getMessage()
                    );
        }
    }


    // =========================================================
    // ADMIN - SERVE NEXT
    // =========================================================

    @PostMapping("/counter/{counterId}/serve-next")
    public ResponseEntity<?> serveNext(
            @PathVariable Long counterId) {

        if (!counterRepository.existsById(counterId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Counter not found");
        }

        Optional<QueueToken> existingServing =
                queueRepository
                        .findFirstByCounterIdAndStatusOrderByTokenNumberAsc(
                                counterId,
                                "SERVING"
                        );

        if (existingServing.isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "A token is already being served"
                    );
        }

        Optional<QueueToken> nextToken =
                queueRepository
                        .findFirstByCounterIdAndStatusOrderByTokenNumberAsc(
                                counterId,
                                "WAITING"
                        );

        if (nextToken.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("No waiting tokens");
        }

        QueueToken token =
                nextToken.get();

        token.setStatus("SERVING");

        token.setCalledAt(
                LocalDateTime.now()
        );

        QueueToken saved =
                queueRepository.save(token);

        if (saved.getUserId() != null) {

            notificationService.tokenServed(
                    saved.getUserId(),
                    saved.getTokenNumber()
            );
        }

        return ResponseEntity.ok(saved);
    }


    // =========================================================
    // ADMIN - SERVE SPECIFIC TOKEN
    // =========================================================

    @PostMapping("/{id}/serve")
    public ResponseEntity<?> serveToken(
            @PathVariable Long id) {

        QueueToken token =
                queueRepository
                        .findById(id)
                        .orElse(null);

        if (token == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Token not found");
        }

        if (!"WAITING".equalsIgnoreCase(
                token.getStatus())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Only waiting tokens can be served"
                    );
        }

        Optional<QueueToken> existingServing =
                queueRepository
                        .findFirstByCounterIdAndStatusOrderByTokenNumberAsc(
                                token.getCounterId(),
                                "SERVING"
                        );

        if (existingServing.isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "A token is already being served at this counter"
                    );
        }

        token.setStatus("SERVING");

        token.setCalledAt(
                LocalDateTime.now()
        );

        QueueToken saved =
                queueRepository.save(token);

        if (saved.getUserId() != null) {

            notificationService.tokenServed(
                    saved.getUserId(),
                    saved.getTokenNumber()
            );
        }

        return ResponseEntity.ok(saved);
    }


    // =========================================================
    // ADMIN - ADD TIME
    // =========================================================

    @PostMapping("/{id}/add-time")
    public ResponseEntity<?> addTime(
            @PathVariable Long id,
            @RequestParam Integer minutes) {

        QueueToken token =
                queueRepository
                        .findById(id)
                        .orElse(null);

        if (token == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Token not found");
        }

        if (minutes == null ||
                minutes <= 0) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Minutes must be greater than zero"
                    );
        }

        int current =
                token.getAddedTimeMinutes() == null
                        ? 0
                        : token.getAddedTimeMinutes();

        token.setAddedTimeMinutes(
                current + minutes
        );

        QueueToken saved =
                queueRepository.save(token);

        if (saved.getUserId() != null) {

            notificationService.timeAdded(
                    saved.getUserId(),
                    saved.getTokenNumber(),
                    minutes
            );
        }

        return ResponseEntity.ok(saved);
    }


    // =========================================================
    // ADMIN - SKIP
    // =========================================================

    @PostMapping("/{id}/skip")
    public ResponseEntity<?> skipToken(
            @PathVariable Long id) {

        QueueToken token =
                queueRepository
                        .findById(id)
                        .orElse(null);

        if (token == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Token not found");
        }

        if ("SERVED".equalsIgnoreCase(
                token.getStatus())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Completed token cannot be skipped"
                    );
        }

        if ("SKIPPED".equalsIgnoreCase(
                token.getStatus())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Token is already skipped"
                    );
        }

        token.setStatus("SKIPPED");

        QueueToken saved =
                queueRepository.save(token);

        if (saved.getUserId() != null) {

            notificationService.tokenSkipped(
                    saved.getUserId(),
                    saved.getTokenNumber()
            );
        }

        return ResponseEntity.ok(saved);
    }


    // =========================================================
    // ADMIN - COMPLETE
    // =========================================================

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> completeToken(
            @PathVariable Long id) {

        QueueToken token =
                queueRepository
                        .findById(id)
                        .orElse(null);

        if (token == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Token not found");
        }

        if (!"SERVING".equalsIgnoreCase(
                token.getStatus())) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Only a serving token can be completed"
                    );
        }

        token.setStatus("SERVED");

        token.setCompletedAt(
                LocalDateTime.now()
        );

        QueueToken saved =
                queueRepository.save(token);

        if (saved.getUserId() != null) {

            notificationService.queueCompleted(
                    saved.getUserId(),
                    saved.getTokenNumber()
            );
        }

        return ResponseEntity.ok(saved);
    }


    // =========================================================
    // CURRENT SERVING TOKEN
    // =========================================================

    @GetMapping("/counter/{counterId}/current")
    public ResponseEntity<?> getCurrentToken(
            @PathVariable Long counterId) {

        if (!counterRepository.existsById(counterId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Counter not found");
        }

        Optional<QueueToken> token =
                queueRepository
                        .findFirstByCounterIdAndStatusOrderByTokenNumberAsc(
                                counterId,
                                "SERVING"
                        );

        if (token.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "No token is currently being served"
                    );
        }

        return ResponseEntity.ok(
                token.get()
        );
    }


    // =========================================================
    // CUSTOMER - HISTORY
    // =========================================================

    @GetMapping("/user/{userId}/history")
    public ResponseEntity<?> getQueueHistory(
            @PathVariable Long userId) {

        if (!userRepository.existsById(userId)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        List<QueueToken> history =
                queueRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                userId
                        );

        return ResponseEntity.ok(history);
    }


    // =========================================================
    // ORGANIZATION - ALL TOKENS
    // =========================================================

    @GetMapping("/organization/{organizationId}/tokens")
    public ResponseEntity<?> getOrganizationTokens(
            @PathVariable Long organizationId) {

        if (!organizationRepository.existsById(organizationId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Organization not found");
        }

        List<QueueToken> tokens =
                queueRepository
                        .findByOrganizationIdOrderByCreatedAtDesc(
                                organizationId
                        );

        return ResponseEntity.ok(tokens);
    }


    // =========================================================
    // ORGANIZATION - QUEUE ANALYTICS
    // =========================================================

    @GetMapping("/organization/{organizationId}/analytics")
    public ResponseEntity<?> getOrganizationAnalytics(
            @PathVariable Long organizationId) {

        if (!organizationRepository.existsById(organizationId)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Organization not found");
        }

        List<QueueToken> allTokens =
                queueRepository
                        .findByOrganizationIdOrderByCreatedAtDesc(
                                organizationId
                        );

        long totalTokens = allTokens.size();
        long waiting = 0;
        long serving = 0;
        long completed = 0;
        long cancelled = 0;
        long hold = 0;

        Map<Long, Integer> serviceTokenCounts = new HashMap<>();
        Map<Long, Integer> counterTokenCounts = new HashMap<>();
        Map<Integer, Integer> hourlyCounts = new HashMap<>();

        for (int h = 8; h <= 20; h++) {
            hourlyCounts.put(h, 0);
        }

        for (QueueToken t : allTokens) {
            String st = t.getStatus() != null ? t.getStatus().toUpperCase() : "WAITING";
            switch (st) {
                case "WAITING" -> waiting++;
                case "SERVING" -> serving++;
                case "COMPLETED" -> completed++;
                case "CANCELLED", "SKIPPED", "MISSED" -> cancelled++;
                case "HOLD" -> hold++;
                default -> waiting++;
            }

            if (t.getServiceId() != null) {
                serviceTokenCounts.put(t.getServiceId(), serviceTokenCounts.getOrDefault(t.getServiceId(), 0) + 1);
            }

            if (t.getCounterId() != null) {
                counterTokenCounts.put(t.getCounterId(), counterTokenCounts.getOrDefault(t.getCounterId(), 0) + 1);
            }

            if (t.getCreatedAt() != null) {
                int hour = t.getCreatedAt().getHour();
                if (hour >= 8 && hour <= 20) {
                    hourlyCounts.put(hour, hourlyCounts.getOrDefault(hour, 0) + 1);
                }
            }
        }

        // Service breakdown details
        List<Map<String, Object>> serviceBreakdown = new ArrayList<>();
        List<ServiceItem> services = serviceItemRepository.findByOrganizationId(organizationId);
        for (ServiceItem s : services) {
            Map<String, Object> item = new HashMap<>();
            item.put("serviceId", s.getId());
            item.put("name", s.getName());
            item.put("count", serviceTokenCounts.getOrDefault(s.getId(), 0));
            item.put("avgMinutes", s.getAverageServiceTime() != null ? s.getAverageServiceTime() : 10);
            serviceBreakdown.add(item);
        }

        // Counter breakdown details
        List<Map<String, Object>> counterBreakdown = new ArrayList<>();
        List<Counter> counters = counterRepository.findByOrganizationId(organizationId);
        for (Counter c : counters) {
            Map<String, Object> item = new HashMap<>();
            item.put("counterId", c.getId());
            item.put("name", c.getName());
            item.put("status", c.getStatus());
            item.put("count", counterTokenCounts.getOrDefault(c.getId(), 0));
            counterBreakdown.add(item);
        }

        // Hourly traffic list
        List<Map<String, Object>> hourlyTraffic = new ArrayList<>();
        for (int h = 9; h <= 18; h++) {
            Map<String, Object> hourData = new HashMap<>();
            hourData.put("hour", String.format("%02d:00", h));
            hourData.put("count", hourlyCounts.getOrDefault(h, 0));
            hourlyTraffic.add(hourData);
        }

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalTokens", totalTokens);
        analytics.put("waitingTokens", waiting);
        analytics.put("servingTokens", serving);
        analytics.put("completedTokens", completed);
        analytics.put("cancelledTokens", cancelled);
        analytics.put("holdTokens", hold);
        analytics.put("avgWaitTimeMinutes", totalTokens > 0 ? 12 : 0);
        analytics.put("serviceBreakdown", serviceBreakdown);
        analytics.put("counterBreakdown", counterBreakdown);
        analytics.put("hourlyTraffic", hourlyTraffic);

        return ResponseEntity.ok(analytics);
    }


    // =========================================================
    // TOKEN HOLD
    // =========================================================

    @PostMapping("/{id}/hold")
    public ResponseEntity<?> holdToken(@PathVariable Long id) {

        QueueToken token = queueRepository.findById(id).orElse(null);
        if (token == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Token not found");
        }

        token.setStatus("HOLD");
        QueueToken saved = queueRepository.save(token);

        return ResponseEntity.ok(saved);
    }


    // =========================================================
    // TOKEN REJOIN
    // =========================================================

    @PostMapping("/{id}/rejoin")
    public ResponseEntity<?> rejoinToken(@PathVariable Long id) {

        QueueToken token = queueRepository.findById(id).orElse(null);
        if (token == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Token not found");
        }

        token.setStatus("WAITING");
        QueueToken saved = queueRepository.save(token);

        return ResponseEntity.ok(saved);
    }


    // =========================================================
    // REQUEST DTO - JOIN
    // =========================================================

    public static class JoinQueueRequest {

        public Long userId;

        public Long organizationId;

        public Long serviceId;
    }


    // =========================================================
    // REQUEST DTO - WALK-IN
    // =========================================================

    public static class WalkInRequest {

        public Long organizationId;

        public Long serviceId;

        public String name;

        public String phone;

        public String note;
    }


    // =========================================================
    // REQUEST DTO - LEAVE
    // =========================================================

    public static class LeaveQueueRequest {

        public Long userId;
    }
}