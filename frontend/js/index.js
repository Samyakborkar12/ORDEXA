/**
 * ORDEXA - Landing Gateway Interaction
 * frontend/js/index.js
 */

document.addEventListener("DOMContentLoaded", () => {
    // Log ready status
    console.log("ORDEXA Portal Initialized");

    // Smooth card click navigation for accessibility
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        card.addEventListener("click", (e) => {
            // If user clicked inside the card but not on the direct anchor, trigger the primary button
            if (e.target.tagName !== "A" && !e.target.closest("a")) {
                const btn = card.querySelector(".card-button");
                if (btn && btn.href) {
                    window.location.href = btn.href;
                }
            }
        });
    });
});

