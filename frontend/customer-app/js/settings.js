function loadPreferences() {
        const prefs = JSON.parse(localStorage.getItem("ordexa_cust_prefs") || "{}");
        if (prefs.lang) document.getElementById("langSelect").value = prefs.lang;
        if (prefs.sound !== undefined) document.getElementById("soundToggle").checked = prefs.sound;
        if (prefs.refresh) document.getElementById("refreshSelect").value = prefs.refresh;
    }

    function savePreferences() {
        const prefs = {
            lang: document.getElementById("langSelect").value,
            sound: document.getElementById("soundToggle").checked,
            refresh: document.getElementById("refreshSelect").value
        };
        localStorage.setItem("ordexa_cust_prefs", JSON.stringify(prefs));
    }

    function clearAppData() {
        if (confirm("Are you sure you want to clear your local token data?")) {
            localStorage.removeItem("ordexa_active_token");
            localStorage.removeItem("ordexa_cust_prefs");
            alert("Local cache cleared!");
            window.location.href = "home.html";
        }
    }

    loadPreferences();
