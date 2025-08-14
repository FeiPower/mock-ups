// Toggle between admin and client views
function showAdminDashboard() {
	document.getElementById('adminDashboard').classList.remove('hidden');
	document.getElementById('clientPortal').classList.add('hidden');
}

function showClientPortal() {
	document.getElementById('adminDashboard').classList.add('hidden');
	document.getElementById('clientPortal').classList.remove('hidden');
}


// Simulate chat interaction
document.getElementById('chatSendButton').addEventListener('click', function() {
	const input = document.getElementById('chatInput');
	const message = input.value.trim();

	if (message) {
		// Add user message
		const chatContainer = document.getElementById('chatContainer');
		const userMessage = document.createElement('div');
		userMessage.className = 'fade-in mb-4';
		userMessage.innerHTML = `
			<div class="flex items-start justify-end">
				<div class="ml-3 max-w-3xl">
					<div class="bg-indigo-100 p-4 rounded-lg shadow-sm chat-bubble-user">
						<p class="text-sm text-indigo-800">${message}</p>
					</div>
					<div class="mt-2 text-xs text-gray-500 text-right">
						<span>You • Just now</span>
					</div>
				</div>
				<div class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
					<i class="fas fa-user"></i>
				</div>
			</div>
		`;
		chatContainer.appendChild(userMessage);

		// Clear input
		input.value = '';

		// Simulate AI response after a delay
		setTimeout(() => {
			const aiResponse = document.createElement('div');
			aiResponse.className = 'fade-in mb-4';
			aiResponse.innerHTML = `
				<div class="flex items-start">
					<div class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
						<i class="fas fa-robot"></i>
					</div>
					<div class="ml-3 max-w-3xl">
						<div class="bg-white p-4 rounded-lg shadow-sm chat-bubble-ai">
							<p class="text-sm text-gray-800">Based on our market analysis report (page 42), the current market size for your industry is estimated at $12.4 billion with a projected CAGR of 7.2% over the next five years.</p>
							<div class="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
								<p class="font-medium">Source:</p>
								<p>Market Analysis Report.pdf, page 42</p>
								<p class="mt-1">Competitive Benchmark.xlsx, sheet "Market Size"</p>
							</div>
						</div>
						<div class="mt-2 text-xs text-gray-500">
							<span>AI Assistant • Just now</span>
						</div>
					</div>
				</div>
			`;
			chatContainer.appendChild(aiResponse);

			// Scroll to bottom
			chatContainer.scrollTop = chatContainer.scrollHeight;
		}, 1000);

		// Scroll to bottom
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}
});

// Intake chat interaction (admin)
document.getElementById('intakeChatSendButton')?.addEventListener('click', function() {
	const input = document.getElementById('intakeChatInput');
	if (!input) return;
	const message = input.value.trim();
	if (!message) return;
	const chatContainer = document.getElementById('intakeChatContainer');
	const adminMsg = document.createElement('div');
	adminMsg.className = 'fade-in mb-4';
	adminMsg.innerHTML = `
		<div class="flex items-start justify-end">
			<div class="ml-3 max-w-3xl">
				<div class="bg-indigo-100 p-4 rounded-lg shadow-sm chat-bubble-user">
					<p class="text-sm text-indigo-800">${message}</p>
				</div>
				<div class="mt-2 text-xs text-gray-500 text-right">
					<span>Admin • Just now</span>
				</div>
			</div>
			<div class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
				<i class="fas fa-user-shield"></i>
			</div>
		</div>
	`;
	chatContainer.appendChild(adminMsg);
	input.value = '';
	setTimeout(() => {
		const bot = document.createElement('div');
		bot.className = 'fade-in mb-4';
		bot.innerHTML = `
			<div class="flex items-start">
				<div class="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
					<i class="fas fa-robot"></i>
				</div>
				<div class="ml-3 max-w-3xl">
					<div class="bg-white p-4 rounded-lg shadow-sm chat-bubble-ai">
						<p class="text-sm text-gray-800">Noted. I will update the project brief with your changes and suggest next steps.</p>
					</div>
					<div class="mt-2 text-xs text-gray-500">
						<span>Intake Bot • Just now</span>
					</div>
				</div>
			</div>
		`;
		chatContainer.appendChild(bot);
		chatContainer.scrollTop = chatContainer.scrollHeight;
	}, 800);
});

