const API =
        ((window.location.port === "3000") ? "http://localhost:8080" : window.location.origin);


    let admin = null;

    let counter = null;

    let staff = null;

    let queue = [];

    let currentToken = null;

    const params =
        new URLSearchParams(
            window.location.search
        );

    const counterId =
        params.get("id");


    /* =====================================================
       AUTH
    ===================================================== */

    function checkAuth() {

        const stored =
            localStorage.getItem(
                "ordexa_admin"
            ) ||
            sessionStorage.getItem(
                "ordexa_admin"
            );


        if (!stored) {

            window.location.href =
                "login.html";

            return false;
        }


        try {

            admin =
                JSON.parse(stored);

        } catch {

            window.location.href =
                "login.html";

            return false;
        }


        document.getElementById(
            "adminName"
        ).textContent =
            admin.name || "Admin";


        document.getElementById(
            "adminInitial"
        ).textContent =
            (admin.name || "A")
                .charAt(0)
                .toUpperCase();


        return true;

    }


    /* =====================================================
       CHECK COUNTER ID
    ===================================================== */

    function checkCounterId() {

        if (!counterId) {

            alert(
                "Counter ID is missing."
            );

            window.location.href =
                "counters.html";

            return false;
        }

        return true;

    }


    /* =====================================================
       LOAD COUNTER
    ===================================================== */

    async function loadCounter() {

        try {

            const response =
                await fetch(
                    `${API}/api/counters/${counterId}`
                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            counter =
                await response.json();


            document.getElementById(
                "counterName"
            ).textContent =
                counter.name;


            const status =
                String(
                    counter.status || "OPEN"
                ).toUpperCase();


            const statusElement =
                document.getElementById(
                    "counterStatus"
                );


            statusElement.textContent =
                status;


            statusElement.className =
                "status " +
                (
                    status === "OPEN"
                        ? "open"
                        : "closed"
                );


            await loadStaff(
                counter.staffId
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Unable to load counter",
                true
            );

        }

    }


    /* =====================================================
       LOAD STAFF
    ===================================================== */

    async function loadStaff(staffId) {

        if (!staffId) {

            document.getElementById(
                "staffName"
            ).textContent =
                "No staff assigned";

            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/api/staff/organization/${counter.organizationId}`
                );


            if (!response.ok) {
                throw new Error();
            }


            const staffList =
                await response.json();


            staff =
                staffList.find(
                    item =>
                        Number(item.id) ===
                        Number(staffId)
                );


            document.getElementById(
                "staffName"
            ).textContent =
                staff
                    ? `👤 ${staff.name} • ${staff.role}`
                    : "Staff not found";


        } catch {

            document.getElementById(
                "staffName"
            ).textContent =
                "Staff information unavailable";

        }

    }


    /* =====================================================
       LOAD QUEUE
    ===================================================== */

    async function loadQueue() {

        try {

            const response =
                await fetch(
                    `${API}/api/queue/counter/${counterId}`
                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            queue =
                await response.json();


            renderQueue();


        } catch (error) {

            console.error(error);

            showToast(
                "Unable to load queue",
                true
            );

        }

    }


    /* =====================================================
       LOAD CURRENT
    ===================================================== */

    async function loadCurrent() {

        try {

            const response =
                await fetch(
                    `${API}/api/queue/counter/${counterId}/current`
                );


            if (!response.ok) {

                throw new Error();

            }


            currentToken =
                await response.json();


            renderCurrent();


        } catch (error) {

            console.error(error);

        }

    }


    /* =====================================================
       RENDER CURRENT
    ===================================================== */

    function renderCurrent() {

        const tokenElement =
            document.getElementById(
                "currentToken"
            );


        const infoElement =
            document.getElementById(
                "currentInfo"
            );


        if (!currentToken) {

            tokenElement.textContent =
                "---";


            infoElement.textContent =
                "No token is currently being served.";


            return;

        }


        tokenElement.textContent =
            formatToken(
                currentToken.tokenNumber
            );


        let info =
            `Serving • ${currentToken.addedTimeMinutes || 0} extra minutes`;


        if (currentToken.calledAt) {

            info +=
                ` • Started ${formatDateTime(currentToken.calledAt)}`;

        }


        infoElement.textContent =
            info;

    }


    /* =====================================================
       RENDER QUEUE
    ===================================================== */

    function renderQueue() {

        const waiting =
            queue.filter(
                token =>
                    token.status === "WAITING"
            );


        const history =
            queue.filter(
                token =>
                    token.status === "SERVED" ||
                    token.status === "SKIPPED"
            );


        document.getElementById(
            "waitingCount"
        ).textContent =
            waiting.length;


        document.getElementById(
            "historyCount"
        ).textContent =
            history.length;


        renderWaiting(
            waiting
        );


        renderHistory(
            history
        );

    }


    /* =====================================================
       WAITING QUEUE
    ===================================================== */

    function renderWaiting(waiting) {

        const container =
            document.getElementById(
                "waitingQueue"
            );


        if (!waiting.length) {

            container.innerHTML = `

                <div class="empty">

                    <div class="empty-icon">
                        🎟️
                    </div>

                    No waiting tokens.

                </div>

            `;

            return;
        }


        container.innerHTML =
            waiting.map(
                token => `

                <div class="queue-item">

                    <div class="token-number">

                        ${formatToken(
                            token.tokenNumber
                        )}

                    </div>


                    <div class="token-meta">

                        <strong>
                            Waiting
                        </strong>

                        <span>
                            Joined
                            ${formatDateTime(
                                token.createdAt
                            )}
                        </span>

                    </div>


                    <div class="token-actions">

                        <button
                            class="serve-small"
                            onclick="serveToken(${token.id})">

                            Serve

                        </button>


                        <button
                            class="skip-small"
                            onclick="skipToken(${token.id})">

                            Skip

                        </button>

                    </div>

                </div>

            `
            ).join("");

    }


    /* =====================================================
       HISTORY
    ===================================================== */

    function renderHistory(history) {

        const container =
            document.getElementById(
                "history"
            );


        if (!history.length) {

            container.innerHTML = `

                <div class="empty">

                    <div class="empty-icon">
                        📋
                    </div>

                    No history yet.

                </div>

            `;

            return;
        }


        const sorted =
            [...history].reverse();


        container.innerHTML =
            sorted.map(
                token => `

                <div class="history-item">

                    <div>

                        <div class="history-token">

                            ${formatToken(
                                token.tokenNumber
                            )}

                        </div>

                        <small style="
                            color:#718096;
                            font-size:10px;
                        ">

                            ${
                                token.status === "SERVED"
                                    ? formatDateTime(
                                        token.completedAt
                                    )
                                    : "Skipped"
                            }

                        </small>

                    </div>


                    <span
                        class="history-status ${
                            token.status === "SERVED"
                                ? "served"
                                : "skipped"
                        }">

                        ${
                            token.status === "SERVED"
                                ? "COMPLETED"
                                : "SKIPPED"
                        }

                    </span>

                </div>

            `
            ).join("");

    }


    /* =====================================================
       GENERATE TOKEN
    ===================================================== */

    async function generateToken() {

        try {

            const response =
                await fetch(
                    `${API}/api/queue/counter/${counterId}/token`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Unable to generate token"
                );

            }


            showToast(
                `Token ${formatToken(result.tokenNumber)} generated`
            );


            await refresh();


        } catch (error) {

            showToast(
                error.message,
                true
            );

        }

    }


    /* =====================================================
       SERVE NEXT
    ===================================================== */

    async function serveNext() {

        try {

            const response =
                await fetch(
                    `${API}/api/queue/counter/${counterId}/serve-next`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                throw new Error(
                    result ||
                    "Unable to serve next token"
                );

            }


            showToast(
                `Now serving ${formatToken(result.tokenNumber)}`
            );


            await refresh();


        } catch (error) {

            showToast(
                error.message,
                true
            );

        }

    }


    /* =====================================================
       SERVE SPECIFIC TOKEN
    ===================================================== */

    async function serveToken(id) {

        try {

            const response =
                await fetch(
                    `${API}/api/queue/${id}/serve`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                throw new Error(
                    result ||
                    "Unable to serve token"
                );

            }


            showToast(
                `Now serving ${formatToken(result.tokenNumber)}`
            );


            await refresh();


        } catch (error) {

            showToast(
                error.message,
                true
            );

        }

    }


    /* =====================================================
       SKIP TOKEN
    ===================================================== */

    async function skipToken(id) {

        if (
            !confirm(
                "Skip this token?"
            )
        ) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/api/queue/${id}/skip`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                throw new Error(
                    result ||
                    "Unable to skip token"
                );

            }


            showToast(
                "Token skipped"
            );


            await refresh();


        } catch (error) {

            showToast(
                error.message,
                true
            );

        }

    }


    /* =====================================================
       SKIP CURRENT
    ===================================================== */

    async function skipCurrent() {

        if (!currentToken) {

            showToast(
                "No token is currently being served",
                true
            );

            return;
        }


        await skipToken(
            currentToken.id
        );

    }


    /* =====================================================
       COMPLETE CURRENT
    ===================================================== */

    async function completeCurrent() {

        if (!currentToken) {

            showToast(
                "No token is currently being served",
                true
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/api/queue/${currentToken.id}/complete`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                throw new Error(
                    result ||
                    "Unable to complete token"
                );

            }


            showToast(
                `Token ${formatToken(currentToken.tokenNumber)} completed`
            );


            await refresh();


        } catch (error) {

            showToast(
                error.message,
                true
            );

        }

    }


    /* =====================================================
       ADD TIME MODAL
    ===================================================== */

    function openAddTimeModal() {

        if (!currentToken) {

            showToast(
                "No token is currently being served",
                true
            );

            return;
        }


        document.getElementById(
            "timeInput"
        ).value = "";


        document.getElementById(
            "addTimeModal"
        ).classList.add(
            "show"
        );


        document.getElementById(
            "timeInput"
        ).focus();

    }


    function closeAddTimeModal() {

        document.getElementById(
            "addTimeModal"
        ).classList.remove(
            "show"
        );

    }


    /* =====================================================
       ADD TIME
    ===================================================== */

    async function addTime() {

        if (!currentToken) {
            return;
        }


        const minutes =
            Number(
                document.getElementById(
                    "timeInput"
                ).value
            );


        if (
            !Number.isInteger(minutes) ||
            minutes <= 0
        ) {

            showToast(
                "Enter valid minutes",
                true
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/api/queue/${currentToken.id}/add-time?minutes=${minutes}`,
                    {
                        method: "POST"
                    }
                );


            const result =
                await readResponse(
                    response
                );


            if (!response.ok) {

                throw new Error(
                    result ||
                    "Unable to add time"
                );

            }


            closeAddTimeModal();


            showToast(
                `${minutes} minutes added`
            );


            await refresh();


        } catch (error) {

            showToast(
                error.message,
                true
            );

        }

    }


    /* =====================================================
       REFRESH
    ===================================================== */

    async function refresh() {

        await Promise.all([
            loadQueue(),
            loadCurrent()
        ]);

    }


    /* =====================================================
       FORMAT TOKEN
    ===================================================== */

    function formatToken(number) {

        return String(
            number
        ).padStart(
            3,
            "0"
        );

    }


    /* =====================================================
       FORMAT DATE
    ===================================================== */

    function formatDateTime(value) {

        if (!value) {
            return "-";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }


        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    /* =====================================================
       READ RESPONSE
    ===================================================== */

    async function readResponse(response) {

        const text =
            await response.text();


        if (!text) {
            return null;
        }


        try {

            return JSON.parse(
                text
            );

        } catch {

            return text;

        }

    }


    /* =====================================================
       BACK
    ===================================================== */

    function goBack() {

        window.location.href =
            "counters.html";

    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    function logout() {

        localStorage.removeItem(
            "ordexa_admin"
        );

        sessionStorage.removeItem(
            "ordexa_admin"
        );

        localStorage.removeItem(
            "ordexa_organization_id"
        );

        localStorage.removeItem(
            "ordexaOrganizationId"
        );

        window.location.href =
            "login.html";

    }


    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer;


    function showToast(
        message,
        error = false
    ) {

        const toast =
            document.getElementById(
                "toast"
            );


        toast.textContent =
            message;


        toast.className =
            "toast show" +
            (
                error
                    ? " error"
                    : ""
            );


        clearTimeout(
            toastTimer
        );


        toastTimer =
            setTimeout(
                () => {

                    toast.className =
                        "toast";

                },
                3000
            );

    }


    /* =====================================================
       MODAL OUTSIDE CLICK
    ===================================================== */

    document
        .getElementById(
            "addTimeModal"
        )
        .addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    this
                ) {

                    closeAddTimeModal();

                }

            }
        );


    /* =====================================================
       ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                closeAddTimeModal();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    async function init() {

        if (!checkAuth()) {
            return;
        }


        if (!checkCounterId()) {
            return;
        }


        await loadCounter();

        await refresh();


        /*
         * Automatically update queue
         * every 2.5 seconds.
         */

        setInterval(
            refresh,
            2500
        );

    }


    init();
