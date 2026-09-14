const form = document.getElementById('converter-form');
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const swapButton = document.getElementById('swap-button');
const convertButton = document.getElementById('convert-button');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error');
const result = document.getElementById('result');
const rateText = document.getElementById('rate-text');
const convertedAmount = document.getElementById('converted-amount');
const updatedText = document.getElementById('updated-text');
const apiKeyInput = document.getElementById('api-key');
const saveKeyButton = document.getElementById('save-key');

const openApiUrl = 'https://open.er-api.com/v6/latest/USD';
let supportedCurrencies = {};
let latestRates = {};

function getApiKey() {
	return localStorage.getItem('exchangeRateApiKey') || '';
}

function setLoading(isLoading) {
	loading.classList.toggle('is-hidden', !isLoading);
	convertButton.disabled = isLoading || !supportedCurrencies.USD;
	swapButton.disabled = isLoading;
	if (isLoading) {
		errorMessage.classList.add('is-hidden');
		result.classList.add('is-hidden');
	}
}

function showError(message) {
	loading.classList.add('is-hidden');
	result.classList.add('is-hidden');
	errorMessage.textContent = message;
	errorMessage.classList.remove('is-hidden');
	convertButton.disabled = false;
}

function populateCurrencies(currencies) {
	const options = Object.entries(currencies)
		.sort(([first], [second]) => first.localeCompare(second))
		.map(([code, name]) => `<option value="${code}">${code} - ${name}</option>`)
		.join('');
	fromCurrency.innerHTML = options;
	toCurrency.innerHTML = options;
	fromCurrency.value = 'USD';
	toCurrency.value = 'EUR';
	fromCurrency.disabled = false;
	toCurrency.disabled = false;
	convertButton.disabled = false;
}

async function fetchSupportedCurrencies() {
	const apiKey = getApiKey();
	const endpoint = apiKey
		? `https://v6.exchangerate-api.com/v6/${apiKey}/codes`
		: openApiUrl;
	const response = await fetch(endpoint);
	if (!response.ok) throw new Error('Could not load supported currencies.');
	const data = await response.json();

	if (apiKey) {
		if (data.result !== 'success') throw new Error(data['error-type'] || 'Invalid API key.');
		supportedCurrencies = Object.fromEntries(data.supported_codes);
	} else {
		if (data.result !== 'success') throw new Error('Could not load supported currencies.');
		supportedCurrencies = Object.fromEntries(Object.keys(data.rates).map((code) => [code, code]));
	}
	populateCurrencies(supportedCurrencies);
}

async function fetchConversion(amount, from, to) {
	const apiKey = getApiKey();
	if (apiKey) {
		const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`);
		if (!response.ok) throw new Error('Could not convert this amount.');
		const data = await response.json();
		if (data.result !== 'success') throw new Error(data['error-type'] || 'Could not convert this amount.');
		return { rate: data.conversion_rate, converted: data.conversion_result, date: data.time_last_update_utc };
	}

	const response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
	if (!response.ok) throw new Error('Could not get the latest exchange rate.');
	const data = await response.json();
	if (data.result !== 'success' || !data.rates[to]) throw new Error('Could not get the latest exchange rate.');
	const rate = data.rates[to];
	latestRates = data.rates;
	return { rate, converted: amount * rate, date: data.time_last_update_utc };
}

async function convertCurrency(event) {
	event.preventDefault();
	const amount = Number(amountInput.value);
	if (!Number.isFinite(amount) || amount < 0) {
		showError('Please enter a valid amount.');
		return;
	}
	setLoading(true);
	try {
		const conversion = await fetchConversion(amount, fromCurrency.value, toCurrency.value);
		rateText.textContent = `1 ${fromCurrency.value} = ${conversion.rate.toFixed(4)} ${toCurrency.value}`;
		convertedAmount.textContent = `${conversion.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${toCurrency.value}`;
		updatedText.textContent = `Updated ${conversion.date || 'just now'}`;
		loading.classList.add('is-hidden');
		result.classList.remove('is-hidden');
	} catch (error) {
		showError(error.message);
	} finally {
		convertButton.disabled = false;
		swapButton.disabled = false;
	}
}

async function initialize() {
	try {
		await fetchSupportedCurrencies();
		await convertCurrency({ preventDefault() {} });
	} catch (error) {
		showError(error.message);
	}
}

swapButton.addEventListener('click', () => {
	const previousFrom = fromCurrency.value;
	fromCurrency.value = toCurrency.value;
	toCurrency.value = previousFrom;
	form.requestSubmit();
});

saveKeyButton.addEventListener('click', async () => {
	localStorage.setItem('exchangeRateApiKey', apiKeyInput.value.trim());
	await initialize();
});

form.addEventListener('submit', convertCurrency);
apiKeyInput.value = getApiKey();
initialize();
