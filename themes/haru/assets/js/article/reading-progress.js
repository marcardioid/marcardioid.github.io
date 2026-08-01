(function () {
	var progressBar = document.getElementById('reading-progress');
	var progressFill = document.getElementById('reading-progress-fill');
	var root = document.documentElement;
	var completedOnce = false;
	var completeTimer = 0;

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

	function clearCompleteState() {
		if (completeTimer) {
			window.clearTimeout(completeTimer);
			completeTimer = 0;
		}
		progressFill.classList.remove('is-complete');
	}

	function celebrateCompletion() {
		if (completedOnce) {
			return;
		}

		completedOnce = true;
		progressFill.classList.remove('is-complete');
		progressFill.offsetWidth;
		progressFill.classList.add('is-complete');

		completeTimer = window.setTimeout(function () {
			progressFill.classList.remove('is-complete');
			completeTimer = 0;
		}, 700);
	}

	function updateProgress() {
		ticking = false;

		var maxScroll = getMaxScroll();
		if (maxScroll <= 0) {
			progressFill.style.transform = 'scaleX(0)';
			clearCompleteState();
			progressBar.classList.remove('is-visible');
			return;
		}

		var progress = window.scrollY / maxScroll;
		var clampedProgress = Math.min(Math.max(progress, 0), 1);

		progressFill.style.transform = 'scaleX(' + clampedProgress + ')';
		progressBar.classList.toggle('is-visible', clampedProgress > 0);

		if (clampedProgress >= 1) {
			celebrateCompletion();
		}
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
	window.addEventListener('reading-progress:refresh', queueUpdate);

	queueUpdate();
})();
