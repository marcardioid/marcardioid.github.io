(function () {
	var storageKey = 'site-theme';
	var root = document.documentElement;
	var metaThemeColor = document.getElementById('meta-theme-color');
	var systemThemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
	var fallbackThemeColors = { light: '#f6f5f1', dark: '#0f1419' };

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
		if (systemThemeQuery && systemThemeQuery.matches) {
			return 'dark';
		}

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

	var storedTheme = getStoredTheme();
	var hasStoredTheme = isThemeValue(storedTheme);
	var preferredTheme = hasStoredTheme ? storedTheme : getPreferredThemeFromSystem();
	root.setAttribute('data-theme', hasStoredTheme ? storedTheme : preferredTheme);
	updateThemeColor(metaThemeColor, preferredTheme);

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

	function setTheme(toggle, theme, persistTheme) {
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

		function syncThemeFromState() {
			setTheme(toggle, resolveThemeFromStorageOrSystem(), false);
		}

		if (toggle) {
			toggle.addEventListener('click', function () {
				var currentTheme = getActiveTheme();
				setTheme(toggle, currentTheme === 'dark' ? 'light' : 'dark', true);
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
				setTheme(toggle, event.newValue, false);
				return;
			}

			syncThemeFromState();
		});

		if (systemThemeQuery) {
			var onSystemThemeChange = function (event) {
				if (isThemeValue(getStoredTheme())) {
					return;
				}

				setTheme(toggle, event.matches ? 'dark' : 'light', false);
			};

			if (systemThemeQuery.addEventListener) {
				systemThemeQuery.addEventListener('change', onSystemThemeChange);
			} else if (systemThemeQuery.addListener) {
				systemThemeQuery.addListener(onSystemThemeChange);
			}
		}

		syncThemeFromState();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupThemeToggle);
	} else {
		setupThemeToggle();
	}
})();
