(function() {
	const StorageKeys = {
		view: 'strtgy.view',
		preferences: 'strtgy.preferences'
	};

	const defaultState = {
		currentView: 'dashboard',
		preferences: {}
	};

	function loadFromStorage() {
		try {
			const view = localStorage.getItem(StorageKeys.view) || defaultState.currentView;
			const prefsRaw = localStorage.getItem(StorageKeys.preferences);
			const preferences = prefsRaw ? JSON.parse(prefsRaw) : defaultState.preferences;
			return { currentView: view, preferences };
		} catch (err) {
			return { ...defaultState };
		}
	}

	function saveToStorage(state) {
		try {
			if (state.currentView) {
				localStorage.setItem(StorageKeys.view, state.currentView);
			}
			if (state.preferences) {
				localStorage.setItem(StorageKeys.preferences, JSON.stringify(state.preferences));
			}
		} catch (err) {
			// ignore storage errors in mock environment
		}
	}

	const internalState = loadFromStorage();

	window.AppState = {
		getState() {
			return { ...internalState };
		},
		getCurrentView() {
			return internalState.currentView || defaultState.currentView;
		},
		setCurrentView(viewKey) {
			internalState.currentView = viewKey;
			saveToStorage(internalState);
		},
		getPreference(key, fallback) {
			return Object.prototype.hasOwnProperty.call(internalState.preferences, key)
				? internalState.preferences[key]
				: fallback;
		},
		setPreference(key, value) {
			internalState.preferences[key] = value;
			saveToStorage(internalState);
		}
	};
})();


