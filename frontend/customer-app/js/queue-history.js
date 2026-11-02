const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));
    let allTokens = [];
    let currentFilter = "ALL";

    function getLoggedInUser() {
        let user = localStorage.getItem("ordexa_user") || sessionStorage.getItem("ordexa_user");
        if (!user) {
            window.location.href = "login.html";
            return null;
        }
        try {
            return JSON.parse(user);
        } catch (e) {
            window.location.href = "login.html";
            return null;
        }
    }

    async function loadHistory() {
        const user = getLoggedInUser();
        if (!user) return;

        try {
            const res = await fetch(`${API}/queue/user/${user.id}/history`);
            if (!res.ok) throw new Error("Could not load history");
            allTokens = await res.json();
            renderList();
        } catch (err) {
            console.warn("Using sample history view:", err);
            allTokens = [
                {
                    id: 101,
                    tokenCode: "ORD-CON-004",
                    status: "COMPLETED",
                    createdAt: "2026-10-04T11:30:00",
                    completedAt: "2026-10-04T11:45:00",
                    counterId: 1
                },
                {
                    id: 98,
                    tokenCode: "ORD-EXP-012",
                    status: "COMPLETED",
                    createdAt: "2026-10-02T14:15:00",
                    completedAt: "2026-10-02T14:25:00",
                    counterId: 2
                },
                {
                    id: 85,
                    tokenCode: "ORD-GEN-029",
                    status: "CANCELLED",
                    createdAt: "2026-09-28T09:40:00",
                    counterId: 1
                }
            ];
            renderList();
        }
    }

    function filterTokens(type) {
        currentFilter = type;
        document.querySelectorAll(".filter-tab").forEach(tab => tab.classList.remove("active"));
        event.target.classList.add("active");
        renderList();
    }

    function renderList() {
        const container = document.getElementById("historyList");
        let list = allTokens;

        if (currentFilter === "COMPLETED") {
            list = allTokens.filter(t => (t.status || "").toUpperCase() === "COMPLETED");
        } else if (currentFilter === "CANCELLED") {
            list = allTokens.filter(t => ["CANCELLED", "SKIPPED", "MISSED"].includes((t.status || "").toUpperCase()));
        }

        if (list.length === 0) {
            container.innerHTML = `
                <div class="empty-history">
                    <div style="font-size: 36px; margin-bottom: 12px;">🎟</div>
                    <h3>No tokens found</h3>
                    <p style="color: #8faabd; font-size: 13px; margin-top: 6px;">You haven't participated in any queue matching this filter.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        list.forEach(t => {
            const status = (t.status || "WAITING").toUpperCase();
            let badgeClass = "status-waiting";
            if (status === "COMPLETED") badgeClass = "status-completed";
            else if (["CANCELLED", "SKIPPED", "MISSED"].includes(status)) badgeClass = "status-cancelled";
            else if (status === "HOLD") badgeClass = "status-hold";

            const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recent";

            const card = document.createElement("div");
            card.className = "history-card";
            card.innerHTML = `
                <div class="history-left">
                    <div class="token-circle">🎟</div>
                    <div>
                        <div class="token-title">${t.tokenCode || `#${t.id}`}</div>
                        <div class="token-sub">Service Desk · Counter ${t.counterId || 1}</div>
                        <div class="token-meta">Created: ${dateStr}</div>
                    </div>
                </div>
                <div>
                    <span class="status-badge ${badgeClass}">${status}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    loadHistory();
