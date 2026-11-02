const API =
        ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));


    const form =
        document.getElementById(
            "registerForm"
        );

    const message =
        document.getElementById(
            "message"
        );

    const button =
        document.getElementById(
            "registerButton"
        );


    function showMessage(
        text,
        type
    ) {

        message.textContent = text;

        message.className =
            "message " + type;
    }


    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const email =
                document.getElementById(
                    "email"
                ).value.trim();


            const phone =
                document.getElementById(
                    "phone"
                ).value.trim();


            const password =
                document.getElementById(
                    "password"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            if (password !== confirmPassword) {

                showMessage(
                    "Passwords do not match.",
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


            button.disabled = true;

            button.textContent =
                "Creating Account...";


            try {

                const response =
                    await fetch(
                        `${API}/users/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                password: password,

                                phone: phone

                            })
                        }
                    );


                const result =
                    await response.json()
                        .catch(() => null);


                if (!response.ok) {

                    throw new Error(
                        typeof result === "string"
                            ? result
                            : "Registration failed"
                    );
                }


                showMessage(
                    "Account created successfully! Redirecting...",
                    "success"
                );


                setTimeout(
                    function() {

                        window.location.href =
                            "login.html";

                    },
                    1200
                );


            } catch (error) {

                console.error(error);

                showMessage(
                    error.message ||
                    "Unable to create account.",
                    "error"
                );

                button.disabled = false;

                button.textContent =
                    "Create Account";
            }

        }
    );
