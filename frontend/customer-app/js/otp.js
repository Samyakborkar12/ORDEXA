const inputs = document.querySelectorAll(".otp-box");
    let countdown = 45;
    let timerInterval = null;

    function startTimer() {
        countdown = 45;
        document.getElementById("resendBtn").disabled = true;
        document.getElementById("timer").textContent = countdown;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            countdown--;
            document.getElementById("timer").textContent = countdown;
            if (countdown <= 0) {
                clearInterval(timerInterval);
                document.getElementById("resendBtn").disabled = false;
                document.getElementById("resendBtn").textContent = "Resend Code";
            }
        }, 1000);
    }

    function moveNext(input, index) {
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    }

    function handleBackspace(e, index) {
        if (e.key === "Backspace" && !inputs[index].value && index > 0) {
            inputs[index - 1].focus();
        }
    }

    function handleVerify(e) {
        e.preventDefault();
        const code = Array.from(inputs).map(i => i.value).join("");
        if (code.length < 6) {
            alert("Please enter the complete 6-digit code.");
            return;
        }

        const btn = document.getElementById("verifyBtn");
        btn.textContent = "Verifying...";
        btn.disabled = true;

        setTimeout(() => {
            alert("Verification successful!");
            window.location.href = "home.html";
        }, 800);
    }

    function resendCode() {
        startTimer();
        alert("A new verification code has been dispatched.");
    }

    startTimer();
