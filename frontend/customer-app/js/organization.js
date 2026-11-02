/* =====================================================
   API
===================================================== */

const API =
    ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));


/* =====================================================
   LOGIN CHECK
===================================================== */

function getLoggedInUser() {

    let saved =
        localStorage.getItem(
            "ordexa_user"
        );


    if (!saved) {

        saved =
            sessionStorage.getItem(
                "ordexa_user"
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

        console.error(error);


        localStorage.removeItem(
            "ordexa_user"
        );

        sessionStorage.removeItem(
            "ordexa_user"
        );


        window.location.href =
            "login.html";


        return null;

    }

}


const user =
    getLoggedInUser();


/* =====================================================
   GET ORGANIZATION ID
===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );


const organizationId =
    params.get("id");


/* =====================================================
   LOAD ORGANIZATION
===================================================== */

async function loadOrganization() {

    if (!organizationId) {

        showError(
            "Organization ID is missing."
        );

        return;

    }


    showLoading();


    try {

        /*
         * First try:
         * GET /api/organizations/{id}
         */

        const orgResponse =
            await fetch(
                `${API}/organizations/${encodeURIComponent(organizationId)}`
            );


        let organization;


        if (orgResponse.ok) {

            organization =
                await orgResponse.json();

        } else {

            /*
             * Fallback:
             * GET /api/organizations
             */

            const allResponse =
                await fetch(
                    `${API}/organizations`
                );


            if (!allResponse.ok) {

                throw new Error(
                    "Unable to load organizations."
                );

            }


            const allOrganizations =
                await allResponse.json();


            organization =
                allOrganizations.find(
                    org =>
                        String(org.id) ===
                        String(organizationId)
                );


            if (!organization) {

                throw new Error(
                    "Organization not found."
                );

            }

        }


        /* DISPLAY ORGANIZATION */

        displayOrganization(
            organization
        );


        /* LOAD SERVICES */

        await loadServices(
            organization.id
        );


    } catch (error) {

        console.error(
            "Organization error:",
            error
        );


        showError(
            error.message ||
            "Unable to load organization."
        );

    }

}


/* =====================================================
   DISPLAY ORGANIZATION
===================================================== */

function displayOrganization(org) {

    document.getElementById(
        "loading"
    ).style.display = "none";


    document.getElementById(
        "error"
    ).style.display = "none";


    document.getElementById(
        "orgHeader"
    ).style.display = "flex";


    document.getElementById(
        "orgName"
    ).textContent =
        org.name ||
        "Organization";


    document.getElementById(
        "orgType"
    ).textContent =
        org.type ||
        "Organization";


    document.getElementById(
        "orgDescription"
    ).textContent =
        org.description ||
        "Explore available services.";


    document.getElementById(
        "orgIcon"
    ).textContent =
        getOrganizationIcon(org);

}


/* =====================================================
   LOAD SERVICES
   IMPORTANT BACKEND FIX
===================================================== */

async function loadServices(
    organizationId
) {

    try {

        /*
         * CORRECT BACKEND ENDPOINT:
         *
         * /api/service-items/organization/{organizationId}
         *
         * NOT:
         * /api/services/organization/{organizationId}
         */

        const response =
            await fetch(
                `${API}/service-items/organization/${encodeURIComponent(organizationId)}`
            );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                `Unable to load services (${response.status})`
            );

        }


        const services =
            await response.json();


        console.log(
            "Services loaded:",
            services
        );


        renderServices(
            Array.isArray(services)
                ? services
                : []
        );


    } catch (error) {

        console.error(
            "Services error:",
            error
        );


        document.getElementById(
            "serviceSection"
        ).style.display = "none";


        document.getElementById(
            "empty"
        ).style.display = "block";


        document.getElementById(
            "emptyTitle"
        ).textContent =
            "Unable to Load Services";


        document.getElementById(
            "emptyMessage"
        ).textContent =
            error.message ||
            "Make sure the backend is running.";

    }

}


/* =====================================================
   RENDER SERVICES
===================================================== */

function renderServices(
    services
) {

    const container =
        document.getElementById(
            "services"
        );


    const section =
        document.getElementById(
            "serviceSection"
        );


    const empty =
        document.getElementById(
            "empty"
        );


    const count =
        document.getElementById(
            "serviceCount"
        );


    container.innerHTML = "";


    count.textContent =
        services.length +
        (
            services.length === 1
                ? " service"
                : " services"
        );


    /* NO SERVICES */

    if (services.length === 0) {

        section.style.display =
            "none";


        empty.style.display =
            "block";


        document.getElementById(
            "emptyTitle"
        ).textContent =
            "No Services Available";


        document.getElementById(
            "emptyMessage"
        ).textContent =
            "This organization has not added any services yet.";


        return;

    }


    empty.style.display =
        "none";


    section.style.display =
        "block";


    services.forEach(
        service => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "service-card";


            const active =
                String(
                    service.status || ""
                ).toUpperCase() ===
                "ACTIVE";


            /*
             * BACKEND FIELD:
             *
             * averageServiceTime
             *
             * NOT:
             * estimatedTimeMinutes
             */

            const averageTime =
                service.averageServiceTime ??
                0;


            card.innerHTML = `

                <div class="service-icon">
                    ⚙
                </div>


                <h3 class="service-name">

                    ${escapeHtml(
                        service.name ||
                        "Service"
                    )}

                </h3>


                <p class="service-description">

                    ${escapeHtml(
                        service.description ||
                        "No description available."
                    )}

                </p>


                <div class="service-info">

                    <span class="time">

                        ⏱
                        ${escapeHtml(
                            String(
                                averageTime
                            )
                        )}
                        min

                    </span>


                    <span class="${
                        active
                            ? "active-status"
                            : "inactive-status"
                    }">

                        ${
                            active
                                ? "AVAILABLE"
                                : "UNAVAILABLE"
                        }

                    </span>

                </div>


                <button
                    class="select-btn ${
                        active
                            ? ""
                            : "disabled"
                    }"
                    ${active
                        ? ""
                        : "disabled"}>

                    ${
                        active
                            ? "Select Service →"
                            : "Currently Unavailable"
                    }

                </button>

            `;


            /* ACTIVE SERVICE */

            if (active) {

                card.addEventListener(
                    "click",
                    function() {

                        window.location.href =
                            "service.html?id=" +
                            encodeURIComponent(
                                service.id
                            ) +
                            "&organizationId=" +
                            encodeURIComponent(
                                organizationId
                            );

                    }
                );

            }


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   ORGANIZATION ICON
===================================================== */

function getOrganizationIcon(
    org
) {

    if (org.icon) {

        return org.icon;

    }


    const type =
        String(
            org.type || ""
        ).toUpperCase();


    if (
        type === "HOSPITAL"
    ) {

        return "🏥";

    }


    if (
        type === "BANK"
    ) {

        return "🏦";

    }


    if (
        type ===
        "GOVERNMENT OFFICE"
    ) {

        return "🏛";

    }


    return "🏢";

}


/* =====================================================
   HTML ESCAPE
===================================================== */

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

}


/* =====================================================
   LOADING
===================================================== */

function showLoading() {

    document.getElementById(
        "loading"
    ).style.display =
        "block";


    document.getElementById(
        "error"
    ).style.display =
        "none";


    document.getElementById(
        "orgHeader"
    ).style.display =
        "none";


    document.getElementById(
        "serviceSection"
    ).style.display =
        "none";


    document.getElementById(
        "empty"
    ).style.display =
        "none";

}


/* =====================================================
   ERROR
===================================================== */

function showError(
    message
) {

    document.getElementById(
        "loading"
    ).style.display =
        "none";


    document.getElementById(
        "error"
    ).style.display =
        "block";


    document.getElementById(
        "errorText"
    ).textContent =
        message;

}


/* =====================================================
   NAVIGATION
===================================================== */

function goHome() {

    window.location.href =
        "home.html";

}


function goBack() {

    window.location.href =
        "explore.html";

}


function goExplore() {

    window.location.href =
        "explore.html";

}


function openQueue() {

    window.location.href =
        "live-queue.html";

}


function openNotifications() {

    window.location.href =
        "notifications.html";

}


function openProfile() {

    window.location.href =
        "profile.html";

}


/* =====================================================
   START
===================================================== */

if (user) {

    loadOrganization();

}
