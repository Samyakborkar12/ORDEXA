/* =====================================================
   API
===================================================== */

const API =
    ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));


let organizations = [];

let currentFilter =
    "ALL";



/* =====================================================
   LOGIN CHECK
===================================================== */

function getLoggedInUser() {

    let user =
        localStorage.getItem(
            "ordexa_user"
        );


    if (!user) {

        user =
            sessionStorage.getItem(
                "ordexa_user"
            );

    }


    if (!user) {

        window.location.href =
            "login.html";

        return null;

    }


    try {

        return JSON.parse(user);

    }

    catch (error) {

        console.error(
            "[ORDEXA] Invalid user session",
            error
        );


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
   LOAD ORGANIZATIONS
===================================================== */

async function loadOrganizations() {

    const loading =
        document.getElementById(
            "loading"
        );


    const error =
        document.getElementById(
            "error"
        );


    const empty =
        document.getElementById(
            "empty"
        );


    const container =
        document.getElementById(
            "organizations"
        );


    loading.style.display =
        "block";


    error.style.display =
        "none";


    empty.style.display =
        "none";


    container.innerHTML =
        "";


    document.getElementById(
        "count"
    ).textContent =
        "Loading...";


    try {


        console.log(
            "[ORDEXA] Loading organizations..."
        );


        const response =
            await fetch(
                `${API}/organizations`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        console.log(
            "[ORDEXA] Organization API status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load organizations"
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "Invalid organizations response"
            );

        }


        organizations =
            data;


        console.log(
            "[ORDEXA] Organizations:",
            organizations
        );


        loading.style.display =
            "none";


        filterOrganizations();


    }

    catch (err) {

        console.error(
            "[ORDEXA] Organization loading error:",
            err
        );


        loading.style.display =
            "none";


        error.style.display =
            "block";


        document.getElementById(
            "count"
        ).textContent =
            "0 organizations";

    }

}



/* =====================================================
   SET FILTER
===================================================== */

function setFilter(
    type,
    button
) {


    currentFilter =
        type;


    document
        .querySelectorAll(
            ".filter"
        )
        .forEach(
            btn => {

                btn.classList.remove(
                    "active"
                );

            }
        );


    button.classList.add(
        "active"
    );


    filterOrganizations();

}



/* =====================================================
   NORMALIZE ORGANIZATION TYPE
===================================================== */

function normalizeType(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toUpperCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

}



/* =====================================================
   CHECK GOVERNMENT ORGANIZATION
===================================================== */

function isGovernmentOrganization(
    org
) {


    const type =
        normalizeType(
            org.type
        );


    /*
     * Accept all reasonable government
     * type values.
     *
     * Examples:
     *
     * GOVERNMENT
     * GOVERNMENT OFFICE
     * GOVERNMENT_OFFICE
     * GOVT
     * GOVT OFFICE
     * RTO
     */

    const governmentTypes = [

        "GOVERNMENT",

        "GOVERNMENT OFFICE",

        "GOVT",

        "GOVT OFFICE",

        "GOVERNMENT DEPARTMENT",

        "RTO"

    ];


    if (
        governmentTypes.includes(
            type
        )
    ) {

        return true;

    }


    /*
     * Also support future values such as:
     *
     * GOVERNMENT RTO
     * GOVERNMENT OFFICE RTO
     * GOVERNMENT AUTHORITY
     */

    if (
        type.includes(
            "GOVERNMENT"
        )
    ) {

        return true;

    }


    if (
        type.includes(
            "GOVT"
        )
    ) {

        return true;

    }


    return false;

}



/* =====================================================
   CHECK ORGANIZATION TYPE
===================================================== */

function matchesFilter(
    org,
    filter
) {


    if (
        filter === "ALL"
    ) {

        return true;

    }


    const type =
        normalizeType(
            org.type
        );


    if (
        filter === "HOSPITAL"
    ) {

        return type ===
            "HOSPITAL";

    }


    if (
        filter === "BANK"
    ) {

        return type ===
            "BANK";

    }


    if (
        filter === "GOVERNMENT"
    ) {

        return isGovernmentOrganization(
            org
        );

    }


    return true;

}



/* =====================================================
   FILTER ORGANIZATIONS
===================================================== */

function filterOrganizations() {


    const search =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .trim()
            .toLowerCase();


    const filtered =
        organizations.filter(
            org => {


                const name =
                    String(
                        org.name || ""
                    )
                        .toLowerCase();


                const description =
                    String(
                        org.description || ""
                    )
                        .toLowerCase();


                const type =
                    normalizeType(
                        org.type
                    )
                        .toLowerCase();


                const matchesType =
                    matchesFilter(
                        org,
                        currentFilter
                    );


                const matchesSearch =
                    !search ||

                    name.includes(
                        search
                    ) ||

                    description.includes(
                        search
                    ) ||

                    type.includes(
                        search
                    );


                return (
                    matchesType &&
                    matchesSearch
                );

            }
        );


    renderOrganizations(
        filtered
    );

}



/* =====================================================
   RENDER ORGANIZATIONS
===================================================== */

function renderOrganizations(
    list
) {


    const container =
        document.getElementById(
            "organizations"
        );


    const empty =
        document.getElementById(
            "empty"
        );


    const count =
        document.getElementById(
            "count"
        );


    container.innerHTML =
        "";


    count.textContent =
        list.length +
        (
            list.length === 1
                ? " organization"
                : " organizations"
        );


    if (
        list.length === 0
    ) {

        empty.style.display =
            "block";

        return;

    }


    empty.style.display =
        "none";


    list.forEach(
        org => {


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "organization-card";


            const icon =
                getOrganizationIcon(
                    org
                );


            const displayType =
                getDisplayType(
                    org
                );


            card.innerHTML = `

                <div class="org-icon">

                    ${escapeHtml(icon)}

                </div>


                <div class="org-type">

                    ${escapeHtml(
                        displayType
                    )}

                </div>


                <div class="org-name">

                    ${escapeHtml(
                        org.name ||
                        "Unnamed Organization"
                    )}

                </div>


                <div class="org-description">

                    ${escapeHtml(
                        org.description ||
                        "Explore available services and join a queue."
                    )}

                </div>


                <button
                    class="view-btn">

                    View Services →

                </button>

            `;


            card.addEventListener(
                "click",
                () => {


                    window.location.href =
                        "organization.html?id=" +
                        encodeURIComponent(
                            org.id
                        );


                }
            );


            container.appendChild(
                card
            );


        }
    );

}



/* =====================================================
   DISPLAY TYPE
===================================================== */

function getDisplayType(
    org
) {


    const type =
        normalizeType(
            org.type
        );


    if (
        type === "HOSPITAL"
    ) {

        return "Hospital";

    }


    if (
        type === "BANK"
    ) {

        return "Bank";

    }


    if (
        isGovernmentOrganization(
            org
        )
    ) {

        return "Government";

    }


    return (
        org.type ||
        "Organization"
    );

}



/* =====================================================
   ORGANIZATION ICON
===================================================== */

function getOrganizationIcon(
    org
) {


    if (
        org.icon
    ) {

        return org.icon;

    }


    const type =
        normalizeType(
            org.type
        );


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
        isGovernmentOrganization(
            org
        )
    ) {

        return "🏛";

    }


    return "🏢";

}



/* =====================================================
   HTML SAFETY
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
   NAVIGATION
===================================================== */

function goHome() {

    window.location.href =
        "home.html";

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

    loadOrganizations();

}
