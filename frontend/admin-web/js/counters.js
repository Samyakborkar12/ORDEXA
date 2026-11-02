const API = ((window.location.port === "3000") ? "http://localhost:8080" : window.location.origin);

let admin = null;
let organization = null;
let staffList = [];
let counters = [];
let editingCounterId = null;
let toastTimer = null;


/* =====================================================
   AUTH
===================================================== */

function checkAuth() {

    const stored =
        localStorage.getItem("ordexa_admin") ||
        sessionStorage.getItem("ordexa_admin");

    if (!stored) {

        window.location.href = "login.html";

        return false;
    }

    try {

        admin = JSON.parse(stored);

    } catch (error) {

        console.error(
            "[ORDEXA] Invalid admin session:",
            error
        );

        localStorage.removeItem("ordexa_admin");
        sessionStorage.removeItem("ordexa_admin");

        window.location.href = "login.html";

        return false;
    }

    if (!admin || !admin.id) {

        console.error(
            "[ORDEXA] Admin ID missing"
        );

        localStorage.removeItem("ordexa_admin");
        sessionStorage.removeItem("ordexa_admin");

        window.location.href = "login.html";

        return false;
    }

    document.getElementById("adminName").textContent =
        admin.name || "Admin";

    document.getElementById("adminInitial").textContent =
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

        console.log(
            "[ORDEXA] Loading organization for admin:",
            admin.id
        );

        const response =
            await fetch(
                `${API}/api/organizations/admin/${admin.id}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        console.log(
            "[ORDEXA] Organization response:",
            response.status
        );

        if (response.status === 404) {

            window.location.href =
                "organization.html";

            return false;
        }

        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(
                message ||
                "Unable to load organization"
            );
        }

        const data =
            await response.json();

        if (!data || !data.id) {

            throw new Error(
                "Organization ID was not returned by server"
            );
        }

        organization = data;

        localStorage.setItem(
            "ordexa_organization_id",
            String(organization.id)
        );

        localStorage.setItem(
            "ordexaOrganizationId",
            String(organization.id)
        );

        console.log(
            "[ORDEXA] Organization loaded:",
            organization
        );

        document.getElementById(
            "organizationName"
        ).textContent =
            organization.name ||
            "Organization";

        return true;

    } catch (error) {

        console.error(
            "[ORDEXA] Organization loading failed:",
            error
        );

        showToast(
            error.message ||
            "Unable to load organization",
            true
        );

        document.getElementById(
            "counterContainer"
        ).innerHTML = `
            <div class="empty">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load organization
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

                <button
                    class="add-btn"
                    onclick="init()">

                    Retry

                </button>

            </div>
        `;

        return false;
    }
}


/* =====================================================
   LOAD STAFF
===================================================== */

async function loadStaff() {

    if (!organization || !organization.id) {

        console.error(
            "[ORDEXA] Cannot load staff: organization missing"
        );

        return;
    }

    try {

        const response =
            await fetch(
                `${API}/api/staff/organization/${organization.id}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(
                message ||
                "Unable to load staff"
            );
        }

        staffList =
            await response.json();

        console.log(
            "[ORDEXA] Staff loaded:",
            staffList
        );

        populateStaffSelect();

    } catch (error) {

        console.error(
            "[ORDEXA] Staff loading failed:",
            error
        );

        staffList = [];

        populateStaffSelect();

        showToast(
            "Unable to load staff: " +
            error.message,
            true
        );
    }
}


/* =====================================================
   STAFF SELECT
===================================================== */

function populateStaffSelect() {

    const select =
        document.getElementById(
            "staffSelect"
        );

    select.innerHTML = `
        <option value="">
            No staff assigned
        </option>
    `;

    staffList.forEach(staff => {

        const option =
            document.createElement("option");

        option.value =
            staff.id;

        option.textContent =
            `${staff.name} — ${staff.role}`;

        select.appendChild(option);
    });
}


/* =====================================================
   LOAD COUNTERS
===================================================== */

async function loadCounters() {

    if (!organization || !organization.id) {

        console.error(
            "[ORDEXA] Cannot load counters: organization missing"
        );

        return;
    }

    const container =
        document.getElementById(
            "counterContainer"
        );

    try {

        const response =
            await fetch(
                `${API}/api/counters/organization/${organization.id}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        console.log(
            "[ORDEXA] Counter response:",
            response.status
        );

        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(
                message ||
                "Unable to load counters"
            );
        }

        counters =
            await response.json();

        console.log(
            "[ORDEXA] Counters loaded:",
            counters
        );

        renderCounters();

    } catch (error) {

        console.error(
            "[ORDEXA] Counter loading failed:",
            error
        );

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load counters
                </h3>

                <p>
                    ${escapeHtml(error.message)}
                </p>

                <button
                    class="add-btn"
                    onclick="loadCounters()">

                    Retry

                </button>

            </div>

        `;
    }
}


/* =====================================================
   RENDER COUNTERS
===================================================== */

function renderCounters() {

    const container =
        document.getElementById(
            "counterContainer"
        );

    if (!counters.length) {

        container.innerHTML = `

            <div class="empty">

                <div class="empty-icon">
                    🎛️
                </div>

                <h3>
                    No counters yet
                </h3>

                <p>
                    Your organization has no counters.
                    Add your first counter to start managing queues.
                </p>

                <button
                    class="add-btn"
                    onclick="openAddModal()">

                    + Add First Counter

                </button>

            </div>

        `;

        return;
    }

    container.innerHTML = `

        <div class="counter-grid">

            ${counters
                .map(counter => counterCard(counter))
                .join("")}

        </div>

    `;
}


/* =====================================================
   COUNTER CARD
===================================================== */

function counterCard(counter) {

    const staff =
        staffList.find(
            staff =>
                Number(staff.id) ===
                Number(counter.staffId)
        );

    const staffName =
        staff
            ? staff.name
            : "No staff assigned";

    const status =
        String(
            counter.status || "OPEN"
        ).toUpperCase();

    const statusClass =
        status === "OPEN"
            ? "status-open"
            : "status-closed";

    return `

        <div
            class="counter-card"
            onclick="openQueue(${Number(counter.id)})">

            <div class="counter-top">

                <div class="counter-icon">
                    🎛️
                </div>

                <span
                    class="status ${statusClass}">

                    ${escapeHtml(status)}

                </span>

            </div>

            <div class="counter-name">
                ${escapeHtml(counter.name)}
            </div>

            <div class="counter-staff">

                👤
                ${escapeHtml(staffName)}

            </div>

            <div class="counter-footer">

                <span
                    class="queue-link"
                    onclick="
                        event.stopPropagation();
                        openQueue(${Number(counter.id)});
                    ">

                    Open Live Queue →

                </span>

                <div class="counter-actions">

                    <button
                        class="small-btn edit-btn"
                        onclick="
                            event.stopPropagation();
                            openEditModal(${Number(counter.id)});
                        ">

                        Edit

                    </button>

                    <button
                        class="small-btn delete-btn"
                        onclick="
                            event.stopPropagation();
                            deleteCounter(${Number(counter.id)});
                        ">

                        Delete

                    </button>

                </div>

            </div>

        </div>

    `;
}


/* =====================================================
   OPEN LIVE QUEUE
   FIXED:
   Always sends counterId parameter.
===================================================== */

function openQueue(id) {

    const counterId =
        Number(id);

    if (!Number.isInteger(counterId) || counterId <= 0) {

        console.error(
            "[ORDEXA] Invalid counter ID:",
            id
        );

        showToast(
            "Invalid Counter ID",
            true
        );

        return;
    }

    console.log(
        "[ORDEXA] Opening live queue for counter:",
        counterId
    );

    /*
     * Save it as fallback.
     */
    localStorage.setItem(
        "ordexa_selected_counter_id",
        String(counterId)
    );

    /*
     * IMPORTANT:
     * live-queue.html expects counterId.
     */
    window.location.href =
        `live-queue.html?counterId=${encodeURIComponent(counterId)}`;
}


/* =====================================================
   ADD MODAL
===================================================== */

function openAddModal() {

    if (!organization) {

        showToast(
            "Organization is still loading",
            true
        );

        return;
    }

    editingCounterId = null;

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Counter";

    document.getElementById(
        "counterNameInput"
    ).value =
        "";

    document.getElementById(
        "staffSelect"
    ).value =
        "";

    document.getElementById(
        "statusSelect"
    ).value =
        "OPEN";

    document.getElementById(
        "saveButton"
    ).textContent =
        "Save Counter";

    document.getElementById(
        "modalOverlay"
    ).classList.add("show");

    setTimeout(() => {

        document.getElementById(
            "counterNameInput"
        ).focus();

    }, 100);
}


/* =====================================================
   EDIT MODAL
===================================================== */

function openEditModal(id) {

    const counter =
        counters.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!counter) {

        showToast(
            "Counter not found",
            true
        );

        return;
    }

    editingCounterId =
        counter.id;

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Counter";

    document.getElementById(
        "counterNameInput"
    ).value =
        counter.name || "";

    document.getElementById(
        "staffSelect"
    ).value =
        counter.staffId
            ? String(counter.staffId)
            : "";

    document.getElementById(
        "statusSelect"
    ).value =
        String(
            counter.status || "OPEN"
        ).toUpperCase();

    document.getElementById(
        "saveButton"
    ).textContent =
        "Update Counter";

    document.getElementById(
        "modalOverlay"
    ).classList.add("show");
}


/* =====================================================
   CLOSE MODAL
===================================================== */

function closeModal() {

    document.getElementById(
        "modalOverlay"
    ).classList.remove("show");

    editingCounterId = null;
}


/* =====================================================
   SAVE COUNTER
===================================================== */

async function saveCounter() {

    const name =
        document.getElementById(
            "counterNameInput"
        ).value.trim();

    const staffValue =
        document.getElementById(
            "staffSelect"
        ).value;

    const status =
        document.getElementById(
            "statusSelect"
        ).value;

    if (!name) {

        showToast(
            "Counter name is required",
            true
        );

        return;
    }

    if (!organization || !organization.id) {

        showToast(
            "Organization not loaded",
            true
        );

        return;
    }

    const saveButton =
        document.getElementById(
            "saveButton"
        );

    const wasEditing =
        Boolean(editingCounterId);

    saveButton.disabled = true;

    saveButton.textContent =
        wasEditing
            ? "Updating..."
            : "Saving...";

    try {

        let response;

        if (wasEditing) {

            response =
                await fetch(
                    `${API}/api/counters/${editingCounterId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                staffId:
                                    staffValue
                                        ? Number(staffValue)
                                        : null,

                                status:
                                    status

                            })
                    }
                );

        } else {

            response =
                await fetch(
                    `${API}/api/counters`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                organizationId:
                                    Number(organization.id),

                                name:
                                    name,

                                staffId:
                                    staffValue
                                        ? Number(staffValue)
                                        : null,

                                status:
                                    status

                            })
                    }
                );
        }

        const result =
            await response.text();

        if (!response.ok) {

            throw new Error(
                result ||
                "Unable to save counter"
            );
        }

        closeModal();

        showToast(
            wasEditing
                ? "Counter updated successfully"
                : "Counter created successfully"
        );

        await loadCounters();

    } catch (error) {

        console.error(
            "[ORDEXA] Save counter failed:",
            error
        );

        showToast(
            error.message ||
            "Unable to save counter",
            true
        );

    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            wasEditing
                ? "Update Counter"
                : "Save Counter";
    }
}


/* =====================================================
   DELETE COUNTER
===================================================== */

async function deleteCounter(id) {

    const counter =
        counters.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!counter) {
        return;
    }

    const confirmed =
        confirm(
            `Delete "${counter.name}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API}/api/counters/${id}`,
                {
                    method: "DELETE"
                }
            );

        const result =
            await response.text();

        if (!response.ok) {

            throw new Error(
                result ||
                "Unable to delete counter"
            );
        }

        const selectedId =
            localStorage.getItem(
                "ordexa_selected_counter_id"
            );

        if (
            selectedId &&
            Number(selectedId) === Number(id)
        ) {

            localStorage.removeItem(
                "ordexa_selected_counter_id"
            );
        }

        showToast(
            "Counter deleted successfully"
        );

        await loadCounters();

    } catch (error) {

        console.error(
            "[ORDEXA] Delete counter failed:",
            error
        );

        showToast(
            error.message ||
            "Unable to delete counter",
            true
        );
    }
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
   TOAST
===================================================== */

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
        setTimeout(() => {

            toast.className =
                "toast";

        }, 3000);
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

    localStorage.removeItem(
        "ordexa_selected_counter_id"
    );

    window.location.href =
        "login.html";
}


/* =====================================================
   MODAL OUTSIDE CLICK
===================================================== */

document
    .getElementById("modalOverlay")
    .addEventListener(
        "click",
        function(event) {

            if (event.target === this) {

                closeModal();

            }

        }
    );


/* =====================================================
   ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            closeModal();

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

    const organizationLoaded =
        await loadOrganization();

    if (!organizationLoaded) {
        return;
    }

    await loadStaff();

    await loadCounters();
}


init();
