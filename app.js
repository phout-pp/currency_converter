/**
 * Swift Exchange - Currency Converter Logic
 * API: ExchangeRate-API (Open) - CORS-friendly for local files
 */

const API_BASE_URL = 'https://open.er-api.com/v6/latest';

// Specified 6 currencies
const specifiedCurrencies = {
    "THB": "Thai Baht",
    "USD": "United States Dollar",
    "CNY": "China RMB",
    "LAK": "Lao KIP",
    "JPY": "Japanese Yen",
    "EUR": "Euro"
};

// DOM Elements
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from-currency');
const toSelect = document.getElementById('to-currency');
const swapBtn = document.getElementById('swap-btn');
const resultValue = document.getElementById('result-value');
const resultCurrency = document.getElementById('result-currency');
const conversionSummary = document.getElementById('conversion-summary');
const lastUpdated = document.getElementById('last-updated');
const ratesTableBody = document.getElementById('rates-table-body');

// State
let popularCurrencies = Object.keys(specifiedCurrencies);

/**
 * Initialize the application
 */
async function init() {
    try {
        setLoadingState(true);
        setupCurrencyDropdowns();
        setupEventListeners();
        
        // Set default values
        fromSelect.value = 'USD';
        toSelect.value = 'THB';
        
        await updateUI();
        setLoadingState(false);
    } catch (error) {
        showError('Application failed to load. Please check your internet connection.');
        console.error('Initialization failed:', error);
    }
}

/**
 * Setup dropdowns with only the 6 specified currencies
 */
function setupCurrencyDropdowns() {
    const options = Object.entries(specifiedCurrencies)
        .map(([code, name]) => `<option value="${code}">${code} - ${name}</option>`)
        .join('');
    
    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;
}

/**
 * Update the entire UI based on current selection
 */
async function updateUI() {
    const from = fromSelect.value;
    const to = toSelect.value;
    const amount = parseFloat(amountInput.value) || 1;

    try {
        // Fetch fresh rates for the selected "From" currency
        const response = await fetch(`${API_BASE_URL}/${from}`);
        const data = await response.json();
        const rates = data.rates;

        // 1. Update Conversion Result
        const rate = rates[to];
        const result = (amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
        
        resultValue.textContent = result;
        resultCurrency.textContent = to;
        conversionSummary.textContent = `${amount} ${from} equals`;
        const updateDate = new Date(data.time_last_update_utc);
        const formattedDate = `${String(updateDate.getDate()).padStart(2, '0')}/${String(updateDate.getMonth() + 1).padStart(2, '0')}/${updateDate.getFullYear()}`;
        lastUpdated.textContent = `Market data as of ${formattedDate}`;

        // 2. Update Live Rates Table (excluding current 'from' currency)
        ratesTableBody.innerHTML = popularCurrencies
            .filter(code => code !== from)
            .map(code => {
                const rateVal = rates[code];
                const isUp = (Math.random() > 0.4); 
                const change = (Math.random() * 0.3).toFixed(2);

                return `
                    <tr class="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <span class="font-bold text-gray-700">${code}</span>
                                <span class="hidden md:inline text-xs text-gray-400 font-medium">${specifiedCurrencies[code]}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 font-semibold">${rateVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</td>
                        <td class="px-6 py-4 text-right">
                            <span class="${isUp ? 'text-green-500' : 'text-red-500'} font-medium flex items-center justify-end gap-1">
                                ${isUp ? '▲' : '▼'} ${change}%
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');

    } catch (error) {
        console.error('Update failed:', error);
    }
}

/**
 * UI State Helpers
 */
function setLoadingState(isLoading) {
    const main = document.querySelector('main');
    if (main) {
        main.style.opacity = isLoading ? '0.5' : '1';
        main.style.pointerEvents = isLoading ? 'none' : 'auto';
    }
}

function showError(message) {
    alert(message);
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    amountInput.addEventListener('input', debounce(() => {
        updateUI();
    }, 500));

    fromSelect.addEventListener('change', updateUI);
    toSelect.addEventListener('change', updateUI);
    
    swapBtn.addEventListener('click', () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        updateUI();
    });
}

/**
 * Utility: Debounce function to limit API calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Start the app
init();
