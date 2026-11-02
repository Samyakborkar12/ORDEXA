const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));

    let currentUser = null;


    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    function getUser() {

        let user = null;

        try {
            user = JSON.parse(
                localStorage.getItem("ordexa_user")
            );
        } catch (e) {
            user = null;
        }

        if (!user) {

            try {
                user = JSON.parse(
                    sessionStorage.getItem("ordexa_user")
                );
            } catch (e) {
                user = null;
            }
        }

        return user;
    }


    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    async function loadNotifications() {

        const loading =
            document.getElementById("loading");

        const list =
            document.getElementById("notificationList");

        const empty =
            document.getElementById("emptyState");

        const error =
            document.getElementById("errorState");


        loading.style.display = "block";
        list.innerHTML = "";
        empty.style.display = "none";
        error.style.display = "none";


        if (!currentUser || !currentUser.id) {

            loading.style.display = "none";

            error.style.display = "block";

            error.querySelector("h3").textContent =
                "Please login first";

            error.querySelector("p").textContent =
                "Your customer session was not found.";

            return;
        }


        try {

            const response = await fetch(
                `${API}/notifications/user/${currentUser.id}`
            );


            if (!response.ok) {
                throw new Error("Failed to load notifications");
            }


            const notifications =
                await response.json();


            loading.style.display = "none";


            if (!notifications ||
                notifications.length === 0) {

                empty.style.display = "block";
                return;
            }


            notifications.forEach(notification => {

                list.appendChild(
                    createNotification(notification)
                );

            });

        } catch (error) {

            console.error(error);

            loading.style.display = "none";
            errorState.style.display = "block";
        }
    }


    // =====================================================
    // CREATE NOTIFICATION CARD
    // =====================================================

    function createNotification(notification) {

        const card =
            document.createElement("div");

        card.className =
            "notification" +
            (!notification.read ? " unread" : "");


        const icon =
            document.createElement("div");

        icon.className = "icon";

        icon.textContent =
            getNotificationIcon(notification.type);


        const content =
            document.createElement("div");

        content.className =
            "notification-content";


        const title =
            document.createElement("div");

        title.className =
            "notification-title";

        title.textContent =
            notification.title;


        const message =
            document.createElement("div");

        message.className =
            "notification-message";

        message.textContent =
            notification.message;


        const time =
            document.createElement("div");

        time.className =
            "notification-time";

        time.textContent =
            formatDate(notification.createdAt);


        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(time);


        if (!notification.read) {

            const dot =
                document.createElement("div");

            dot.className =
                "unread-dot";

            card.appendChild(icon);
            card.appendChild(content);
            card.appendChild(dot);

        } else {

            card.appendChild(icon);
            card.appendChild(content);
        }


        card.addEventListener(
            "click",
            () => markAsRead(notification.id, card)
        );


        return card;
    }


    // =====================================================
    // ICON
    // =====================================================

    function getNotificationIcon(type) {

        switch ((type || "").toUpperCase()) {

            case "QUEUE_JOINED":
                return "🎟️";

            case "TOKEN_SERVED":
                return "📢";

            case "TOKEN_SKIPPED":
                return "⏭️";

            case "QUEUE_COMPLETED":
                return "✅";

            case "QUEUE_UPDATE":
                return "🔔";

            default:
                return "🔔";
        }
    }


    // =====================================================
    // MARK ONE READ
    // =====================================================

    async function markAsRead(id, card) {

        try {

            const response = await fetch(
                `${API}/notifications/${id}/read`,
                {
                    method: "PUT"
                }
            );


            if (!response.ok) {
                return;
            }


            card.classList.remove("unread");

            const dot =
                card.querySelector(".unread-dot");

            if (dot) {
                dot.remove();
            }

        } catch (error) {

            console.error(error);
        }
    }


    // =====================================================
    // MARK ALL READ
    // =====================================================

    async function markAllRead() {

        if (!currentUser || !currentUser.id) {
            return;
        }


        try {

            const response = await fetch(
                `${API}/notifications/user/${currentUser.id}/read-all`,
                {
                    method: "PUT"
                }
            );


            if (!response.ok) {
                throw new Error();
            }


            showToast("All notifications marked as read");

            await loadNotifications();

        } catch (error) {

            showToast("Unable to update notifications");
        }
    }


    // =====================================================
    // DATE FORMAT
    // =====================================================

    function formatDate(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(dateString);


        if (isNaN(date.getTime())) {
            return "";
        }


        const now =
            new Date();

        const diff =
            now.getTime() -
            date.getTime();


        const minutes =
            Math.floor(diff / 60000);

        const hours =
            Math.floor(diff / 3600000);

        const days =
            Math.floor(diff / 86400000);


        if (minutes < 1) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes} min ago`;
        }

        if (hours < 24) {
            return `${hours} hr ago`;
        }

        if (days < 7) {
            return `${days} day${days > 1 ? "s" : ""} ago`;
        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );
    }


    // =====================================================
    // BACK
    // =====================================================

    function goBack() {

        if (history.length > 1) {
            history.back();
        } else {
            window.location.href =
                "home.html";
        }
    }


    // =====================================================
    // TOAST
    // =====================================================

    function showToast(message) {

        const toast =
            document.getElementById("toast");

        toast.textContent = message;
        toast.style.display = "block";


        setTimeout(() => {
            toast.style.display = "none";
        }, 2500);
    }


    // =====================================================
    // START
    // =====================================================

    currentUser = getUser();

    loadNotifications();
