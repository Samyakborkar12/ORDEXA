/*
     * CHECK LOGIN
     */

    function getLoggedInUser() {

        let user = localStorage.getItem("ordexa_user");

        if (!user) {
            user = sessionStorage.getItem("ordexa_user");
        }

        if (!user) {
            window.location.href = "login.html";
            return null;
        }

        try {
            return JSON.parse(user);
        } catch (error) {

            localStorage.removeItem("ordexa_user");
            sessionStorage.removeItem("ordexa_user");

            window.location.href = "login.html";

            return null;
        }
    }


    const user = getLoggedInUser();


    /*
     * SHOW USER INFORMATION
     */

    if (user) {

        const name =
            user.name ||
            "User";

        document.getElementById("userName").textContent = name;

        document.getElementById("profileName").textContent = name;

        const firstLetter =
            name.charAt(0).toUpperCase();

        document.getElementById("avatar").textContent =
            firstLetter;
    }


    /*
     * NAVIGATION
     */

    function goHome() {
        window.location.href = "home.html";
    }


    function openExplore() {
        window.location.href = "explore.html";
    }


    function openQueue() {
        window.location.href = "live-queue.html";
    }


    function openNotifications() {
        window.location.href = "notifications.html";
    }


    function openProfile() {
        window.location.href = "profile.html";
    }


    function openScanner() {
        window.location.href = "qr-scanner.html";
    }


    /*
     * SEARCH
     */

    function handleSearch(event) {

        if (event.key === "Enter") {

            const query =
                document.getElementById("searchInput")
                .value
                .trim();

            if (!query) {
                return;
            }

            window.location.href =
                "explore.html?search=" +
                encodeURIComponent(query);
        }
    }
