// =========================================================
    // API
    // =========================================================

    const API =
        ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));


    // =========================================================
    // STATE
    // =========================================================

    let admin = null;

    let organization = null;

    let counters = [];

    let services = [];

    let editingServiceId = null;

    let toastTimer = null;


    // =========================================================
    // DOM
    // =========================================================

    const organizationName =
        document.getElementById(
            "organizationName"
        );


    const serviceGrid =
        document.getElementById(
            "serviceGrid"
        );


    const serviceCount =
        document.getElementById(
            "serviceCount"
        );


    const loading =
        document.getElementById(
            "loading"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const emptyTitle =
        document.getElementById(
            "emptyTitle"
        );


    const emptyMessage =
        document.getElementById(
            "emptyMessage"
        );


    const errorBox =
        document.getElementById(
            "errorBox"
        );


    const modalOverlay =
        document.getElementById(
            "modalOverlay"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const serviceForm =
        document.getElementById(
            "serviceForm"
        );


    const serviceName =
        document.getElementById(
            "serviceName"
        );


    const serviceDescription =
        document.getElementById(
            "serviceDescription"
        );


    const averageServiceTime =
        document.getElementById(
            "averageServiceTime"
        );


    const serviceStatus =
        document.getElementById(
            "serviceStatus"
        );


    const counterList =
        document.getElementById(
            "counterList"
        );


    const saveButton =
        document.getElementById(
            "saveButton"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const toast =
        document.getElementById(
            "toast"
        );


    const toastTitle =
        document.getElementById(
            "toastTitle"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    // =========================================================
    // AUTH
    // =========================================================

    function getLoggedInAdmin() {

        let saved =
            localStorage.getItem(
                "ordexa_admin"
            );


        if (!saved) {

            saved =
                sessionStorage.getItem(
                    "ordexa_admin"
                );
        }


        if (!saved) {

            window.location.href =
                "login.html";

            return null;
        }


        try {

            return JSON.parse(saved);

        } catch (error) {

            localStorage.removeItem(
                "ordexa_admin"
            );

            sessionStorage.removeItem(
                "ordexa_admin"
            );

            window.location.href =
                "login.html";

            return null;
        }
    }


    // =========================================================
    // FETCH HELPER
    // =========================================================

    async function fetchJson(url, options = {}) {

        const response =
            await fetch(
                url,
                {
                    cache: "no-store",

                    ...options,

                    headers: {
                        "Accept":
                            "application/json",

                        ...(options.headers || {})
                    }
                }
            );


        const text =
            await response.text();


        let data =
            null;


        if (text) {

            try {

                data =
                    JSON.parse(text);

            } catch {

                data =
                    text;
            }
        }


        if (!response.ok) {

            let message =
                "Request failed.";


            if (
                typeof data ===
                "string" &&
                data.trim()
            ) {

                message =
                    data;

            } else if (
                data &&
                data.message
            ) {

                message =
                    data.message;
            }


            throw new Error(
                message
            );
        }


        return data;
    }


    // =========================================================
    // INITIALIZE
    // =========================================================

    async function initialize() {

        admin =
            getLoggedInAdmin();


        if (!admin) {

            return;
        }


        if (!admin.id) {

            showError(
                "Admin ID is missing. Please login again."
            );

            return;
        }


        try {

            await loadOrganization();

            await loadCounters();

            await loadServices();

        } catch (error) {

            console.error(
                "INITIALIZATION ERROR:",
                error
            );


            showError(
                error.message ||
                "Unable to load service data."
            );
        }
    }


    // =========================================================
    // LOAD ORGANIZATION
    // =========================================================

    async function loadOrganization() {

        const data =
            await fetchJson(
                `${API}/organizations/admin/${admin.id}`
            );


        if (!data) {

            throw new Error(
                "Organization data was not returned."
            );
        }


        organization =
            data;


        organizationName.textContent =
            organization.name ||
            "Organization";


        /*
         * Keep organization ID synchronized.
         * This prevents old/stale localStorage
         * values from being used elsewhere.
         */

        localStorage.setItem(
            "ordexa_organization_id",
            String(organization.id)
        );


        localStorage.setItem(
            "ordexaOrganizationId",
            String(organization.id)
        );
    }


    // =========================================================
    // LOAD COUNTERS
    // =========================================================

    async function loadCounters() {

        const data =
            await fetchJson(
                `${API}/counters/organization/${organization.id}`
            );


        counters =
            Array.isArray(data)
                ? data
                : [];
    }


    // =========================================================
    // LOAD SERVICES
    // =========================================================

    async function loadServices() {

        loading.style.display =
            "block";


        serviceGrid.innerHTML =
            "";


        emptyState.style.display =
            "none";


        try {

            const data =
                await fetchJson(
                    `${API}/service-items/organization/${organization.id}`
                );


            services =
                Array.isArray(data)
                    ? data
                    : [];


            /*
             * The organization service endpoint may
             * or may not include a counters array.
             *
             * We always fetch the actual counter
             * mappings from the dedicated endpoint.
             */

            await loadServiceCounterMappings();


            loading.style.display =
                "none";


            renderServices();

        } catch (error) {

            loading.style.display =
                "none";


            throw error;
        }
    }


    // =========================================================
    // LOAD ACTUAL SERVICE -> COUNTER MAPPINGS
    // =========================================================

    async function loadServiceCounterMappings() {

        if (!services.length) {

            return;
        }


        const results =
            await Promise.all(
                services.map(
                    async service => {

                        try {

                            const data =
                                await fetchJson(
                                    `${API}/service-items/${service.id}/counters`
                                );


                            return {
                                serviceId:
                                    Number(service.id),

                                mappings:
                                    Array.isArray(data)
                                        ? data
                                        : []
                            };

                        } catch (error) {

                            console.warn(
                                `Unable to load counters for service ${service.id}:`,
                                error
                            );


                            return {
                                serviceId:
                                    Number(service.id),

                                mappings:
                                    []
                            };
                        }
                    }
                )
            );


        services =
            services.map(
                service => {

                    const result =
                        results.find(
                            item =>
                                item.serviceId ===
                                Number(service.id)
                        );


                    const mappings =
                        result
                            ? result.mappings
                            : [];


                    /*
                     * Backend mapping usually contains
                     * counterId.
                     *
                     * Convert it into actual counter
                     * objects using the already loaded
                     * counters list.
                     */

                    const assignedCounters =
                        mappings
                            .map(
                                mapping => {

                                    const counterId =
                                        Number(
                                            mapping.counterId
                                        );


                                    return counters.find(
                                        counter =>
                                            Number(
                                                counter.id
                                            ) ===
                                            counterId
                                    );
                                }
                            )
                            .filter(
                                Boolean
                            );


                    /*
                     * If backend directly returned
                     * counter information, use it
                     * as a fallback.
                     */

                    if (
                        assignedCounters.length === 0 &&
                        mappings.length > 0
                    ) {

                        const fallback =
                            mappings
                                .map(
                                    mapping =>
                                        mapping.counter ||
                                        mapping
                                )
                                .filter(
                                    item =>
                                        item &&
                                        item.id
                                );


                        return {
                            ...service,

                            counters:
                                fallback
                        };
                    }


                    return {
                        ...service,

                        counters:
                            assignedCounters
                    };
                }
            );
    }


    // =========================================================
    // FILTER
    // =========================================================

    function applyFilters() {

        renderServices();
    }


    // =========================================================
    // RENDER SERVICES
    // =========================================================

    function renderServices() {

        serviceGrid.innerHTML =
            "";


        const search =
            searchInput.value
                .trim()
                .toLowerCase();


        const selectedStatus =
            statusFilter.value;


        const filtered =
            services.filter(
                service => {

                    const name =
                        String(
                            service.name || ""
                        ).toLowerCase();


                    const description =
                        String(
                            service.description || ""
                        ).toLowerCase();


                    const status =
                        String(
                            service.status ||
                            "ACTIVE"
                        ).toUpperCase();


                    const matchesSearch =
                        !search ||
                        name.includes(search) ||
                        description.includes(search);


                    const matchesStatus =
                        selectedStatus === "ALL" ||
                        status === selectedStatus;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );


        serviceCount.textContent =
            `${filtered.length} ${
                filtered.length === 1
                    ? "service"
                    : "services"
            }`;


        if (services.length === 0) {

            emptyTitle.textContent =
                "No services yet";


            emptyMessage.textContent =
                "Add your first service and assign one or more counters.";


            emptyState.style.display =
                "block";


            return;
        }


        if (filtered.length === 0) {

            emptyTitle.textContent =
                "No matching services";


            emptyMessage.textContent =
                "Try changing your search or status filter.";


            emptyState.style.display =
                "block";


            return;
        }


        emptyState.style.display =
            "none";


        filtered.forEach(
            renderService
        );
    }


    // =========================================================
    // RENDER SERVICE CARD
    // =========================================================

    function renderService(service) {

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "service-card";


        const status =
            String(
                service.status ||
                "ACTIVE"
            ).toUpperCase();


        const statusClass =
            status === "ACTIVE"
                ? "active"
                : "inactive";


        const assignedCounters =
            Array.isArray(
                service.counters
            )
                ? service.counters
                : [];


        const counterCount =
            assignedCounters.length;


        let counterHTML =
            "";


        if (counterCount > 0) {

            counterHTML =
                assignedCounters
                    .map(
                        counter => `

                            <span class="counter-chip">

                                ${escapeHtml(
                                    counter.name ||
                                    "Unnamed Counter"
                                )}

                            </span>

                        `
                    )
                    .join("");

        } else {

            counterHTML = `

                <span class="no-counter-text">

                    No counters assigned

                </span>

            `;
        }


        card.innerHTML = `

            <div class="service-top">

                <div class="service-icon">
                    ⚙️
                </div>


                <span
                    class="status ${statusClass}"
                >

                    ${escapeHtml(status)}

                </span>

            </div>


            <h3 class="service-name">

                ${escapeHtml(
                    service.name ||
                    "Unnamed Service"
                )}

            </h3>


            <p class="service-description">

                ${escapeHtml(
                    service.description ||
                    "No description provided."
                )}

            </p>


            <div class="service-details">


                <div class="detail-box">

                    <div class="detail-label">
                        AVG. SERVICE TIME
                    </div>


                    <div class="detail-value">

                        ${escapeHtml(
                            service.averageServiceTime ??
                            "-"
                        )}

                        min

                    </div>

                </div>


                <div class="detail-box">

                    <div class="detail-label">
                        COUNTERS
                    </div>


                    <div class="detail-value">

                        ${counterCount}

                    </div>

                </div>


            </div>


            <div class="detail-box assigned-box">

                <div class="detail-label">
                    ASSIGNED COUNTERS
                </div>


                <div class="assigned-value">

                    ${counterHTML}

                </div>

            </div>


            <div class="service-actions">


                <button
                    class="action-button queue-button"
                    onclick="openServiceQueue(${service.id})"
                >

                    👁 View Queue

                </button>


                <button
                    class="action-button"
                    onclick="openEditModal(${service.id})"
                >

                    ✏️ Edit

                </button>


                <button
                    class="action-button delete-button"
                    onclick="deleteService(${service.id})"
                >

                    🗑 Delete

                </button>


            </div>

        `;


        serviceGrid.appendChild(
            card
        );
    }


    // =========================================================
    // OPEN SERVICE LIVE QUEUE
    // =========================================================

    function openServiceQueue(serviceId) {

        if (!serviceId) {

            showToast(
                "Error",
                "Service ID is missing.",
                "error"
            );

            return;
        }


        if (
            !organization ||
            !organization.id
        ) {

            showToast(
                "Error",
                "Organization information is not available.",
                "error"
            );

            return;
        }


        /*
         * Service live queue mode.
         *
         * live-queue.html will receive:
         *
         * serviceId
         * organizationId
         */

        window.location.href =
            `live-queue.html?serviceId=${encodeURIComponent(serviceId)}&organizationId=${encodeURIComponent(organization.id)}`;
    }


    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    function openAddModal() {

        if (!organization) {

            showToast(
                "Error",
                "Organization information is not loaded.",
                "error"
            );

            return;
        }


        if (!counters.length) {

            showToast(
                "No counters",
                "Create at least one counter before adding a service.",
                "error"
            );

            return;
        }


        editingServiceId =
            null;


        modalTitle.textContent =
            "Add Service";


        saveButton.textContent =
            "Save Service";


        serviceName.value =
            "";


        serviceDescription.value =
            "";


        averageServiceTime.value =
            "";


        serviceStatus.value =
            "ACTIVE";


        renderCounterOptions(
            []
        );


        modalOverlay.classList.add(
            "show"
        );


        setTimeout(
            () =>
                serviceName.focus(),
            100
        );
    }


    // =========================================================
    // OPEN EDIT MODAL
    // =========================================================

    function openEditModal(id) {

        const service =
            services.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!service) {

            showToast(
                "Error",
                "Service could not be found.",
                "error"
            );

            return;
        }


        editingServiceId =
            service.id;


        modalTitle.textContent =
            "Edit Service";


        saveButton.textContent =
            "Update Service";


        serviceName.value =
            service.name || "";


        serviceDescription.value =
            service.description || "";


        averageServiceTime.value =
            service.averageServiceTime || "";


        serviceStatus.value =
            String(
                service.status ||
                "ACTIVE"
            ).toUpperCase();


        const assignedIds =
            Array.isArray(
                service.counters
            )
                ? service.counters.map(
                    counter =>
                        Number(counter.id)
                )
                : [];


        renderCounterOptions(
            assignedIds
        );


        modalOverlay.classList.add(
            "show"
        );


        setTimeout(
            () =>
                serviceName.focus(),
            100
        );
    }


    // =========================================================
    // COUNTER OPTIONS
    // =========================================================

    function renderCounterOptions(
        selectedIds = []
    ) {

        counterList.innerHTML =
            "";


        if (!counters.length) {

            counterList.innerHTML = `

                <div class="no-counters">

                    No counters are available.
                    Create a counter first.

                </div>

            `;

            return;
        }


        counters.forEach(
            counter => {

                const counterId =
                    Number(
                        counter.id
                    );


                const checked =
                    selectedIds.includes(
                        counterId
                    );


                const option =
                    document.createElement(
                        "label"
                    );


                option.className =
                    "counter-option";


                option.innerHTML = `

                    <input
                        type="checkbox"
                        value="${counterId}"
                        ${checked ? "checked" : ""}
                    >


                    <div class="counter-info">

                        <div class="counter-name">

                            ${escapeHtml(
                                counter.name ||
                                "Unnamed Counter"
                            )}

                        </div>


                        <div class="counter-status">

                            Status:
                            ${escapeHtml(
                                counter.status ||
                                "OPEN"
                            )}

                        </div>

                    </div>

                `;


                counterList.appendChild(
                    option
                );
            }
        );
    }


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    function closeModal() {

        modalOverlay.classList.remove(
            "show"
        );


        editingServiceId =
            null;
    }


    // =========================================================
    // SAVE / UPDATE SERVICE
    // =========================================================

    serviceForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!organization) {

                showToast(
                    "Error",
                    "Organization not found.",
                    "error"
                );

                return;
            }


            const name =
                serviceName.value.trim();


            const description =
                serviceDescription.value.trim();


            const averageTime =
                Number(
                    averageServiceTime.value
                );


            const status =
                serviceStatus.value;


            if (!name) {

                showToast(
                    "Validation",
                    "Service name is required.",
                    "error"
                );

                return;
            }


            if (
                !averageTime ||
                averageTime <= 0
            ) {

                showToast(
                    "Validation",
                    "Average service time must be greater than 0.",
                    "error"
                );

                return;
            }


            const selectedCounterIds =
                Array.from(
                    counterList.querySelectorAll(
                        'input[type="checkbox"]:checked'
                    )
                ).map(
                    checkbox =>
                        Number(
                            checkbox.value
                        )
                );


            if (
                selectedCounterIds.length === 0
            ) {

                showToast(
                    "Validation",
                    "Please assign at least one counter.",
                    "error"
                );

                return;
            }


            const payload = {

                organizationId:
                    organization.id,

                name:
                    name,

                description:
                    description,

                averageServiceTime:
                    averageTime,

                status:
                    status,

                counterIds:
                    selectedCounterIds
            };


            const isEditing =
                editingServiceId !== null;


            saveButton.disabled =
                true;


            saveButton.textContent =
                isEditing
                    ? "Updating..."
                    : "Saving...";


            try {

                const url =
                    isEditing
                        ? `${API}/service-items/${editingServiceId}`
                        : `${API}/service-items`;


                const method =
                    isEditing
                        ? "PUT"
                        : "POST";


                const response =
                    await fetch(
                        url,
                        {
                            method:
                                method,

                            cache:
                                "no-store",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );


                const responseText =
                    await response.text();


                let responseData =
                    null;


                if (responseText) {

                    try {

                        responseData =
                            JSON.parse(
                                responseText
                            );

                        } catch {

                        responseData =
                            responseText;
                    }
                }


                if (!response.ok) {

                    let message =
                        "Unable to save service.";


                    if (
                        typeof responseData ===
                        "string" &&
                        responseData.trim()
                    ) {

                        message =
                            responseData;

                    } else if (
                        responseData &&
                        responseData.message
                    ) {

                        message =
                            responseData.message;
                    }


                    throw new Error(
                        message
                    );
                }


                closeModal();


                await loadServices();


                showToast(
                    isEditing
                        ? "Service updated"
                        : "Service created",

                    isEditing
                        ? "Service details have been updated successfully."
                        : "The new service has been added successfully.",

                    "success"
                );


            } catch (error) {

                console.error(
                    "SAVE SERVICE ERROR:",
                    error
                );


                showToast(
                    "Unable to save service",

                    error.message ||
                    "Something went wrong.",

                    "error"
                );


            } finally {

                saveButton.disabled =
                    false;


                saveButton.textContent =
                    "Save Service";
            }

        }
    );


    // =========================================================
    // DELETE SERVICE
    // =========================================================

    async function deleteService(id) {

        const service =
            services.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!service) {

            return;
        }


        const confirmed =
            confirm(
                `Delete "${service.name}"?\n\nThis service and its counter assignments will be permanently removed.`
            );


        if (!confirmed) {

            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/service-items/${id}`,
                    {
                        method:
                            "DELETE",

                        cache:
                            "no-store",

                        headers: {

                            "Accept":
                                "application/json"
                        }
                    }
                );


            const responseText =
                await response.text();


            if (!response.ok) {

                let message =
                    responseText ||
                    "Unable to delete service.";


                try {

                    const json =
                        JSON.parse(
                            responseText
                        );


                    if (json.message) {

                        message =
                            json.message;
                    }

                } catch {
                    // Plain text response
                }


                throw new Error(
                    message
                );
            }


            await loadServices();


            showToast(
                "Service deleted",

                `"${service.name}" has been removed.`,

                "success"
            );


        } catch (error) {

            console.error(
                "DELETE SERVICE ERROR:",
                error
            );


            showToast(
                "Unable to delete service",

                error.message ||
                "Something went wrong.",

                "error"
            );
        }
    }


    // =========================================================
    // ERROR
    // =========================================================

    function showError(message) {

        errorBox.textContent =
            message;


        errorBox.style.display =
            "block";
    }


    // =========================================================
    // TOAST
    // =========================================================

    function showToast(
        title,
        message,
        type = "success"
    ) {

        clearTimeout(
            toastTimer
        );


        toast.className =
            `toast ${type} show`;


        toastTitle.textContent =
            title;


        toastMessage.textContent =
            message;


        toastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                4000
            );
    }


    // =========================================================
    // ESCAPE HTML
    // =========================================================

    function escapeHtml(value) {

        return String(
            value ?? ""
        )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
    }


    // =========================================================
    // SEARCH
    // =========================================================

    searchInput.addEventListener(
        "input",
        applyFilters
    );


    // =========================================================
    // STATUS FILTER
    // =========================================================

    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    // =========================================================
    // OUTSIDE MODAL CLICK
    // =========================================================

    modalOverlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                modalOverlay
            ) {

                closeModal();
            }
        }
    );


    // =========================================================
    // ESC
    // =========================================================

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape" &&
                modalOverlay.classList.contains(
                    "show"
                )
            ) {

                closeModal();
            }
        }
    );


    // =========================================================
    // START
    // =========================================================

    initialize();
