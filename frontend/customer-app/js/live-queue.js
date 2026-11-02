/* =========================================================
   ORDEXA LIVE QUEUE
   ========================================================= */


const API =
    ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));



/* =========================================================
   URL PARAMETERS
   ========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


/*
 * IMPORTANT:
 * URL token has highest priority.
 *
 * Example:
 *
 * ?queueId=6
 * &token=RTO-PUC-001
 *
 * We MUST display RTO-PUC-001,
 * NOT queue id 6.
 */

const urlToken =
    params.get("token");


const urlQueueId =
    params.get("queueId");


const urlCounterId =
    params.get("counterId");


const urlOrganizationId =
    params.get("organizationId");


const urlServiceId =
    params.get("serviceId");


const urlOrganization =
    params.get("organization");


const urlService =
    params.get("service");



/* =========================================================
   ELEMENTS
   ========================================================= */

const loading =
    document.getElementById(
        "loading"
    );


const errorBox =
    document.getElementById(
        "error"
    );


const errorMessage =
    document.getElementById(
        "error-message"
    );


const noQueue =
    document.getElementById(
        "noQueue"
    );


const queueCard =
    document.getElementById(
        "queueCard"
    );


const tokenElement =
    document.getElementById(
        "token-number"
    );


const organizationElement =
    document.getElementById(
        "organization-name"
    );


const serviceElement =
    document.getElementById(
        "service-name"
    );


const statusElement =
    document.getElementById(
        "queue-status"
    );


const currentTokenElement =
    document.getElementById(
        "current-token"
    );


const peopleAheadElement =
    document.getElementById(
        "people-ahead"
    );


const peopleAheadMainElement =
    document.getElementById(
        "people-ahead-main"
    );


const estimatedWaitElement =
    document.getElementById(
        "estimated-wait"
    );



/* =========================================================
   LOGIN
   ========================================================= */

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

    } catch (error) {

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



/* =========================================================
   GET TOKEN SAFELY
   ========================================================= */

function getRealToken(queue) {

    /*
     * 1. URL token has highest priority.
     *
     * This fixes:
     *
     * URL = RTO-PUC-001
     * UI  = 1
     */

    if (
        urlToken &&
        urlToken.trim()
    ) {

        return urlToken.trim();

    }


    if (!queue) {

        return "--";

    }


    /*
     * 2. Backend tokenCode
     */

    if (
        queue.tokenCode &&
        String(queue.tokenCode).trim()
    ) {

        return String(
            queue.tokenCode
        ).trim();

    }


    /*
     * 3. Backend tokenNumber
     */

    if (
        queue.tokenNumber &&
        String(queue.tokenNumber).trim()
    ) {

        return String(
            queue.tokenNumber
        ).trim();

    }


    /*
     * 4. Backend token
     */

    if (
        queue.token &&
        String(queue.token).trim()
    ) {

        return String(
            queue.token
        ).trim();

    }


    /*
     * NEVER use queue.id here.
     *
     * queue.id is database ID,
     * NOT customer token.
     */

    return "--";

}



/* =========================================================
   LOAD ACTIVE QUEUE
   ========================================================= */

async function loadQueue() {

    if (!user || !user.id) {

        return;

    }


    loading.style.display =
        "block";

    errorBox.style.display =
        "none";

    noQueue.style.display =
        "none";

    queueCard.style.display =
        "none";


    try {


        /*
         * First try the active queue API.
         */

        const response =
            await fetch(
                `${API}/queue/user/${user.id}/active`,
                {
                    cache: "no-store"
                }
            );


        /*
         * No active queue.
         */

        if (response.status === 404) {

            showNoQueue();

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Unable to load active queue."
            );

        }


        const queue =
            await response.json();


        if (!queue) {

            showNoQueue();

            return;

        }


        console.log(
            "[ORDEXA] Active queue:",
            queue
        );


        displayQueue(
            queue
        );


    } catch (error) {

        console.error(
            "[ORDEXA] Queue loading error:",
            error
        );


        loading.style.display =
            "none";

        errorBox.style.display =
            "block";

        errorMessage.textContent =
            error.message ||
            "Unable to load queue.";

    }

}



/* =========================================================
   DISPLAY QUEUE
   ========================================================= */

function displayQueue(queue) {

    loading.style.display =
        "none";

    errorBox.style.display =
        "none";

    noQueue.style.display =
        "none";

    queueCard.style.display =
        "block";


    /*
     * =====================================================
     * REAL TOKEN
     * =====================================================
     */

    const realToken =
        getRealToken(queue);


    tokenElement.textContent =
        realToken;


    console.log(
        "[ORDEXA] DISPLAY TOKEN:",
        realToken
    );


    /*
     * =====================================================
     * ORGANIZATION
     * =====================================================
     */

    organizationElement.textContent =
        queue.organizationName ||
        urlOrganization ||
        "Organization";


    /*
     * =====================================================
     * SERVICE
     * =====================================================
     */

    serviceElement.textContent =
        queue.serviceName ||
        urlService ||
        "Service";


    /*
     * =====================================================
     * STATUS
     * =====================================================
     */

    const status =
        String(
            queue.status ||
            "WAITING"
        ).toUpperCase();


    statusElement.textContent =
        status;


    /*
     * =====================================================
     * PEOPLE AHEAD
     * =====================================================
     */

    const peopleAhead =
        Number(
            queue.peopleAhead
        );


    const safePeopleAhead =
        Number.isFinite(
            peopleAhead
        )
            ? peopleAhead
            : 0;


    peopleAheadElement.textContent =
        safePeopleAhead;


    peopleAheadMainElement.textContent =
        safePeopleAhead;


    /*
     * =====================================================
     * CURRENT TOKEN
     * =====================================================
     */

    const currentToken =
        queue.currentToken ||
        queue.currentTokenCode ||
        queue.servingToken;


    currentTokenElement.textContent =
        currentToken ||
        "--";


    /*
     * =====================================================
     * ESTIMATED WAIT
     * =====================================================
     */

    const estimatedWait =
        Number(
            queue.estimatedWait
        );


    if (
        Number.isFinite(
            estimatedWait
        )
    ) {

        estimatedWaitElement.textContent =
            `${estimatedWait} min`;

    } else {

        estimatedWaitElement.textContent =
            "0 min";

    }


    /*
     * =====================================================
     * SAVE CORRECT ACTIVE QUEUE
     * =====================================================
     */

    const activeQueue = {

        queueId:
            queue.id ||
            queue.queueId ||
            urlQueueId,

        tokenNumber:
            realToken,

        tokenCode:
            queue.tokenCode ||
            realToken,

        organizationId:
            queue.organizationId ||
            urlOrganizationId,

        counterId:
            queue.counterId ||
            urlCounterId,

        serviceId:
            queue.serviceId ||
            urlServiceId,

        status:
            queue.status,

        organizationName:
            queue.organizationName ||
            urlOrganization,

        serviceName:
            queue.serviceName ||
            urlService

    };


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

}



/* =========================================================
   NO QUEUE
   ========================================================= */

function showNoQueue() {

    loading.style.display =
        "none";

    errorBox.style.display =
        "none";

    queueCard.style.display =
        "none";

    noQueue.style.display =
        "block";

}



/* =========================================================
   SHOW NO QUEUE STATE
   ========================================================= */

function showNoQueue() {
    if (loading) loading.style.display = "none";
    if (errorBox) errorBox.style.display = "none";
    if (queueCard) queueCard.style.display = "none";
    if (noQueue) noQueue.style.display = "block";
}


/* =========================================================
   LEAVE QUEUE
   ========================================================= */

async function leaveQueue() {

    if (!user || !user.id) {
        window.location.href = "login.html";
        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to leave this queue?"
        );

    if (!confirmed) {
        return;
    }

    try {

        let queueId = urlQueueId;

        if (!queueId) {
            try {
                const response =
                    await fetch(
                        `${API}/queue/user/${user.id}/active`,
                        {
                            cache: "no-store"
                        }
                    );

                if (response.ok) {
                    const queue = await response.json();
                    if (queue) {
                        queueId = queue.id || queue.queueId;
                    }
                }
            } catch (fetchErr) {
                console.warn("Could not fetch active queue from server:", fetchErr);
            }
        }

        if (queueId) {
            try {
                await fetch(
                    `${API}/queue/${queueId}/leave?userId=${user.id}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: user.id
                        })
                    }
                );
            } catch (apiErr) {
                console.warn("Leave API call failed:", apiErr);
            }
        }

        // Clean local caches
        localStorage.removeItem("ordexa_active_queue");
        sessionStorage.removeItem("ordexa_active_queue");
        localStorage.removeItem("ordexa_active_token");
        sessionStorage.removeItem("ordexa_active_token");

        alert("You have left the queue.");
        showNoQueue();
        window.location.href = "home.html";

    } catch (error) {

        console.error(
            error
        );

        localStorage.removeItem("ordexa_active_queue");
        sessionStorage.removeItem("ordexa_active_queue");
        localStorage.removeItem("ordexa_active_token");
        sessionStorage.removeItem("ordexa_active_token");

        alert("You have left the queue.");
        showNoQueue();
        window.location.href = "home.html";

    }

}



/* =========================================================
   NAVIGATION
   ========================================================= */

function goHome() {

    window.location.href =
        "home.html";

}


function openExplore() {

    window.location.href =
        "explore.html";

}


function openNotifications() {

    window.location.href =
        "notifications.html";

}


function openProfile() {

    window.location.href =
        "profile.html";

}



/* =========================================================
   INITIALIZE
   ========================================================= */

if (user) {

    loadQueue();

}



/*
 * Automatically refresh every 5 seconds.
 */

setInterval(
    function () {

        if (user) {

            loadQueue();

        }

    },
    5000
);
