const API =
        ((window.location.port === "3000") ? "http://localhost:8080" : window.location.origin);


    let admin = null;
    let organization = null;


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
       LOAD ORGANIZATION
    ===================================================== */

    async function loadOrganization() {

        try {

            const response =
                await fetch(
                    `${API}/api/organizations/admin/${admin.id}`
                );


            if (response.status === 404) {

                window.location.href =
                    "organization.html";

                return;
            }


            if (!response.ok) {

                throw new Error(
                    await response.text()
                );
            }


            organization =
                await response.json();


            localStorage.setItem(
                "ordexa_organization_id",
                organization.id
            );


            localStorage.setItem(
                "ordexaOrganizationId",
                organization.id
            );


            renderOrganization();


            await loadStats();


        } catch (error) {

            console.error(error);

            document.getElementById(
                "organizationCard"
            ).innerHTML = `

                <div>
                    <div style="
                        font-size:20px;
                        font-weight:800;
                    ">
                        Unable to load organization
                    </div>

                    <div style="
                        margin-top:7px;
                        color:#b8d1dc;
                        font-size:13px;
                    ">
                        ${escapeHtml(error.message)}
                    </div>
                </div>

            `;

        }

    }


    /* =====================================================
       ORGANIZATION UI
    ===================================================== */

    function renderOrganization() {

        const icon =
            organization.icon ||
            getIcon(organization.type);


        const type =
            formatType(
                organization.type
            );


        document.getElementById(
            "organizationCard"
        ).innerHTML = `

            <div class="organization-left">

                <div class="organization-icon">
                    ${escapeHtml(icon)}
                </div>

                <div>

                    <div class="organization-name">
                        ${escapeHtml(organization.name)}
                    </div>

                    <div class="organization-type">
                        ${escapeHtml(type)}
                    </div>

                </div>

            </div>


            <button
                class="organization-button"
                onclick="openOrganization()">

                Manage Organization

            </button>

        `;

    }


    /* =====================================================
       LOAD DASHBOARD STATS
    ===================================================== */

    async function loadStats() {

        const organizationId =
            organization.id;


        try {

            /*
             * COUNTERS
             */

            const counterResponse =
                await fetch(
                    `${API}/api/counters/organization/${organizationId}`
                );


            if (counterResponse.ok) {

                const counters =
                    await counterResponse.json();


                document.getElementById(
                    "counterCount"
                ).textContent =
                    counters.length;


                let activeQueues = 0;


                await Promise.all(
                    counters.map(
                        async counter => {

                            try {

                                const response =
                                    await fetch(
                                        `${API}/api/queue/counter/${counter.id}/current`
                                    );


                                if (!response.ok) {
                                    return;
                                }


                                const current =
                                    await response.json();


                                if (current) {
                                    activeQueues++;
                                }

                            } catch (error) {

                                console.error(error);

                            }

                        }
                    )
                );


                document.getElementById(
                    "activeQueueCount"
                ).textContent =
                    activeQueues;

            } else {

                document.getElementById(
                    "counterCount"
                ).textContent =
                    "0";

                document.getElementById(
                    "activeQueueCount"
                ).textContent =
                    "0";
            }


            /*
             * STAFF
             */

            const staffResponse =
                await fetch(
                    `${API}/api/staff/organization/${organizationId}`
                );


            if (staffResponse.ok) {

                const staff =
                    await staffResponse.json();


                document.getElementById(
                    "staffCount"
                ).textContent =
                    staff.length;

            } else {

                document.getElementById(
                    "staffCount"
                ).textContent =
                    "0";
            }


        } catch (error) {

            console.error(
                "Dashboard stats error:",
                error
            );

            document.getElementById(
                "counterCount"
            ).textContent =
                "0";

            document.getElementById(
                "staffCount"
            ).textContent =
                "0";

            document.getElementById(
                "activeQueueCount"
            ).textContent =
                "0";
        }

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    function openCounters() {

        window.location.href =
            "counters.html";

    }


    function openStaff() {

        window.location.href =
            "staff.html";

    }


    function openOrganization() {

        window.location.href =
            "organization.html";

    }


    /* =====================================================
       TYPE
    ===================================================== */

    function formatType(type) {

        switch (
            String(type || "").toUpperCase()
        ) {

            case "HOSPITAL":
                return "Hospital";

            case "BANK":
                return "Bank";

            case "GOVERNMENT":
                return "Government Office";

            case "CUSTOM":
                return "Custom Organization";

            default:
                return type || "Organization";
        }

    }


    function getIcon(type) {

        switch (
            String(type || "").toUpperCase()
        ) {

            case "HOSPITAL":
                return "🏥";

            case "BANK":
                return "🏦";

            case "GOVERNMENT":
                return "🏛️";

            default:
                return "🏢";
        }

    }


    /* =====================================================
       ESCAPE
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

        await loadOrganization();

    }


    init();
