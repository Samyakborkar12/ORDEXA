/* =========================================================
       CONFIG
    ========================================================= */

    const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));


    /* =========================================================
       URL PARAMETERS
    ========================================================= */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const organizationId =
        params.get("organizationId");

    const organizationFromUrl =
        params.get("organization");

    const typeFromUrl =
        params.get("type");

    let selectedServiceId =
        params.get("serviceId");

    let services = [];

    let refreshTimer = null;


    /* =========================================================
       DOM
    ========================================================= */

    const organizationName =
        document.getElementById(
            "organizationName"
        );

    const serviceSelect =
        document.getElementById(
            "serviceSelect"
        );

    const loadingBox =
        document.getElementById(
            "loadingBox"
        );

    const errorBox =
        document.getElementById(
            "errorBox"
        );

    const queueContent =
        document.getElementById(
            "queueContent"
        );


    /* =========================================================
       INIT
    ========================================================= */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    async function init() {

        if (!organizationId) {

            showError(
                "Organization ID is missing. Please open View Queue from an organization."
            );

            organizationName.textContent =
                "Organization not selected";

            serviceSelect.innerHTML =
                `<option value="">
                    Organization not selected
                </option>`;

            serviceSelect.disabled = true;

            return;
        }


        if (organizationFromUrl) {

            organizationName.textContent =
                decodeURIComponent(
                    organizationFromUrl
                );

        } else {

            await loadOrganization();
        }


        await loadServices();


        serviceSelect.addEventListener(
            "change",
            function () {

                selectedServiceId =
                    this.value;

                queueContent.style.display =
                    "none";

                if (selectedServiceId) {

                    loadQueueStatus();

                    startAutoRefresh();

                } else {

                    stopAutoRefresh();
                }
            }
        );


        if (selectedServiceId) {

            serviceSelect.value =
                selectedServiceId;

            if (
                serviceSelect.value ===
                selectedServiceId
            ) {

                await loadQueueStatus();

                startAutoRefresh();
            }
        }
    }


    /* =========================================================
       LOAD ORGANIZATION
    ========================================================= */

    async function loadOrganization() {

        try {

            const response =
                await fetch(
                    `${API}/organizations/${organizationId}`
                );

            if (!response.ok) {

                throw new Error(
                    "Unable to load organization"
                );
            }

            const data =
                await response.json();

            organizationName.textContent =
                data.name || "Organization";

        } catch (error) {

            console.error(error);

            organizationName.textContent =
                "Organization";

            showError(
                "Unable to load organization details."
            );
        }
    }


    /* =========================================================
       LOAD SERVICES
    ========================================================= */

    async function loadServices() {

        try {

            serviceSelect.disabled = true;

            serviceSelect.innerHTML =
                `<option value="">
                    Loading services...
                </option>`;


            const response =
                await fetch(
                    `${API}/service-items/organization/${organizationId}/active`
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load services"
                );
            }


            services =
                await response.json();


            serviceSelect.innerHTML =
                `<option value="">
                    Select a service
                </option>`;


            if (
                !services ||
                services.length === 0
            ) {

                serviceSelect.innerHTML =
                    `<option value="">
                        No active services available
                    </option>`;

                showError(
                    "There are currently no active services for this organization."
                );

                return;
            }


            services.forEach(
                service => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        service.id;

                    option.textContent =
                        service.name;

                    serviceSelect.appendChild(
                        option
                    );
                }
            );


            serviceSelect.disabled = false;


        } catch (error) {

            console.error(error);

            serviceSelect.innerHTML =
                `<option value="">
                    Unable to load services
                </option>`;

            showError(
                "Unable to load services. Make sure the Spring Boot backend is running."
            );
        }
    }


    /* =========================================================
       LOAD QUEUE STATUS
    ========================================================= */

    async function loadQueueStatus() {

        if (!selectedServiceId) {
            return;
        }


        showLoading();


        try {

            const response =
                await fetch(
                    `${API}/queue/organization/${organizationId}/service/${selectedServiceId}/status`
                );


            if (!response.ok) {

                let message =
                    "Unable to load queue status.";

                try {

                    const errorData =
                        await response.text();

                    if (errorData) {
                        message =
                            errorData;
                    }

                } catch (_) {}

                throw new Error(message);
            }


            const data =
                await response.json();


            hideError();

            renderQueue(data);


        } catch (error) {

            console.error(error);

            queueContent.style.display =
                "none";

            showError(
                error.message ||
                "Unable to load live queue."
            );

        } finally {

            hideLoading();
        }
    }


    /* =========================================================
       RENDER QUEUE
    ========================================================= */

    function renderQueue(data) {

        queueContent.style.display =
            "block";


        /* -----------------------------------------------------
           SERVICE
        ----------------------------------------------------- */

        document.getElementById(
            "serviceName"
        ).textContent =
            data.serviceName || "Service";


        const avgTime =
            Number(
                data.averageServiceTime || 0
            );


        document.getElementById(
            "serviceTime"
        ).textContent =
            avgTime > 0
                ? `Average service time: ${avgTime} min`
                : "Average service time unavailable";


        /* -----------------------------------------------------
           SERVICE STATUS
        ----------------------------------------------------- */

        const statusElement =
            document.getElementById(
                "serviceStatus"
            );


        const active =
            String(
                data.serviceStatus || ""
            ).toUpperCase() === "ACTIVE";


        statusElement.textContent =
            active
                ? "ACTIVE"
                : "INACTIVE";


        statusElement.classList.toggle(
            "closed",
            !active
        );


        /* -----------------------------------------------------
           NOW SERVING
        ----------------------------------------------------- */

        const servingTokens =
            Array.isArray(
                data.currentServingTokens
            )
                ? data.currentServingTokens
                : [];


        let nowServing =
            data.currentServingToken;


        if (
            servingTokens.length > 1
        ) {

            nowServing =
                servingTokens.join(" • ");

        } else if (
            servingTokens.length === 1
        ) {

            nowServing =
                servingTokens[0];

        }


        document.getElementById(
            "nowServing"
        ).textContent =
            nowServing || "None";


        /* -----------------------------------------------------
           LINES
        ----------------------------------------------------- */

        const openLines =
            Number(
                data.openLines || 0
            );

        const totalLines =
            Number(
                data.totalLines || 0
            );


        document.getElementById(
            "linesOpen"
        ).textContent =
            openLines;


        document.getElementById(
            "linesTotal"
        ).textContent =
            `${totalLines} assigned line${totalLines === 1 ? "" : "s"}`;


        /* -----------------------------------------------------
           WAITING
        ----------------------------------------------------- */

        document.getElementById(
            "peopleWaiting"
        ).textContent =
            Number(
                data.totalWaiting || 0
            );


        /* -----------------------------------------------------
           PEOPLE AHEAD
        ----------------------------------------------------- */

        document.getElementById(
            "peopleAhead"
        ).textContent =
            Number(
                data.peopleAheadIfJoin ??
                data.peopleAhead ??
                0
            );


        /* -----------------------------------------------------
           ESTIMATED WAIT
        ----------------------------------------------------- */

        const wait =
            Number(
                data.estimatedWaitMinutes || 0
            );


        document.getElementById(
            "estimatedWait"
        ).textContent =
            formatMinutes(wait);


        /* -----------------------------------------------------
           LINES
        ----------------------------------------------------- */

        renderLines(
            data.lines || []
        );


        /* -----------------------------------------------------
           JOIN
        ----------------------------------------------------- */

        const joinButton =
            document.getElementById(
                "joinButton"
            );

        const joinDescription =
            document.getElementById(
                "joinDescription"
            );


        const canJoin =
            data.canJoin === true;


        joinButton.disabled =
            !canJoin;


        if (!active) {

            joinDescription.textContent =
                "This service is currently inactive.";

        } else if (!canJoin) {

            joinDescription.textContent =
                "No open counter is currently available for this service.";

        } else {

            joinDescription.textContent =
                `You will currently be placed at ${data.selectedCounterName || "the available counter"}.`;
        }


        /* -----------------------------------------------------
           UPDATED
        ----------------------------------------------------- */

        const now =
            new Date();


        document.getElementById(
            "lastUpdated"
        ).textContent =
            `Last updated: ${now.toLocaleTimeString()}`;
    }


    /* =========================================================
       RENDER LINES
    ========================================================= */

    function renderLines(lines) {

        const container =
            document.getElementById(
                "linesContainer"
            );


        container.innerHTML = "";


        if (
            !lines ||
            lines.length === 0
        ) {

            container.innerHTML =
                `
                <div class="vq-empty">
                    No counters are currently assigned to this service.
                </div>
                `;

            return;
        }


        lines.forEach(
            line => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "vq-line";


                const isOpen =
                    line.open === true ||
                    String(
                        line.status || ""
                    ).toUpperCase() === "OPEN";


                const token =
                    line.currentServingToken ||
                    "Not serving";


                const waiting =
                    Number(
                        line.waitingCount || 0
                    );


                card.innerHTML =
                    `
                    <div class="vq-line-top">

                        <div class="vq-counter-name">
                            ${escapeHtml(
                                line.counterName ||
                                "Counter"
                            )}
                        </div>

                        <div class="vq-open-badge"
                             style="${
                                isOpen
                                ? ""
                                : "background:#f1f5f9;color:#64748b;"
                             }">

                            ${
                                isOpen
                                ? "OPEN"
                                : "CLOSED"
                            }

                        </div>

                    </div>


                    <div class="vq-line-token-label">
                        Now Serving
                    </div>

                    <div class="vq-line-token">
                        ${escapeHtml(token)}
                    </div>


                    <div class="vq-line-waiting">

                        <span>
                            People waiting
                        </span>

                        <span>
                            ${waiting}
                        </span>

                    </div>
                    `;


                container.appendChild(
                    card
                );
            }
        );
    }


    /* =========================================================
       JOIN SELECTED SERVICE
    ========================================================= */

    function joinSelectedService() {

        if (!selectedServiceId) {

            showError(
                "Please select a service first."
            );

            return;
        }


        const service =
            services.find(
                item =>
                    String(item.id) ===
                    String(selectedServiceId)
            );


        if (!service) {

            showError(
                "Selected service could not be found."
            );

            return;
        }


        const organization =
            organizationFromUrl ||
            organizationName.textContent;


        const url =
            new URL(
                "join-queue.html",
                window.location.href
            );


        url.searchParams.set(
            "organizationId",
            organizationId
        );

        url.searchParams.set(
            "serviceId",
            selectedServiceId
        );

        url.searchParams.set(
            "organization",
            organization
        );

        url.searchParams.set(
            "service",
            service.name
        );


        if (typeFromUrl) {

            url.searchParams.set(
                "type",
                typeFromUrl
            );
        }


        window.location.href =
            url.toString();
    }


    /* =========================================================
       AUTO REFRESH
    ========================================================= */

    function startAutoRefresh() {

        stopAutoRefresh();


        refreshTimer =
            setInterval(
                function () {

                    if (selectedServiceId) {
                        loadQueueStatus();
                    }

                },
                5000
            );
    }


    function stopAutoRefresh() {

        if (refreshTimer) {

            clearInterval(
                refreshTimer
            );

            refreshTimer = null;
        }
    }


    /* =========================================================
       LOADING
    ========================================================= */

    function showLoading() {

        loadingBox.style.display =
            "block";
    }


    function hideLoading() {

        loadingBox.style.display =
            "none";
    }


    /* =========================================================
       ERROR
    ========================================================= */

    function showError(message) {

        errorBox.textContent =
            message;

        errorBox.style.display =
            "block";
    }


    function hideError() {

        errorBox.style.display =
            "none";
    }


    /* =========================================================
       BACK
    ========================================================= */

    function goBack() {

        if (
            document.referrer &&
            document.referrer.includes(
                window.location.host
            )
        ) {

            window.history.back();

        } else {

            window.location.href =
                "home.html";
        }
    }


    /* =========================================================
       FORMAT MINUTES
    ========================================================= */

    function formatMinutes(minutes) {

        minutes =
            Number(minutes || 0);


        if (minutes <= 0) {
            return "0 min";
        }


        if (minutes < 60) {

            return `${minutes} min`;
        }


        const hours =
            Math.floor(
                minutes / 60
            );

        const remaining =
            minutes % 60;


        if (remaining === 0) {

            return `${hours} hr`;
        }


        return `${hours} hr ${remaining} min`;
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHtml(value) {

        return String(value ?? "")
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


    /* =========================================================
       CLEANUP
    ========================================================= */

    window.addEventListener(
        "beforeunload",
        stopAutoRefresh
    );
