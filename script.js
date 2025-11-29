/**
 * Change Dinar - JavaScript
 * API Integration & Interactive Features
 */

// API Configuration
const API_BASE_URL = 'https://changedinaradmin-main-ufzenb.laravel.cloud/api';

const API_ENDPOINTS = {
    currencies: `${API_BASE_URL}/v1/today`,
    electronic: `${API_BASE_URL}/v1/electronic-currencies/latest`,
    digitalBank: `${API_BASE_URL}/rates/digital-bank`,
    crypto: `${API_BASE_URL}/crypto/all`,
    blackMarket: `${API_BASE_URL}/rates/black-market/all`,
    usdt: `${API_BASE_URL}/rates/usdt`
};

// Priority order for currencies (EUR, USD, GBP first - most important!)
const CURRENCY_PRIORITY = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'SAR', 'AED', 'TRY', 'MAD', 'TND', 'EGP', 'QAR'];

// Currency configuration with flags
const CURRENCY_CONFIG = {
    EUR: { name: 'Euro', flag: 'euro', symbol: '€', priority: 1 },
    USD: { name: 'US Dollar', flag: 'usa', symbol: '$', priority: 2 },
    GBP: { name: 'Pfund Sterling', flag: 'uk', symbol: '£', priority: 3 },
    CHF: { name: 'Schweizer Franken', flag: 'swi', symbol: 'Fr', priority: 4 },
    CAD: { name: 'Kanadischer Dollar', flag: 'canada', symbol: '$', priority: 5 },
    SAR: { name: 'Saudi Riyal', flag: 'saudi', symbol: '﷼', priority: 6 },
    AED: { name: 'UAE Dirham', flag: 'aed', symbol: 'د.إ', priority: 7 },
    TRY: { name: 'Türkische Lira', flag: 'turky', symbol: '₺', priority: 8 },
    MAD: { name: 'Marokkanischer Dirham', flag: 'mad', symbol: 'د.م.', priority: 9 },
    TND: { name: 'Tunesischer Dinar', flag: 'tunes', symbol: 'د.ت', priority: 10 },
    EGP: { name: 'Ägyptisches Pfund', flag: 'egp', symbol: 'E£', priority: 11 },
    QAR: { name: 'Katar Riyal', flag: 'qatar', symbol: '﷼', priority: 12 }
};

// Digital payment providers
const DIGITAL_CONFIG = {
    paypal: { name: 'PayPal', icon: 'paypal' },
    wise: { name: 'Wise', icon: 'wise' },
    payoneer: { name: 'Payoneer', icon: 'payoneer' },
    paysera: { name: 'Paysera', icon: 'paysera' },
    skrill: { name: 'Skrill', icon: 'skrill' },
    n26: { name: 'N26', icon: 'n26' }
};

// Crypto configuration
const CRYPTO_CONFIG = {
    bitcoin: { name: 'Bitcoin', symbol: 'BTC', icon: 'bitcoin' },
    ethereum: { name: 'Ethereum', symbol: 'ETH', icon: 'ethereum' },
    tether: { name: 'Tether', symbol: 'USDT', icon: 'tether' },
    binancecoin: { name: 'BNB', symbol: 'BNB', icon: 'bnb' },
    solana: { name: 'Solana', symbol: 'SOL', icon: 'solana' },
    ripple: { name: 'XRP', symbol: 'XRP', icon: 'xrp' }
};

// Global state
let currencyRates = {};
let currentTab = 'unofficial';
let selectedFromCurrency = 'EUR';

// ============================================
// DOM Elements
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize theme
    initTheme();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize tabs
    initTabs();

    // Initialize converter
    initConverter();

    // Fetch all data
    fetchAllData();

    // Initialize currency rotation in hero
    initCurrencyRotation();

    // Smooth scroll for anchor links
    initSmoothScroll();
}

// ============================================
// Theme Management
// ============================================
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');

    menuBtn?.addEventListener('click', () => {
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        mobileNav.classList.toggle('active');
        mobileNav.setAttribute('aria-hidden', isExpanded);
    });

    // Close menu when clicking on links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            menuBtn.setAttribute('aria-expanded', 'false');
        });
    });
}

// ============================================
// Tabs
// ============================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            renderCurrencyRates();
        });
    });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Currency Rotation in Hero
// ============================================
function initCurrencyRotation() {
    const currencies = ['EUR', 'USD', 'GBP', 'CAD', 'CHF'];
    let currentIndex = 0;

    const rotatingCode = document.getElementById('rotating-code');
    const rotatingName = document.getElementById('rotating-name');
    const rotatingFlag = document.getElementById('rotating-flag');

    if (!rotatingCode) return;

    // Determine image path based on current page location
    const basePath = window.location.pathname.includes('/fr/') ||
                   window.location.pathname.includes('/en/') ||
                   window.location.pathname.includes('/ar/') ? '../' : '';

    setInterval(() => {
        currentIndex = (currentIndex + 1) % currencies.length;
        const code = currencies[currentIndex];
        const config = CURRENCY_CONFIG[code];

        rotatingCode.textContent = code;
        rotatingName.textContent = config.name;
        rotatingFlag.src = `${basePath}images/flags/${config.flag}.png`;
        rotatingFlag.alt = `${config.name} Flag`;
    }, 3000);
}

// ============================================
// API Fetch Functions
// ============================================
async function fetchAllData() {
    try {
        await Promise.all([
            fetchCurrencyRates(),
            fetchDigitalRates(),
            fetchCryptoRates()
        ]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchCurrencyRates() {
    try {
        const response = await fetch(API_ENDPOINTS.currencies);
        const data = await response.json();

        if (Array.isArray(data)) {
            data.forEach(currency => {
                currencyRates[currency.code] = {
                    buy: parseFloat(currency.price?.unofficial_buy_price) || 0,
                    sell: parseFloat(currency.price?.unofficial_sell_price) || 0,
                    official: parseFloat(currency.price?.official_price) || 0,
                    date: currency.price?.date
                };
            });

            updateHeroStats();
            renderCurrencyRates();
            updateLastUpdated(data[0]?.price?.date);
            updateConverter();
        }
    } catch (error) {
        console.error('Error fetching currency rates:', error);
        showOfflineMessage('currency-rates');
    }
}

async function fetchDigitalRates() {
    try {
        const response = await fetch(API_ENDPOINTS.electronic);
        const data = await response.json();

        if (data) {
            renderDigitalRates(data);
        }
    } catch (error) {
        console.error('Error fetching digital rates:', error);
        showOfflineMessage('digital-rates');
    }
}

async function fetchCryptoRates() {
    try {
        const response = await fetch(API_ENDPOINTS.crypto);
        const data = await response.json();

        if (data) {
            renderCryptoRates(data);
        }
    } catch (error) {
        console.error('Error fetching crypto rates:', error);
        showOfflineMessage('crypto-rates');
    }
}

// ============================================
// Render Functions
// ============================================
function renderCurrencyRates() {
    const container = document.getElementById('currency-rates');
    if (!container) return;

    // Sort currencies by priority (EUR, USD, GBP first!)
    const sortedCurrencies = Object.entries(currencyRates)
        .filter(([code]) => CURRENCY_CONFIG[code])
        .sort((a, b) => {
            const priorityA = CURRENCY_CONFIG[a[0]]?.priority || 999;
            const priorityB = CURRENCY_CONFIG[b[0]]?.priority || 999;
            return priorityA - priorityB;
        });

    const html = sortedCurrencies
        .map(([code, rates]) => {
            const config = CURRENCY_CONFIG[code];
            const buyRate = currentTab === 'official' ? rates.official : rates.buy;
            const sellRate = rates.sell;
            // Mark top 3 currencies as featured (EUR, USD, GBP)
            const isFeatured = config.priority <= 3;
            const featuredClass = isFeatured ? 'featured' : '';

            // Determine image path based on current page location
            const basePath = window.location.pathname.includes('/fr/') ||
                           window.location.pathname.includes('/en/') ||
                           window.location.pathname.includes('/ar/') ? '../' : '';

            return `
                <article class="currency-card ${featuredClass}" data-code="${code}" itemscope itemtype="https://schema.org/ExchangeRateSpecification">
                    <div class="currency-card-header">
                        <img src="${basePath}images/flags/${config.flag}.png"
                             alt="${config.name} Flagge"
                             class="currency-flag"
                             loading="lazy"
                             width="48"
                             height="48">
                        <div class="currency-info">
                            <span class="currency-code" itemprop="currency">${code}</span>
                            <span class="currency-name">${config.name}</span>
                        </div>
                    </div>
                    <div class="currency-card-body">
                        <div class="rate-group">
                            <span class="rate-label">Achat</span>
                            <span class="rate-value" itemprop="currentExchangeRate">${formatNumber(buyRate)} DZD</span>
                        </div>
                        ${currentTab !== 'official' ? `
                        <div class="rate-group">
                            <span class="rate-label">Vente</span>
                            <span class="rate-value sell">${formatNumber(sellRate)} DZD</span>
                        </div>
                        ` : ''}
                    </div>
                </article>
            `;
        }).join('');

    container.innerHTML = html || '<p class="no-data">Keine Daten verfügbar</p>';
}

function renderDigitalRates(data) {
    const container = document.getElementById('digital-rates');
    if (!container) return;

    // Determine image path based on current page location
    const basePath = window.location.pathname.includes('/fr/') ||
                   window.location.pathname.includes('/en/') ||
                   window.location.pathname.includes('/ar/') ? '../' : '';

    // Handle different API response structures
    let rates = [];
    if (Array.isArray(data)) {
        rates = data;
    } else if (data.data) {
        rates = data.data;
    }

    const html = rates.map(item => {
        const name = item.name || item.currency_name || 'Unknown';
        const buyPrice = item.buy_price || item.unofficial_buy_price || 0;
        const sellPrice = item.sell_price || item.unofficial_sell_price || 0;
        const icon = name.toLowerCase().replace(/\s+/g, '');

        return `
            <article class="currency-card digital-card">
                <div class="currency-card-header">
                    <img src="${basePath}images/digital/${icon}.png"
                         alt="${name}"
                         class="currency-flag"
                         loading="lazy"
                         onerror="this.src='${basePath}images/digital/default.png'"
                         width="48"
                         height="48">
                    <div class="currency-info">
                        <span class="currency-code">${name}</span>
                        <span class="currency-name">EUR</span>
                    </div>
                </div>
                <div class="currency-card-body">
                    <div class="rate-group">
                        <span class="rate-label">Achat</span>
                        <span class="rate-value">${formatNumber(buyPrice)} DZD</span>
                    </div>
                    <div class="rate-group">
                        <span class="rate-label">Vente</span>
                        <span class="rate-value sell">${formatNumber(sellPrice)} DZD</span>
                    </div>
                </div>
            </article>
        `;
    }).join('');

    container.innerHTML = html || '<p class="no-data">Keine Daten verfügbar</p>';
}

function renderCryptoRates(data) {
    const container = document.getElementById('crypto-rates');
    if (!container) return;

    // Determine image path based on current page location
    const basePath = window.location.pathname.includes('/fr/') ||
                   window.location.pathname.includes('/en/') ||
                   window.location.pathname.includes('/ar/') ? '../' : '';

    let cryptos = [];
    if (Array.isArray(data)) {
        cryptos = data;
    } else if (data.data) {
        cryptos = data.data;
    }

    const html = cryptos.slice(0, 8).map(crypto => {
        const name = crypto.name || crypto.symbol || 'Unknown';
        const symbol = crypto.symbol || '';
        const price = crypto.price_dzd || crypto.price || 0;
        const change = crypto.change_24h || crypto.percent_change_24h || 0;
        const icon = name.toLowerCase();

        return `
            <article class="currency-card crypto-card">
                <div class="currency-card-header">
                    <img src="${basePath}images/crypto/${icon}.png"
                         alt="${name}"
                         class="currency-flag"
                         loading="lazy"
                         onerror="this.src='${basePath}images/crypto/default.png'"
                         width="48"
                         height="48">
                    <div class="currency-info">
                        <span class="currency-code">${symbol}</span>
                        <span class="currency-name">${name}</span>
                    </div>
                </div>
                <div class="currency-card-body">
                    <div class="rate-group">
                        <span class="rate-label">Preis</span>
                        <span class="rate-value">${formatNumber(price)} DZD</span>
                    </div>
                    <div class="rate-change ${change >= 0 ? 'positive' : 'negative'}">
                        ${change >= 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(2)}%
                    </div>
                </div>
            </article>
        `;
    }).join('');

    container.innerHTML = html || '<p class="no-data">Keine Daten verfügbar</p>';
}

// ============================================
// Update Functions
// ============================================
function updateHeroStats() {
    const eurRate = document.getElementById('hero-eur-rate');
    const usdRate = document.getElementById('hero-usd-rate');
    const gbpRate = document.getElementById('hero-gbp-rate');

    if (eurRate && currencyRates.EUR) {
        eurRate.textContent = formatNumber(currencyRates.EUR.buy);
    }
    if (usdRate && currencyRates.USD) {
        usdRate.textContent = formatNumber(currencyRates.USD.buy);
    }
    if (gbpRate && currencyRates.GBP) {
        gbpRate.textContent = formatNumber(currencyRates.GBP.buy);
    }
}

function updateLastUpdated(date) {
    const element = document.getElementById('last-update-time');
    if (element && date) {
        // Detect language from URL path
        const path = window.location.pathname;
        let prefix = 'Letzte Aktualisierung';

        if (path.includes('/fr/')) {
            prefix = 'Dernière mise à jour';
        } else if (path.includes('/en/')) {
            prefix = 'Last updated';
        } else if (path.includes('/ar/')) {
            prefix = 'آخر تحديث';
        }

        element.textContent = `${prefix}: ${date}`;
    }
}

function showOfflineMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="offline-message">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
                <p>Daten konnten nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
            </div>
        `;
    }
}

// ============================================
// Converter
// ============================================
function initConverter() {
    const fromAmount = document.getElementById('from-amount');
    const fromCurrency = document.getElementById('from-currency');
    const swapBtn = document.getElementById('swap-currencies');

    fromAmount?.addEventListener('input', updateConverter);
    fromCurrency?.addEventListener('change', () => {
        selectedFromCurrency = fromCurrency.value;
        updateConverter();
    });

    swapBtn?.addEventListener('click', () => {
        // Animate button
        swapBtn.style.transform = 'rotate(180deg) scale(1.1)';
        setTimeout(() => {
            swapBtn.style.transform = '';
        }, 300);
    });
}

function updateConverter() {
    const fromAmount = document.getElementById('from-amount');
    const toAmount = document.getElementById('to-amount');
    const currentRateEl = document.getElementById('current-rate');

    if (!fromAmount || !toAmount) return;

    const amount = parseFloat(fromAmount.value) || 0;
    const rate = currencyRates[selectedFromCurrency]?.buy || 0;
    const result = amount * rate;

    toAmount.value = formatNumber(result);

    if (currentRateEl) {
        currentRateEl.textContent = `1 ${selectedFromCurrency} = ${formatNumber(rate)} DZD`;
    }
}

// ============================================
// Utility Functions
// ============================================
function formatNumber(num) {
    if (!num || isNaN(num)) return '---';
    return new Intl.NumberFormat('de-DE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
}

// ============================================
// Auto Refresh (every 5 minutes)
// ============================================
setInterval(() => {
    fetchAllData();
}, 5 * 60 * 1000);

// ============================================
// Service Worker Registration (for PWA)
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ============================================
// Performance: Intersection Observer for lazy loading
// ============================================
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section);
});
