(function() {
	function createModal({ title, content, onConfirm, confirmText = 'Save', cancelText = 'Cancel' }) {
		const wrapper = document.createElement('div');
		wrapper.className = 'fixed inset-0 z-50 flex items-center justify-center';
		wrapper.innerHTML = `
			<div class="fixed inset-0 bg-black bg-opacity-30"></div>
			<div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 z-10">
				<div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
					<h3 class="text-lg font-medium text-gray-900">${title}</h3>
					<button class="text-gray-400 hover:text-gray-600 close-btn"><i class="fas fa-times"></i></button>
				</div>
				<div class="p-6">${content}</div>
				<div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
					<button class="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 cancel-btn">${cancelText}</button>
					<button class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 confirm-btn">${confirmText}</button>
				</div>
			</div>
		`;
		document.body.appendChild(wrapper);
		function close() { document.body.removeChild(wrapper); }
		wrapper.querySelector('.close-btn').addEventListener('click', close);
		wrapper.querySelector('.cancel-btn').addEventListener('click', close);
		wrapper.querySelector('.confirm-btn').addEventListener('click', async () => {
			try {
				await onConfirm?.(wrapper);
				close();
			} catch (e) { /* keep modal open */ }
		});
		return wrapper;
	}

	let toastTimeout;
	function showToast(message, type = 'info') {
		const existing = document.getElementById('toaster');
		if (existing) existing.remove();
		const el = document.createElement('div');
		el.id = 'toaster';
		el.className = 'fixed bottom-4 right-4 z-50';
		el.innerHTML = `
			<div class="px-4 py-3 rounded shadow-lg text-sm ${type === 'error' ? 'bg-red-600 text-white' : type === 'success' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}">${message}</div>
		`;
		document.body.appendChild(el);
		clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => el.remove(), 2500);
	}

	window.UI = { createModal, showToast };
})();


