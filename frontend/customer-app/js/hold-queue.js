const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));
    let selectedMins = 5;

    function selectDuration(mins, btn) {
        selectedMins = mins;
        document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    }

    async function confirmHold() {
        const btn = document.getElementById("holdBtn");
        btn.disabled = true;
        btn.textContent = "Pausing...";

        // Look for active token
        const activeQueue = JSON.parse(localStorage.getItem("ordexa_active_token") || "{}");
        const tokenId = activeQueue.id;

        if (tokenId) {
            try {
                await fetch(`${API}/queue/${tokenId}/hold`, { method: "POST" });
            } catch (e) {
                console.log("Offline hold simulation");
            }
        }

        alert(`Your token has been put on HOLD for ${selectedMins} minutes. Tap 'Rejoin' once you arrive at the lounge!`);
        window.location.href = `rejoin-queue.html?id=${tokenId || ''}`;
    }
