(function() {
	function el(html) {
		const template = document.createElement('template');
		template.innerHTML = html.trim();
		return template.content.firstChild;
	}

	function showError(container, error) {
		container.innerHTML = '';
		container.appendChild(el(`
			<div class="col-span-full">
				<div class="p-4 border border-red-200 bg-red-50 text-sm text-red-700 rounded">
					${error?.message || 'Error loading data'}
					<button class="ml-3 px-2 py-1 text-xs bg-white border border-red-300 rounded retry-btn">Retry</button>
				</div>
			</div>
		`));
		return container.querySelector('.retry-btn');
	}

	async function renderDashboard() {
		const stats = document.getElementById('dashboard-stats');
		const recent = document.getElementById('dashboard-recent-projects');
		if (!stats || !recent) return;
		// simple skeleton
		stats.querySelectorAll('.bg-white').forEach(card => card.classList.add('opacity-50'));
		try {
			const [projects, proposals, documents] = await Promise.all([
				MockApi.getProjects(),
				MockApi.getProposals(),
				MockApi.getDocuments()
			]);
			// Update fake numbers from data
			const activeProjects = projects.filter(p => p.status !== 'closed').length;
			stats.children[0].querySelector('p.mt-1').textContent = String(activeProjects);
			stats.children[1].querySelector('p.mt-1').textContent = String(proposals.length);
			stats.children[2].querySelector('p.mt-1').textContent = String(documents.length);
			stats.children[3].querySelector('p.mt-1').textContent = String(projects.length * 6 + 12);

			// Recent projects list from data (limit 4)
			recent.innerHTML = '';
			projects.slice(0,4).forEach(p => {
				recent.appendChild(el(`
					<div class="px-6 py-4 hover:bg-gray-50 cursor-pointer">
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm font-medium text-indigo-600">${p.name}</p>
								<p class="text-sm text-gray-500">${p.clientId}</p>
							</div>
							<div class="flex items-center">
								<span class="px-2 py-1 text-xs font-medium rounded-full bg-${p.status === 'in_progress' ? 'green' : p.status === 'review' ? 'blue' : 'yellow'}-100 text-${p.status === 'in_progress' ? 'green' : p.status === 'review' ? 'blue' : 'yellow'}-800">${p.status.replace('_',' ')}</span>
								<i class="ml-4 fas fa-chevron-right text-gray-400"></i>
							</div>
						</div>
					</div>
				`));
			});

			// Quick actions wiring
			document.getElementById('qa-new-client')?.addEventListener('click', () => document.getElementById('new-client-button')?.click());
			document.getElementById('qa-new-project')?.addEventListener('click', () => document.getElementById('new-project-button')?.click());
			document.getElementById('qa-upload-docs')?.addEventListener('click', () => Router.navigateTo('intake'));
			document.getElementById('qa-generate-proposal')?.addEventListener('click', async () => {
				const projectsAll = await MockApi.getProjects();
				if (!projectsAll.length) return UI.showToast('No projects available', 'error');
				const p = projectsAll[0];
				await MockApi.createProposalDraft(p.id, p.clientId);
				UI.showToast('Draft proposal created', 'success');
			});
		} catch (err) {
			const retry = showError(stats, err);
			retry?.addEventListener('click', renderDashboard);
		}
	}

	async function renderClients() {
		const grid = document.getElementById('clients-grid');
		if (!grid) return;
		const search = document.getElementById('clients-search');
		const query = (search?.value || '').toLowerCase();
		try {
			const clients = await MockApi.getClients();
			grid.innerHTML = '';
			clients.filter(c => !query || c.name.toLowerCase().includes(query) || (c.industry||'').toLowerCase().includes(query)).forEach(c => {
				const initial = c.name.charAt(0).toUpperCase();
				grid.appendChild(el(`
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow transition-shadow">
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<div class="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">${initial}</div>
								<div>
									<p class="text-sm font-medium">${c.name}</p>
									<p class="text-xs text-gray-500">${c.industry}</p>
								</div>
							</div>
							<span class="px-2 py-1 text-xs rounded-full bg-${c.status === 'Active' ? 'green' : c.status === 'Prospect' ? 'yellow' : 'gray'}-100 text-${c.status === 'Active' ? 'green' : c.status === 'Prospect' ? 'yellow' : 'gray'}-800">${c.status}</span>
						</div>
						<div class="mt-3 flex space-x-2">
							<button class="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">View</button>
							<button class="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50">Projects</button>
						</div>
					</div>
				`));
			});
		} catch (err) {
			const retry = showError(grid, err);
			retry?.addEventListener('click', renderClients);
		}
	}

	async function renderProjects() {
		const board = document.getElementById('projects-board');
		if (!board) return;
		const filter = document.getElementById('projects-filter');
		const selectedClient = filter ? filter.value : 'All Clients';
		try {
			const projects = await MockApi.getProjects();
			const columns = {
				backlog: [], in_progress: [], review: []
			};
			projects
				.filter(p => selectedClient === 'All Clients' || p.clientId === selectedClient || p.clientId === selectedClient?.toLowerCase())
				.forEach(p => columns[p.status]?.push(p));
			board.innerHTML = '';
			Object.entries(columns).forEach(([status, items]) => {
				const title = status === 'backlog' ? 'Backlog' : status === 'in_progress' ? 'In Progress' : 'Review';
				const col = el(`
					<div>
						<h4 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">${title}</h4>
						<div class="space-y-3"></div>
					</div>
				`);
				const list = col.querySelector('.space-y-3');
				items.forEach(p => list.appendChild(el(`
					<div class="border border-gray-200 rounded-lg p-3 hover:shadow">
						<p class="text-sm font-medium">${p.name}</p>
						<p class="text-xs text-gray-500">${p.clientId}</p>
						${p.status === 'in_progress' ? `<div class="mt-2 w-full bg-gray-200 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${p.progress}%"></div></div>` : ''}
						<div class="mt-2 flex items-center space-x-2">
							<button data-action="move" data-status="backlog" class="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Backlog</button>
							<button data-action="move" data-status="in_progress" class="px-2 py-1 text-xs bg-white border border-gray-300 rounded">In Progress</button>
							<button data-action="move" data-status="review" class="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Review</button>
						</div>
					</div>
				`)));
				board.appendChild(col);
			});
			// attach move handlers
			board.querySelectorAll('[data-action="move"]').forEach(btn => {
				btn.addEventListener('click', async (e) => {
					const card = e.target.closest('.border');
					const name = card.querySelector('p.text-sm.font-medium').textContent;
					const projectsAll = await MockApi.getProjects();
					const project = projectsAll.find(p => p.name === name);
					if (!project) return;
					const to = e.target.getAttribute('data-status');
					await MockApi.updateProject(project.id, { status: to, progress: to === 'in_progress' ? project.progress || 10 : to === 'review' ? 100 : 0 });
					UI.showToast('Project updated', 'success');
					renderProjects();
				});
			});
		} catch (err) {
			const retry = showError(board, err);
			retry?.addEventListener('click', renderProjects);
		}
	}

	async function renderAgents() {
		const grid = document.getElementById('agents-grid');
		if (!grid) return;
		try {
			const agents = (await MockApi.getAgents()).filter(a => a && a.icon && a.accent);
			grid.innerHTML = '';
			agents.forEach(a => {
				const color = a.accent;
				grid.appendChild(el(`
					<div class="border border-gray-200 rounded-lg p-4 hover:shadow">
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<div class="h-10 w-10 rounded-full bg-${color}-100 text-${color}-600 flex items-center justify-center mr-3"><i class="fas fa-${a.icon}"></i></div>
								<div>
									<p class="text-sm font-medium">${a.name}</p>
									<p class="text-xs text-gray-500">${a.description}</p>
								</div>
							</div>
							<span class="px-2 py-1 text-xs rounded-full bg-${a.status === 'healthy' ? 'green' : a.status === 'degraded' ? 'yellow' : 'gray'}-100 text-${a.status === 'healthy' ? 'green' : a.status === 'degraded' ? 'yellow' : 'gray'}-800">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
						</div>
						<div class="mt-3 flex space-x-2">
							<button class="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Run</button>
							<button class="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Logs</button>
						</div>
					</div>
				`));
			});
		} catch (err) {
			const retry = showError(grid, err);
			retry?.addEventListener('click', renderAgents);
		}
	}

	async function renderProposals() {
		const list = document.getElementById('proposals-list');
		if (!list) return;
		try {
			const proposals = await MockApi.getProposals();
			list.innerHTML = '';
			proposals.forEach(p => list.appendChild(el(`
				<div class="py-4 flex items-center justify-between">
					<div>
						<p class="text-sm font-medium">${p.title}</p>
						<p class="text-xs text-gray-500">${p.clientId}</p>
					</div>
					<div class="flex items-center space-x-2">
						<span class="px-2 py-1 text-xs rounded-full bg-${p.status === 'in_review' ? 'yellow' : 'blue'}-100 text-${p.status === 'in_review' ? 'yellow' : 'blue'}-800">${p.status === 'in_review' ? 'In Review' : 'Draft'}</span>
						<button class="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Preview</button>
						<button class="px-2 py-1 text-xs bg-indigo-600 text-white rounded">Send</button>
					</div>
				</div>
			`)));
		} catch (err) {
			const retry = showError(list, err);
			retry?.addEventListener('click', renderProposals);
		}
	}

	async function renderAnalytics() {
		const grid = document.getElementById('analytics-grid');
		if (!grid) return;
		// Simple RNG-based trend mock to show variability
		const bars = grid.querySelectorAll('.grid .bg-indigo-200, .grid .bg-indigo-300, .grid .bg-indigo-400, .grid .bg-indigo-500');
		bars.forEach(b => {
			b.style.height = `${10 + Math.floor(Math.random() * 28)}rem`;
		});
	}

	// Chat enhancements: typing indicator + streaming + clickable citations
	(function enhanceChat() {
		const chatSend = document.getElementById('chatSendButton');
		const chatInput = document.getElementById('chatInput');
		const chatContainer = document.getElementById('chatContainer');
		if (!chatSend || !chatInput || !chatContainer) return;
		let wired = false;
		if (wired) return; wired = true;
		const origHandler = chatSend.onclick || null;
		chatSend.addEventListener('click', () => {
			setTimeout(() => {
				// add typing indicator
				const indicator = el(`
					<div class="fade-in mb-4 typing-indicator">
						<div class="flex items-start">
							<div class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
								<i class="fas fa-robot"></i>
							</div>
							<div class="ml-3 max-w-3xl">
								<div class="bg-white p-4 rounded-lg shadow-sm chat-bubble-ai">
									<p class="text-sm text-gray-800"><span class="dots">Typing</span></p>
								</div>
							</div>
						</div>
					</div>
				`);
				chatContainer.appendChild(indicator);
				chatContainer.scrollTop = chatContainer.scrollHeight;
				// animate dots
				const dotsEl = indicator.querySelector('.dots');
				let step = 0; const dotsTimer = setInterval(() => { dotsEl.textContent = 'Typing' + '.'.repeat(step % 4); step++; }, 300);
				// streaming response
				setTimeout(() => {
					indicator.remove(); clearInterval(dotsTimer);
					const response = el(`
						<div class="fade-in mb-4">
							<div class="flex items-start">
								<div class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
									<i class="fas fa-robot"></i>
								</div>
								<div class="ml-3 max-w-3xl">
									<div class="bg-white p-4 rounded-lg shadow-sm chat-bubble-ai">
										<p class="text-sm text-gray-800"><span class="stream"></span></p>
										<div class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
											<p class="font-medium">Source:</p>
											<p><button class="source-chip underline text-indigo-600">Market Analysis Report.pdf, page 42</button></p>
											<p class="mt-1"><button class="source-chip underline text-indigo-600">Competitive Benchmark.xlsx, sheet "Market Size"</button></p>
										</div>
									</div>
									<div class="mt-2 text-xs text-gray-500">
										<span>AI Assistant • Just now</span>
									</div>
								</div>
							</div>
						</div>
					`);
					chatContainer.appendChild(response);
					chatContainer.scrollTop = chatContainer.scrollHeight;
					// type out text
					const streamEl = response.querySelector('.stream');
					const text = 'Based on our market analysis, the current market size is estimated at $12.4B with 7.2% CAGR over five years.';
					let i = 0; const streamTimer = setInterval(() => {
						streamEl.textContent = text.slice(0, i += 2);
						if (i >= text.length) clearInterval(streamTimer);
					}, 20);
					// wire source chips to open documents panel
					response.querySelectorAll('.source-chip').forEach(btn => btn.addEventListener('click', () => Router.navigateTo('intake')));
				}, 800);
			}, 0);
		});
	})();

	function handleSectionShown(e) {
		switch (e.detail.sectionKey) {
			case 'dashboard':
				renderDashboard();
				break;
			case 'clients':
				renderClients();
				break;
			case 'projects':
				renderProjects();
				break;
			case 'agents':
				renderAgents();
				break;
			case 'proposals':
				renderProposals();
				break;
			case 'analytics':
				renderAnalytics();
				break;
		}
	}

	document.addEventListener('section:shown', handleSectionShown);

	// Settings persistence and theming
	(function wireSettings() {
		const email = document.getElementById('notify-email');
		const slack = document.getElementById('notify-slack');
		const weekly = document.getElementById('notify-weekly');
		const company = document.getElementById('settings-company');
		const currency = document.getElementById('settings-currency');
		const dark = document.getElementById('settings-dark');
		if (!company || !currency || !dark) return;
		// Load
		const prefs = AppState.getState().preferences || {};
		company.value = prefs.company || '';
		currency.value = prefs.currency || 'USD';
		email && (email.checked = !!prefs.notifyEmail);
		slack && (slack.checked = !!prefs.notifySlack);
		weekly && (weekly.checked = !!prefs.notifyWeekly);
		dark.checked = !!prefs.darkMode;
		if (prefs.darkMode) document.documentElement.classList.add('theme-dark');
		// Save on change
		function save() {
			AppState.setPreference('company', company.value);
			AppState.setPreference('currency', currency.value);
			email && AppState.setPreference('notifyEmail', email.checked);
			slack && AppState.setPreference('notifySlack', slack.checked);
			weekly && AppState.setPreference('notifyWeekly', weekly.checked);
			AppState.setPreference('darkMode', dark.checked);
			document.documentElement.classList.toggle('theme-dark', dark.checked);
			UI.showToast('Settings saved', 'success');
		}
		[company, currency, email, slack, weekly, dark].filter(Boolean).forEach(elm => {
			elm.addEventListener('change', save);
		});
	})();

	// Wire search/create outside of section event to keep listeners single-bound
	document.getElementById('clients-search')?.addEventListener('input', () => {
		if (AppState.getCurrentView() === 'clients') renderClients();
	});

	document.getElementById('new-client-button')?.addEventListener('click', () => {
		const modal = UI.createModal({
			title: 'New Client',
			content: `
				<label class="block text-sm text-gray-600">Name</label>
				<input id="client-name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded mb-3" placeholder="Acme Corporation" />
				<label class="block text-sm text-gray-600">Industry</label>
				<input id="client-industry" type="text" class="w-full px-3 py-2 border border-gray-300 rounded" placeholder="Manufacturing" />
			`,
			onConfirm: async (wrapper) => {
				const name = wrapper.querySelector('#client-name').value.trim();
				const industry = wrapper.querySelector('#client-industry').value.trim();
				if (!name) throw new Error('Name is required');
				await MockApi.createClient({ name, industry, status: 'Active' });
				UI.showToast('Client created', 'success');
				if (AppState.getCurrentView() === 'clients') renderClients();
			}
		});
	});

	document.getElementById('new-project-button')?.addEventListener('click', async () => {
		const clients = await MockApi.getClients();
		const options = clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
		UI.createModal({
			title: 'New Project',
			content: `
				<label class="block text-sm text-gray-600">Name</label>
				<input id="project-name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded mb-3" placeholder="New Initiative" />
				<label class="block text-sm text-gray-600">Client</label>
				<select id="project-client" class="w-full px-3 py-2 border border-gray-300 rounded">${options}</select>
			`,
			onConfirm: async (wrapper) => {
				const name = wrapper.querySelector('#project-name').value.trim();
				const clientId = wrapper.querySelector('#project-client').value;
				if (!name) throw new Error('Name is required');
				await MockApi.createProject({ name, clientId });
				UI.showToast('Project created', 'success');
				if (AppState.getCurrentView() === 'projects') renderProjects();
			}
		});
	});

	document.getElementById('projects-filter')?.addEventListener('change', () => {
		if (AppState.getCurrentView() === 'projects') renderProjects();
	});
})();


