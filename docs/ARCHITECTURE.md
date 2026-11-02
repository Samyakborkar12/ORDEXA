# ORDEXA System Architecture

```mermaid
graph TD
    Client[Customer Mobile App / Admin Web] -->|HTTP / REST| API[Spring Boot REST API :3030]
    API --> Security[Spring Security & BCrypt]
    API --> Controllers[REST Controllers]
    Controllers --> Services[Business & Queue Engine]
    Services --> Repositories[Spring Data JPA Repositories]
    Repositories --> DB[(MySQL 8.0+ Database)]
```

## Core Modules & Data Flow

1. **Queue Engine (`com.ordexa.queue`):**
   - Handles token numbering sequences, unique prefix formatting (e.g. `ORG-SRV-001`).
   - Implements FIFO (First In, First Out) counter assignments based on active service mappings.
   - Calculates waiting time dynamically based on average duration multiplied by preceding tokens.

2. **Counter Dispatch:**
   - Multi-counter support where multiple counters can serve the same service (load balancing), or a single counter handles specialized services.
   - Supports states: `WAITING` -> `SERVING` -> `COMPLETED` / `CANCELLED` / `HOLD`.

3. **Touchless Kiosk & QR Integration:**
   - Pre-encoded QR codes link directly to organization/service IDs allowing instant browser token issuance without downloading an app.
