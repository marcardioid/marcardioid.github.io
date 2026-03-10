(function () {
	var sidebar = document.querySelector('.article-sidebar--toc');
	var articleLayout = sidebar ? sidebar.closest('.article-layout') : null;
	var desktopMedia = window.matchMedia('(min-width: 1380px)');
	var ticking = false;
	var raf = window.requestAnimationFrame || function (callback) {
		return window.setTimeout(callback, 16);
	};

	if (!sidebar || !articleLayout) {
		return;
	}

	function getStickyTop() {
		var top = window.getComputedStyle(sidebar).top;
		var parsedTop = parseFloat(top);

		if (Number.isNaN(parsedTop)) {
			return null;
		}

		return parsedTop;
	}

	function shouldApplyStickyState() {
		var stickyTop = getStickyTop();
		var sidebarRect;
		var layoutRect;

		if (!desktopMedia.matches || stickyTop === null) {
			return false;
		}

		sidebarRect = sidebar.getBoundingClientRect();
		layoutRect = articleLayout.getBoundingClientRect();

		return sidebarRect.top <= stickyTop + 1 && layoutRect.bottom > stickyTop + sidebarRect.height;
	}

	function updateStickyState() {
		ticking = false;
		sidebar.classList.toggle('is-sticky', shouldApplyStickyState());
	}

	function queueUpdate() {
		if (ticking) {
			return;
		}

		ticking = true;
		raf(updateStickyState);
	}

	window.addEventListener('scroll', queueUpdate, { passive: true });
	window.addEventListener('resize', queueUpdate);
	window.addEventListener('load', queueUpdate);
	window.addEventListener('pageshow', queueUpdate);
	window.addEventListener('reading-progress:refresh', queueUpdate);

	if (desktopMedia.addEventListener) {
		desktopMedia.addEventListener('change', queueUpdate);
	} else if (desktopMedia.addListener) {
		desktopMedia.addListener(queueUpdate);
	}

	queueUpdate();
})();
