const API_BASE =
        ((window.location.port === "3000") ? "http://localhost:8080" : window.location.origin);


    /* AUTH */

    const storedAdmin =
        localStorage.getItem("ordexa_admin") ||
        sessionStorage.getItem("ordexa_admin");


    if (!storedAdmin) {

        window.location.href =
            "login.html";

        throw new Error(
            "Admin is not logged in"
        );

    }


    const admin =
        JSON.parse(storedAdmin);


    document.getElementById(
        "adminName"
    ).textContent =
        admin.name || "Admin";


    document.getElementById(
        "avatar"
    ).textContent =
        (admin.name || "A")
            .charAt(0)
            .toUpperCase();


    let organizationId =
        localStorage.getItem(
            "ordexa_organization_id"
        );


    let editingId = null;


    /* LOAD ORGANIZATION IF ID IS MISSING */

    async function getOrganizationId() {

        if (organizationId) {
            return organizationId;
        }

        const response =
            await fetch(
                API_BASE +
                "/api/organizations/admin/" +
                admin.id
            );

        if (!response.ok) {
            window.location.href =
                "organization.html";

            return null;
        }

        const organization =
            await response.json();

        organizationId =
            organization.id;

        localStorage.setItem(
            "ordexa_organization_id",
            organization.id
        );

        return organizationId;
    }


    /* LOAD STAFF */

    async function loadStaff() {

        const id =
            await getOrganizationId();

        if (!id) {
            return;
        }

        try {

            const response =
                await fetch(
                    API_BASE +
                    "/api/staff/organization/" +
                    id
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to load staff"
                );
            }

            const staff =
                await response.json();

            renderStaff(staff);

        } catch (error) {

            console.error(error);

            document.getElementById(
                "staffContainer"
            ).innerHTML = `
                <div class="empty">
                    Unable to connect to backend.
                </div>
            `;

        }

    }


    /* RENDER */

    function renderStaff(staff) {

        const container =
            document.getElementById(
                "staffContainer"
            );


        if (!staff.length) {

            container.innerHTML = `
                <div class="empty">

                    <div class="empty-icon">
                        👥
                    </div>

                    <h3>No staff members yet</h3>

                    <p style="margin-top:8px;">
                        Add your first staff member to get started.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML = `

            <div class="staff-grid">

                ${staff.map(person => `

                    <div class="staff-card">

                        <div class="staff-top">

                            <div class="staff-avatar">
                                ${person.name
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <span class="status">
                                ${person.status}
                            </span>

                        </div>

                        <div class="staff-name">
                            ${escapeHtml(person.name)}
                        </div>

                        <div class="staff-role">
                            ${escapeHtml(person.role)}
                        </div>

                        <div class="staff-info">

                            ✉ ${escapeHtml(person.email)}
                            <br>

                            ☎ ${escapeHtml(
                                person.phone || "Not provided"
                            )}

                        </div>

                        <div class="actions">

                            <button
                                class="action-btn"
                                onclick="editStaff(
                                    ${person.id},
                                    '${escapeJs(person.name)}',
                                    '${escapeJs(person.email)}',
                                    '${escapeJs(person.phone || "")}',
                                    '${escapeJs(person.role)}',
                                    '${escapeJs(person.status)}'
                                )">

                                Edit

                            </button>

                            <button
                                class="action-btn delete-btn"
                                onclick="deleteStaff(${person.id})">

                                Delete

                            </button>

                        </div>

                    </div>

                `).join("")}

            </div>

        `;

    }


    /* OPEN ADD */

    function openAddModal() {

        editingId = null;

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add Staff";

        document.getElementById(
            "staffForm"
        ).reset();

        document.getElementById(
            "errorMessage"
        ).style.display = "none";

        document.getElementById(
            "staffModal"
        ).style.display = "flex";

    }


    /* EDIT */

    function editStaff(
        id,
        name,
        email,
        phone,
        role,
        status
    ) {

        editingId = id;

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Edit Staff";

        document.getElementById(
            "name"
        ).value = name;

        document.getElementById(
            "email"
        ).value = email;

        document.getElementById(
            "phone"
        ).value = phone;

        document.getElementById(
            "role"
        ).value = role;

        document.getElementById(
            "status"
        ).value = status;

        document.getElementById(
            "errorMessage"
        ).style.display = "none";

        document.getElementById(
            "staffModal"
        ).style.display = "flex";

    }


    /* CLOSE */

    function closeModal() {

        document.getElementById(
            "staffModal"
        ).style.display = "none";

    }


    /* SAVE */

    document
        .getElementById("staffForm")
        .addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();

                const id =
                    await getOrganizationId();

                if (!id) {
                    return;
                }


                const data = {

                    organizationId:
                        Number(id),

                    name:
                        document.getElementById(
                            "name"
                        ).value.trim(),

                    email:
                        document.getElementById(
                            "email"
                        ).value.trim(),

                    phone:
                        document.getElementById(
                            "phone"
                        ).value.trim(),

                    role:
                        document.getElementById(
                            "role"
                        ).value.trim(),

                    status:
                        document.getElementById(
                            "status"
                        ).value

                };


                const button =
                    document.getElementById(
                        "saveButton"
                    );

                const error =
                    document.getElementById(
                        "errorMessage"
                    );


                button.disabled = true;
                button.textContent = "Saving...";

                error.style.display = "none";


                try {

                    const url =
                        editingId
                            ? API_BASE +
                              "/api/staff/" +
                              editingId
                            : API_BASE +
                              "/api/staff";


                    const response =
                        await fetch(
                            url,
                            {
                                method:
                                    editingId
                                        ? "PUT"
                                        : "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(data)
                            }
                        );


                    const result =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            typeof result === "string"
                                ? result
                                : "Unable to save staff"
                        );

                    }


                    closeModal();

                    loadStaff();


                } catch (err) {

                    error.textContent =
                        err.message;

                    error.style.display =
                        "block";

                } finally {

                    button.disabled = false;

                    button.textContent =
                        editingId
                            ? "Update Staff"
                            : "Save Staff";

                }

            }
        );


    /* DELETE */

    async function deleteStaff(id) {

        if (!confirm(
            "Are you sure you want to delete this staff member?"
        )) {
            return;
        }


        try {

            const response =
                await fetch(
                    API_BASE +
                    "/api/staff/" +
                    id,
                    {
                        method: "DELETE"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to delete staff"
                );

            }


            loadStaff();


        } catch (error) {

            alert(error.message);

        }

    }


    /* NAVIGATION */

    function go(page) {

        window.location.href = page;

    }


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
            "ordexa_organization_type"
        );

        window.location.href =
            "login.html";

    }


    /* SECURITY HELPERS */

    function escapeHtml(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    function escapeJs(value) {

        return String(value)
            .replaceAll("\\", "\\\\")
            .replaceAll("'", "\\'")
            .replaceAll("\n", "\\n")
            .replaceAll("\r", "\\r");

    }


    loadStaff();
