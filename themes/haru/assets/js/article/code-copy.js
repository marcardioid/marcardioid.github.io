(function () {
	var BUTTON_ICONS = {
		idle: '<svg class="code-copy-button__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="14" height="14" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
		copied: '<svg class="code-copy-button__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>',
		failed: '<svg class="code-copy-button__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 6-12 12"></path><path d="m6 6 12 12"></path></svg>'
	};

	function getCodeNode(block) {
		var codeNode = block.querySelector('td.code code');
		if (codeNode) {
			return codeNode;
		}

		codeNode = block.querySelector('td.code pre');
		if (codeNode) {
			return codeNode;
		}

		codeNode = block.querySelector('pre code');
		if (codeNode) {
			return codeNode;
		}

		return block.querySelector('pre');
	}

	function getCodeText(block) {
		var codeNode = getCodeNode(block);
		if (!codeNode) {
			return '';
		}

		return codeNode.textContent.replace(/^\n/, '').replace(/\n$/, '');
	}

	function fallbackCopy(text) {
		var textArea = document.createElement('textarea');

		textArea.value = text;
		textArea.setAttribute('readonly', '');
		textArea.style.position = 'fixed';
		textArea.style.top = '-9999px';
		textArea.style.left = '-9999px';
		textArea.style.opacity = '0';

		document.body.appendChild(textArea);
		textArea.select();
		textArea.setSelectionRange(0, textArea.value.length);

		var copied = false;
		try {
			copied = document.execCommand('copy');
		} catch (error) {
			copied = false;
		}

		textArea.remove();
		return copied;
	}

	function copyText(text, onComplete) {
		if (navigator.clipboard && window.isSecureContext) {
			navigator.clipboard.writeText(text).then(function () {
				onComplete(true);
			}).catch(function () {
				onComplete(fallbackCopy(text));
			});
			return;
		}

		onComplete(fallbackCopy(text));
	}

	function setButtonState(button, state) {
		var label = 'Copy code to clipboard';

		button.setAttribute('data-copy-state', state);

		if (state === 'copied') {
			label = 'Copied to clipboard';
		} else if (state === 'failed') {
			label = 'Copy failed';
		}

		button.setAttribute('aria-label', label);
		button.setAttribute('title', label);
		button.innerHTML = BUTTON_ICONS[state] || BUTTON_ICONS.idle;
	}

	function getScrollerNode(block) {
		var scroller = block.querySelector('.codehilite__scroller');

		if (scroller && scroller.parentNode === block) {
			return scroller;
		}

		scroller = document.createElement('div');
		scroller.className = 'codehilite__scroller';

		while (block.firstChild) {
			scroller.appendChild(block.firstChild);
		}

		block.appendChild(scroller);
		return scroller;
	}

	function enhanceCodeBlock(block) {
		if (block.querySelector('.code-copy-button')) {
			return;
		}

		var scroller = getScrollerNode(block);
		var button = document.createElement('button');

		button.type = 'button';
		button.className = 'code-copy-button';
		setButtonState(button, 'idle');

		button.addEventListener('click', function () {
			if (button.disabled) {
				return;
			}

			var codeText = getCodeText(block);
			if (!codeText) {
				setButtonState(button, 'failed');
				window.setTimeout(function () {
					setButtonState(button, 'idle');
				}, 1800);
				return;
			}

			button.disabled = true;
			copyText(codeText, function (copied) {
				setButtonState(button, copied ? 'copied' : 'failed');
				window.setTimeout(function () {
					setButtonState(button, 'idle');
					button.disabled = false;
				}, copied ? 1400 : 1800);
			});
		});

		block.classList.add('has-copy-button');
		block.insertBefore(button, scroller);
	}

	function setupCodeCopyButtons() {
		var codeBlocks = document.querySelectorAll('.codehilite');
		if (!codeBlocks.length) {
			return;
		}

		for (var i = 0; i < codeBlocks.length; i += 1) {
			enhanceCodeBlock(codeBlocks[i]);
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupCodeCopyButtons);
	} else {
		setupCodeCopyButtons();
	}
})();
