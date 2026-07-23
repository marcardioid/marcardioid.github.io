(function () {
	'use strict';

	var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
	var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
	var MOBILE_MAX_WIDTH = 767;
	var MAX_PETALS = 64;
	var DAYBREAK_SECRET_NAME = 'daybreak';
	var GROVE_HINT_STORAGE_KEY = 'haru-grove-hint-seen-v1';
	var CANOPY_BASE_HIT_TOP_RATIO = 0.65;
	var CANOPY_BLOOM_EMIT_START = 0.01;
	var CANOPY_BLOOM_EMIT_STEP = 0.065;
	var DESKTOP_MAX_WIDTH_RATIO = 1.05;
	var DESKTOP_MAX_HEIGHT_RATIO = 0.68;
	var DESKTOP_ART_CENTER_RATIO = 0.50;
	var DESKTOP_TOP_SAFE_RATIO = 0.14;
	var DESKTOP_BOTTOM_INSET_RATIO = 0.05;
	var MOBILE_MAX_WIDTH_RATIO = 0.86;
	var MOBILE_MAX_HEIGHT_RATIO = 0.84;
	var MOBILE_TOP_SAFE_RATIO = 0.07;
	var MOBILE_BOTTOM_INSET_RATIO = 0;
	var PETAL_SIZE_REFERENCE = 360;
	var PETAL_SIZE_MIN_SCALE = 0.4;
	var GROVE_HINT_TOUCH_COPY = 'try tapping the blossoms';
	var GROVE_HINT_POINTER_COPY = 'try clicking the blossoms';
	var SHAKE_DURATION_MS = 520;
	var SHAKE_LAYER_CONFIG = {
		Bark_Highlights: { amplitudeX: 0.2, amplitudeY: 1.55 },
		Bark_Midlights: { amplitudeX: 0.1, amplitudeY: 1.05 },
		Canopy_Base: { amplitudeX: 0.2, amplitudeY: 1.55 },
		Canopy_Base_2: { amplitudeX: 2.2, amplitudeY: 1.65 },
		Canopy_Base_3: { amplitudeX: 3.8, amplitudeY: 2.85 },
		Canopy_Lowlights: { amplitudeX: 2.0, amplitudeY: 1.05 },
		Canopy_Midlights: { amplitudeX: 3.4, amplitudeY: 1.7 },
		Canopy_Highlights: { amplitudeX: 5.2, amplitudeY: 3.45 }
	};
	var CANOPY_HIT_LAYERS = [
		'Canopy_Base_2',
		'Canopy_Base_3',
		'Canopy_Lowlights',
		'Canopy_Midlights',
		'Canopy_Highlights'
	];
	var HOVER_PETAL_INTERVAL_MS = 340;
	// Amplitudes stay under ~1.5px so the idle sway reads as breathing, not wind.
	var IDLE_SWAY_SPEED_X = 0.00052;
	var IDLE_SWAY_SPEED_Y = 0.00037;
	var IDLE_SWAY_LAYER_CONFIG = {
		Canopy_Base_2: { amplitudeX: 0.5, amplitudeY: 0.3, phase: 1.7 },
		Canopy_Base_3: { amplitudeX: 0.8, amplitudeY: 0.5, phase: 3.9 },
		Canopy_Lowlights: { amplitudeX: 0.45, amplitudeY: 0.28, phase: 0.6 },
		Canopy_Midlights: { amplitudeX: 1.05, amplitudeY: 0.65, phase: 2.8 },
		Canopy_Highlights: { amplitudeX: 1.5, amplitudeY: 0.95, phase: 5.1 }
	};
	var THEME_CONFIG = {
		light: {
			fillMap: null,
			petals: {
				colors: ['#f2c0d0', '#e6a5ba', '#f8d5df'],
				stroke: 'rgba(124, 83, 91, 0.2)'
			}
		},
		dark: {
			fillMap: {
				'#2F1013': '#261c1d',
				'#3F1317': '#342627',
				'#52161A': '#473334',
				'#551C19': '#533d3d',
				'#69311C': '#65514a',
				'#A44361': '#745064',
				'#ACB47B': '#65735f',
				'#B55267': '#5f4153',
				'#C3CB92': '#4c594c',
				'#EFBAC6': '#b8a8bb',
				'#F097AB': '#8f7287',
				'#FAF3F5': '#eef1f6',
				'#FDE4D2': '#d7ddea'
			},
			petals: {
				colors: ['#8f7389', '#b3a7ba', '#d9dfeb'],
				stroke: 'rgba(30, 24, 30, 0.34)'
			}
		}
	};
	var LAYER_DURATIONS = {
		Base: 220,
		Trunk: 260,
		Canopy_Lowlights: 220,
		Canopy_Base_2: 240,
		Bark: 220,
		Canopy_Midlights: 220,
		Bark_Lowlights: 190,
		Canopy_Base_3: 240,
		Bark_Midlights: 190,
		Canopy_Highlights: 220,
		Bark_Highlights: 190,
		Base_Highlights: 180,
		Canopy_Base: 320
	};
	var LAYER_STRATEGIES = {
		Base: 'wipe',
		Trunk: 'trunk',
		Canopy_Lowlights: 'wipe',
		Canopy_Base_2: 'wipe',
		Bark: 'wipe',
		Canopy_Midlights: 'wipe',
		Bark_Lowlights: 'wipe',
		Canopy_Base_3: 'wipe',
		Bark_Midlights: 'wipe',
		Canopy_Highlights: 'wipe',
		Bark_Highlights: 'wipe',
		Base_Highlights: 'wipe',
		Canopy_Base: 'wipe'
	};
	var FOREGROUND_RENDER_ORDER = [
		'Base',
		'Trunk',
		'Canopy_Lowlights',
		'Canopy_Base_2',
		'Bark',
		'Canopy_Midlights',
		'Bark_Lowlights',
		'Canopy_Base_3',
		'Bark_Midlights',
		'Canopy_Highlights',
		'Bark_Highlights',
		'Base_Highlights'
	];

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function easeOutCubic(value) {
		return 1 - Math.pow(1 - value, 3);
	}

	function easeOutQuart(value) {
		return 1 - Math.pow(1 - value, 4);
	}

	function createRng(seed) {
		var state = (seed >>> 0) || 1;

		return function () {
			state ^= state << 13;
			state >>>= 0;
			state ^= state >>> 17;
			state >>>= 0;
			state ^= state << 5;
			state >>>= 0;
			return (state >>> 0) / 4294967296;
		};
	}

	function randomBetween(rng, min, max) {
		return min + ((max - min) * rng());
	}

	function parseViewBox(viewBox) {
		var values;

		if (!viewBox) {
			return null;
		}

		values = viewBox.trim().split(/\s+|,/).map(Number);
		if (values.length !== 4 || !isFinite(values[2]) || !isFinite(values[3])) {
			return null;
		}

		return {
			minX: values[0],
			minY: values[1],
			width: values[2],
			height: values[3]
		};
	}

	function getActiveTheme() {
		var theme = document.documentElement ? document.documentElement.getAttribute('data-theme') : null;

		return theme === 'dark' ? 'dark' : 'light';
	}

	function applyThemeToSvg(group, theme) {
		var fillMap = THEME_CONFIG[theme].fillMap;
		var currentFill;
		var nextFill;

		if (!fillMap) {
			return;
		}

		currentFill = group.getAttribute('fill');
		nextFill = fillMap[currentFill ? currentFill.toUpperCase() : ''];
		if (nextFill) {
			group.setAttribute('fill', nextFill);
		}

		Array.prototype.forEach.call(group.querySelectorAll('[fill]'), function (element) {
			var currentFill = element.getAttribute('fill');
			var nextFill = fillMap[currentFill ? currentFill.toUpperCase() : ''];

			if (nextFill) {
				element.setAttribute('fill', nextFill);
			}
		});
	}

	function buildTimeline() {
		var steps = {};
		var totalDurationMs = 0;

		function addStep(id, startMs) {
			steps[id] = {
				id: id,
				durationMs: LAYER_DURATIONS[id],
				strategy: LAYER_STRATEGIES[id],
				startMs: startMs
			};
			totalDurationMs = Math.max(totalDurationMs, startMs + LAYER_DURATIONS[id]);
		}

		// Keep the authored draw choreography explicit so timing tweaks stay readable.
		addStep('Base', 0);
		addStep('Trunk', steps.Base.startMs + (steps.Base.durationMs * 0.5));
		addStep('Canopy_Lowlights', steps.Trunk.startMs + (steps.Trunk.durationMs * 0.5));
		addStep('Canopy_Base_2', steps.Canopy_Lowlights.startMs + (steps.Canopy_Lowlights.durationMs * 0.5));
		addStep('Bark', steps.Canopy_Base_2.startMs);
		addStep('Canopy_Base', steps.Canopy_Base_2.startMs + (steps.Canopy_Base_2.durationMs * 0.5));
		addStep(
			'Canopy_Midlights',
			Math.max(
				steps.Canopy_Base_2.startMs + steps.Canopy_Base_2.durationMs,
				steps.Bark.startMs + steps.Bark.durationMs
			)
		);
		addStep('Bark_Lowlights', steps.Canopy_Midlights.startMs);
		addStep(
			'Canopy_Base_3',
			Math.max(
				steps.Canopy_Midlights.startMs + steps.Canopy_Midlights.durationMs,
				steps.Bark_Lowlights.startMs + steps.Bark_Lowlights.durationMs
			)
		);
		addStep('Bark_Midlights', steps.Canopy_Base_3.startMs);
		addStep(
			'Canopy_Highlights',
			Math.max(
				steps.Canopy_Base_3.startMs + steps.Canopy_Base_3.durationMs,
				steps.Bark_Midlights.startMs + steps.Bark_Midlights.durationMs
			)
		);
		addStep('Bark_Highlights', steps.Canopy_Highlights.startMs);
		addStep('Base_Highlights', steps.Canopy_Highlights.startMs);

		return {
			steps: steps,
			totalDurationMs: totalDurationMs
		};
	}

	function loadRasterizedSvg(svgMarkup) {
		var blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });

		if (window.createImageBitmap) {
			return window.createImageBitmap(blob).catch(function () {
				return loadRasterizedSvgFallback(blob);
			});
		}

		return loadRasterizedSvgFallback(blob);
	}

	function loadRasterizedSvgFallback(blob) {
		return new Promise(function (resolve, reject) {
			var image = new Image();
			var objectUrl = URL.createObjectURL(blob);

			image.onload = function () {
				URL.revokeObjectURL(objectUrl);
				resolve(image);
			};

			image.onerror = function () {
				URL.revokeObjectURL(objectUrl);
				reject(new Error('Could not decode cherry-blossom layer.'));
			};

			image.src = objectUrl;
		});
	}

	function drawPetalShape(ctx) {
		ctx.beginPath();
		ctx.moveTo(0, -1);
		ctx.quadraticCurveTo(0.82, -0.28, 0.68, 0.78);
		ctx.quadraticCurveTo(0.09, 1.1, 0, 0.52);
		ctx.quadraticCurveTo(-0.09, 1.1, -0.68, 0.78);
		ctx.quadraticCurveTo(-0.82, -0.28, 0, -1);
		ctx.closePath();
	}

	function hasSeenInteractionHint() {
		try {
			return window.localStorage.getItem(GROVE_HINT_STORAGE_KEY) === 'true';
		} catch (error) {
			return false;
		}
	}

	function rememberInteractionHint() {
		try {
			window.localStorage.setItem(GROVE_HINT_STORAGE_KEY, 'true');
		} catch (error) {
			// Ignore write errors (private mode or disabled storage).
		}
	}

	function CherryBlossomGrove(canvas) {
		this.canvas = canvas;
		this.hint = document.getElementById('cherry-blossom-hint');
		this.ctx = canvas.getContext('2d');
		this.svgUrl = canvas.getAttribute('data-cherry-blossom-svg') || '';
		this.width = 1;
		this.height = 1;
		this.dpr = 1;
		this.hitCanvas = document.createElement('canvas');
		this.hitCtx = this.hitCanvas.getContext('2d', { willReadFrequently: true });
		this.canopyHitCanvas = document.createElement('canvas');
		this.canopyHitCtx = this.canopyHitCanvas.getContext('2d', { willReadFrequently: true });
		this.viewBox = null;
		this.artBounds = null;
		this.timeline = buildTimeline();
		this.layerMap = Object.create(null);
		this.layerMapsByTheme = {
			light: Object.create(null),
			dark: Object.create(null)
		};
		this.petals = [];
		this.rafId = 0;
		this.lastFrameTime = 0;
		this.introStartTime = 0;
		this.introActive = false;
		this.hasPlayedIntro = false;
		this.hasLoaded = false;
		this.loadPromise = null;
		this.destroyed = false;
		this.themeObserver = null;
		this.canopyBloomCursor = 0;
		this.hasInteracted = false;
		this.hasSeenHint = hasSeenInteractionHint();
		this.hintHideTimeoutId = 0;
		this.shakeStartTime = 0;
		this.isInteractiveCursorVisible = false;
		this.lastHoverPetalTime = 0;
		this.isPageVisible = !document.hidden;
		this.isInViewport = true;
		this.viewportObserver = null;
		this.reducedMotionMediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
		this.prefersReducedMotion = this.reducedMotionMediaQuery ? this.reducedMotionMediaQuery.matches : false;
		this.rng = createRng(Date.now() ^ ((this.canvas.offsetWidth || 1) << 5));

		this.onFrame = this.onFrame.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onPointerMove = this.onPointerMove.bind(this);
		this.onPointerLeave = this.onPointerLeave.bind(this);
		this.onResize = this.onResize.bind(this);
		this.onThemeOrPageShow = this.onThemeOrPageShow.bind(this);
		this.onReducedMotionChange = this.onReducedMotionChange.bind(this);
		this.onThemeMutation = this.onThemeMutation.bind(this);
		this.onVisibilityChange = this.onVisibilityChange.bind(this);
		this.onViewportChange = this.onViewportChange.bind(this);
	}

	function getInteractionHintCopy() {
		var hasCoarsePointer = window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
		var hasTouchPoints = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

		return (hasCoarsePointer || hasTouchPoints) ? GROVE_HINT_TOUCH_COPY : GROVE_HINT_POINTER_COPY;
	}

	CherryBlossomGrove.prototype.init = function () {
		if (!this.ctx || !this.svgUrl) {
			return;
		}

		this.updateHintCopy();
		this.hideHint(true);

		this.canvas.addEventListener('click', this.onClick);
		this.canvas.addEventListener('mousemove', this.onPointerMove);
		this.canvas.addEventListener('mouseleave', this.onPointerLeave);
		window.addEventListener('resize', this.onResize, { passive: true });
		window.addEventListener('pageshow', this.onThemeOrPageShow);
		document.addEventListener('visibilitychange', this.onVisibilityChange);

		if (window.IntersectionObserver) {
			this.viewportObserver = new IntersectionObserver(this.onViewportChange);
			this.viewportObserver.observe(this.canvas);
		}

		if (this.reducedMotionMediaQuery) {
			this.reducedMotionMediaQuery.addEventListener('change', this.onReducedMotionChange);
		}

		if (window.MutationObserver && document.documentElement) {
			this.themeObserver = new MutationObserver(this.onThemeMutation);
			this.themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ['data-theme', 'data-delight-secret']
			});
		}

		this.resize();
		this.loadAssets();
	};

	CherryBlossomGrove.prototype.destroy = function () {
		this.destroyed = true;
		this.canvas.removeEventListener('click', this.onClick);
		this.canvas.removeEventListener('mousemove', this.onPointerMove);
		this.canvas.removeEventListener('mouseleave', this.onPointerLeave);
		window.removeEventListener('resize', this.onResize);
		window.removeEventListener('pageshow', this.onThemeOrPageShow);
		document.removeEventListener('visibilitychange', this.onVisibilityChange);

		if (this.viewportObserver) {
			this.viewportObserver.disconnect();
			this.viewportObserver = null;
		}

		if (this.reducedMotionMediaQuery) {
			this.reducedMotionMediaQuery.removeEventListener('change', this.onReducedMotionChange);
		}

		if (this.themeObserver) {
			this.themeObserver.disconnect();
			this.themeObserver = null;
		}

		if (this.rafId) {
			window.cancelAnimationFrame(this.rafId);
			this.rafId = 0;
		}

		if (this.hintHideTimeoutId) {
			window.clearTimeout(this.hintHideTimeoutId);
			this.hintHideTimeoutId = 0;
		}

		this.setInteractiveCursor(false);
	};

	CherryBlossomGrove.prototype.updateHintCopy = function () {
		if (!this.hint) {
			return;
		}

		this.hint.textContent = getInteractionHintCopy();
	};

	CherryBlossomGrove.prototype.showHint = function () {
		var self = this;

		if (!this.hint || this.hasInteracted || this.hasSeenHint) {
			return;
		}

		if (this.hintHideTimeoutId) {
			window.clearTimeout(this.hintHideTimeoutId);
			this.hintHideTimeoutId = 0;
		}

		this.hasSeenHint = true;
		rememberInteractionHint();
		this.hint.hidden = false;
		window.requestAnimationFrame(function () {
			if (!self.hint || self.hasInteracted) {
				return;
			}

			self.hint.classList.add('is-visible');
		});
	};

	CherryBlossomGrove.prototype.hideHint = function (immediate) {
		var self = this;

		if (!this.hint) {
			return;
		}

		if (this.hintHideTimeoutId) {
			window.clearTimeout(this.hintHideTimeoutId);
			this.hintHideTimeoutId = 0;
		}

		this.hint.classList.remove('is-visible');

		if (immediate) {
			this.hint.hidden = true;
			return;
		}

		this.hintHideTimeoutId = window.setTimeout(function () {
			if (!self.hint || self.hint.classList.contains('is-visible')) {
				return;
			}

			self.hint.hidden = true;
			self.hintHideTimeoutId = 0;
		}, 220);
	};

	CherryBlossomGrove.prototype.updateHintVisibility = function () {
		if (!this.hint) {
			return;
		}

		if (!this.hasLoaded || this.hasInteracted || this.introActive) {
			this.hideHint(true);
			return;
		}

		if (this.prefersReducedMotion || this.hasPlayedIntro) {
			this.showHint();
		}
	};

	CherryBlossomGrove.prototype.onResize = function () {
		this.resize();
	};

	CherryBlossomGrove.prototype.onThemeOrPageShow = function () {
		if (this.hasLoaded) {
			this.renderAt(this.getRenderElapsed());
			this.updateHintVisibility();
		}
	};

	CherryBlossomGrove.prototype.onThemeMutation = function (mutations) {
		var index;
		var mutation;
		var themeChanged = false;
		var shouldTriggerDaybreakShake = false;

		for (index = 0; index < mutations.length; index += 1) {
			mutation = mutations[index];

			if (mutation.attributeName === 'data-theme') {
				themeChanged = true;
			}

			if (
				mutation.attributeName === 'data-delight-secret' &&
				document.documentElement &&
				document.documentElement.getAttribute('data-delight-secret') === DAYBREAK_SECRET_NAME
			) {
				shouldTriggerDaybreakShake = true;
			}
		}

		if (themeChanged) {
			this.applyTheme();
			this.onThemeOrPageShow();
		}

		if (shouldTriggerDaybreakShake) {
			this.triggerDaybreakShake();
		}
	};

	CherryBlossomGrove.prototype.onReducedMotionChange = function (event) {
		this.prefersReducedMotion = event.matches;

		if (this.prefersReducedMotion) {
			this.introActive = false;
			this.petals = [];
			this.stopAnimationLoop();
			this.renderAt(this.timeline.totalDurationMs);
			this.updateHintVisibility();
			return;
		}

		this.renderAt(this.getRenderElapsed());
		this.updateHintVisibility();

		if (this.shouldIdleSway()) {
			this.lastFrameTime = 0;
			this.ensureAnimationLoop();
		}
	};

	CherryBlossomGrove.prototype.onVisibilityChange = function () {
		this.isPageVisible = !document.hidden;

		if (this.shouldIdleSway()) {
			this.lastFrameTime = 0;
			this.ensureAnimationLoop();
		}
	};

	CherryBlossomGrove.prototype.onViewportChange = function (entries) {
		var entry = entries[entries.length - 1];

		this.isInViewport = !!(entry && entry.isIntersecting);

		if (this.shouldIdleSway()) {
			this.lastFrameTime = 0;
			this.ensureAnimationLoop();
		}
	};

	CherryBlossomGrove.prototype.shouldIdleSway = function () {
		return (
			this.hasLoaded &&
			!this.destroyed &&
			!this.introActive &&
			!this.prefersReducedMotion &&
			this.isPageVisible &&
			this.isInViewport
		);
	};

	CherryBlossomGrove.prototype.getLayerIdleOffset = function (layerId) {
		var config = IDLE_SWAY_LAYER_CONFIG[layerId];
		var now;

		if (!config || !this.shouldIdleSway()) {
			return null;
		}

		now = window.performance && window.performance.now ? window.performance.now() : Date.now();
		return {
			x: Math.sin((now * IDLE_SWAY_SPEED_X) + config.phase) * config.amplitudeX,
			y: Math.sin((now * IDLE_SWAY_SPEED_Y) + (config.phase * 1.6)) * config.amplitudeY
		};
	};

	CherryBlossomGrove.prototype.onClick = function (event) {
		var rect;
		var clickX;
		var clickY;

		if (!this.hasLoaded || this.prefersReducedMotion) {
			return;
		}

		rect = this.canvas.getBoundingClientRect();
		clickX = event.clientX - rect.left;
		clickY = event.clientY - rect.top;

		if (!this.isCanopyHit(clickX, clickY)) {
			return;
		}

		this.hasInteracted = true;
		this.hasSeenHint = true;
		rememberInteractionHint();
		this.hideHint();
		this.startCanopyShake();
		this.spawnPetals(clickX, clickY);
	};

	CherryBlossomGrove.prototype.onPointerMove = function (event) {
		var rect;
		var pointerX;
		var pointerY;
		var isCanopyHit;
		var now;

		if (!this.hasLoaded) {
			this.setInteractiveCursor(false);
			return;
		}

		rect = this.canvas.getBoundingClientRect();
		pointerX = event.clientX - rect.left;
		pointerY = event.clientY - rect.top;
		isCanopyHit = this.isCanopyHit(pointerX, pointerY);
		this.setInteractiveCursor(isCanopyHit);

		if (isCanopyHit && !this.prefersReducedMotion && !this.introActive) {
			now = window.performance && window.performance.now ? window.performance.now() : Date.now();

			if (now - this.lastHoverPetalTime >= HOVER_PETAL_INTERVAL_MS) {
				this.lastHoverPetalTime = now;
				this.spawnHoverPetals(pointerX, pointerY);
			}
		}
	};

	CherryBlossomGrove.prototype.onPointerLeave = function () {
		this.setInteractiveCursor(false);
	};

	CherryBlossomGrove.prototype.setInteractiveCursor = function (isInteractive) {
		var nextCursor = isInteractive ? 'pointer' : '';

		if (this.isInteractiveCursorVisible === isInteractive) {
			return;
		}

		this.canvas.style.cursor = nextCursor;
		this.isInteractiveCursorVisible = isInteractive;
	};

	CherryBlossomGrove.prototype.resize = function () {
		var sizingElement = this.canvas.parentElement || this.canvas;
		var rect = sizingElement.getBoundingClientRect();
		var nextWidth = Math.max(1, Math.round(rect.width));
		var nextHeight = Math.max(1, Math.round(rect.height));
		var nextDpr = clamp(window.devicePixelRatio || 1, 1, 2);

		this.width = nextWidth;
		this.height = nextHeight;
		this.dpr = nextDpr;
		this.canvas.width = Math.round(nextWidth * nextDpr);
		this.canvas.height = Math.round(nextHeight * nextDpr);
		this.hitCanvas.width = this.canvas.width;
		this.hitCanvas.height = this.canvas.height;
		this.canopyHitCanvas.width = this.canvas.width;
		this.canopyHitCanvas.height = this.canvas.height;

		if (this.viewBox) {
			this.artBounds = this.calculateArtBounds();
			this.rebuildHitMaps();
		}

		if (this.hasLoaded) {
			this.renderAt(this.getRenderElapsed());
		}
	};

	CherryBlossomGrove.prototype.calculateArtBounds = function () {
		var maxWidthRatio;
		var maxHeightRatio;
		var topSafeInset;
		var bottomInset;
		var scale;
		var drawWidth;
		var drawHeight;
		var x;
		var y;

		if (this.width <= MOBILE_MAX_WIDTH) {
			maxWidthRatio = MOBILE_MAX_WIDTH_RATIO;
			maxHeightRatio = MOBILE_MAX_HEIGHT_RATIO;
			topSafeInset = this.height * MOBILE_TOP_SAFE_RATIO;
			bottomInset = this.height * MOBILE_BOTTOM_INSET_RATIO;
		} else {
			maxWidthRatio = DESKTOP_MAX_WIDTH_RATIO;
			maxHeightRatio = DESKTOP_MAX_HEIGHT_RATIO;
			topSafeInset = this.height * DESKTOP_TOP_SAFE_RATIO;
			bottomInset = this.height * DESKTOP_BOTTOM_INSET_RATIO;
		}

		// Keep the tree centered in its canvas while reserving some air above it.
		scale = Math.min(
			(this.width * maxWidthRatio) / this.viewBox.width,
			(this.height * maxHeightRatio) / this.viewBox.height
		);
		drawWidth = this.viewBox.width * scale;
		drawHeight = this.viewBox.height * scale;
		x = this.width <= MOBILE_MAX_WIDTH
			? (this.width - drawWidth) * 0.5
			: (this.width * DESKTOP_ART_CENTER_RATIO) - (drawWidth * 0.5);
		y = Math.max(topSafeInset, this.height - drawHeight - bottomInset);

		return {
			x: x,
			y: y,
			width: drawWidth,
			height: drawHeight
		};
	};

	CherryBlossomGrove.prototype.getPetalSizeScale = function () {
		var referenceSize;

		if (!this.artBounds) {
			return 1;
		}

		referenceSize = Math.min(this.artBounds.width, this.artBounds.height);
		return clamp(referenceSize / PETAL_SIZE_REFERENCE, PETAL_SIZE_MIN_SCALE, 1);
	};

	CherryBlossomGrove.prototype.loadAssets = function () {
		var self = this;

		if (this.loadPromise) {
			return this.loadPromise;
		}

		this.loadPromise = window.fetch(this.svgUrl, { credentials: 'same-origin' })
			.then(function (response) {
				if (!response.ok) {
					throw new Error('Could not load cherry-blossom illustration.');
				}

				return response.text();
			})
			.then(function (text) {
				return Promise.all([
					self.parseSvgLayers(text, 'light'),
					self.parseSvgLayers(text, 'dark')
				]);
			})
			.then(function (results) {
				var lightResult = results[0];
				var darkResult = results[1];

				self.viewBox = lightResult.viewBox;
				self.layerMapsByTheme.light = lightResult.layerMap;
				self.layerMapsByTheme.dark = darkResult.layerMap;
				self.applyTheme();
				self.hasLoaded = true;
				self.artBounds = self.calculateArtBounds();
				self.rebuildHitMaps();

				if (self.prefersReducedMotion) {
					self.hasPlayedIntro = true;
					self.renderAt(self.timeline.totalDurationMs);
					self.updateHintVisibility();
					return;
				}

				self.startIntro();
			})
			.catch(function (error) {
				console.error(error);
			});

		return this.loadPromise;
	};

	CherryBlossomGrove.prototype.parseSvgLayers = function (svgText, theme) {
		var parser = new DOMParser();
		var documentSvg = parser.parseFromString(svgText, 'image/svg+xml');
		var root = documentSvg.documentElement;
		var parserError = documentSvg.querySelector('parsererror');
		var viewBox = parseViewBox(root.getAttribute('viewBox'));
		var serializer = new XMLSerializer();
		var groups = {};

		if (parserError || !root || !viewBox) {
			return Promise.reject(new Error('Invalid cherry-blossom.svg document.'));
		}

		// SVGO may collapse simple top-level groups into direct paths while preserving IDs.
		Array.prototype.forEach.call(root.children, function (element) {
			var id = element.getAttribute('id');

			if (id) {
				groups[id] = element;
			}
		});

		return Promise.all(Object.keys(this.timeline.steps).map(function (stepId) {
			var step = this.timeline.steps[stepId];
			var group = groups[step.id];
			var svgMarkup;

			if (!group) {
				return Promise.reject(new Error('Missing cherry-blossom layer: ' + step.id));
			}

			group = group.cloneNode(true);
			applyThemeToSvg(group, theme);

			svgMarkup = [
				'<svg xmlns="', SVG_NAMESPACE, '" xmlns:xlink="', XLINK_NAMESPACE,
				'" viewBox="', root.getAttribute('viewBox'), '">',
				serializer.serializeToString(group),
				'</svg>'
			].join('');

			return loadRasterizedSvg(svgMarkup).then(function (image) {
				return {
					id: step.id,
					image: image,
					strategy: step.strategy,
					startMs: step.startMs,
					durationMs: step.durationMs
				};
			});
		}, this)).then(function (layers) {
			var layerMap = Object.create(null);

			layers.forEach(function (layer) {
				layerMap[layer.id] = layer;
			});

			return {
				viewBox: viewBox,
				layerMap: layerMap
			};
		});
	};

	CherryBlossomGrove.prototype.applyTheme = function () {
		var nextTheme = getActiveTheme();

		this.layerMap = this.layerMapsByTheme[nextTheme] || this.layerMapsByTheme.light || Object.create(null);

		if (this.viewBox) {
			this.rebuildHitMaps();
		}
	};

	CherryBlossomGrove.prototype.startIntro = function () {
		this.hasPlayedIntro = true;
		this.introActive = true;
		this.introStartTime = 0;
		this.lastFrameTime = 0;
		this.canopyBloomCursor = 0;
		this.ensureAnimationLoop();
	};

	CherryBlossomGrove.prototype.ensureAnimationLoop = function () {
		if (!this.rafId) {
			this.rafId = window.requestAnimationFrame(this.onFrame);
		}
	};

	CherryBlossomGrove.prototype.stopAnimationLoop = function () {
		if (this.rafId) {
			window.cancelAnimationFrame(this.rafId);
			this.rafId = 0;
		}
	};

	CherryBlossomGrove.prototype.getRenderElapsed = function () {
		if (this.introActive && this.introStartTime && window.performance && window.performance.now) {
			return clamp(window.performance.now() - this.introStartTime, 0, this.timeline.totalDurationMs);
		}

		if (this.prefersReducedMotion || (this.hasPlayedIntro && !this.introActive)) {
			return this.timeline.totalDurationMs;
		}

		return 0;
	};

	CherryBlossomGrove.prototype.onFrame = function (timestamp) {
		var elapsed = this.timeline.totalDurationMs;
		var deltaMs = this.lastFrameTime ? clamp(timestamp - this.lastFrameTime, 0, 48) : 16;
		var introJustCompleted = false;

		this.rafId = 0;

		if (this.introActive) {
			if (!this.introStartTime) {
				this.introStartTime = timestamp;
			}

			elapsed = clamp(timestamp - this.introStartTime, 0, this.timeline.totalDurationMs);

			if (elapsed >= this.timeline.totalDurationMs) {
				this.introActive = false;
				introJustCompleted = true;
			}
		}

		this.lastFrameTime = timestamp;
		this.emitCanopyBloomPetals(elapsed);
		this.updatePetals(deltaMs);
		this.renderAt(elapsed);

		if (introJustCompleted) {
			this.updateHintVisibility();
		}

		if ((this.introActive || this.petals.length || this.getLayerShakeOffset('Canopy_Highlights') || this.shouldIdleSway()) && !this.destroyed) {
			this.ensureAnimationLoop();
		}
	};

	CherryBlossomGrove.prototype.renderAt = function (elapsedMs) {
		var ctx = this.ctx;
		var bounds = this.artBounds;
		var backgroundLayer;

		if (!ctx) {
			return;
		}

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

		if (!this.hasLoaded || !bounds) {
			return;
		}

		backgroundLayer = this.layerMap.Canopy_Base;
		if (backgroundLayer) {
			this.drawLayer(backgroundLayer, elapsedMs, bounds);
		}

		FOREGROUND_RENDER_ORDER.forEach(function (layerId) {
			var layer = this.layerMap[layerId];

			if (!layer) {
				return;
			}

			this.drawLayer(layer, elapsedMs, bounds);
		}, this);

		this.drawPetals(ctx);
	};

	CherryBlossomGrove.prototype.getLayerProgress = function (layer, elapsedMs) {
		return clamp((elapsedMs - layer.startMs) / layer.durationMs, 0, 1);
	};

	CherryBlossomGrove.prototype.drawRasterLayers = function (ctx, layerIds, bounds) {
		layerIds.forEach(function (layerId) {
			var layer = this.layerMap[layerId];

			if (!layer) {
				return;
			}

			ctx.drawImage(layer.image, bounds.x, bounds.y, bounds.width, bounds.height);
		}, this);
	};

	CherryBlossomGrove.prototype.drawCanopyBaseHitArea = function (ctx, bounds) {
		var canopyBase = this.layerMap.Canopy_Base;

		if (!canopyBase) {
			return;
		}

		// Only the upper canopy mass should react to clicks; the lower flood fill stays passive.
		ctx.save();
		ctx.beginPath();
		ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height * CANOPY_BASE_HIT_TOP_RATIO);
		ctx.clip();
		ctx.drawImage(canopyBase.image, bounds.x, bounds.y, bounds.width, bounds.height);
		ctx.restore();
	};

	CherryBlossomGrove.prototype.rebuildHitMaps = function () {
		var bounds = this.artBounds;
		var fullCtx = this.hitCtx;
		var canopyCtx = this.canopyHitCtx;

		if (!fullCtx || !canopyCtx || !bounds) {
			return;
		}

		fullCtx.setTransform(1, 0, 0, 1, 0, 0);
		fullCtx.clearRect(0, 0, this.hitCanvas.width, this.hitCanvas.height);
		fullCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		fullCtx.globalAlpha = 1;

		canopyCtx.setTransform(1, 0, 0, 1, 0, 0);
		canopyCtx.clearRect(0, 0, this.canopyHitCanvas.width, this.canopyHitCanvas.height);
		canopyCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
		canopyCtx.globalAlpha = 1;

		if (this.layerMap.Canopy_Base) {
			fullCtx.drawImage(this.layerMap.Canopy_Base.image, bounds.x, bounds.y, bounds.width, bounds.height);
		}

		this.drawRasterLayers(fullCtx, FOREGROUND_RENDER_ORDER, bounds);
		this.drawRasterLayers(canopyCtx, CANOPY_HIT_LAYERS, bounds);
		this.drawCanopyBaseHitArea(canopyCtx, bounds);
	};

	CherryBlossomGrove.prototype.hasAlphaAt = function (ctx, canvas, x, y) {
		var pixelX;
		var pixelY;
		var data;

		if (!ctx || !canvas || !this.artBounds) {
			return false;
		}

		pixelX = Math.round(x * this.dpr);
		pixelY = Math.round(y * this.dpr);

		if (
			pixelX < 0 ||
			pixelY < 0 ||
			pixelX >= canvas.width ||
			pixelY >= canvas.height
		) {
			return false;
		}

		data = ctx.getImageData(pixelX, pixelY, 1, 1).data;
		return data[3] > 8;
	};

	CherryBlossomGrove.prototype.isCanopyHit = function (x, y) {
		return this.hasAlphaAt(this.canopyHitCtx, this.canopyHitCanvas, x, y);
	};

	CherryBlossomGrove.prototype.startCanopyShake = function () {
		if (this.prefersReducedMotion) {
			return;
		}

		this.shakeStartTime = window.performance && window.performance.now ? window.performance.now() : Date.now();
		this.ensureAnimationLoop();
	};

	CherryBlossomGrove.prototype.triggerDaybreakShake = function () {
		if (!this.hasLoaded) {
			return;
		}

		this.startCanopyShake();
	};

	CherryBlossomGrove.prototype.getLayerShakeOffset = function (layerId) {
		var config = SHAKE_LAYER_CONFIG[layerId];
		var now;
		var elapsed;
		var intensity;

		if (!config || !this.shakeStartTime) {
			return null;
		}

		now = window.performance && window.performance.now ? window.performance.now() : Date.now();
		elapsed = now - this.shakeStartTime;
		if (elapsed >= SHAKE_DURATION_MS) {
			return null;
		}

		intensity = 1 - (elapsed / SHAKE_DURATION_MS);
		return {
			x: Math.sin(elapsed * 0.065) * config.amplitudeX * intensity,
			y: Math.cos(elapsed * 0.04) * config.amplitudeY * intensity
		};
	};

	CherryBlossomGrove.prototype.getCanopyBloomGeometry = function (bounds, progress) {
		var eased = easeOutCubic(progress);
		var width = bounds.width * (0.14 + (eased * 0.86));
		var height = bounds.height * (0.12 + (eased * 0.88));
		var centerX = bounds.x + (bounds.width * 0.5);
		var centerY = bounds.y + (bounds.height * 0.5);

		return {
			eased: eased,
			width: width,
			height: height,
			centerX: centerX,
			centerY: centerY,
			topY: centerY - (height * 0.5)
		};
	};

	CherryBlossomGrove.prototype.addPetal = function (x, y, options) {
		var config = options || {};

		if (this.petals.length >= MAX_PETALS) {
			this.petals.shift();
		}

		this.petals.push({
			x: x,
			y: y,
			vx: config.vx,
			vy: config.vy,
			gravity: config.gravity,
			size: config.size,
			rotation: config.rotation,
			rotationVelocity: config.rotationVelocity,
			alpha: config.alpha,
			sway: config.sway,
			swayOffset: config.swayOffset,
			lifetimeMs: config.lifetimeMs,
			ageMs: 0,
			colorIndex: config.colorIndex || 0
		});
	};

	CherryBlossomGrove.prototype.getPetalPalette = function () {
		return (THEME_CONFIG[getActiveTheme()] || THEME_CONFIG.light).petals;
	};

	CherryBlossomGrove.prototype.emitCanopyBloomPetals = function (elapsedMs) {
		var layer = this.layerMap.Canopy_Base;
		var progress;
		var bloomStage;
		var targetCursor;
		var geometry;
		var index;
		var petalIndex;
		var petalSizeScale;
		var spread;
		var x;
		var y;
		var petalPalette;

		if (!this.introActive || !layer || !this.artBounds) {
			return;
		}

		progress = this.getLayerProgress(layer, elapsedMs);
		if (progress < CANOPY_BLOOM_EMIT_START) {
			return;
		}

		bloomStage = (progress - CANOPY_BLOOM_EMIT_START) / (1 - CANOPY_BLOOM_EMIT_START);
		targetCursor = Math.floor(bloomStage / CANOPY_BLOOM_EMIT_STEP);
		if (targetCursor <= this.canopyBloomCursor) {
			return;
		}

		geometry = this.getCanopyBloomGeometry(this.artBounds, progress);
		petalSizeScale = this.getPetalSizeScale();
		petalPalette = this.getPetalPalette();

		// Emit petals along the current bloom edge so the canopy base feels painted in.
		for (index = this.canopyBloomCursor; index < targetCursor; index += 1) {
			for (petalIndex = 0; petalIndex < 6; petalIndex += 1) {
				spread = (geometry.width * 0.44) * randomBetween(this.rng, -1, 1);
				x = geometry.centerX + spread;
				y = geometry.topY + randomBetween(this.rng, -10, 6);

				this.addPetal(x, y, {
					vx: randomBetween(this.rng, -0.35, 0.35),
					vy: randomBetween(this.rng, -1.1, -0.25),
					gravity: randomBetween(this.rng, 0.0026, 0.0043),
					size: randomBetween(this.rng, 5.2, 8.6) * petalSizeScale,
					rotation: randomBetween(this.rng, -Math.PI, Math.PI),
					rotationVelocity: randomBetween(this.rng, -0.0032, 0.0032),
					alpha: randomBetween(this.rng, 0.68, 0.92),
					sway: randomBetween(this.rng, 0.008, 0.018),
					swayOffset: randomBetween(this.rng, 0, Math.PI * 2),
					lifetimeMs: randomBetween(this.rng, 980, 1500),
					colorIndex: Math.floor(this.rng() * petalPalette.colors.length)
				});
			}
		}

		this.canopyBloomCursor = targetCursor;
	};

	CherryBlossomGrove.prototype.drawLayer = function (layer, elapsedMs, bounds) {
		var progress = this.getLayerProgress(layer, elapsedMs);
		var eased = layer.strategy === 'trunk' ? easeOutQuart(progress) : easeOutCubic(progress);
		var heightCap = bounds.height;
		var revealHeight;
		var shakeOffset;
		var idleOffset;
		var ctx = this.ctx;

		if (progress <= 0) {
			return;
		}

		ctx.save();
		shakeOffset = this.getLayerShakeOffset(layer.id);
		idleOffset = this.getLayerIdleOffset(layer.id);
		if (shakeOffset || idleOffset) {
			ctx.translate(
				(shakeOffset ? shakeOffset.x : 0) + (idleOffset ? idleOffset.x : 0),
				(shakeOffset ? shakeOffset.y : 0) + (idleOffset ? idleOffset.y : 0)
			);
		}
		ctx.beginPath();
		ctx.rect(bounds.x, bounds.y + bounds.height - heightCap, bounds.width, heightCap);
		ctx.clip();

		if (layer.strategy === 'trunk') {
			revealHeight = Math.min(bounds.height * eased, heightCap);
			ctx.beginPath();
			ctx.rect(bounds.x, bounds.y + bounds.height - revealHeight, bounds.width, revealHeight);
			ctx.clip();
			ctx.globalAlpha = 0.98;
		} else {
			revealHeight = Math.min(bounds.height * Math.min(1, eased * 1.08), heightCap);
			ctx.beginPath();
			ctx.rect(bounds.x, bounds.y + bounds.height - revealHeight, bounds.width, revealHeight);
			ctx.clip();
			ctx.globalAlpha = Math.min(1, 0.18 + (eased * 0.92));
			ctx.translate(0, (1 - eased) * 5);
		}

		ctx.drawImage(layer.image, bounds.x, bounds.y, bounds.width, bounds.height);
		ctx.restore();
	};

	CherryBlossomGrove.prototype.spawnPetals = function (x, y) {
		var count = 14 + Math.floor(this.rng() * 25);
		var index;
		var petalSizeScale = this.getPetalSizeScale();
		var petalPalette = this.getPetalPalette();

		for (index = 0; index < count; index += 1) {
			this.addPetal(x + randomBetween(this.rng, -14, 14), y + randomBetween(this.rng, -10, 10), {
				vx: randomBetween(this.rng, -0.45, 0.45),
				vy: randomBetween(this.rng, -1.3, -0.45),
				gravity: randomBetween(this.rng, 0.0028, 0.0046),
				size: randomBetween(this.rng, 5.8, 9.6) * petalSizeScale,
				rotation: randomBetween(this.rng, -Math.PI, Math.PI),
				rotationVelocity: randomBetween(this.rng, -0.0036, 0.0036),
				alpha: randomBetween(this.rng, 0.72, 0.94),
				sway: randomBetween(this.rng, 0.008, 0.018),
				swayOffset: randomBetween(this.rng, 0, Math.PI * 2),
				lifetimeMs: randomBetween(this.rng, 1050, 1700),
				colorIndex: Math.floor(this.rng() * petalPalette.colors.length)
			});
		}

		this.ensureAnimationLoop();
	};

	CherryBlossomGrove.prototype.spawnHoverPetals = function (x, y) {
		var count = 1 + Math.floor(this.rng() * 2);
		var index;
		var petalSizeScale = this.getPetalSizeScale();
		var petalPalette = this.getPetalPalette();

		// Gentler than the click burst: a petal or two drifting loose under the pointer.
		for (index = 0; index < count; index += 1) {
			this.addPetal(x + randomBetween(this.rng, -10, 10), y + randomBetween(this.rng, -8, 8), {
				vx: randomBetween(this.rng, -0.22, 0.22),
				vy: randomBetween(this.rng, -0.5, -0.12),
				gravity: randomBetween(this.rng, 0.002, 0.0034),
				size: randomBetween(this.rng, 4.4, 7.4) * petalSizeScale,
				rotation: randomBetween(this.rng, -Math.PI, Math.PI),
				rotationVelocity: randomBetween(this.rng, -0.0028, 0.0028),
				alpha: randomBetween(this.rng, 0.5, 0.78),
				sway: randomBetween(this.rng, 0.008, 0.016),
				swayOffset: randomBetween(this.rng, 0, Math.PI * 2),
				lifetimeMs: randomBetween(this.rng, 850, 1350),
				colorIndex: Math.floor(this.rng() * petalPalette.colors.length)
			});
		}

		this.ensureAnimationLoop();
	};

	CherryBlossomGrove.prototype.updatePetals = function (deltaMs) {
		var nextPetals = [];

		this.petals.forEach(function (petal) {
			var lifeProgress;

			petal.ageMs += deltaMs;
			if (petal.ageMs >= petal.lifetimeMs) {
				return;
			}

			lifeProgress = petal.ageMs / petal.lifetimeMs;
			petal.vy += petal.gravity * deltaMs;
			petal.x += (petal.vx * deltaMs) + (Math.sin((petal.ageMs * petal.sway) + petal.swayOffset) * 0.12);
			petal.y += petal.vy * deltaMs;
			petal.rotation += petal.rotationVelocity * deltaMs;
			petal.alpha = Math.max(0, 1 - lifeProgress);
			nextPetals.push(petal);
		});

		this.petals = nextPetals;
	};

	CherryBlossomGrove.prototype.drawPetals = function (ctx) {
		var petalPalette = this.getPetalPalette();

		this.petals.forEach(function (petal) {
			ctx.save();
			ctx.translate(petal.x, petal.y);
			ctx.rotate(petal.rotation);
			ctx.scale(petal.size, petal.size);
			ctx.globalAlpha = petal.alpha * 0.82;
			ctx.fillStyle = petalPalette.colors[petal.colorIndex % petalPalette.colors.length];
			ctx.strokeStyle = petalPalette.stroke;
			ctx.lineWidth = 0.11;
			drawPetalShape(ctx);
			ctx.fill();
			ctx.stroke();
			ctx.restore();
		});
	};

	function setupCherryBlossomGrove() {
		var canvas = document.getElementById('cherry-blossom-canvas');
		var grove;

		if (!canvas || !canvas.getContext) {
			return;
		}

		grove = new CherryBlossomGrove(canvas);
		grove.init();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupCherryBlossomGrove);
	} else {
		setupCherryBlossomGrove();
	}
})();
