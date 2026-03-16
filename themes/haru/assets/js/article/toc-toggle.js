(function () {
	var tocList = document.querySelectorAll('.toc');
	var idSeed = 0;

	if (!tocList.length) {
		return;
	}

	function createId() {
		idSeed += 1;
		return 'toc-content-' + idSeed;
	}

	function getTocTitle(tocElement) {
		return tocElement.querySelector('.toctitle');
	}

	function getTocLists(tocElement) {
		var children = tocElement.children;
		var listNodes = [];

		for (var i = 0; i < children.length; i += 1) {
			if (children[i].tagName === 'UL' || children[i].tagName === 'OL') {
				listNodes.push(children[i]);
			}
		}

		return listNodes;
	}

	function enhanceToc(tocElement) {
		var titleNode = getTocTitle(tocElement);
		var listNodes = getTocLists(tocElement);

		if (!titleNode || !listNodes.length) {
			return;
		}

		var contentWrapper = document.createElement('div');
		var contentId = createId();
		var button = document.createElement('button');

		contentWrapper.className = 'toc-content';
		contentWrapper.id = contentId;
		contentWrapper.hidden = false;

		for (var i = 0; i < listNodes.length; i += 1) {
			contentWrapper.appendChild(listNodes[i]);
		}

		button.type = 'button';
		button.className = 'toc-toggle';
		button.setAttribute('aria-expanded', 'true');
		button.setAttribute('aria-controls', contentId);
		button.textContent = titleNode.textContent || 'On this page';

		titleNode.replaceWith(button);
		tocElement.appendChild(contentWrapper);
		tocElement.classList.add('toc--collapsible');

		button.addEventListener('click', function () {
			var isExpanded = button.getAttribute('aria-expanded') === 'true';
			var nextExpanded = !isExpanded;

			button.setAttribute('aria-expanded', nextExpanded ? 'true' : 'false');
			contentWrapper.hidden = !nextExpanded;
			tocElement.classList.toggle('is-collapsed', !nextExpanded);

			if (window.requestAnimationFrame) {
				window.requestAnimationFrame(function () {
					window.dispatchEvent(new Event('reading-progress:refresh'));
				});
				return;
			}

			window.dispatchEvent(new Event('reading-progress:refresh'));
		});
	}

	for (var i = 0; i < tocList.length; i += 1) {
		enhanceToc(tocList[i]);
	}
})();
