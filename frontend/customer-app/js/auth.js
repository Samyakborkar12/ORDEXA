const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));

const form = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

function showMessage(text, type) {

    message.textContent = text;
    message.className = "message " + type;

}

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const remember = document.getElementById("remember").checked;

    if (!email || !password) {
        showMessage("Please enter email and password.", "error");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        const response = await fetch(`${API}/users/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {

            const errorMessage =
                typeof data === "string"
                    ? data
                    : data?.message || "Invalid email or password.";

            showMessage(errorMessage, "error");

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

            return;
        }

        /*
         * IMPORTANT:
         * Password is NOT stored in browser storage.
         */

        const customer = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone || ""
        };

        const storage = remember
            ? localStorage
            : sessionStorage;

        storage.setItem(
            "ordexa_user",
            JSON.stringify(customer)
        );

        showMessage("Login successful! Redirecting...", "success");

        setTimeout(() => {

            window.location.href = "home.html";

        }, 700);

    } catch (error) {

        console.error(error);

        showMessage(
            "Cannot connect to ORDEXA server. Make sure Spring Boot is running.",
            "error"
        );

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }

});

function forgotPassword() {

    window.location.href = "forgot-password.html";

}
