const API_KEY = "YOUR_API_KEY";
const API_ROOT = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

const form = document.querySelector("#converter-form");
const amountInput = document.querySelector("#amount");
const fromSelect = document.querySelector("#from-currency");
const toSelect = document.querySelector("#to-currency");
const swapButton = document.querySelector("#swap-currencies");
const result = document.querySelector("#result");
const rate = document.querySelector("#rate");

function showMessage(message, type = "") {
	result.className = `result ${type}`;
	result.textContent = message;
}

async function getJson(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Request failed with status ${response.status}`);
	}

	const data = await response.json();
	if (data.result === "error") {
		throw new Error(data["error-type"] || "Currency API error");
	}

	return data;
}

async function loadCurrencies() {
	if (API_KEY === "YOUR_API_KEY") {
		throw new Error("Add your ExchangeRate-API key in the API_KEY constant first.");
	}

	const data = await getJson(`${API_ROOT}/codes`);
	data.supported_codes.forEach(([code, name]) => {
		const option = new Option(`${code} - ${name}`, code);
		fromSelect.add(option.cloneNode(true));
		toSelect.add(option);
	});

	fromSelect.value = "EUR";
	toSelect.value = "USD";
}

async function convertCurrency() {
	const amount = Number(amountInput.value);
	const from = fromSelect.value;
	const to = toSelect.value;

	if (!Number.isFinite(amount) || amount < 0) {
		showMessage("Enter a valid amount.", "error");
		return;
	}

	showMessage("Converting...");

	try {
		const data = await getJson(`${API_ROOT}/pair/${from}/${to}/${amount}`);
		result.textContent = `${amount.toLocaleString()} ${from} = ${data.conversion_result.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}`;
		result.className = "result success";
		rate.textContent = `1 ${from} = ${data.conversion_rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to}`;
	} catch (error) {
		showMessage(error.message, "error");
		rate.textContent = "";
	}
}

form.addEventListener("submit", (event) => {
	event.preventDefault();
	convertCurrency();
});

swapButton.addEventListener("click", () => {
	[fromSelect.value, toSelect.value] = [toSelect.value, fromSelect.value];
	convertCurrency();
});

loadCurrencies().catch((error) => showMessage(error.message, "error"));
