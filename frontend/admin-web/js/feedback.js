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

    if (checkAuth()) {
        // Active
    }
