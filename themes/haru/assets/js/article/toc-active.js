(function () {
	var toc = document.querySelector('.article-sidebar--toc .toc');
	var header = document.querySelector('.site-header');
	var tocLinks;
	var sections = [];
	var ticking = false;
	var raf = window.requestAnimationFrame || function (callback) {
		return window.setTimeout(callback, 16);
	};

	if (!toc) {
		return;
	}

	tocLinks = toc.querySelectorAll('a[href^="#"]');
	if (!tocLinks.length) {
		return;
	}

	for (var i = 0; i < tocLinks.length; i += 1) {
		var href = tocLinks[i].getAttribute('href');
		if (!href || href === '#') {
			continue;
		}

		var section = document.getElementById(href.slice(1));
		if (!section) {
			continue;
		}

		sections.push({ link: tocLinks[i], section: section });
	}

	if (!sections.length) {
		return;
	}

	function getOffset() {
		return (header ? header.offsetHeight : 0) + 28;
	}

	function setActiveLink(activeLink) {
		for (var i = 0; i < sections.length; i += 1) {
			sections[i].link.classList.toggle('is-active', sections[i].link === activeLink);
		}
	}

	function updateActiveLink() {
		ticking = false;

		var active = sections[0].link;
		var offset = getOffset();

		for (var i = 0; i < sections.length; i += 1) {
			if (sections[i].section.getBoundingClientRect().top - offset <= 0) {
				active = sections[i].link;
				continue;
			}

			break;
		}

		setActiveLink(active);
	}

	function queueUpdate() {
		if (ticking) {
			return;
		}

		ticking = true;
		raf(updateActiveLink);
	}

	window.addEventListener('scroll', queueUpdate, { passive: true });
	window.addEventListener('resize', queueUpdate);
	window.addEventListener('load', queueUpdate);
	window.addEventListener('pageshow', queueUpdate);

	queueUpdate();
})();
