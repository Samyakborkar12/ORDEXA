// =========================================================
    // CONFIG
    // =========================================================

    const API =
        ((window.location.port === "3000") ? "http://localhost:8080" : window.location.origin);


    // =========================================================
    // GLOBAL VARIABLES
    // =========================================================

    let admin = null;

    let selectedType = null;

    let existingOrganization = null;

    let editMode = false;


    // =========================================================
    // AUTH CHECK
    // =========================================================

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


        if (!admin || !admin.id) {

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


    // =========================================================
    // LOAD ORGANIZATION
    // =========================================================

    async function loadOrganization() {


        if (!admin || !admin.id) {
            return;
        }


        try {


            const response =
                await fetch(
                    `${API}/api/organizations/admin/${admin.id}`
                );


            // -------------------------------------------------
            // NO ORGANIZATION
            // -------------------------------------------------

            if (response.status === 404) {

                editMode = false;

                setupCreateMode();

                return;
            }


            if (!response.ok) {

                throw new Error(
                    "Unable to check organization."
                );
            }


            const organization =
                await response.json();


            // -------------------------------------------------
            // ORGANIZATION FOUND
            // -------------------------------------------------

            existingOrganization =
                organization;

            editMode = true;


            // Save organization ID

            localStorage.setItem(
                "ordexa_organization_id",
                organization.id
            );

            localStorage.setItem(
                "ordexaOrganizationId",
                organization.id
            );


            setupEditMode();


        } catch (error) {


            console.error(
                "Organization load error:",
                error
            );


            showMessage(
                "Unable to load organization details. Please try again.",
                "error"
            );

        }

    }


    // =========================================================
    // CREATE MODE
    // =========================================================

    function setupCreateMode() {


        document.getElementById(
            "pageTitle"
        ).textContent =
            "Set Up Your Organization";


        document.getElementById(
            "pageSubtitle"
        ).textContent =
            "Select the type of organization you want to manage with ORDEXA.";


        document.getElementById(
            "stepText"
        ).textContent =
            "Select Organization Type";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Organization Details";


        document.getElementById(
            "formSubtitle"
        ).textContent =
            "Enter the basic information of your organization.";


        document.getElementById(
            "continueButton"
        ).textContent =
            "Continue to Dashboard →";


        document.getElementById(
            "organizationName"
        ).value = "";


        document.getElementById(
            "description"
        ).value = "";


        selectedType = null;


        document.getElementById(
            "selectedType"
        ).textContent =
            "Select an organization type above";


        document
            .querySelectorAll(".type-card")
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );

            });


        document.getElementById(
            "continueButton"
        ).disabled = true;

    }


    // =========================================================
    // EDIT MODE
    // =========================================================

    function setupEditMode() {


        document.getElementById(
            "pageTitle"
        ).textContent =
            "Edit Your Organization";


        document.getElementById(
            "pageSubtitle"
        ).textContent =
            "Update your organization information whenever you need.";


        document.getElementById(
            "stepText"
        ).textContent =
            "Organization Information";


        document.getElementById(
            "formTitle"
        ).textContent =
            "Edit Organization Details";


        document.getElementById(
            "formSubtitle"
        ).textContent =
            "Update the basic information of your organization.";


        document.getElementById(
            "continueButton"
        ).textContent =
            "Save Changes →";


        // -----------------------------------------------------
        // Load name
        // -----------------------------------------------------

        document.getElementById(
            "organizationName"
        ).value =
            existingOrganization.name || "";


        // -----------------------------------------------------
        // Load description
        // -----------------------------------------------------

        document.getElementById(
            "description"
        ).value =
            existingOrganization.description || "";


        // -----------------------------------------------------
        // Load type
        // -----------------------------------------------------

        selectedType =
            existingOrganization.type;


        const typeNames = {

            HOSPITAL:
                "🏥 Hospital",

            BANK:
                "🏦 Bank",

            GOVERNMENT:
                "🏛️ Government Office"

        };


        document.getElementById(
            "selectedType"
        ).textContent =
            typeNames[selectedType] ||
            selectedType;


        // -----------------------------------------------------
        // Highlight selected type
        // -----------------------------------------------------

        document
            .querySelectorAll(".type-card")
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );


                if (
                    card.dataset.type ===
                    selectedType
                ) {

                    card.classList.add(
                        "selected"
                    );

                }

            });


        document.getElementById(
            "continueButton"
        ).disabled = false;

    }


    // =========================================================
    // SELECT TYPE
    // =========================================================

    function selectType(type) {


        if (type === "CUSTOM") {

            showMessage(
                "Custom organization setup is coming soon.",
                "error"
            );

            return;
        }


        selectedType =
            type;


        document
            .querySelectorAll(".type-card")
            .forEach(card => {

                card.classList.remove(
                    "selected"
                );

            });


        const selectedCard =
            document.querySelector(
                `[data-type="${type}"]`
            );


        if (selectedCard) {

            selectedCard.classList.add(
                "selected"
            );

        }


        const names = {

            HOSPITAL:
                "🏥 Hospital",

            BANK:
                "🏦 Bank",

            GOVERNMENT:
                "🏛️ Government Office"

        };


        document.getElementById(
            "selectedType"
        ).textContent =
            names[type];


        document.getElementById(
            "continueButton"
        ).disabled = false;


        clearMessage();

    }


    // =========================================================
    // SAVE ORGANIZATION
    // =========================================================

    async function saveOrganization() {


        if (!admin || !admin.id) {

            showMessage(
                "Admin session is invalid. Please login again.",
                "error"
            );

            return;
        }


        if (!selectedType) {

            showMessage(
                "Please select an organization type.",
                "error"
            );

            return;
        }


        const name =
            document
                .getElementById(
                    "organizationName"
                )
                .value
                .trim();


        const description =
            document
                .getElementById(
                    "description"
                )
                .value
                .trim();


        if (!name) {

            showMessage(
                "Organization name is required.",
                "error"
            );

            document
                .getElementById(
                    "organizationName"
                )
                .focus();

            return;
        }


        const button =
            document.getElementById(
                "continueButton"
            );


        button.disabled = true;


        button.textContent =
            editMode
                ? "Saving Changes..."
                : "Creating Organization...";


        try {


            let response;


            // =================================================
            // CREATE
            // =================================================

            if (!editMode) {


                response =
                    await fetch(
                        `${API}/api/organizations`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    adminId:
                                        admin.id,

                                    name:
                                        name,

                                    type:
                                        selectedType,

                                    description:
                                        description,

                                    icon:
                                        getIcon(
                                            selectedType
                                        )

                                })
                        }
                    );


            }


            // =================================================
            // UPDATE
            // =================================================

            else {


                response =
                    await fetch(
                        `${API}/api/organizations/${existingOrganization.id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    adminId:
                                        admin.id,

                                    name:
                                        name,

                                    type:
                                        selectedType,

                                    description:
                                        description,

                                    icon:
                                        getIcon(
                                            selectedType
                                        )

                                })
                        }
                    );

            }


            // =================================================
            // RESPONSE
            // =================================================

            const responseText =
                await response.text();


            if (!response.ok) {


                let errorMessage =
                    responseText ||
                    "Unable to save organization.";


                try {

                    const json =
                        JSON.parse(
                            responseText
                        );

                    errorMessage =
                        json.message ||
                        json.error ||
                        errorMessage;

                } catch (e) {
                    // Plain text response
                }


                throw new Error(
                    errorMessage
                );

            }


            const organization =
                JSON.parse(
                    responseText
                );


            // =================================================
            // SAVE ORGANIZATION ID
            // =================================================

            localStorage.setItem(
                "ordexa_organization_id",
                organization.id
            );


            localStorage.setItem(
                "ordexaOrganizationId",
                organization.id
            );


            // =================================================
            // SUCCESS
            // =================================================

            showMessage(
                editMode
                    ? "Organization updated successfully. Opening dashboard..."
                    : "Organization created successfully. Opening dashboard...",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);


        } catch (error) {


            console.error(
                "Organization save error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong while saving organization.",
                "error"
            );


            button.disabled = false;


            button.textContent =
                editMode
                    ? "Save Changes →"
                    : "Continue to Dashboard →";

        }

    }


    // =========================================================
    // ICON
    // =========================================================

    function getIcon(type) {


        switch (type) {

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


    // =========================================================
    // MESSAGE
    // =========================================================

    function showMessage(
        text,
        type
    ) {


        const message =
            document.getElementById(
                "message"
            );


        message.textContent =
            text;


        message.className =
            "message " + type;

    }


    function clearMessage() {


        const message =
            document.getElementById(
                "message"
            );


        message.textContent =
            "";


        message.className =
            "message";

    }


    // =========================================================
    // LOGOUT
    // =========================================================

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


    // =========================================================
    // INITIALIZE
    // =========================================================

    async function initialize() {


        if (!checkAuth()) {
            return;
        }


        await loadOrganization();

    }


    initialize();
