const API_URL = ((window.location.port === "3000") ? "http://localhost:8080/api/admin" : (window.location.origin + "/api/admin"));


    // ----------------------------------------
    // SHOW / HIDE PASSWORD
    // ----------------------------------------

    function togglePassword(inputId, button) {

        const input = document.getElementById(inputId);

        if (input.type === "password") {

            input.type = "text";

            button.textContent = "HIDE";

        } else {

            input.type = "password";

            button.textContent = "SHOW";

        }
    }


    // ----------------------------------------
    // MESSAGE
    // ----------------------------------------

    function showMessage(message, type) {

        const messageBox =
            document.getElementById("message");

        messageBox.textContent = message;

        messageBox.className =
            "message " + type;
    }


    function clearMessage() {

        const messageBox =
            document.getElementById("message");

        messageBox.textContent = "";

        messageBox.className = "message";
    }


    // ----------------------------------------
    // REGISTER
    // ----------------------------------------

    document
        .getElementById("registerForm")
        .addEventListener("submit", async function(event) {

            event.preventDefault();

            clearMessage();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("password")
                    .value;

            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            // ----------------------------------------
            // VALIDATION
            // ----------------------------------------

            if (!name) {

                showMessage(
                    "Please enter your full name.",
                    "error"
                );

                return;
            }


            if (!email) {

                showMessage(
                    "Please enter your email address.",
                    "error"
                );

                return;
            }


            if (password.length < 6) {

                showMessage(
                    "Password must be at least 6 characters.",
                    "error"
                );

                return;
            }


            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            // ----------------------------------------
            // BUTTON LOADING
            // ----------------------------------------

            const button =
                document.getElementById("registerBtn");

            button.disabled = true;

            button.innerHTML = `
                <span class="loading">
                    <span class="spinner"></span>
                    Creating Account...
                </span>
            `;


            try {

                // ----------------------------------------
                // API REQUEST
                // ----------------------------------------

                const response = await fetch(
                    `${API_URL}/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    }
                );


                // ----------------------------------------
                // RESPONSE
                // ----------------------------------------

                const contentType =
                    response.headers.get(
                        "content-type"
                    );

                let data;

                if (
                    contentType &&
                    contentType.includes("application/json")
                ) {

                    data = await response.json();

                } else {

                    data = await response.text();

                }


                // ----------------------------------------
                // SUCCESS
                // ----------------------------------------

                if (response.ok) {

                    showMessage(
                        "Account created successfully! Redirecting to login...",
                        "success"
                    );


                    // Clear form

                    document
                        .getElementById("registerForm")
                        .reset();


                    // Redirect to login

                    setTimeout(function() {

                        window.location.href =
                            "login.html";

                    }, 1500);


                    return;
                }


                // ----------------------------------------
                // ERROR
                // ----------------------------------------

                let errorMessage =
                    "Unable to create account.";


                if (typeof data === "string") {

                    errorMessage = data;

                } else if (data && data.message) {

                    errorMessage = data.message;

                }


                showMessage(
                    errorMessage,
                    "error"
                );


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showMessage(
                    "Unable to connect to ORDEXA server. Make sure the Spring Boot backend is running on port 8080.",
                    "error"
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    "Create Account";

            }

        });
