const form = document.querySelector('[data-auth-form]');
const submitButton = form.querySelector('.submit-button');
const message = form.querySelector('.form-message');
const mode = form.dataset.authForm;

function updateSubmitState() {
	const fields = Array.from(form.querySelectorAll('input[required]'));
	submitButton.disabled = !fields.every((field) => field.value.trim() && field.checkValidity());
}

form.addEventListener('input', updateSubmitState);
form.addEventListener('change', updateSubmitState);
form.addEventListener('submit', async (event) => {
	event.preventDefault();
	message.textContent = '';
	message.classList.remove('is-success');
	submitButton.disabled = true;

	const body = Object.fromEntries(new FormData(form).entries());
	try {
		const response = await fetch(`/${mode}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
		const result = await response.json();
		if (!response.ok) throw new Error(result.message || 'Unable to complete the request.');

		message.textContent = mode === 'register'
			? `${result.message} You can now sign in.`
			: result.message;
		message.classList.add('is-success');
		form.reset();
		if (mode === 'register') {
			const link = document.createElement('a');
			link.href = '/login.html';
			link.textContent = ' Go to sign in';
			message.append(link);
		}
	} catch (error) {
		message.textContent = error.message;
	} finally {
		updateSubmitState();
	}
});

updateSubmitState();