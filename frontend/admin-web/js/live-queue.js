const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));

    const params = new URLSearchParams(window.location.search);

    /*
     * Supported URLs:
     *
     * Counter:
     * live-queue.html?counterId=5
     *
     * Old counter:
     * live-queue.html?id=5
     *
     * Service:
     * live-queue.html?serviceId=6&organizationId=3
     *
     * Counter + Service:
     * live-queue.html?counterId=5&serviceId=6
     */

    let counterId =
        params.get("counterId") ||
        params.get("id");

    let serviceId =
        params.get("serviceId");

    let organizationId =
        params.get("organizationId");

    let mode = "unknown";

    let counter = null;
    let selectedService = null;

    let assignedServices = [];
    let assignedCounters = [];

    let queueData = [];
    let currentData = null;

    let refreshTimer = null;


    /* =========================================================
       BASIC HELPERS
       ========================================================= */

    function $(id) {
        return document.getElementById(id);
    }


    function escapeHtml(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    async function apiFetch(url, options = {}) {

        const finalOptions = {
            ...options,
            cache: "no-store",
            headers: {
                ...(options.headers || {})
            }
        };

        const response =
            await fetch(url, finalOptions);

        let data = null;

        const contentType =
            response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {

            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }

        } else {

            try {
                data = await response.text();
            } catch (e) {
                data = null;
            }
        }


        if (!response.ok) {

            let errorMessage =
                `Request failed (${response.status})`;

            if (typeof data === "string" && data.trim()) {
                errorMessage = data;
            }

            if (data && data.message) {
                errorMessage = data.message;
            }

            throw new Error(errorMessage);
        }

        return data;
    }


    function showMessage(message, type = "info") {

        const box = $("messageBox");

        box.className =
            `message show ${type}`;

        box.textContent = message;
    }


    function hideMessage() {

        const box = $("messageBox");

        box.className = "message";
        box.textContent = "";
    }


    function goBack() {

        /*
         * Counter mode should return to counters.
         * Service mode should return to services.
         */

        if (mode === "counter") {

            window.location.href =
                "counters.html";

        } else {

            window.location.href =
                "services.html";
        }
    }


    function getDisplayToken(item) {

        if (!item) {
            return "—";
        }

        if (item.tokenCode) {
            return item.tokenCode;
        }

        if (item.tokenNumber !== undefined &&
            item.tokenNumber !== null) {

            return String(item.tokenNumber);
        }

        if (item.token) {
            return item.token;
        }

        if (item.code) {
            return item.code;
        }

        return `#${item.id || "?"}`;
    }


    function getServiceName(item) {

        if (!item) {
            return "Unknown Service";
        }

        if (item.serviceName) {
            return item.serviceName;
        }

        if (item.service &&
            item.service.name) {

            return item.service.name;
        }

        return `Service #${item.serviceId || "?"}`;
    }


    function getQueueStatus(item) {

        return String(
            item.status ||
            item.queueStatus ||
            "WAITING"
        ).toUpperCase();
    }


    function isWaiting(item) {

        const status =
            getQueueStatus(item);

        return status === "WAITING" ||
               status === "REJOINED";
    }


    /* =========================================================
       START
       ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    async function init() {

        hideMessage();

        /*
         * Determine mode.
         */

        if (counterId) {

            mode = "counter";

        } else if (serviceId) {

            mode = "service";

        } else {

            mode = "unknown";

            $("pageTitle").textContent =
                "Live Queue";

            $("pageSubtitle").textContent =
                "No counter or service was selected.";

            showMessage(
                "Counter ID or Service ID is missing. Please open the live queue from Counters or Services page.",
                "error"
            );

            return;
        }


        if (mode === "counter") {

            await initCounterMode();

        } else if (mode === "service") {

            await initServiceMode();
        }


        /*
         * Refresh every 2.5 seconds.
         */

        clearInterval(refreshTimer);

        refreshTimer =
            setInterval(
                refreshQueueOnly,
                2500
            );
    }


    /* =========================================================
       COUNTER MODE
       ========================================================= */

    async function initCounterMode() {

        $("pageTitle").textContent =
            "Counter Live Queue";

        $("pageSubtitle").textContent =
            "Manage the live queue and services handled by this counter.";

        $("counterServicesSection")
            .style.display = "block";

        $("queueSection")
            .style.display = "block";

        $("serviceFilterArea")
            .style.display = "block";

        $("walkInArea")
            .style.display = "block";


        try {

            await loadCounter();

            await loadCounterAssignedServices();

            /*
             * If URL contains serviceId,
             * select that service automatically.
             */

            if (serviceId) {

                selectedService =
                    assignedServices.find(
                        service =>
                            String(service.id) ===
                            String(serviceId)
                    ) || null;
            }

            populateServiceFilter();

            populateWalkInServices();

            await loadQueueForCounter();

            await loadCurrentForCounter();

            renderCounterMainInfo();

        } catch (error) {

            console.error(
                "Counter mode error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to load counter.",
                "error"
            );
        }
    }


    async function loadCounter() {

        counter =
            await apiFetch(
                `${API}/counters/${counterId}`
            );

        if (!counter) {

            throw new Error(
                "Counter was not found."
            );
        }


        /*
         * If organizationId was not supplied
         * in URL, get it from counter.
         */

        if (!organizationId &&
            counter.organizationId) {

            organizationId =
                String(counter.organizationId);
        }
    }


    async function loadCounterAssignedServices() {

        if (!organizationId) {

            assignedServices = [];

            return;
        }


        const services =
            await apiFetch(
                `${API}/service-items/organization/${organizationId}/active`
            );


        if (!Array.isArray(services)) {

            assignedServices = [];

            return;
        }


        const result = [];


        /*
         * Each service has a /counters endpoint.
         *
         * IMPORTANT:
         *
         * Your backend currently returns:
         *
         * [
         *   {
         *     "organizationId": 3,
         *     "name": "COUNTER 2",
         *     "staffId": 3,
         *     "status": "OPEN",
         *     "id": 5
         *   }
         * ]
         *
         * Therefore we compare mapping.id
         * with counterId.
         */

        for (const service of services) {

            try {

                const mappings =
                    await apiFetch(
                        `${API}/service-items/${service.id}/counters`
                    );


                if (!Array.isArray(mappings)) {
                    continue;
                }


                const assigned =
                    mappings.some(
                        mapping => {

                            const mappedCounterId =
                                mapping.counterId ??
                                mapping.id;

                            return String(mappedCounterId) ===
                                   String(counterId);
                        }
                    );


                if (assigned) {

                    result.push(service);
                }

            } catch (error) {

                console.warn(
                    `Could not load counters for service ${service.id}`,
                    error
                );
            }
        }


        assignedServices = result;
    }


    function renderCounterMainInfo() {

        if (!counter) {
            return;
        }


        const status =
            String(
                counter.status || "OPEN"
            ).toUpperCase();


        const statusClass =
            status === "OPEN"
                ? "status-open"
                : "status-closed";


        $("mainInfo").innerHTML = `

            <div class="mode-badge">
                ● COUNTER MODE
            </div>

            <div class="card-title">
                ${escapeHtml(counter.name || "Counter")}
            </div>

            <div class="card-subtitle">
                This is the live queue for the selected counter.
            </div>

            <div class="info-grid">

                <div class="info-box">
                    <div class="info-label">
                        Counter ID
                    </div>

                    <div class="info-value">
                        ${escapeHtml(counter.id)}
                    </div>
                </div>


                <div class="info-box">
                    <div class="info-label">
                        Organization ID
                    </div>

                    <div class="info-value">
                        ${escapeHtml(counter.organizationId)}
                    </div>
                </div>


                <div class="info-box">
                    <div class="info-label">
                        Staff ID
                    </div>

                    <div class="info-value">
                        ${counter.staffId
                            ? escapeHtml(counter.staffId)
                            : "Not Assigned"}
                    </div>
                </div>


                <div class="info-box">
                    <div class="info-label">
                        Status
                    </div>

                    <div class="info-value ${statusClass}">
                        ${escapeHtml(status)}
                    </div>
                </div>

            </div>
        `;
    }


    function populateServiceFilter() {

        const select =
            $("serviceFilter");

        select.innerHTML = `
            <option value="">
                All Assigned Services
            </option>
        `;


        assignedServices.forEach(
            service => {

                const option =
                    document.createElement("option");

                option.value =
                    service.id;

                option.textContent =
                    `${service.name} (${service.averageServiceTime || 0} min)`;

                select.appendChild(option);
            }
        );


        if (serviceId) {

            select.value =
                String(serviceId);
        }


        select.onchange =
            async function () {

                serviceId =
                    this.value || null;


                selectedService =
                    assignedServices.find(
                        service =>
                            String(service.id) ===
                            String(serviceId)
                    ) || null;


                $("selectedServiceName")
                    .textContent =
                    selectedService
                        ? selectedService.name
                        : "All Services";


                await refreshQueueOnly();
            };
    }


    function populateWalkInServices() {

        const select =
            $("walkInService");

        select.innerHTML = `
            <option value="">
                Select Service
            </option>
        `;


        assignedServices.forEach(
            service => {

                const option =
                    document.createElement("option");

                option.value =
                    service.id;

                option.textContent =
                    service.name;

                select.appendChild(option);
            }
        );


        /*
         * If only one service is assigned,
         * automatically select it.
         */

        if (assignedServices.length === 1) {

            select.value =
                assignedServices[0].id;
        }
    }


    function renderAssignedServices() {

        const container =
            $("assignedServices");


        if (!assignedServices.length) {

            container.innerHTML = `

                <div class="loading"
                     style="grid-column:1/-1;">

                    <strong>
                        No services assigned
                    </strong>

                    <br><br>

                    Assign services to this counter
                    from the Services page.

                </div>
            `;

            return;
        }


        container.innerHTML =
            assignedServices.map(
                service => `

                    <div class="service-card">

                        <div>

                            <div class="service-name">
                                ${escapeHtml(service.name)}
                            </div>

                            <div class="service-meta">
                                Average service time:
                                ${escapeHtml(service.averageServiceTime || 0)}
                                minutes
                            </div>

                        </div>

                        <div>

                            <div class="service-status">
                                ${escapeHtml(service.status || "ACTIVE")}
                            </div>

                        </div>

                    </div>

                `
            ).join("");
    }


    /* =========================================================
       SERVICE MODE
       ========================================================= */

    async function initServiceMode() {

        $("pageTitle").textContent =
            "Service Live Queue";

        $("pageSubtitle").textContent =
            "View the live queues of every counter assigned to this service.";

        $("serviceCountersSection")
            .style.display = "block";


        try {

            await loadSelectedService();

            await loadServiceAssignedCounters();

            renderServiceMainInfo();

            await loadServiceCounterQueues();

        } catch (error) {

            console.error(
                "Service mode error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to load service live queue.",
                "error"
            );
        }
    }


    async function loadSelectedService() {

        selectedService =
            await apiFetch(
                `${API}/service-items/${serviceId}`
            );


        if (!selectedService) {

            throw new Error(
                "Service was not found."
            );
        }


        /*
         * Service API gives organizationId.
         */

        if (!organizationId &&
            selectedService.organizationId) {

            organizationId =
                String(
                    selectedService.organizationId
                );
        }
    }


    async function loadServiceAssignedCounters() {

        /*
         * THIS IS THE IMPORTANT FIX.
         *
         * Current backend returns COUNTER OBJECTS:
         *
         * [
         *   {
         *     "organizationId": 3,
         *     "name": "COUNTER 2",
         *     "staffId": 3,
         *     "status": "OPEN",
         *     "id": 5
         *   }
         * ]
         *
         * Therefore mapping.id is the counter ID.
         *
         * We ALSO support mapping.counterId
         * in case backend is changed later.
         */

        const mappings =
            await apiFetch(
                `${API}/service-items/${serviceId}/counters`
            );


        if (!Array.isArray(mappings)) {

            assignedCounters = [];

            return;
        }


        const result = [];


        for (const mapping of mappings) {

            /*
             * Case 1:
             * Backend directly returns Counter.
             */

            if (mapping.id &&
                mapping.name) {

                result.push(mapping);

                continue;
            }


            /*
             * Case 2:
             * Backend returns:
             *
             * {
             *   counterId: 5
             * }
             *
             * Then fetch the counter.
             */

            const id =
                mapping.counterId;


            if (id) {

                try {

                    const counterData =
                        await apiFetch(
                            `${API}/counters/${id}`
                        );

                    if (counterData) {

                        result.push(
                            counterData
                        );
                    }

                } catch (error) {

                    console.warn(
                        "Could not load mapped counter:",
                        id,
                        error
                    );
                }
            }
        }


        assignedCounters = result;
    }


    function renderServiceMainInfo() {

        const status =
            String(
                selectedService.status ||
                "ACTIVE"
            ).toUpperCase();


        $("mainInfo").innerHTML = `

            <div class="mode-badge">
                ● SERVICE MODE
            </div>

            <div class="card-title">
                ${escapeHtml(selectedService.name)}
            </div>

            <div class="card-subtitle">
                ${escapeHtml(
                    selectedService.description ||
                    "This service is handled by the counters shown below."
                )}
            </div>

            <div class="info-grid">

                <div class="info-box">

                    <div class="info-label">
                        Service ID
                    </div>

                    <div class="info-value">
                        ${escapeHtml(selectedService.id)}
                    </div>

                </div>


                <div class="info-box">

                    <div class="info-label">
                        Average Time
                    </div>

                    <div class="info-value">
                        ${escapeHtml(
                            selectedService.averageServiceTime || 0
                        )} min
                    </div>

                </div>


                <div class="info-box">

                    <div class="info-label">
                        Organization ID
                    </div>

                    <div class="info-value">
                        ${escapeHtml(
                            selectedService.organizationId
                        )}
                    </div>

                </div>


                <div class="info-box">

                    <div class="info-label">
                        Status
                    </div>

                    <div class="info-value status-open">
                        ${escapeHtml(status)}
                    </div>

                </div>

            </div>
        `;
    }


    async function loadServiceCounterQueues() {

        const container =
            $("assignedCounters");


        if (!assignedCounters.length) {

            container.innerHTML = `

                <div class="loading">

                    <strong>
                        No counters assigned
                    </strong>

                    <br><br>

                    Assign this service to one or more
                    counters from the Services page.

                </div>
            `;

            return;
        }


        container.innerHTML = `
            <div class="loading">
                Loading counter queues...
            </div>
        `;


        const cards = [];


        for (const counterItem of assignedCounters) {

            try {

                const queue =
                    await apiFetch(
                        `${API}/queue/counter/${counterItem.id}`
                    );


                const allQueue =
                    Array.isArray(queue)
                        ? queue
                        : [];


                /*
                 * Counter queue contains multiple services.
                 *
                 * Service mode MUST show only
                 * the selected service.
                 */

                const serviceQueue =
                    allQueue.filter(
                        item =>
                            String(item.serviceId) ===
                            String(serviceId)
                    );


                let current = null;


                try {

                    current =
                        await apiFetch(
                            `${API}/queue/counter/${counterItem.id}/current`
                        );

                } catch (error) {

                    current = null;
                }


                /*
                 * Current endpoint can be counter-wide.
                 * Only use it if it belongs to selected service.
                 */

                if (current &&
                    current.serviceId !== undefined &&
                    String(current.serviceId) !==
                    String(serviceId)) {

                    current = null;
                }


                const waiting =
                    serviceQueue.filter(
                        item => isWaiting(item)
                    );


                cards.push(
                    buildServiceCounterCard(
                        counterItem,
                        serviceQueue,
                        waiting,
                        current
                    )
                );

            } catch (error) {

                console.error(
                    `Queue load failed for counter ${counterItem.id}`,
                    error
                );


                cards.push(`

                    <div class="counter-card">

                        <div class="counter-head">

                            <div>

                                <div class="counter-name">
                                    ${escapeHtml(counterItem.name)}
                                </div>

                                <div class="counter-id">
                                    Counter ID:
                                    ${escapeHtml(counterItem.id)}
                                </div>

                            </div>

                        </div>

                        <div class="empty-small">
                            Unable to load this counter's queue.
                        </div>

                    </div>
                `);
            }
        }


        container.innerHTML =
            cards.join("");
    }


    function buildServiceCounterCard(
        counterItem,
        queue,
        waiting,
        current
    ) {

        const currentToken =
            current
                ? getDisplayToken(current)
                : "—";


        const currentServiceName =
            current
                ? getServiceName(current)
                : "No customer currently being served";


        const status =
            String(
                counterItem.status ||
                "OPEN"
            ).toUpperCase();


        const tokenHtml =
            waiting.length
                ? waiting.map(
                    item => `
                        <span class="token">
                            ${escapeHtml(
                                getDisplayToken(item)
                            )}
                        </span>
                    `
                ).join("")
                : `<div class="empty-small">
                       No waiting customers for this service.
                   </div>`;


        return `

            <div class="counter-card">

                <div class="counter-head">

                    <div>

                        <div class="counter-name">
                            ${escapeHtml(
                                counterItem.name ||
                                `Counter ${counterItem.id}`
                            )}
                        </div>

                        <div class="counter-id">
                            Counter ID:
                            ${escapeHtml(counterItem.id)}
                        </div>

                    </div>

                    <div class="counter-status">
                        ${escapeHtml(status)}
                    </div>

                </div>


                <div class="counter-stats">

                    <div class="mini-stat">

                        <div class="mini-stat-label">
                            Now Serving
                        </div>

                        <div class="mini-stat-value">
                            ${escapeHtml(currentToken)}
                        </div>

                    </div>


                    <div class="mini-stat">

                        <div class="mini-stat-label">
                            Waiting
                        </div>

                        <div class="mini-stat-value">
                            ${waiting.length}
                        </div>

                    </div>


                    <div class="mini-stat">

                        <div class="mini-stat-label">
                            Total
                        </div>

                        <div class="mini-stat-value">
                            ${queue.length}
                        </div>

                    </div>


                    <div class="mini-stat">

                        <div class="mini-stat-label">
                            Avg. Time
                        </div>

                        <div class="mini-stat-value">
                            ${escapeHtml(
                                selectedService.averageServiceTime || 0
                            )} min
                        </div>

                    </div>

                </div>


                <div class="card-subtitle">
                    Current:
                    ${escapeHtml(currentServiceName)}
                </div>


                <div class="token-list">
                    ${tokenHtml}
                </div>


                <div style="margin-top:18px;">

                    <button class="btn btn-primary"
                        onclick="openCounterForService(
                            ${counterItem.id},
                            ${serviceId}
                        )">

                        Open Counter Live Queue →

                    </button>

                </div>

            </div>
        `;
    }


    function openCounterForService(
        selectedCounterId,
        selectedServiceId
    ) {

        window.location.href =
            `live-queue.html?counterId=${encodeURIComponent(
                selectedCounterId
            )}&serviceId=${encodeURIComponent(
                selectedServiceId
            )}`;
    }


    /* =========================================================
       COUNTER QUEUE
       ========================================================= */

    async function loadQueueForCounter() {

        queueData =
            await apiFetch(
                `${API}/queue/counter/${counterId}`
            );


        if (!Array.isArray(queueData)) {

            queueData = [];
        }


        renderCounterQueue();
    }


    async function loadCurrentForCounter() {

        try {

            currentData =
                await apiFetch(
                    `${API}/queue/counter/${counterId}/current`
                );

        } catch (error) {

            currentData = null;
        }


        /*
         * If serviceId is selected,
         * current token must belong to that service.
         */

        if (currentData &&
            serviceId &&
            currentData.serviceId !== undefined &&
            String(currentData.serviceId) !==
            String(serviceId)) {

            currentData = null;
        }


        renderCurrent();
    }


    function getFilteredQueue() {

        if (!serviceId) {

            return queueData;
        }


        return queueData.filter(
            item =>
                String(item.serviceId) ===
                String(serviceId)
        );
    }


    function renderCurrent() {

        const token =
            currentData
                ? getDisplayToken(currentData)
                : "—";


        $("currentToken")
            .textContent = token;


        $("currentService")
            .textContent =
            currentData
                ? getServiceName(currentData)
                : "No customer currently being served";
    }


    function renderCounterQueue() {

        const filtered =
            getFilteredQueue();


        const waiting =
            filtered.filter(
                item => isWaiting(item)
            );


        $("waitingCount")
            .textContent =
            waiting.length;


        $("totalCount")
            .textContent =
            filtered.length;


        $("selectedServiceName")
            .textContent =
            selectedService
                ? selectedService.name
                : "All Services";


        $("queueCounterStatus")
            .textContent =
            counter
                ? String(
                    counter.status ||
                    "OPEN"
                ).toUpperCase()
                : "—";


        $("queueTitle")
            .textContent =
            counter
                ? `${counter.name} — Live Queue`
                : "Live Queue";


        $("queueSubtitle")
            .textContent =
            selectedService
                ? `Managing ${selectedService.name} at this counter.`
                : "Manage customers waiting at this counter.";


        renderQueueTable(
            filtered
        );
    }


    function renderQueueTable(items) {

        const container =
            $("queueTableContainer");


        if (!items.length) {

            container.innerHTML = `

                <div class="loading">

                    No customers are currently in this queue.

                </div>
            `;

            return;
        }


        const sorted =
            [...items].sort(
                (a, b) =>
                    (a.id || 0) -
                    (b.id || 0)
            );


        container.innerHTML = `

            <table class="queue-table">

                <thead>

                    <tr>

                        <th>
                            Token
                        </th>

                        <th>
                            Service
                        </th>

                        <th>
                            Status
                        </th>

                        <th>
                            Customer
                        </th>

                        <th>
                            Action
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${sorted.map(
                        item => {

                            const status =
                                getQueueStatus(item);


                            const canServe =
                                status === "WAITING" ||
                                status === "REJOINED";


                            return `

                                <tr>

                                    <td>
                                        <span class="queue-token">
                                            ${escapeHtml(
                                                getDisplayToken(item)
                                            )}
                                        </span>
                                    </td>


                                    <td>
                                        ${escapeHtml(
                                            getServiceName(item)
                                        )}
                                    </td>


                                    <td>

                                        <span class="queue-status">
                                            ${escapeHtml(status)}
                                        </span>

                                    </td>


                                    <td>
                                        ${escapeHtml(
                                            item.userName ||
                                            item.customerName ||
                                            item.name ||
                                            "Customer"
                                        )}
                                    </td>


                                    <td>

                                        <div class="queue-actions">

                                            ${
                                                canServe
                                                ? `
                                                    <button
                                                        class="small-btn"
                                                        onclick="serveToken(${item.id})">
                                                        Serve
                                                    </button>
                                                  `
                                                : ""
                                            }


                                            ${
                                                status === "SERVING"
                                                ? `
                                                    <button
                                                        class="small-btn"
                                                        onclick="addTime(${item.id})">
                                                        + Time
                                                    </button>

                                                    <button
                                                        class="small-btn"
                                                        onclick="skipToken(${item.id})">
                                                        Skip
                                                    </button>

                                                    <button
                                                        class="small-btn"
                                                        onclick="completeToken(${item.id})">
                                                        Complete
                                                    </button>
                                                  `
                                                : ""
                                            }

                                        </div>

                                    </td>

                                </tr>
                            `;
                        }
                    ).join("")}

                </tbody>

            </table>
        `;
    }


    /* =========================================================
       QUEUE ACTIONS
       ========================================================= */

    async function serveNext() {

        try {

            hideMessage();


            /*
             * If service filter selected,
             * backend serve-next is counter-wide.
             *
             * To prevent serving wrong service,
             * first find first waiting token
             * belonging to selected service.
             */

            if (serviceId) {

                const filtered =
                    getFilteredQueue()
                        .filter(
                            item => isWaiting(item)
                        );


                if (!filtered.length) {

                    showMessage(
                        "No waiting customer for the selected service.",
                        "info"
                    );

                    return;
                }


                /*
                 * Serve the first waiting token
                 * of selected service.
                 */

                await serveToken(
                    filtered[0].id
                );

                return;
            }


            await apiFetch(
                `${API}/queue/counter/${counterId}/serve-next`,
                {
                    method: "POST"
                }
            );


            showMessage(
                "Next customer is now being served.",
                "success"
            );


            await refreshQueueOnly();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to serve next customer.",
                "error"
            );
        }
    }


    async function serveToken(id) {

        try {

            await apiFetch(
                `${API}/queue/${id}/serve`,
                {
                    method: "POST"
                }
            );


            showMessage(
                "Customer moved to SERVING.",
                "success"
            );


            await refreshQueueOnly();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to serve customer.",
                "error"
            );
        }
    }


    async function addTime(id) {

        const input =
            prompt(
                "Enter additional service time in minutes:",
                "5"
            );


        if (input === null) {
            return;
        }


        const minutes =
            Number(input);


        if (!Number.isFinite(minutes) ||
            minutes <= 0) {

            showMessage(
                "Please enter a valid number of minutes.",
                "error"
            );

            return;
        }


        try {

            await apiFetch(
                `${API}/queue/${id}/add-time?minutes=${encodeURIComponent(
                    minutes
                )}`,
                {
                    method: "POST"
                }
            );


            showMessage(
                `${minutes} minutes added.`,
                "success"
            );


            await refreshQueueOnly();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to add time.",
                "error"
            );
        }
    }


    async function skipToken(id) {

        const confirmed =
            confirm(
                "Skip this customer?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await apiFetch(
                `${API}/queue/${id}/skip`,
                {
                    method: "POST"
                }
            );


            showMessage(
                "Customer skipped.",
                "success"
            );


            await refreshQueueOnly();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to skip customer.",
                "error"
            );
        }
    }


    async function completeToken(id) {

        const confirmed =
            confirm(
                "Mark this customer as completed?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await apiFetch(
                `${API}/queue/${id}/complete`,
                {
                    method: "POST"
                }
            );


            showMessage(
                "Customer marked as completed.",
                "success"
            );


            await refreshQueueOnly();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to complete customer.",
                "error"
            );
        }
    }


    /* =========================================================
       WALK-IN
       ========================================================= */

    async function generateWalkIn() {

        const selectedServiceId =
            $("walkInService").value;


        const name =
            $("walkInName").value.trim();


        const phone =
            $("walkInPhone").value.trim();


        if (!selectedServiceId) {

            showMessage(
                "Please select a service.",
                "error"
            );

            return;
        }


        if (!name) {

            showMessage(
                "Please enter customer name.",
                "error"
            );

            return;
        }


        try {

            /*
             * Existing ORDEXA walk-in endpoint.
             *
             * Backend can receive serviceId,
             * userName and userPhone.
             */

            const result =
                await apiFetch(
                    `${API}/queue/counter/${counterId}/walk-in`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                serviceId:
                                    Number(
                                        selectedServiceId
                                    ),

                                userName:
                                    name,

                                userPhone:
                                    phone

                            })
                    }
                );


            const token =
                getDisplayToken(result);


            showMessage(
                token !== "—"
                    ? `Walk-in token generated: ${token}`
                    : "Walk-in token generated successfully.",
                "success"
            );


            $("walkInName").value = "";
            $("walkInPhone").value = "";


            await refreshQueueOnly();

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to generate walk-in token.",
                "error"
            );
        }
    }


    /* =========================================================
       REFRESH
       ========================================================= */

    async function refreshQueueOnly() {

        try {

            if (mode === "counter") {

                await loadQueueForCounter();

                await loadCurrentForCounter();

            } else if (mode === "service") {

                await loadServiceCounterQueues();
            }

        } catch (error) {

            console.error(
                "Refresh error:",
                error
            );
        }
    }


    async function refreshAll() {

        hideMessage();


        try {

            if (mode === "counter") {

                await loadCounter();

                await loadCounterAssignedServices();

                populateServiceFilter();

                populateWalkInServices();

                renderAssignedServices();

                renderCounterMainInfo();

                await loadQueueForCounter();

                await loadCurrentForCounter();

            } else if (mode === "service") {

                await loadSelectedService();

                await loadServiceAssignedCounters();

                renderServiceMainInfo();

                await loadServiceCounterQueues();
            }


            showMessage(
                "Queue refreshed successfully.",
                "success"
            );


            setTimeout(
                hideMessage,
                1800
            );

        } catch (error) {

            console.error(error);

            showMessage(
                error.message ||
                "Unable to refresh queue.",
                "error"
            );
        }
    }


    /* =========================================================
       INITIAL RENDER HOOK
       ========================================================= */

    /*
     * Counter assigned services need to be rendered
     * after the initial data has loaded.
     */

    const originalInitCounterMode =
        initCounterMode;


    /*
     * renderAssignedServices after page initialization.
     */

    async function finishCounterRendering() {

        if (mode === "counter") {

            renderAssignedServices();
        }
    }


    /*
     * Small observer-style startup:
     * wait until initialization has populated data.
     */

    setTimeout(
        () => {

            if (mode === "counter") {
                renderAssignedServices();
            }

        },
        500
    );
