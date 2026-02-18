(function () {
	var progressBar = document.getElementById('reading-progress');
	var progressFill = document.getElementById('reading-progress-fill');
	var root = document.documentElement;

	if (!progressBar || !progressFill || !root) {
		return;
	}

	var ticking = false;
	var raf = window.requestAnimationFrame || function (callback) {
		return window.setTimeout(callback, 16);
	};

	function getMaxScroll() {
		return root.scrollHeight - window.innerHeight;
	}

	function updateProgress() {
		ticking = false;

		var maxScroll = getMaxScroll();
		if (maxScroll <= 0) {
			progressFill.style.transform = 'scaleX(0)';
			progressBar.classList.remove('is-visible');
			return;
		}

		var progress = window.scrollY / maxScroll;
		var clampedProgress = Math.min(Math.max(progress, 0), 1);

		progressFill.style.transform = 'scaleX(' + clampedProgress + ')';
		progressBar.classList.toggle('is-visible', clampedProgress > 0);
	}

	function queueUpdate() {
		if (ticking) {
			return;
		}

		ticking = true;
		raf(updateProgress);
	}

	window.addEventListener('scroll', queueUpdate, { passive: true });
	window.addEventListener('resize', queueUpdate);
	window.addEventListener('load', queueUpdate);

	queueUpdate();
})();
