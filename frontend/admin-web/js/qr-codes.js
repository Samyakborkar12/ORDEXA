const API = ((window.location.port === "3000") ? "http://localhost:8080/api" : (window.location.origin + "/api"));
    let organizationId = localStorage.getItem("ordexa_organization_id") || localStorage.getItem("ordexaOrganizationId") || 1;
    let organizationName = "ORDEXA Partner";
    let qrcodeObj = null;

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

    async function loadOrgAndServices() {
        try {
            const orgRes = await fetch(`${API}/organizations/${organizationId}`);
            if (orgRes.ok) {
                const org = await orgRes.json();
                organizationName = org.name || "ORDEXA Partner";
                document.getElementById("previewOrgName").textContent = organizationName;
            }

            const servRes = await fetch(`${API}/services/organization/${organizationId}`);
            if (servRes.ok) {
                const services = await servRes.json();
                const select = document.getElementById("serviceSelect");
                select.innerHTML = '<option value="">-- Choose a Service --</option>';
                services.forEach(s => {
                    const opt = document.createElement("option");
                    opt.value = s.id;
                    opt.textContent = s.name;
                    select.appendChild(opt);
                });
            }
        } catch (e) {
            console.log("Could not load remote details, using fallback:", e);
            document.getElementById("previewOrgName").textContent = "Healthcare & Service Center";
        }
        updateQr();
    }

    function onQrTypeChange() {
        const type = document.getElementById("qrType").value;
        document.getElementById("serviceSelectGroup").style.display = type === "service" ? "block" : "none";
        updateQr();
    }

    function updatePosterText() {
        const heading = document.getElementById("customHeading").value;
        const sub = document.getElementById("customSubheading").value;
        document.getElementById("previewOrgName").textContent = heading || organizationName;
        document.getElementById("previewSubheading").textContent = sub;
    }

    function updateQr() {
        const type = document.getElementById("qrType").value;
        const serviceId = document.getElementById("serviceSelect").value;
        
        const basePath = window.location.pathname.includes("/frontend/") ? "/frontend" : "";
        let targetUrl = window.location.origin + `${basePath}/customer-app/pages/organization.html?id=${organizationId}`;
        if (type === "service" && serviceId) {
            targetUrl = window.location.origin + `${basePath}/customer-app/pages/join-queue.html?organizationId=${organizationId}&serviceId=${serviceId}`;
        }
        
        document.getElementById("targetUrlInput").value = targetUrl;

        // Render QR
        const container = document.getElementById("qrcode");
        container.innerHTML = "";
        
        if (typeof QRCode !== "undefined") {
            qrcodeObj = new QRCode(container, {
                text: targetUrl,
                width: 190,
                height: 190,
                colorDark: "#06283d",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback SVG QR placeholder if offline
            container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(targetUrl)}" width="190" height="190" alt="QR Code">`;
        }
    }

    function downloadQr() {
        const img = document.querySelector("#qrcode img");
        if (img) {
            const a = document.createElement("a");
            a.href = img.src;
            a.download = `ORDEXA_QR_${organizationId}.png`;
            a.click();
        } else {
            alert("QR Code image ready! You can right-click the QR to save or print the poster.");
        }
    }

    if (checkAuth()) {
        loadOrgAndServices();
    }
