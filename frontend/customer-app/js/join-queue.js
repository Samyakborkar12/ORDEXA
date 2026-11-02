/* =====================================================
   API
===================================================== */

const API =
    ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));



/* =====================================================
   URL PARAMETERS
===================================================== */

const params =
    new URLSearchParams(
        window.location.search
    );


const organizationId =
    params.get("organizationId");


const serviceId =
    params.get("serviceId");


const organization =
    params.get("organization") ||
    "Organization";


const service =
    params.get("service") ||
    "Service";


const type =
    params.get("type") ||
    "hospitals";



/* =====================================================
   PAGE ELEMENTS
===================================================== */

const organizationNameElement =
    document.getElementById(
        "organization-name"
    );


const serviceNameElement =
    document.getElementById(
        "service-name"
    );


const serviceTimeElement =
    document.getElementById(
        "service-time"
    );


const waitingCountElement =
    document.getElementById(
        "waiting-count"
    );


const waitingTimeElement =
    document.getElementById(
        "waiting-time"
    );


const joinButton =
    document.getElementById(
        "join-queue-button"
    );


const tokenResult =
    document.getElementById(
        "token-result"
    );


const tokenNumberElement =
    document.getElementById(
        "token-number"
    );


const peopleAheadElement =
    document.getElementById(
        "people-ahead"
    );


const yourWaitElement =
    document.getElementById(
        "your-wait"
    );


const trackQueueButton =
    document.getElementById(
        "track-queue-button"
    );


const backButton =
    document.getElementById(
        "back-button"
    );


const messageBox =
    document.getElementById(
        "message-box"
    );



/* =====================================================
   SERVICE DATA
===================================================== */

let currentService = null;

let averageServiceTime = 5;



/* =====================================================
   GET LOGGED-IN USER
===================================================== */

function getLoggedInUser() {

    let savedUser =
        localStorage.getItem(
            "ordexa_user"
        );


    if (!savedUser) {

        savedUser =
            sessionStorage.getItem(
                "ordexa_user"
            );

    }


    if (!savedUser) {

        window.location.href =
            "login.html";

        return null;

    }


    try {

        return JSON.parse(
            savedUser
        );

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



/* =====================================================
   DISPLAY BASIC INFORMATION
===================================================== */

organizationNameElement.textContent =
    organization;


serviceNameElement.textContent =
    service;



/* =====================================================
   MESSAGE FUNCTIONS
===================================================== */

function showError(message) {

    messageBox.textContent =
        message;

    messageBox.className =
        "message-box error";

}


function showSuccess(message) {

    messageBox.textContent =
        message;

    messageBox.className =
        "message-box success";

}


function hideMessage() {

    messageBox.textContent =
        "";

    messageBox.className =
        "message-box";

}



/* =====================================================
   BACK BUTTON
===================================================== */

const serviceUrl =
    new URL(
        "service.html",
        window.location.href
    );


if (organizationId) {

    serviceUrl.searchParams.set(
        "organizationId",
        organizationId
    );

}


if (serviceId) {

    serviceUrl.searchParams.set(
        "id",
        serviceId
    );

}


if (type) {

    serviceUrl.searchParams.set(
        "type",
        type
    );

}


backButton.href =
    serviceUrl.href;



/* =====================================================
   LOAD SERVICE INFORMATION
===================================================== */

async function loadService() {

    if (!serviceId) {

        showError(
            "Service information is missing."
        );

        joinButton.disabled =
            true;

        return null;

    }


    try {

        console.log(
            "[ORDEXA] Loading service:",
            serviceId
        );


        /*
         * CORRECT BACKEND ENDPOINT
         *
         * /api/service-items/{id}
         */

        const response =
            await fetch(
                `${API}/service-items/${serviceId}`,
                {
                    cache: "no-store"
                }
            );


        console.log(
            "[ORDEXA] Service API status:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await response.text();


            throw new Error(
                errorText ||
                "Unable to load service."
            );

        }


        const serviceData =
            await response.json();


        console.log(
            "[ORDEXA] Service data:",
            serviceData
        );


        currentService =
            serviceData;


        /*
         * CORRECT BACKEND FIELD
         *
         * averageServiceTime
         */

        averageServiceTime =
            Number(
                serviceData.averageServiceTime
            );


        if (
            !Number.isFinite(
                averageServiceTime
            ) ||
            averageServiceTime <= 0
        ) {

            averageServiceTime =
                5;

        }


        serviceTimeElement.textContent =
            `${averageServiceTime} min/person`;


        /*
         * Initially there may be no
         * people ahead.
         *
         * Therefore estimated wait
         * can correctly be 0 min.
         */

        waitingCountElement.textContent =
            "0";


        waitingTimeElement.textContent =
            "0 min";


        console.log(
            "[ORDEXA] Average service time:",
            averageServiceTime,
            "minutes"
        );


        return serviceData;

    }

    catch (error) {

        console.error(
            "[ORDEXA] Service loading error:",
            error
        );


        serviceTimeElement.textContent =
            "--";


        waitingTimeElement.textContent =
            "--";


        showError(
            "Unable to load service information."
        );


        return null;

    }

}



/* =====================================================
   CHECK EXISTING ACTIVE QUEUE
===================================================== */

async function checkExistingQueue() {

    if (!user || !user.id) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/queue/user/${user.id}/active`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            return;

        }


        const activeQueue =
            await response.json();


        if (!activeQueue) {

            return;

        }


        /*
         * Only use active queue
         * for the currently selected service.
         */

        if (
            String(
                activeQueue.serviceId
            ) !==
            String(serviceId)
        ) {

            return;

        }


        console.log(
            "[ORDEXA] Existing active queue:",
            activeQueue
        );


        const realToken =
            getTokenCode(
                activeQueue
            );


        tokenNumberElement.textContent =
            realToken;


        await updateQueueDetails(
            activeQueue
        );


        buildLiveQueueLink(
            activeQueue
        );


        const notice =
            document.querySelector(
                ".demo-notice"
            );


        if (notice) {

            notice.textContent =
                "You already have an active queue for this service.";

        }


        joinButton.hidden =
            true;


        tokenResult.hidden =
            false;


        showSuccess(
            "You already have an active queue for this service."
        );


    }

    catch (error) {

        console.warn(
            "[ORDEXA] Active queue check failed:",
            error
        );

    }

}



/* =====================================================
   GET REAL TOKEN CODE
===================================================== */

function getTokenCode(
    queue
) {

    if (!queue) {

        return "--";

    }


    /*
     * Backend may expose the token
     * using different JSON property names.
     *
     * Always prefer the actual token code.
     */

    const token =
        queue.tokenCode ||
        queue.token ||
        queue.tokenNumber;


    if (
        token === null ||
        token === undefined ||
        token === ""
    ) {

        return "--";

    }


    return String(
        token
    );

}



/* =====================================================
   JOIN QUEUE
===================================================== */

async function joinQueue() {

    hideMessage();


    if (!user) {

        return;

    }


    if (!user.id) {

        showError(
            "User information is missing. Please login again."
        );

        return;

    }


    if (!organizationId) {

        showError(
            "Organization information is missing."
        );

        return;

    }


    if (!serviceId) {

        showError(
            "Service information is missing."
        );

        return;

    }


    joinButton.disabled =
        true;


    joinButton.textContent =
        "Joining Queue...";


    try {


        const response =
            await fetch(
                `${API}/queue/join`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        userId:
                            Number(
                                user.id
                            ),

                        organizationId:
                            Number(
                                organizationId
                            ),

                        serviceId:
                            Number(
                                serviceId
                            )

                    })

                }
            );


        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch {

            data =
                responseText;

        }


        console.log(
            "[ORDEXA] Join queue response:",
            data
        );


        /* =================================================
           SUCCESS
        ================================================= */

        if (response.ok) {


            /*
             * Get actual token.
             *
             * Prefer tokenCode/token.
             */

            const realToken =
                getTokenCode(
                    data
                );


            /*
             * Backend response may use
             * queueId OR id.
             */

            const queueId =
                data.queueId ||
                data.id;


            const activeQueue = {

                queueId:
                    queueId,

                tokenCode:
                    realToken,

                token:
                    realToken,

                organizationId:
                    data.organizationId ||
                    Number(
                        organizationId
                    ),

                counterId:
                    data.counterId,

                serviceId:
                    data.serviceId ||
                    Number(
                        serviceId
                    ),

                status:
                    data.status,

                createdAt:
                    data.createdAt

            };


            /*
             * Save active queue locally.
             */

            localStorage.setItem(
                "ordexa_active_queue",
                JSON.stringify(
                    activeQueue
                )
            );


            sessionStorage.setItem(
                "ordexa_active_queue",
                JSON.stringify(
                    activeQueue
                )
            );


            /* =================================================
               SHOW REAL TOKEN
            ================================================= */

            tokenNumberElement.textContent =
                realToken;


            peopleAheadElement.textContent =
                "Calculating...";


            yourWaitElement.textContent =
                "Calculating...";


            /* =================================================
               BUILD LIVE QUEUE LINK
            ================================================= */

            buildLiveQueueLink(
                activeQueue
            );


            /* =================================================
               SHOW TOKEN RESULT
            ================================================= */

            tokenResult.hidden =
                false;


            joinButton.hidden =
                true;


            showSuccess(
                "Queue joined successfully."
            );


            const notice =
                document.querySelector(
                    ".demo-notice"
                );


            if (notice) {

                notice.textContent =
                    "Your real queue token has been generated successfully.";

            }


            /* =================================================
               GET QUEUE DETAILS
            ================================================= */

            await updateQueueDetails(
                activeQueue
            );


            tokenResult.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center"

            });


            return;

        }



        /* =================================================
           BACKEND ERROR
        ================================================= */

        let errorMessage =
            "Unable to join queue.";


        if (
            typeof data ===
            "string"
        ) {

            errorMessage =
                data;

        }

        else if (
            data &&
            data.message
        ) {

            errorMessage =
                data.message;

        }


        showError(
            errorMessage
        );


        joinButton.disabled =
            false;


        joinButton.textContent =
            "Join Queue →";


    }

    catch (error) {

        console.error(
            "[ORDEXA] Join queue error:",
            error
        );


        showError(
            "Unable to connect to ORDEXA server. Make sure the backend is running."
        );


        joinButton.disabled =
            false;


        joinButton.textContent =
            "Join Queue →";

    }

}



/* =====================================================
   UPDATE QUEUE DETAILS
===================================================== */

async function updateQueueDetails(
    activeQueue
) {

    try {

        /*
         * Get latest active queue
         * from backend.
         */

        const response =
            await fetch(
                `${API}/queue/user/${user.id}/active`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            peopleAheadElement.textContent =
                "0";


            yourWaitElement.textContent =
                "0 min";


            waitingCountElement.textContent =
                "0";


            waitingTimeElement.textContent =
                "0 min";


            return;

        }


        const queue =
            await response.json();


        console.log(
            "[ORDEXA] Current queue:",
            queue
        );


        const peopleAhead =
            Number(
                queue.peopleAhead
            );


        const safePeopleAhead =
            Number.isFinite(
                peopleAhead
            )
                ? Math.max(
                    0,
                    peopleAhead
                )
                : 0;


        peopleAheadElement.textContent =
            safePeopleAhead;


        waitingCountElement.textContent =
            safePeopleAhead;



        /* =================================================
           USE LOADED SERVICE TIME
        ================================================= */

        let minutesPerPerson =
            averageServiceTime;


        /*
         * If service data wasn't loaded
         * for some reason, try loading it
         * again using the correct endpoint.
         */

        if (
            !Number.isFinite(
                minutesPerPerson
            ) ||
            minutesPerPerson <= 0
        ) {

            try {

                const serviceResponse =
                    await fetch(
                        `${API}/service-items/${serviceId}`,
                        {
                            cache: "no-store"
                        }
                    );


                if (
                    serviceResponse.ok
                ) {

                    const serviceData =
                        await serviceResponse.json();


                    minutesPerPerson =
                        Number(
                            serviceData.averageServiceTime
                        );


                    if (
                        !Number.isFinite(
                            minutesPerPerson
                        ) ||
                        minutesPerPerson <= 0
                    ) {

                        minutesPerPerson =
                            5;

                    }


                    averageServiceTime =
                        minutesPerPerson;


                    serviceTimeElement.textContent =
                        `${minutesPerPerson} min/person`;

                }

            }

            catch (error) {

                console.warn(
                    "[ORDEXA] Unable to reload service time:",
                    error
                );

            }

        }



        /* =================================================
           ESTIMATED WAIT
        ================================================= */

        const estimatedWait =
            safePeopleAhead *
            minutesPerPerson;


        yourWaitElement.textContent =
            `${estimatedWait} min`;


        waitingTimeElement.textContent =
            `${estimatedWait} min`;


        console.log(
            "[ORDEXA] Queue calculation:",
            {
                peopleAhead:
                    safePeopleAhead,

                averageServiceTime:
                    minutesPerPerson,

                estimatedWait:
                    estimatedWait
            }
        );


    }

    catch (error) {

        console.error(
            "[ORDEXA] Queue detail error:",
            error
        );


        peopleAheadElement.textContent =
            "0";


        yourWaitElement.textContent =
            "0 min";


        waitingCountElement.textContent =
            "0";


        waitingTimeElement.textContent =
            "0 min";

    }

}



/* =====================================================
   BUILD LIVE QUEUE LINK
===================================================== */

function buildLiveQueueLink(
    queue
) {


    const liveQueueUrl =
        new URL(
            "live-queue.html",
            window.location.href
        );


    if (queue.queueId) {

        liveQueueUrl.searchParams.set(
            "queueId",
            queue.queueId
        );

    }


    /*
     * VERY IMPORTANT:
     *
     * Send actual token code.
     *
     * Example:
     * RTO-PUC-001
     */

    const realToken =
        getTokenCode(
            queue
        );


    if (
        realToken &&
        realToken !== "--"
    ) {

        liveQueueUrl.searchParams.set(
            "token",
            realToken
        );

    }


    if (queue.counterId) {

        liveQueueUrl.searchParams.set(
            "counterId",
            queue.counterId
        );

    }


    if (queue.organizationId) {

        liveQueueUrl.searchParams.set(
            "organizationId",
            queue.organizationId
        );

    }


    if (queue.serviceId) {

        liveQueueUrl.searchParams.set(
            "serviceId",
            queue.serviceId
        );

    }


    if (organization) {

        liveQueueUrl.searchParams.set(
            "organization",
            organization
        );

    }


    if (service) {

        liveQueueUrl.searchParams.set(
            "service",
            service
        );

    }


    trackQueueButton.href =
        liveQueueUrl.href;


    console.log(
        "[ORDEXA] Live queue URL:",
        liveQueueUrl.href
    );

}



/* =====================================================
   JOIN BUTTON
===================================================== */

joinButton.addEventListener(
    "click",
    joinQueue
);



/* =====================================================
   INITIALIZE
===================================================== */

async function initializePage() {


    if (!user) {

        return;

    }


    if (!organizationId) {

        showError(
            "Organization information is missing."
        );


        joinButton.disabled =
            true;


        return;

    }


    if (!serviceId) {

        showError(
            "Service information is missing."
        );


        joinButton.disabled =
            true;


        return;

    }


    /*
     * First load actual service.
     *
     * This gets:
     *
     * averageServiceTime = 60
     */

    await loadService();


    /*
     * Then check if user already
     * has an active queue.
     */

    await checkExistingQueue();

}


initializePage();
