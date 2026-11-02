const API =
        ((window.location.port === "3000") ? "http://localhost:8080" : window.location.origin);


    let admin = null;

    let organization = null;

    let selectedDate = new Date();


    /* =====================================================
       AUTH
    ===================================================== */

    function checkAuth() {

        const stored =
            localStorage.getItem("ordexa_admin") ||
            sessionStorage.getItem("ordexa_admin");


        if (!stored) {

            window.location.href =
                "login.html";

            return false;
        }


        try {

            admin =
                JSON.parse(stored);

            return true;

        } catch (error) {

            localStorage.removeItem(
                "ordexa_admin"
            );

            sessionStorage.removeItem(
                "ordexa_admin"
            );

            window.location.href =
                "login.html";

            return false;
        }

    }


    /* =====================================================
       GET ORGANIZATION
    ===================================================== */

    async function loadOrganization() {

        const response =
            await fetch(
                `${API}/api/organizations/admin/${admin.id}`,
                {
                    cache: "no-store"
                }
            );


        if (response.status === 404) {

            window.location.href =
                "organization.html";

            return null;
        }


        if (!response.ok) {

            throw new Error(
                await response.text()
            );

        }


        organization =
            await response.json();


        return organization;

    }


    /* =====================================================
       DATE
    ===================================================== */

    function formatDateForAPI(date) {

        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                date.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;

    }


    function updateDateDisplay() {

        const today =
            new Date();


        const selected =
            selectedDate;


        const todayString =
            formatDateForAPI(today);


        const selectedString =
            formatDateForAPI(selected);


        let text;


        if (selectedString === todayString) {

            text = "Today";

        } else {

            text =
                selected.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

        }


        document.getElementById(
            "dateDisplay"
        ).textContent = text;

    }


    function changeDay(amount) {

        selectedDate.setDate(
            selectedDate.getDate() + amount
        );


        updateDateDisplay();

        loadCustomers();

    }


    /* =====================================================
       LOAD CUSTOMERS
    ===================================================== */

    async function loadCustomers() {

        const container =
            document.getElementById(
                "customerList"
            );


        container.innerHTML = `
            <div class="loading">
                Loading customers...
            </div>
        `;


        if (!organization) {

            return;

        }


        try {

            /*
             * Existing backend endpoint gives
             * organization's queue history.
             */

            const response =
                await fetch(
                    `${API}/api/queue/organization/${organization.id}/walk-ins`,
                    {
                        cache: "no-store"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );

            }


            const data =
                await response.json();


            if (!Array.isArray(data)) {

                renderEmpty();

                return;

            }


            const selectedDay =
                formatDateForAPI(
                    selectedDate
                );


            /*
             * Keep only customers whose
             * joinedAt date matches selected day.
             */

            const customers =
                data.filter(item => {

                    const joinedAt =
                        item.joinedAt ||
                        item.createdAt ||
                        item.joinTime ||
                        item.createdAtTime;


                    if (!joinedAt) {
                        return false;
                    }


                    const date =
                        new Date(joinedAt);


                    if (isNaN(date.getTime())) {
                        return false;
                    }


                    return (
                        formatDateForAPI(date)
                        === selectedDay
                    );

                });


            customers.sort(
                (a, b) => {

                    const timeA =
                        new Date(
                            a.joinedAt ||
                            a.createdAt ||
                            a.joinTime
                        ).getTime();


                    const timeB =
                        new Date(
                            b.joinedAt ||
                            b.createdAt ||
                            b.joinTime
                        ).getTime();


                    return timeA - timeB;

                }
            );


            if (customers.length === 0) {

                renderEmpty();

                return;

            }


            renderCustomers(
                customers
            );


        } catch (error) {

            console.error(
                "Customer loading error:",
                error
            );


            container.innerHTML = `

                <div class="empty">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load customers
                    </h3>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                </div>

            `;

        }

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderCustomers(customers) {

        const container =
            document.getElementById(
                "customerList"
            );


        container.innerHTML =
            customers.map(customer => {

                const customerName =
                    customer.customerName ||
                    customer.userName ||
                    customer.name ||
                    customer.user?.name ||
                    "Customer";


                const serviceName =
                    customer.serviceName ||
                    customer.service?.name ||
                    "Service";


                const joinedAt =
                    customer.joinedAt ||
                    customer.createdAt ||
                    customer.joinTime;


                const time =
                    formatTime(
                        joinedAt
                    );


                return `

                    <div class="customer-row">

                        <div class="customer-name">
                            ${escapeHtml(customerName)}
                        </div>

                        <div class="service-name">
                            ${escapeHtml(serviceName)}
                        </div>

                        <div class="joined-time">
                            ${escapeHtml(time)}
                        </div>

                    </div>

                `;

            }).join("");

    }


    /* =====================================================
       EMPTY
    ===================================================== */

    function renderEmpty() {

        document.getElementById(
            "customerList"
        ).innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    👥
                </div>

                <h3>
                    No customers joined
                </h3>

                <p>
                    No customer joined a service on this day.
                </p>

            </div>

        `;

    }


    /* =====================================================
       TIME
    ===================================================== */

    function formatTime(value) {

        if (!value) {
            return "--";
        }


        const date =
            new Date(value);


        if (isNaN(date.getTime())) {
            return "--";
        }


        return date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

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
       START
    ===================================================== */

    async function init() {

        if (!checkAuth()) {
            return;
        }


        try {

            await loadOrganization();

            updateDateDisplay();

            await loadCustomers();

        } catch (error) {

            console.error(error);

            document.getElementById(
                "customerList"
            ).innerHTML = `

                <div class="empty">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load customers
                    </h3>

                    <p>
                        ${escapeHtml(error.message)}
                    </p>

                </div>

            `;

        }

    }


    init();
