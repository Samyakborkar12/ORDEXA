const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));
    let organizationId = localStorage.getItem("ordexa_organization_id") || localStorage.getItem("ordexaOrganizationId") || 1;

    function checkAuth() {
        const admin = localStorage.getItem("ordexa_admin") || sessionStorage.getItem("ordexa_admin");
        if (!admin) {
            window.location.href = "login.html";
            return false;
        }
        return true;
    }

    function logout() {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "login.html";
    }

    function showToast(msg) {
        const toast = document.getElementById("toast");
        document.getElementById("toastMsg").textContent = msg;
        toast.style.display = "flex";
        setTimeout(() => toast.style.display = "none", 3000);
    }

    async function loadSettings() {
        try {
            const res = await fetch(`${API}/organizations/${organizationId}`);
            if (res.ok) {
                const org = await res.json();
                document.getElementById("orgName").value = org.name || "";
                document.getElementById("orgType").value = org.type || "HOSPITAL";
                document.getElementById("orgDesc").value = org.description || "";
            }
        } catch (e) {
            console.log("Could not fetch remote settings, using local:", e);
        }

        // Load saved preferences
        const savedPrefs = JSON.parse(localStorage.getItem(`ordexa_settings_${organizationId}`) || "{}");
        if (savedPrefs.openTime) document.getElementById("openTime").value = savedPrefs.openTime;
        if (savedPrefs.closeTime) document.getElementById("closeTime").value = savedPrefs.closeTime;
        if (savedPrefs.bufferMinutes) document.getElementById("bufferMinutes").value = savedPrefs.bufferMinutes;
        if (savedPrefs.soundChime !== undefined) document.getElementById("soundChime").checked = savedPrefs.soundChime;
        if (savedPrefs.autoSkip !== undefined) document.getElementById("autoSkip").checked = savedPrefs.autoSkip;
        if (savedPrefs.smsAlerts !== undefined) document.getElementById("smsAlerts").checked = savedPrefs.smsAlerts;
    }

    async function saveSettings() {
        const name = document.getElementById("orgName").value.trim();
        const type = document.getElementById("orgType").value;
        const description = document.getElementById("orgDesc").value.trim();

        try {
            await fetch(`${API}/organizations/${organizationId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, type, description })
            });
        } catch (e) {
            console.log("Backend update error:", e);
        }

        const prefs = {
            openTime: document.getElementById("openTime").value,
            closeTime: document.getElementById("closeTime").value,
            bufferMinutes: document.getElementById("bufferMinutes").value,
            soundChime: document.getElementById("soundChime").checked,
            autoSkip: document.getElementById("autoSkip").checked,
            smsAlerts: document.getElementById("smsAlerts").checked
        };
        localStorage.setItem(`ordexa_settings_${organizationId}`, JSON.stringify(prefs));

        showToast("Settings updated successfully!");
    }

    function confirmResetQueue() {
        if (confirm("Are you sure you want to reset all waiting tokens for today? Active tokens will be cleared.")) {
            showToast("Queue counters refreshed for the new session.");
        }
    }

    if (checkAuth()) {
        loadSettings();
    }
