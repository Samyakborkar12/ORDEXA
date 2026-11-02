const API =
    ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));

let user = null;


// =====================================================
// GET LOGGED-IN USER
// =====================================================

function getUser() {

    let data =
        localStorage.getItem(
            "ordexa_user"
        );


    if (!data) {

        data =
            sessionStorage.getItem(
                "ordexa_user"
            );
    }


    if (!data) {

        location.href =
            "login.html";

        return null;
    }


    try {

        return JSON.parse(data);

    } catch {

        location.href =
            "login.html";

        return null;
    }
}


// =====================================================
// LOAD HISTORY
// =====================================================

async function loadHistory() {

    if (!user || !user.id) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API}/queue/user/${user.id}/history`
            );


        if (response.status === 404) {

            showEmpty();

            return;
        }


        if (!response.ok) {

            throw new Error(
                "Unable to load history"
            );
        }


        const history =
            await response.json();


        if (
            !Array.isArray(history) ||
            history.length === 0
        ) {

            showEmpty();

            return;
        }


        renderHistory(history);


    } catch (error) {

        console.error(error);

        document.getElementById(
            "loading"
        ).style.display =
            "none";

        document.getElementById(
            "error"
        ).style.display =
            "block";
    }
}


// =====================================================
// RENDER HISTORY
// =====================================================

function renderHistory(history) {

    document.getElementById(
        "loading"
    ).style.display =
        "none";


    document.getElementById(
        "empty"
    ).style.display =
        "none";


    document.getElementById(
        "error"
    ).style.display =
        "none";


    const list =
        document.getElementById(
            "historyList"
        );


    list.style.display =
        "block";


    list.innerHTML =
        history
            .map(
                token =>
                    createHistoryCard(token)
            )
            .join("");
}


// =====================================================
// CREATE HISTORY CARD
// =====================================================

function createHistoryCard(token) {

    const tokenNumber =
        "#" +
        String(
            token.tokenNumber ?? 0
        ).padStart(3, "0");


    const status =
        String(
            token.status || "UNKNOWN"
        ).toUpperCase();


    const statusClass =
        status.toLowerCase();


    const createdAt =
        formatDateTime(
            token.createdAt
        );


    const completedAt =
        token.completedAt
            ? formatDateTime(
                token.completedAt
            )
            : "—";


    return `

        <div class="history-card">


            <div class="history-top">

                <div class="token">
                    ${tokenNumber}
                </div>


                <div
                    class="status ${statusClass}">

                    ${escapeHtml(status)}

                </div>

            </div>


            <div class="details">


                <div class="detail-row">

                    <div class="detail-label">
                        Queue ID
                    </div>

                    <div class="detail-value">
                        ${token.id ?? "—"}
                    </div>

                </div>


                <div class="detail-row">

                    <div class="detail-label">
                        Counter
                    </div>

                    <div class="detail-value">
                        ${token.counterId ?? "—"}
                    </div>

                </div>


                <div class="detail-row">

                    <div class="detail-label">
                        Service
                    </div>

                    <div class="detail-value">
                        ${token.serviceId ?? "—"}
                    </div>

                </div>


                <div class="detail-row">

                    <div class="detail-label">
                        Completed
                    </div>

                    <div class="detail-value">
                        ${completedAt}
                    </div>

                </div>


            </div>


            <div class="date">
                Joined: ${createdAt}
            </div>


        </div>

    `;
}


// =====================================================
// EMPTY STATE
// =====================================================

function showEmpty() {

    document.getElementById(
        "loading"
    ).style.display =
        "none";


    document.getElementById(
        "error"
    ).style.display =
        "none";


    document.getElementById(
        "historyList"
    ).style.display =
        "none";


    document.getElementById(
        "empty"
    ).style.display =
        "block";
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDateTime(value) {

    if (!value) {
        return "—";
    }


    try {

        const date =
            new Date(value);


        return date.toLocaleString(
            [],
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    } catch {

        return "—";
    }
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// =====================================================
// START
// =====================================================

user =
    getUser();


if (user) {

    loadHistory();

}
