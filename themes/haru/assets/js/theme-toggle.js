(function () {
	var storageKey = 'site-theme';
	var root = document.documentElement;
	var fallbackThemeColors = { light: '#fafafa', dark: '#1C1C1C' };

	function isThemeValue(value) {
		return value === 'light' || value === 'dark';
	}

	function getStoredTheme() {
		try {
			return window.localStorage.getItem(storageKey);
		} catch (error) {
			return null;
		}
	}

	function getPreferredThemeFromSystem() {
		// if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		// 	return 'dark';
		// }
		return 'light';
	}

	function resolveThemeFromStorageOrSystem() {
		var storedTheme = getStoredTheme();
		if (isThemeValue(storedTheme)) {
			return storedTheme;
		}
		return getPreferredThemeFromSystem();
	}

	function getActiveTheme() {
		var currentTheme = root.getAttribute('data-theme');
		if (isThemeValue(currentTheme)) {
			return currentTheme;
		}
		return resolveThemeFromStorageOrSystem();
	}

	// Keep first paint behavior aligned with previous inline script.
	var storedTheme = getStoredTheme();
	var hasStoredTheme = isThemeValue(storedTheme);
	var preferredTheme = 'light';
	root.setAttribute('data-theme', hasStoredTheme ? storedTheme : preferredTheme);

	function updateToggle(toggle, theme) {
		if (!toggle) {
			return;
		}

		var isDark = theme === 'dark';
		var darkLabel = toggle.getAttribute('data-label-dark') || 'Switch to dark mode';
		var lightLabel = toggle.getAttribute('data-label-light') || 'Switch to light mode';
		var nextLabel = isDark ? lightLabel : darkLabel;

		toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
		toggle.setAttribute('aria-label', nextLabel);
		toggle.setAttribute('title', nextLabel);
	}

	function updateThemeColor(metaThemeColor, theme) {
		if (!metaThemeColor) {
			return;
		}

		var themeColor = '';
		if (window.getComputedStyle) {
			themeColor = window.getComputedStyle(root).getPropertyValue('--theme-color').trim();
		}

		metaThemeColor.setAttribute('content', themeColor || fallbackThemeColors[theme] || fallbackThemeColors.light);
	}

	function setTheme(toggle, metaThemeColor, theme, persistTheme) {
		root.setAttribute('data-theme', theme);
		updateToggle(toggle, theme);
		updateThemeColor(metaThemeColor, theme);

		if (!persistTheme) {
			return;
		}

		try {
			window.localStorage.setItem(storageKey, theme);
		} catch (error) {
			// Ignore write errors (private mode or disabled storage).
		}
	}

	function setupThemeToggle() {
		var toggle = document.getElementById('theme-toggle');
		var metaThemeColor = document.getElementById('meta-theme-color');

		function syncThemeFromState() {
			setTheme(toggle, metaThemeColor, resolveThemeFromStorageOrSystem(), false);
		}

		if (toggle) {
			toggle.addEventListener('click', function () {
				var currentTheme = getActiveTheme();
				setTheme(toggle, metaThemeColor, currentTheme === 'dark' ? 'light' : 'dark', true);
			});
		}

		// Re-sync theme when navigating with browser history (including bfcache restores).
		window.addEventListener('pageshow', function () {
			syncThemeFromState();
		});

		window.addEventListener('storage', function (event) {
			if (event.key !== storageKey) {
				return;
			}

			if (isThemeValue(event.newValue)) {
				setTheme(toggle, metaThemeColor, event.newValue, false);
				return;
			}

			syncThemeFromState();
		});

		// if (window.matchMedia) {
		// 	var mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
		// 	var onSystemThemeChange = function (event) {
		// 		if (isThemeValue(getStoredTheme())) {
		// 			return;
		// 		}

		// 		setTheme(toggle, metaThemeColor, event.matches ? 'dark' : 'light', false);
		// 	};

		// 	if (mediaQueryList.addEventListener) {
		// 		mediaQueryList.addEventListener('change', onSystemThemeChange);
		// 	} else if (mediaQueryList.addListener) {
		// 		mediaQueryList.addListener(onSystemThemeChange);
		// 	}
		// }

		syncThemeFromState();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupThemeToggle);
	} else {
		setupThemeToggle();
	}
})();
