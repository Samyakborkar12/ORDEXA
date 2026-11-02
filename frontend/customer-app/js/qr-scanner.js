let scanning = false;
    let canvasElement = document.createElement("canvas");
    let canvas = canvasElement.getContext("2d");

    async function startCamera() {
        const video = document.getElementById("videoElement");
        const btn = document.getElementById("camBtn");

        if (scanning) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            video.srcObject = stream;
            video.setAttribute("playsinline", true);
            await video.play();
            
            scanning = true;
            btn.textContent = "● Scanning Live...";
            btn.style.color = "#45e3a8";
            requestAnimationFrame(tick);
        } catch (err) {
            console.error("Camera access error:", err);
            alert("Camera access denied or unavailable. Please use the manual ID entry below.");
        }
    }

    function tick() {
        if (!scanning) return;
        const video = document.getElementById("videoElement");

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvasElement.height = video.videoHeight;
            canvasElement.width = video.videoWidth;
            canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
            
            const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
            if (typeof jsQR !== "undefined") {
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });

                if (code && code.data) {
                    onQrDetected(code.data);
                    return;
                }
            }
        }
        requestAnimationFrame(tick);
    }

    function onQrDetected(data) {
        scanning = false;
        
        // Haptic feedback & audio beep
        if (navigator.vibrate) navigator.vibrate(100);
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}

        const btn = document.getElementById("camBtn");
        btn.textContent = "✓ QR Scanned!";
        btn.style.color = "#19d3e6";

        setTimeout(() => {
            if (data.startsWith("http://") || data.startsWith("https://")) {
                window.location.href = data;
            } else if (!isNaN(data)) {
                window.location.href = `organization.html?id=${encodeURIComponent(data)}`;
            } else {
                alert(`Scanned Content: ${data}`);
                scanning = true;
                requestAnimationFrame(tick);
            }
        }, 500);
    }

    function handleManualJoin() {
        const id = document.getElementById("orgIdInput").value.trim();
        if (!id) {
            alert("Please enter a valid Organization ID");
            return;
        }
        window.location.href = `organization.html?id=${id}`;
    }
