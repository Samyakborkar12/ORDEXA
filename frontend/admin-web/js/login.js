/* =========================================================
       ORDEXA API
    ========================================================= */

    const API_BASE_URL =
        ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));



    /* =========================================================
       PASSWORD SHOW / HIDE
    ========================================================= */

    const passwordInput =
        document.getElementById(
            "password"
        );


    const togglePassword =
        document.getElementById(
            "togglePassword"
        );


    togglePassword.addEventListener(
        "click",
        function () {


            if (
                passwordInput.type ===
                "password"
            ) {


                passwordInput.type =
                    "text";


                togglePassword.textContent =
                    "Hide";


            } else {


                passwordInput.type =
                    "password";


                togglePassword.textContent =
                    "Show";

            }

        }
    );



    /* =========================================================
       LOGIN FORM
    ========================================================= */

    const loginForm =
        document.getElementById(
            "loginForm"
        );



    loginForm.addEventListener(
        "submit",
        async function (event) {


            event.preventDefault();



            /* ============================
               GET FORM DATA
            ============================= */


            const email =
                document
                    .getElementById(
                        "email"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "password"
                    )
                    .value;


            const rememberMe =
                document
                    .getElementById(
                        "rememberMe"
                    )
                    .checked;



            /* ============================
               ELEMENTS
            ============================= */


            const errorMessage =
                document.getElementById(
                    "errorMessage"
                );


            const successMessage =
                document.getElementById(
                    "successMessage"
                );


            const submitButton =
                document.getElementById(
                    "submitBtn"
                );



            /* ============================
               CLEAR OLD MESSAGES
            ============================= */


            errorMessage.style.display =
                "none";


            successMessage.style.display =
                "none";


            submitButton.disabled =
                true;


            submitButton.textContent =
                "Signing in...";



            try {


                /* ========================
                   LOGIN REQUEST
                ========================= */


                console.log(
                    "ORDEXA LOGIN REQUEST"
                );


                console.log(
                    "URL:",
                    API_BASE_URL +
                    "/admin/login"
                );


                console.log(
                    "Email:",
                    email
                );



                const response =
                    await fetch(

                        API_BASE_URL +
                        "/admin/login",

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }

                    );



                console.log(
                    "Login response status:",
                    response.status
                );



                /* ========================
                   READ RESPONSE
                ========================= */


                const contentType =
                    response.headers.get(
                        "content-type"
                    ) || "";


                let data;



                if (
                    contentType.includes(
                        "application/json"
                    )
                ) {


                    data =
                        await response.json();


                } else {


                    data =
                        await response.text();

                }



                console.log(
                    "Login response data:",
                    data
                );



                /* =================================================
                   LOGIN SUCCESS
                ================================================= */


                if (
                    response.ok
                ) {


                    console.log(
                        "LOGIN SUCCESS"
                    );



                    /*
                     * Backend returns:
                     *
                     * id
                     * name
                     * email
                     */


                    const adminSessionData = {

                        id:
                            data.id,

                        name:
                            data.name,

                        email:
                            data.email

                    };



                    const sessionString =
                        JSON.stringify(
                            adminSessionData
                        );



                    /* ========================
                       SAVE LOGIN
                    ========================= */


                    if (
                        rememberMe
                    ) {


                        localStorage.setItem(

                            "ordexa_admin",

                            sessionString

                        );


                    } else {


                        sessionStorage.setItem(

                            "ordexa_admin",

                            sessionString

                        );

                    }



                    /* ========================
                       SHOW SUCCESS
                    ========================= */


                    successMessage.textContent =
                        "Login successful! Checking organization...";


                    successMessage.style.display =
                        "block";


                    submitButton.textContent =
                        "Success ✓";



                    /* =================================================
                       CHECK ORGANIZATION
                    ================================================= */

                    try {


                        console.log(
                            "Checking organization for admin:",
                            data.id
                        );



                        const organizationResponse =
                            await fetch(

                                API_BASE_URL +

                                "/organizations/admin/" +

                                encodeURIComponent(
                                    data.id
                                )

                            );



                        console.log(

                            "Organization check status:",

                            organizationResponse.status

                        );



                        /* ============================
                           ORGANIZATION EXISTS
                        ============================= */

                        if (
                            organizationResponse.ok
                        ) {


                            console.log(

                                "Organization already exists."

                            );


                            /*
                             * Existing admin
                             * → Dashboard
                             */

                            window.location.href =
                                "dashboard.html";


                            return;

                        }



                        /* ============================
                           ORGANIZATION NOT FOUND
                        ============================= */

                        if (
                            organizationResponse.status ===
                            404
                        ) {


                            console.log(

                                "No organization found."

                            );


                            /*
                             * First-time admin
                             * → Organization setup
                             */

                            window.location.href =
                                "organization.html";


                            return;

                        }



                        /* ============================
                           UNEXPECTED RESPONSE
                        ============================= */

                        console.error(

                            "Unexpected organization response:",

                            organizationResponse.status

                        );


                        errorMessage.textContent =
                            "Unable to check organization setup. Please try again.";


                        errorMessage.style.display =
                            "block";


                        successMessage.style.display =
                            "none";


                        submitButton.textContent =
                            "Sign In";


                        submitButton.disabled =
                            false;


                    }


                    catch (
                        organizationError
                    ) {


                        console.error(

                            "Organization check error:",

                            organizationError

                        );


                        errorMessage.textContent =

                            "Could not check organization setup. Please try again.";


                        errorMessage.style.display =
                            "block";


                        successMessage.style.display =
                            "none";


                        submitButton.textContent =
                            "Sign In";


                        submitButton.disabled =
                            false;

                    }



                    return;

                }



                /* =================================================
                   LOGIN FAILED
                ================================================= */


                let message =
                    "Invalid email or password";



                if (
                    typeof data ===
                    "string"
                ) {


                    if (
                        data.trim() !== ""
                    ) {


                        message =
                            data;

                    }


                }


                else if (
                    data &&
                    data.message
                ) {


                    message =
                        data.message;


                }


                else if (
                    data &&
                    data.error
                ) {


                    message =
                        data.error;

                }



                errorMessage.textContent =
                    message;


                errorMessage.style.display =
                    "block";


                submitButton.textContent =
                    "Sign In";


                submitButton.disabled =
                    false;

            }



            /* =====================================================
               CONNECTION ERROR
            ===================================================== */

            catch (
                error
            ) {


                console.error(

                    "ORDEXA LOGIN ERROR:",

                    error

                );


                errorMessage.textContent =

                    "Could not connect to ORDEXA backend. " +

                    "Check the browser console for details.";


                errorMessage.style.display =
                    "block";


                submitButton.textContent =
                    "Sign In";


                submitButton.disabled =
                    false;

            }

        }
    );
