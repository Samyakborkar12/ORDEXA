// ========================================
// ORDEXA - QUEUE MANAGEMENT
// Frontend demo - backend not connected
// ========================================

const params = new URLSearchParams(window.location.search);

const organizationType = params.get("type") || "hospitals";
const organizationName =
    params.get("organization") || "Demo Organization";
const serviceName =
    params.get("service") || "General Service";

// Demo queue values
const DEMO_WAITING_COUNT = 12;
const MINUTES_PER_PERSON = 2;

// Page elements
const organizationElement =
    document.getElementById("organization-name");

const serviceElement =
    document.getElementById("service-name");

const waitingCountElement =
    document.getElementById("waiting-count");

const waitingTimeElement =
    document.getElementById("waiting-time");

const joinButton =
    document.getElementById("join-queue-button");

const tokenResult =
    document.getElementById("token-result");

const tokenNumberElement =
    document.getElementById("token-number");

const peopleAheadElement =
    document.getElementById("people-ahead");

const yourWaitElement =
    document.getElementById("your-wait");

const trackButton =
    document.getElementById("track-queue-button");

// Display selected details
organizationElement.textContent = organizationName;
serviceElement.textContent = serviceName;

document.title = `Join Queue | ${organizationName}`;

// Demo queue information
waitingCountElement.textContent = DEMO_WAITING_COUNT;

waitingTimeElement.textContent =
    `${DEMO_WAITING_COUNT * MINUTES_PER_PERSON} min`;

// Pass selected details to the live queue page
function updateLiveQueueLink(token, ahead, wait) {
    const liveUrl = new URL("live-queue.html", window.location.href);

    liveUrl.searchParams.set("type", organizationType);
    liveUrl.searchParams.set("organization", organizationName);
    liveUrl.searchParams.set("service", serviceName);
    liveUrl.searchParams.set("token", token);
    liveUrl.searchParams.set("ahead", ahead);
    liveUrl.searchParams.set("wait", wait);

    trackButton.href = liveUrl.href;
}

// Generate a demo token
joinButton.addEventListener("click", () => {
    const storageKey =
        `ordexa-demo-${organizationType}-${organizationName}-${serviceName}`;

    let tokenCount =
        Number(sessionStorage.getItem(storageKey)) || 0;

    tokenCount++;

    sessionStorage.setItem(storageKey, tokenCount);

    const token = `A${String(tokenCount).padStart(3, "0")}`;

    const peopleAhead = DEMO_WAITING_COUNT;
    const estimatedWait = peopleAhead * MINUTES_PER_PERSON;

    // Display token
    tokenNumberElement.textContent = token;
    peopleAheadElement.textContent = peopleAhead;
    yourWaitElement.textContent = `${estimatedWait} min`;

    // Update live queue navigation
    updateLiveQueueLink(token, peopleAhead, estimatedWait);

    // Show result
    tokenResult.hidden = false;
    joinButton.textContent = "Token Generated ✓";
    joinButton.disabled = true;

    tokenResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});