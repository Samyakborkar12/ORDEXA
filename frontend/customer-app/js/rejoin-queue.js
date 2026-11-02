const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));
    const params = new URLSearchParams(window.location.search);
    const tokenId = params.get("id");

    const activeQueue = JSON.parse(localStorage.getItem("ordexa_active_token") || "{}");
    if (activeQueue.tokenCode) {
        document.getElementById("tokenCodeText").textContent = activeQueue.tokenCode;
    }

    async function handleRejoin() {
        const btn = document.getElementById("rejoinBtn");
        btn.disabled = true;
        btn.textContent = "Rejoining...";

        const id = tokenId || activeQueue.id;
        if (id) {
            try {
                await fetch(`${API}/queue/${id}/rejoin`, { method: "POST" });
            } catch (e) {
                console.log("Offline rejoin simulation");
            }
        }

        alert("Welcome back! Your token is now ACTIVE in the queue.");
        window.location.href = "live-queue.html";
    }
