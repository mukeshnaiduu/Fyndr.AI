// Shared lightweight toast utility for consistent ephemeral messages across the app.
// Usage: showToast('Message', 'success' | 'error' | 'warning')
export default function showToast(message, type = 'success', duration = 2500) {
	try {
		const el = document.createElement('div');
		el.textContent = message;
		el.className = `fixed top-20 right-4 z-[9999] px-4 py-2 rounded-squircle elevation-3 ${
			type === 'success' ? 'bg-success text-success-foreground' :
			type === 'error' ? 'bg-error text-error-foreground' :
			'bg-warning text-foreground'
		}`;
		document.body.appendChild(el);
		setTimeout(() => el.remove(), duration);
	} catch (_) {
		// no-op if DOM is unavailable (SSR/tests)
	}
}
