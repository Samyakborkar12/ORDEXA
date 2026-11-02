/* ================================
       API
    ================================= */

    const API =
        ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));



    /* ================================
       LOGIN CHECK
    ================================= */

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

        }


        catch (error) {


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



    /* ================================
       URL PARAMETERS
    ================================= */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const serviceId =
        params.get("id");


    const organizationId =
        params.get("organizationId");



    /* ================================
       LOAD SERVICE
    ================================= */

    async function loadService() {


        if (!serviceId) {


            showError(
                "Service ID is missing."
            );


            return;

        }


        showLoading();


        try {


            /*
             * GET SERVICE
             *
             * /api/service-items/{id}
             */

            const response =
                await fetch(

                    `${API}/service-items/${encodeURIComponent(serviceId)}`

                );


            if (!response.ok) {


                if (
                    response.status === 404
                ) {


                    throw new Error(
                        "Service not found."
                    );

                }


                throw new Error(
                    "Unable to load service."
                );

            }


            const service =
                await response.json();



            /*

             * Make sure the service
             * belongs to selected org.

             */

            if (

                organizationId &&

                service.organizationId != null &&

                String(
                    service.organizationId
                ) !==
                String(
                    organizationId
                )

            ) {


                throw new Error(

                    "This service does not belong to the selected organization."

                );

            }



            /* ============================
               LOAD ORGANIZATION
            ============================= */


            let organization =
                null;


            if (organizationId) {


                try {


                    const orgResponse =
                        await fetch(

                            `${API}/organizations/${encodeURIComponent(organizationId)}`

                        );


                    if (
                        orgResponse.ok
                    ) {


                        organization =
                            await orgResponse.json();

                    }

                }


                catch (orgError) {


                    console.warn(

                        "Organization loading failed:",

                        orgError

                    );

                }

            }



            displayService(

                service,

                organization

            );

        }


        catch (error) {


            console.error(

                "Service loading error:",

                error

            );


            showError(

                error.message ||

                "Unable to load service."

            );

        }

    }



    /* ================================
       DISPLAY SERVICE
    ================================= */

    function displayService(
        service,
        organization
    ) {


        document.getElementById(
            "loading"
        ).style.display =
            "none";


        document.getElementById(
            "error"
        ).style.display =
            "none";


        document.getElementById(
            "serviceCard"
        ).style.display =
            "block";



        /* SERVICE NAME */

        document.getElementById(
            "serviceName"
        ).textContent =

            service.name ||

            "Service";



        /* ORGANIZATION */

        document.getElementById(
            "organizationName"
        ).textContent =

            organization?.name ||

            "Organization";



        /* DESCRIPTION */

        document.getElementById(
            "description"
        ).textContent =

            service.description ||

            "No description available.";



        /* ============================
           AVERAGE SERVICE TIME
        ============================= */


        const averageTime =

            Number(
                service.averageServiceTime
            );


        document.getElementById(
            "estimatedTime"
        ).textContent =


            Number.isFinite(
                averageTime
            ) &&

            averageTime > 0

                ? `${averageTime} min`

                : "Not specified";



        /* ============================
           STATUS
        ============================= */


        const status =

            String(
                service.status || ""
            ).toUpperCase();



        const statusElement =

            document.getElementById(
                "status"
            );


        const serviceStatus =

            document.getElementById(
                "serviceStatus"
            );


        const joinButton =

            document.getElementById(
                "joinBtn"
            );


        const viewQueueButton =

            document.getElementById(
                "viewQueueBtn"
            );



        /* ============================
           ACTIVE SERVICE
        ============================= */


        if (
            status === "ACTIVE"
        ) {


            statusElement.textContent =
                "AVAILABLE";


            statusElement.className =
                "service-status";


            serviceStatus.textContent =
                "Available";


            joinButton.disabled =
                false;


            joinButton.textContent =
                "Join Queue";


            /*
             * Queue status available
             */

            viewQueueButton.disabled =
                false;

        }



        /* ============================
           INACTIVE SERVICE
        ============================= */


        else {


            statusElement.textContent =
                "UNAVAILABLE";


            statusElement.className =
                "service-status unavailable";


            serviceStatus.textContent =
                "Currently unavailable";


            joinButton.disabled =
                true;


            joinButton.textContent =
                "Service Unavailable";


            /*
             * User can still see queue
             * status even if service is
             * currently unavailable.
             */

            viewQueueButton.disabled =
                false;

        }

    }



    /* ================================
       VIEW QUEUE STATUS
    ================================= */

    function viewQueueStatus() {


        if (!serviceId) {


            alert(
                "Service ID is missing."
            );


            return;

        }


        if (!organizationId) {


            alert(
                "Organization information is missing."
            );


            return;

        }



        /*
         * Open live queue status
         * for this exact organization
         * and service.
         */

        window.location.href =

            "view-queue.html" +

            "?organizationId=" +

            encodeURIComponent(
                organizationId
            ) +

            "&serviceId=" +

            encodeURIComponent(
                serviceId
            );

    }



    /* ================================
       JOIN QUEUE
    ================================= */

    function joinQueue() {


        if (!serviceId) {


            alert(
                "Service ID is missing."
            );


            return;

        }


        if (!organizationId) {


            alert(
                "Organization information is missing."
            );


            return;

        }



        /*
         * Open Join Queue page
         */

        window.location.href =

            "join-queue.html" +

            "?serviceId=" +

            encodeURIComponent(
                serviceId
            ) +

            "&organizationId=" +

            encodeURIComponent(
                organizationId
            );

    }



    /* ================================
       LOADING
    ================================= */

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
            "serviceCard"
        ).style.display =
            "none";

    }



    /* ================================
       ERROR
    ================================= */

    function showError(
        message
    ) {


        document.getElementById(
            "loading"
        ).style.display =
            "none";


        document.getElementById(
            "serviceCard"
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



    /* ================================
       NAVIGATION
    ================================= */

    function goHome() {


        window.location.href =
            "home.html";

    }



    function goBack() {


        if (organizationId) {


            window.location.href =

                "organization.html?id=" +

                encodeURIComponent(
                    organizationId
                );

        }


        else {


            window.location.href =
                "explore.html";

        }

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



    /* ================================
       START
    ================================= */

    if (user) {

        loadService();

    }
