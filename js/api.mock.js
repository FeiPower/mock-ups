(function() {
	const LATENCY_MIN_MS = 300;
	const LATENCY_MAX_MS = 800;
	const ERROR_RATE = 0.05;
    const STORAGE_KEY = 'strtgy.mockdb';

	function delay() {
		const ms = Math.floor(Math.random() * (LATENCY_MAX_MS - LATENCY_MIN_MS + 1)) + LATENCY_MIN_MS;
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	function readDb() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			const parsed = raw ? JSON.parse(raw) : null;
			if (parsed && typeof parsed.__seeded === 'undefined') parsed.__seeded = false;
			return parsed;
		} catch (_) { return null; }
	}

	function writeDb(db) {
		try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_) {}
	}

	async function fetchJson(path) {
		await delay();
		if (Math.random() < ERROR_RATE) {
			throw new Error('Network error (mock)');
		}
		const res = await fetch(path, { cache: 'no-store' });
		if (!res.ok) throw new Error('Failed to load ' + path);
		return res.json();
	}

	function ensureDb() {
		let db = readDb();
		if (!db) {
			db = { __seeded: false, clients: [], projects: [], documents: [], proposals: [], agents: [] };
			Promise.all([
				fetchJson('data/clients.json'),
				fetchJson('data/projects.json'),
				fetchJson('data/documents.json'),
				fetchJson('data/proposals.json'),
				fetchJson('data/agents.json')
			]).then(([clients, projects, documents, proposals, agents]) => {
				if (!db.clients.length) db.clients = clients;
				if (!db.projects.length) db.projects = projects;
				if (!db.documents.length) db.documents = documents;
				if (!db.proposals.length) db.proposals = proposals;
				if (!db.agents.length) db.agents = agents;
				db.__seeded = true;
				writeDb(db);
			});
		}
		return db;
	}

	function id(prefix) { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }

	window.MockApi = {
		async getClients() { const db = ensureDb(); await delay(); return (db && db.clients && db.clients.length) ? db.clients : fetchJson('data/clients.json'); },
		async createClient(payload) {
			const db = ensureDb(); await delay();
			const newItem = { id: id('client'), status: 'Active', ...payload };
			db.clients.unshift(newItem); writeDb(db); return newItem;
		},
		async getProjects() { const db = ensureDb(); await delay(); return (db && db.projects && db.projects.length) ? db.projects : fetchJson('data/projects.json'); },
		async createProject(payload) {
			const db = ensureDb(); await delay();
			const newItem = { id: id('proj'), status: 'backlog', progress: 0, ...payload };
			db.projects.unshift(newItem); writeDb(db); return newItem;
		},
		async updateProject(idToUpdate, patch) {
			const db = ensureDb(); await delay();
			db.projects = db.projects.map(p => p.id === idToUpdate ? { ...p, ...patch } : p);
			writeDb(db);
			return db.projects.find(p => p.id === idToUpdate);
		},
		async getDocuments() { const db = ensureDb(); await delay(); return (db && db.documents && db.documents.length) ? db.documents : fetchJson('data/documents.json'); },
		async uploadDocument(payload) {
			const db = ensureDb(); await delay();
			const newItem = { id: id('doc'), updatedAt: new Date().toISOString().slice(0,10), ...payload };
			db.documents.unshift(newItem); writeDb(db); return newItem;
		},
		async getProposals() { const db = ensureDb(); await delay(); return (db && db.proposals && db.proposals.length) ? db.proposals : fetchJson('data/proposals.json'); },
		async createProposalDraft(projectId, clientId) {
			const db = ensureDb(); await delay();
			const count = (db.proposals.filter(p => p.projectId === projectId).length) + 1;
			const newItem = { id: id('prop'), projectId, clientId, title: `New Proposal • v0.${count}`, status: 'draft' };
			db.proposals.unshift(newItem); writeDb(db); return newItem;
		},
		async getAgents() { const db = ensureDb(); await delay(); return (db && db.agents && db.agents.length) ? db.agents : fetchJson('data/agents.json'); }
	};
})();


