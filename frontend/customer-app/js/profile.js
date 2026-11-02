const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));
    let currentUser = null;

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

    function init() {
        currentUser = getLoggedInUser();
        if (!currentUser) return;

        const initial = (currentUser.name || "U").charAt(0).toUpperCase();
        document.getElementById("avatarInitial").textContent = initial;
        document.getElementById("displayUserName").textContent = currentUser.name || "Customer";
        document.getElementById("displayUserEmail").textContent = currentUser.email || "";

        document.getElementById("inputName").value = currentUser.name || "";
        document.getElementById("inputPhone").value = currentUser.phone || "";
        document.getElementById("inputEmail").value = currentUser.email || "";
    }

    async function handleUpdateProfile(e) {
        e.preventDefault();
        const name = document.getElementById("inputName").value.trim();
        const phone = document.getElementById("inputPhone").value.trim();
        const btn = document.getElementById("saveBtn");

        btn.disabled = true;
        btn.textContent = "Saving...";

        try {
            const res = await fetch(`${API}/user/${currentUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone })
            });

            if (res.ok) {
                const updated = await res.json();
                currentUser.name = updated.name || name;
                currentUser.phone = updated.phone || phone;
                localStorage.setItem("ordexa_user", JSON.stringify(currentUser));
                alert("Profile updated successfully!");
                init();
            } else {
                alert("Failed to update profile on server.");
            }
        } catch (err) {
            console.log("Offline update:", err);
            currentUser.name = name;
            currentUser.phone = phone;
            localStorage.setItem("ordexa_user", JSON.stringify(currentUser));
            alert("Profile details saved locally!");
            init();
        } finally {
            btn.disabled = false;
            btn.textContent = "Save Profile";
        }
    }

    function logout() {
        localStorage.removeItem("ordexa_user");
        sessionStorage.removeItem("ordexa_user");
        window.location.href = "login.html";
    }

    init();
