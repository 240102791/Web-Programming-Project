// =========================================================
// Modern Weather Dashboard - JavaScript Logic
// Team Member: Omar Ahmed Ramadan (API & DOM) & Ahmed (Leader)
// =========================================================

// Configuration
const API_KEY = 'dc6995fce2cbfe9781f339cb5d7a2288';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// 1. Local Icons Mapping: المارسينج الشامل لكل الصور اللي بعتها
function getWeatherIcon(condition) {
    const desc = condition.toLowerCase();
    const path = "images/"; 

    if (desc.includes("clear")) return `${path}clear.png`;
    if (desc.includes("few clouds")) return `${path}Few-clouds.png`;
    if (desc.includes("scattered clouds")) return `${path}Scattered-clouds.png`;
    if (desc.includes("broken clouds")) return `${path}Broken-clouds.png`;
    if (desc.includes("overcast clouds")) return `${path}Overcast-clouds.png`;
    if (desc.includes("light rain")) return `${path}Light-rain.png`;
    if (desc.includes("moderate rain")) return `${path}Moderate-rain.png`;
    if (desc.includes("heavy intensity rain")) return `${path}Heavy-intensity-rain.png`;
    if (desc.includes("thunderstorm with rain")) return `${path}Thunderstorm-with-rain.png`;
    if (desc.includes("thunderstorm")) return `${path}Thunderstorm.png`;
    if (desc.includes("light snow")) return `${path}Light-snow.png`;
    if (desc.includes("heavy snow")) return `${path}Heavy-snow.png`;
    if (desc.includes("drizzle")) return `${path}Drizzle.png`;
    if (desc.includes("mist")) return `${path}Mist.png`;
    if (desc.includes("fog")) return `${path}Fog.png`;
    if (desc.includes("haze")) return `${path}haze.png`;
    if (desc.includes("dust")) return `${path}Dust.png`;
    if (desc.includes("sand")) return `${path}Sand.png`;
    if (desc.includes("smoke")) return `${path}Smoke.png`;

    return `${path}icon.png`; 
}

// 2. Event Handling: معالجة البحث ومنع إعادة التحميل
document.getElementById('search-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim();
    
    if (city) {
        const isSuccess = await fetchWeatherData(city);
        if (isSuccess) {
            saveCityToHistory(city); 
        }
        cityInput.value = ''; 
    }
});

// 3. Fetch API (async/await): جلب البيانات مع تأمين الأخطاء
const fetchWeatherData = async (city) => {
    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(`${BASE_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`),
            fetch(`${BASE_URL}/forecast?q=${city}&units=metric&appid=${API_KEY}`)
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
            alert("City not found. Please check the spelling.");
            return false;
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);
        
        return true; 
    } catch (error) {
        console.error("JavaScript Execution Error:", error);
        return false;
    }
};

// 4. DOM Manipulation: عرض الطقس الحالي
const displayCurrentWeather = (data) => {
    const weatherSection = document.getElementById('current-weather');
    // تم تعديل المسمى ليتوافق مع الدالة بالأعلى
    const iconUrl = getWeatherIcon(data.weather[0]?.description || '');
    
    let fullCountryName = data.sys.country;
    try {
        const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
        fullCountryName = regionNames.of(data.sys.country);
    } catch (e) {
        console.warn("Could not translate country code.");
    }
    
    weatherSection.innerHTML = `
        <div class="current-weather-card">
            <h2>${data.name}, ${fullCountryName}</h2>
            <div class="weather-info">
                <img src="${iconUrl}" alt="${data.weather[0]?.description || 'weather'}">
                <div class="details">
                    <p class="temp">${Math.round(data.main.temp)}°C</p>
                    <p class="desc" style="text-transform: capitalize;">${data.weather[0]?.description || ''}</p>
                </div>
            </div>
        </div>
    `;
};

// 5. Array Methods: عرض التوقعات
const displayForecast = (data) => {
    const forecastContainer = document.getElementById('forecast-cards');
    const forecastSection = document.querySelector('.forecast-section');
    if (!forecastContainer) return; 

    forecastContainer.innerHTML = ''; 

    const dailyForecasts = {};
    
    data.list.forEach(item => {
        const dateStr = item.dt_txt.split(' ')[0]; 
        
        if (!dailyForecasts[dateStr]) {
            dailyForecasts[dateStr] = {
                dt: item.dt,
                weather: item.weather, 
                temp_max: item.main.temp_max,
                temp_min: item.main.temp_min
            };
        } else {
            if (item.main.temp_max > dailyForecasts[dateStr].temp_max) {
                dailyForecasts[dateStr].temp_max = item.main.temp_max;
            }
            if (item.main.temp_min < dailyForecasts[dateStr].temp_min) {
                dailyForecasts[dateStr].temp_min = item.main.temp_min;
            }
            if (item.dt_txt.includes("12:00:00")) {
                dailyForecasts[dateStr].weather = item.weather;
            }
        }
    });

    const dailyData = Object.values(dailyForecasts).slice(0, 5);

    dailyData.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        const iconUrl = getWeatherIcon(day.weather[0]?.description || '');
        
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML = `
            <h4>${date}</h4>
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 15px 0;">
                <img src="${iconUrl}" alt="Weather Icon" style="width: 50px; height: auto;">
                <span style="font-size: 0.9rem; text-transform: capitalize; color: var(--text-dim); text-align: left;">
                    ${day.weather[0]?.description || 'Unknown'}
                </span>
            </div>
            <p><strong>${Math.round(day.temp_max)}°</strong> / ${Math.round(day.temp_min)}°</p>
        `;
        forecastContainer.appendChild(card);
    });

    renderForecastTable(dailyData, forecastSection || forecastContainer.parentElement);
};

// 6. HTML Table Requirement: رسم جدول الحرارة 
const renderForecastTable = (dailyData, container) => {
    if (!container) return; 

    const oldTable = container.querySelector('.forecast-table');
    if (oldTable) oldTable.remove();

    const table = document.createElement('table');
    table.className = 'forecast-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Icon</th>
                <th>Condition</th>
                <th>High</th>
                <th>Low</th>
            </tr>
        </thead>
        <tbody>
            ${dailyData.map(day => {
                const iconUrl = getWeatherIcon(day.weather[0]?.description || '');
                const dayName = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
                const fullDate = new Date(day.dt * 1000).toLocaleDateString();

                return `
                <tr>
                    <td style="font-weight: bold; color: var(--accent-color);">${dayName}</td>
                    <td>${fullDate}</td>
                    <td>
                        <img src="${iconUrl}" alt="Icon" style="width: 40px; height: auto; filter: drop-shadow(0 0 5px rgba(56, 189, 248, 0.4));">
                    </td>
                    <td style="text-transform: capitalize;">${day.weather[0]?.description || 'N/A'}</td>
                    <td>${Math.round(day.temp_max)}°C</td>
                    <td>${Math.round(day.temp_min)}°C</td>
                </tr>
                `;
            }).join('')}
        </tbody>
    `;
    container.appendChild(table);
};

// 7. PHP Integration: حفظ مدينة جديدة
const saveCityToHistory = async (city) => {
    try {
        await fetch('api/save_city.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `city=${encodeURIComponent(city)}`
        });
        updateSidebar(); 
    } catch (err) {
        console.warn("Could not save to history.");
    }
};

// 8. PHP Integration: جلب السجل للقائمة الجانبية
const updateSidebar = async () => {
    try {
        const response = await fetch('api/get_history.php');
        if (!response.ok) return;
        
        const history = await response.json();
        const sidebarContainer = document.getElementById('saved-cities');
        
        if (sidebarContainer && history && history.length > 0) {
            sidebarContainer.innerHTML = history.map(item => `
                <div class="saved-city" onclick="fetchWeatherData('${item.city_name}')">
                    ${item.city_name}
                </div>
            `).join('');
        }
    } catch (error) {
        console.warn("Could not load history. Make sure PHP is running.");
    }
};

// 10. Dark/Light Mode Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'light') {
    body.classList.add('light-mode');
    themeToggle.innerHTML = '🌙 Dark Mode';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
        themeToggle.innerHTML = '🌙 Dark Mode';
    } else {
        localStorage.setItem('theme', 'dark');
        themeToggle.innerHTML = '☀️ Light Mode';
    }
});

window.onload = updateSidebar;