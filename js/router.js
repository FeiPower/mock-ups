(function() {
	const sectionTitleMap = {
		dashboard: 'Admin Dashboard',
		clients: 'Clients',
		projects: 'Projects',
		agents: 'Agents',
		intake: 'Intake Chat',
		proposals: 'Proposals',
		analytics: 'Analytics',
		settings: 'Settings'
	};

	function parseHash() {
		const raw = (location.hash || '').replace(/^#\/?/, '');
		const [view] = raw.split('/');
		return view || 'dashboard';
	}

	function updateSidebarActive(sectionKey) {
		document.querySelectorAll('.sidebar-item').forEach(item => {
			item.classList.remove('bg-indigo-50', 'text-indigo-700');
			item.querySelector('i')?.classList.remove('text-indigo-600');
			item.classList.add('text-gray-600');
		});
		const activeItem = document.querySelector(`.sidebar-item[data-section="${sectionKey}"]`);
		if (activeItem) {
			activeItem.classList.add('bg-indigo-50', 'text-indigo-700');
			activeItem.classList.remove('text-gray-600');
			activeItem.querySelector('i')?.classList.add('text-indigo-600');
		}
	}

	function showSection(sectionKey) {
		document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
		const active = document.getElementById(`section-${sectionKey}`);
		if (active) {
			active.classList.remove('hidden');
			// focus first focusable element for a11y
			setTimeout(() => {
				const focusable = active.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
				if (focusable) focusable.focus();
			}, 0);
			// notify listeners that a section is now visible
			document.dispatchEvent(new CustomEvent('section:shown', { detail: { sectionKey } }));
		}
		const title = document.getElementById('topNavTitle');
		if (title && sectionTitleMap[sectionKey]) {
			title.textContent = sectionTitleMap[sectionKey];
		}
		updateSidebarActive(sectionKey);
	}

	function navigateTo(viewKey, replace) {
		const hash = `#/${viewKey}`;
		if (replace) {
			history.replaceState(null, '', hash);
		} else {
			location.hash = hash;
		}
		AppState?.setCurrentView(viewKey);
		showSection(viewKey);
	}

	function onHashChange() {
		const view = parseHash();
		AppState?.setCurrentView(view);
		showSection(view);
	}

	// Sidebar click -> route
	document.querySelectorAll('.sidebar-item[data-section]').forEach(item => {
		item.addEventListener('click', (e) => {
			e.preventDefault();
			const sectionKey = item.getAttribute('data-section');
			navigateTo(sectionKey);
		});
	});

	// Initial load
	window.addEventListener('hashchange', onHashChange);

	const initialView = parseHash() || AppState?.getCurrentView() || 'dashboard';
	navigateTo(initialView, true);

	// Expose minimal API for other scripts if needed
	window.Router = {
		navigateTo
	};
})();


