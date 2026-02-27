(function () {
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
		button.setAttribute('data-copy-state', state);

		if (state === 'copied') {
			button.textContent = 'Copied';
			return;
		}

		if (state === 'failed') {
			button.textContent = 'Copy failed';
			return;
		}

		button.textContent = 'Copy';
	}

	function enhanceCodeBlock(block) {
		if (block.querySelector('.code-copy-button')) {
			return;
		}

		var button = document.createElement('button');

		button.type = 'button';
		button.className = 'code-copy-button';
		button.setAttribute('aria-label', 'Copy code to clipboard');
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
		block.insertBefore(button, block.firstChild);
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
