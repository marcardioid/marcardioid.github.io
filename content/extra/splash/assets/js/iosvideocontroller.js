var vid = document.getElementById("bgvid"),
    pauseButton = document.getElementById("bgvid-button-toggle"),
    motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncButton() {
    pauseButton.hidden = false;
    pauseButton.textContent = vid.paused ? "Play" : "Pause";
    pauseButton.setAttribute("aria-pressed", String(!vid.paused));
}

function hideButton() {
    pauseButton.hidden = true;
}

function applyMotionPreference() {
    if (motionQuery.matches) {
        vid.pause();
        hideButton();
        return;
    }

    vid.play().then(syncButton).catch(function() {
        syncButton();
    });
}

if (vid && pauseButton) {
    vid.muted = true;

    vid.addEventListener("play", syncButton);
    vid.addEventListener("pause", syncButton);

    pauseButton.addEventListener("click", function() {
        if (vid.paused) {
            vid.play().then(syncButton).catch(function() {
                syncButton();
            });
            return;
        }

        vid.pause();
    });

    if (typeof motionQuery.addEventListener === "function") {
        motionQuery.addEventListener("change", applyMotionPreference);
    } else if (typeof motionQuery.addListener === "function") {
        motionQuery.addListener(applyMotionPreference);
    }

    applyMotionPreference();
}
