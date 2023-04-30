var iOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false),
    vid = document.getElementById("bgvid"),
    pauseButton = document.getElementById("bgvid-button-toggle");

if (!iOS) {
    pauseButton.parentNode.removeChild(pauseButton);
}

pauseButton.addEventListener("click", function() {
    if (vid.paused) {
        vid.play();
        pauseButton.innerHTML = "Pause";
    } else {
        vid.pause();
        pauseButton.innerHTML = "Play";
    }
})