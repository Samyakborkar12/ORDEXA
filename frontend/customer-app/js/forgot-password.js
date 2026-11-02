const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));

    async function handleReset(e) {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const msgBox = document.getElementById("msgBox");
        const submitBtn = document.getElementById("submitBtn");

        if (newPassword !== confirmPassword) {
            msgBox.className = "msg-box msg-error";
            msgBox.textContent = "Passwords do not match.";
            msgBox.style.display = "block";
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Updating...";

        try {
            const res = await fetch(`${API}/user/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, newPassword })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "User not found or error occurred.");
            }

            msgBox.className = "msg-box msg-success";
            msgBox.textContent = "Password updated successfully! Redirecting to login...";
            msgBox.style.display = "block";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1800);
        } catch (err) {
            msgBox.className = "msg-box msg-error";
            msgBox.textContent = err.message || "Failed to update password.";
            msgBox.style.display = "block";
            submitBtn.disabled = false;
            submitBtn.textContent = "Update Password →";
        }
    }
