/**
 * Change Dinar - App JavaScript (النسخة العربية)
 * أسعار الصرف الحديثة والمتحركة
 */

const API_BASE = 'https://changedinaradmin-main-ufzenb.laravel.cloud/api';
const SITE_BASE = 'https://changedinar.online';
const STRUCTURED_DATA_ID = 'ld-json-structured';
const PAGE_DESCRIPTION = 'أسعار الدينار الجزائري في السوق الموازية لحظيًا: اليورو، الدولار، الجنيه وغيرها مع محوّل فوري وتطبيقات الموبايل.';

// إعدادات العملات (عربي)
const CURRENCIES = {
    EUR: { name: 'اليورو', flag: 'euro', color: 'gold' },
    USD: { name: 'الدولار الأمريكي', flag: 'usa', color: 'primary' },
    GBP: { name: 'الجنيه الإسترليني', flag: 'uk', color: 'purple-400' },
    CHF: { name: 'الفرنك السويسري', flag: 'swi', color: 'red-500' },
    CAD: { name: 'الدولار الكندي', flag: 'canada', color: 'red-600' },
    SAR: { name: 'الريال السعودي', flag: 'saudi', color: 'green-500' },
    AED: { name: 'الدرهم الإماراتي', flag: 'aed', color: 'emerald-500' },
    TRY: { name: 'الليرة التركية', flag: 'turky', color: 'red-500' },
    MAD: { name: 'الدرهم المغربي', flag: 'mad', color: 'red-600' },
    TND: { name: 'الدينار التونسي', flag: 'tunes', color: 'red-500' },
    EGP: { name: 'الجنيه المصري', flag: 'egp', color: 'yellow-500' },
    QAR: { name: 'الريال القطري', flag: 'qatar', color: 'purple-600' }
};

// ترتيب الأولوية
const PRIORITY = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'SAR', 'AED', 'TRY', 'MAD', 'TND', 'EGP', 'QAR'];

// تخزين الأسعار
let rates = {};

// التهيئة
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await fetchRates();
    initConverter();
    fetchDigitalRates();
    fetchCryptoRates();

    // تحديث تلقائي كل 5 دقائق
    setInterval(fetchRates, 5 * 60 * 1000);
}

// جلب أسعار العملات الرئيسية
async function fetchRates() {
    try {
        const res = await fetch(`${API_BASE}/v1/today`);
        const data = await res.json();

        if (Array.isArray(data)) {
            data.forEach(currency => {
                rates[currency.code] = {
                    buy: parseFloat(currency.price?.unofficial_buy_price) || 0,
                    sell: parseFloat(currency.price?.unofficial_sell_price) || 0,
                    official: parseFloat(currency.price?.official_price) || 0,
                    date: currency.price?.date
                };
            });

            updateTopCards();
            renderAllRates();
            updateConverter();

            // تحديث وقت آخر تحديث
            const dateStr = data[0]?.price?.date || new Date().toLocaleDateString('ar-DZ');
            document.getElementById('last-update').textContent = `آخر تحديث: ${dateStr}`;
            updateStructuredData('ar', PAGE_DESCRIPTION);
        }
    } catch (error) {
        console.error('خطأ في جلب الأسعار:', error);
    }
}

// تحديث البطاقات الثلاث الرئيسية (EUR, USD, GBP)
function updateTopCards() {
    // EUR
    if (rates.EUR) {
        animateNumber('eur-buy', rates.EUR.buy);
        animateNumber('eur-sell', rates.EUR.sell);
        const eurRateText = document.getElementById('eur-rate-text');
        if (eurRateText) eurRateText.textContent = formatNumber(rates.EUR.buy);
        const heroEurRate = document.getElementById('hero-eur-rate');
        if (heroEurRate) heroEurRate.textContent = formatNumber(rates.EUR.buy);
    }

    // USD
    if (rates.USD) {
        animateNumber('usd-buy', rates.USD.buy);
        animateNumber('usd-sell', rates.USD.sell);
        const usdRateText = document.getElementById('usd-rate-text');
        if (usdRateText) usdRateText.textContent = formatNumber(rates.USD.buy);
    }

    // GBP
    if (rates.GBP) {
        animateNumber('gbp-buy', rates.GBP.buy);
        animateNumber('gbp-sell', rates.GBP.sell);
        const gbpRateText = document.getElementById('gbp-rate-text');
        if (gbpRateText) gbpRateText.textContent = formatNumber(rates.GBP.buy);
    }
}

// تحريك الأرقام
function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (targetValue - startValue) * easeProgress;

        element.textContent = formatNumber(currentValue);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// عرض جميع أسعار الصرف
function renderAllRates() {
    const container = document.getElementById('all-rates');
    if (!container) return;

    // ترتيب حسب الأولوية، استبعاد EUR, USD, GBP (معروضة بالفعل)
    const sortedCurrencies = PRIORITY
        .filter(code => rates[code] && !['EUR', 'USD', 'GBP'].includes(code))
        .map(code => ({ code, ...rates[code], ...CURRENCIES[code] }));

    const html = sortedCurrencies.map((currency, index) => `
        <div class="group relative bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/5 hover:border-white/20 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10"
             style="animation: scaleIn 0.5s ease-out ${index * 0.08}s forwards; opacity: 0;">
            <div class="flex items-center gap-3 mb-4">
                <div class="relative">
                    <div class="absolute inset-0 bg-white/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img src="../images/flags/${currency.flag}.png" alt="${currency.name}"
                             class="w-8 h-8 rounded-lg object-cover"
                             onerror="this.src='../images/logo.png'">
                    </div>
                </div>
                <div>
                    <div class="font-bold text-lg">${currency.code}</div>
                    <div class="text-xs text-slate-500">${currency.name}</div>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/20">
                    <span class="text-slate-500 text-xs font-medium">شراء</span>
                    <span class="font-bold text-green-400">${formatNumber(currency.buy)}</span>
                </div>
                <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/10">
                    <span class="text-slate-500 text-xs font-medium">بيع</span>
                    <span class="font-semibold text-slate-400">${formatNumber(currency.sell)}</span>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// جلب أسعار العملات الرقمية
async function fetchDigitalRates() {
    const container = document.getElementById('digital-rates');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/v1/electronic-currencies/latest`);
        const data = await res.json();

        let items = Array.isArray(data) ? data : (data.data || []);

        // تصفية العناصر ذات الأسعار الصفرية
        items = items.filter(item => {
            const buy = parseFloat(item.eur_to_dzd_buy) || 0;
            return buy > 0;
        });

        const html = items.map((item, index) => {
            const name = item.currency_name || item.name || 'غير معروف';
            // استخدام أسعار EUR
            const buy = parseFloat(item.eur_to_dzd_buy) || 0;
            const sell = parseFloat(item.eur_to_dzd_sell) || 0;
            const icon = name.toLowerCase().replace(/\s+/g, '');

            return `
                <div class="group relative bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/5 hover:border-blue-500/30 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10"
                     style="animation: scaleIn 0.5s ease-out ${index * 0.08}s forwards; opacity: 0;">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="relative">
                            <div class="absolute inset-0 bg-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div class="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center overflow-hidden">
                                <img src="../images/digital/${icon}.png" alt="${name}"
                                     class="w-8 h-8 object-contain"
                                     onerror="this.src='../images/logo.png'">
                            </div>
                        </div>
                        <div>
                            <div class="font-bold text-lg">${name}</div>
                            <div class="text-xs text-slate-500">يورو/دج</div>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/20">
                            <span class="text-slate-500 text-xs font-medium">شراء</span>
                            <span class="font-bold text-blue-400">${formatNumber(buy)}</span>
                        </div>
                        <div class="flex justify-between items-center p-2.5 rounded-xl bg-black/10">
                            <span class="text-slate-500 text-xs font-medium">بيع</span>
                            <span class="font-semibold text-slate-400">${formatNumber(sell)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || '<p class="text-slate-500 col-span-full text-center">لا توجد بيانات</p>';
    } catch (error) {
        console.error('خطأ في تحميل الأسعار الرقمية:', error);
        container.innerHTML = '<p class="text-slate-500 col-span-full text-center">خطأ في التحميل</p>';
    }
}

// جلب أسعار العملات المشفرة
async function fetchCryptoRates() {
    const container = document.getElementById('crypto-rates');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE}/crypto/all`);
        const response = await res.json();

        // API ترجع { success: true, data: [...] }
        let items = response.data || response || [];
        if (!Array.isArray(items)) items = [];

        // ترتيب حسب القيمة السوقية
        items.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));

        const html = items.slice(0, 8).map((item, index) => {
            const name = item.name || item.symbol || 'غير معروف';
            const symbol = item.symbol || '';
            // استخدام السعر بالدولار
            const priceUsd = parseFloat(item.rate_usd) || parseFloat(item.price_usd) || 0;
            const change = parseFloat(item.change_24h) || 0;
            const icon = name.toLowerCase();
            const isPositive = change >= 0;

            return `
                <div class="group relative bg-gradient-to-br from-dark-800/90 to-dark-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/5 hover:border-orange-500/30 transition-all duration-500 hover:transform hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/10"
                     style="animation: scaleIn 0.5s ease-out ${index * 0.08}s forwards; opacity: 0;">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="relative">
                            <div class="absolute inset-0 bg-orange-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div class="relative w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 flex items-center justify-center overflow-hidden">
                                <img src="../images/crypto/${icon}.png" alt="${name}"
                                     class="w-8 h-8 object-contain"
                                     onerror="this.src='../images/logo.png'">
                            </div>
                        </div>
                        <div>
                            <div class="font-bold text-lg">${symbol}</div>
                            <div class="text-xs text-slate-500">${name}</div>
                        </div>
                    </div>
                    <div class="flex justify-between items-end">
                        <div>
                            <span class="text-slate-500 text-xs">السعر بالدولار</span>
                            <div class="font-bold text-orange-400 text-lg">$${formatNumberUsd(priceUsd)}</div>
                        </div>
                        <div class="text-right">
                            <span class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                                ${isPositive ? '↑' : '↓'} ${Math.abs(change).toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || '<p class="text-slate-500 col-span-full text-center">لا توجد بيانات</p>';
    } catch (error) {
        console.error('خطأ في تحميل أسعار العملات المشفرة:', error);
        container.innerHTML = '<p class="text-slate-500 col-span-full text-center">خطأ في التحميل</p>';
    }
}

// تهيئة المحوّل
function initConverter() {
    const amountInput = document.getElementById('convert-amount');
    const currencySelect = document.getElementById('convert-currency');

    amountInput?.addEventListener('input', updateConverter);
    currencySelect?.addEventListener('change', updateConverter);
}

// تحديث المحوّل
function updateConverter() {
    const amountInput = document.getElementById('convert-amount');
    const currencySelect = document.getElementById('convert-currency');
    const resultEl = document.getElementById('convert-result');
    const rateInfoEl = document.getElementById('convert-rate-info');

    if (!amountInput || !currencySelect || !resultEl) return;

    const amount = parseFloat(amountInput.value) || 0;
    const currency = currencySelect.value;
    const rate = rates[currency]?.buy || 0;
    const result = amount * rate;

    // تحريك النتيجة
    animateNumber('convert-result', result);

    if (rateInfoEl) {
        rateInfoEl.textContent = `1 ${currency} = ${formatNumber(rate)} د.ج (السوق الموازية)`;
    }
}

// تحديث بيانات JSON-LD المهيكلة لتقوية الظهور في نتائج البحث
function updateStructuredData(language, description) {
    const script = document.getElementById(STRUCTURED_DATA_ID) || (() => {
        const el = document.createElement('script');
        el.id = STRUCTURED_DATA_ID;
        el.type = 'application/ld+json';
        document.head.appendChild(el);
        return el;
    })();

    const pagePath = window.location.pathname || '/';
    const pageUrl = `${SITE_BASE}${pagePath}`;
    const orgId = `${SITE_BASE}/#org`;
    const websiteId = `${SITE_BASE}/#website`;

    const exchangeSpecs = Object.entries(rates)
        .filter(([, value]) => value?.buy > 0)
        .map(([code, value]) => {
            const spec = {
                "@type": "ExchangeRateSpecification",
                "@id": `${pageUrl}#${code.toLowerCase()}-rate`,
                "currency": code,
                "currentExchangeRate": {
                    "@type": "UnitPriceSpecification",
                    "price": parseFloat(value.buy.toFixed(2)),
                    "priceCurrency": "DZD"
                }
            };

            if (value.sell) {
                spec.additionalProperty = [
                    {
                        "@type": "PropertyValue",
                        "name": "سعر البيع",
                        "value": parseFloat(value.sell.toFixed(2)),
                        "unitCode": "DZD"
                    }
                ];
            }

            if (value.date) {
                spec.validFrom = value.date;
            }

            return spec;
        });

    const catalogItems = exchangeSpecs.map((spec, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": { "@id": spec["@id"] }
    }));

    const organization = {
        "@type": "Organization",
        "@id": orgId,
        "name": "Change Dinar",
        "url": `${SITE_BASE}/`,
        "logo": `${SITE_BASE}/images/logo.png`,
        "sameAs": [
            "https://www.instagram.com/change_dinar/",
            "https://www.facebook.com/share/1Apr4iWhxJ/?mibextid=wwXIfr"
        ]
    };

    const website = {
        "@type": "WebSite",
        "@id": websiteId,
        "url": pageUrl,
        "name": "تغيير الدينار - أسعار الدينار الجزائري",
        "inLanguage": language,
        "publisher": { "@id": orgId }
    };

    const iosApp = {
        "@type": "MobileApplication",
        "@id": `${SITE_BASE}/#ios-app`,
        "name": "Change Dinar iOS",
        "operatingSystem": "iOS",
        "applicationCategory": "FinanceApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "DZD" },
        "url": "https://apps.apple.com/dz/app/change-dinar-taux-dinar-alger/id6742030993"
    };

    const androidApp = {
        "@type": "MobileApplication",
        "@id": `${SITE_BASE}/#android-app`,
        "name": "Change Dinar Android",
        "operatingSystem": "Android",
        "applicationCategory": "FinanceApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "DZD" },
        "url": "https://play.google.com/store/apps/details?id=com.zaed.changedinar"
    };

    const currencyService = {
        "@type": "CurrencyConversionService",
        "@id": `${pageUrl}#service`,
        "name": "تغيير الدينار - أسعار مباشرة",
        "serviceType": "أسعار السوق الموازية",
        "description": description,
        "provider": { "@id": orgId },
        "url": pageUrl,
        "areaServed": "DZ",
        "inLanguage": language,
        "availableChannel": API_BASE,
        "currenciesAccepted": Object.keys(rates).filter(code => rates[code]?.buy > 0)
    };

    if (catalogItems.length) {
        currencyService.hasOfferCatalog = {
            "@type": "OfferCatalog",
            "name": "أسعار الصرف المباشرة",
            "itemListElement": catalogItems
        };
    }

    const graph = [
        organization,
        website,
        iosApp,
        androidApp,
        currencyService,
        ...exchangeSpecs
    ];

    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
}

// تنسيق الأرقام
function formatNumber(num) {
    if (!num || isNaN(num)) return '---';
    return new Intl.NumberFormat('ar-DZ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(num);
}

// تنسيق أرقام الدولار (لأسعار العملات المشفرة)
function formatNumberUsd(num) {
    if (!num || isNaN(num)) return '---';
    // للأرقام الكبيرة (>1000)، بدون كسور
    // للأرقام المتوسطة (1-1000)، رقمين بعد الفاصلة
    // للأرقام الصغيرة (<1)، حتى 6 أرقام بعد الفاصلة
    if (num >= 1000) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    } else if (num >= 1) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    } else {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(num);
    }
}

// التمرير السلس لروابط المرساة
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Add scaleIn animation if not defined
const style = document.createElement('style');
style.textContent = `
    @keyframes scaleIn {
        0% { opacity: 0; transform: scale(0.9) translateY(10px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
    }
`;
document.head.appendChild(style);
