// ----------------------
// Weather app + Favorites (combined final app2.js)
// - preserves your existing API/UI code behavior
// - adds Celsius/Fahrenheit console buttons
// - adds Favorites feature (localStorage) and creates UI if missing
// ----------------------

// ---------- Existing API/UI code (kept intact) ----------
const apiKey = '45799881bfd27e41a5e85bf53e20bc81';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name'); // DOM element
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

async function getWeatherData(city) {
  try {
    const response = await fetch(`${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

async function getForecastData(city) {
  try {
    const response = await fetch(`${forecastApiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    throw error;
  }
}

function getWeatherIcon(weatherMain) {
  const iconMap = {
    'Clear': '☀️', 'Clouds': '☁️', 'Rain': '🌧️', 'Drizzle': '🌦️',
    'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Fog': '🌫️', 'Haze': '🌫️'
  };
  return iconMap[weatherMain] || '🌤️';
}

function updateWeatherUI(data) {
  if (!data || !data.name) return;
  cityName.textContent = data.name;
  temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
  weatherDescription.textContent = `Description: ${data.weather[0].description}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;
}

function updateForecastUI(forecastData) {
  if (!forecastData || !forecastData.list) return;

  const dailyData = {};
  forecastData.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = { temps: [], weather: [], humidity: [], wind: [] };
    }
    dailyData[date].temps.push(item.main.temp);
    dailyData[date].weather.push(item.weather[0]);
    dailyData[date].humidity.push(item.main.humidity);
    dailyData[date].wind.push(item.wind.speed);
  });

  const dates = Object.keys(dailyData).slice(0, 3);

  dates.forEach((date, index) => {
    const dayNum = index + 1;
    const dayData = dailyData[date];
    const maxTemp = Math.max(...dayData.temps);
    const minTemp = Math.min(...dayData.temps);
    const avgHumidity = dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length;
    const avgWind = dayData.wind.reduce((a, b) => a + b, 0) / dayData.wind.length;

    const weatherCounts = {};
    dayData.weather.forEach(w => {
      weatherCounts[w.main] = (weatherCounts[w.main] || 0) + 1;
    });
    const mostCommonWeather = Object.keys(weatherCounts).reduce((a, b) =>
      weatherCounts[a] > weatherCounts[b] ? a : b
    );

    const weatherDescriptionText = dayData.weather.find(w => w.main === mostCommonWeather).description;

    const nameEl = document.getElementById(`day-${dayNum}-name`);
    const dateEl = document.getElementById(`day-${dayNum}-date`);
    const iconEl = document.getElementById(`day-${dayNum}-icon`);
    const highEl = document.getElementById(`day-${dayNum}-high`);
    const lowEl = document.getElementById(`day-${dayNum}-low`);
    const descEl = document.getElementById(`day-${dayNum}-description`);
    const humEl = document.getElementById(`day-${dayNum}-humidity`);
    const windEl = document.getElementById(`day-${dayNum}-wind`);

    if (nameEl) nameEl.textContent = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    if (dateEl) dateEl.textContent = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (iconEl) iconEl.textContent = getWeatherIcon(mostCommonWeather);
    if (highEl) highEl.textContent = `${Math.round(maxTemp)}°C`;
    if (lowEl) lowEl.textContent = `${Math.round(minTemp)}°C`;
    if (descEl) descEl.textContent = weatherDescriptionText;
    if (humEl) humEl.textContent = `Humidity: ${Math.round(avgHumidity)}%`;
    if (windEl) windEl.textContent = `Wind: ${Math.round(avgWind)} km/h`;
  });
}

async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city name');
    return;
  }

  try {
    cityName.textContent = 'Loading...';
    temperature.textContent = 'Temperature: --°C';
    weatherDescription.textContent = 'Description: --';
    humidity.textContent = 'Humidity: --%';
    windSpeed.textContent = 'Wind Speed: -- km/h';

    for (let i = 1; i <= 3; i++) {
      const elName = document.getElementById(`day-${i}-name`);
      const elDate = document.getElementById(`day-${i}-date`);
      const elIcon = document.getElementById(`day-${i}-icon`);
      const elHigh = document.getElementById(`day-${i}-high`);
      const elLow = document.getElementById(`day-${i}-low`);
      const elDesc = document.getElementById(`day-${i}-description`);
      const elHum = document.getElementById(`day-${i}-humidity`);
      const elWind = document.getElementById(`day-${i}-wind`);

      if (elName) elName.textContent = `Day ${i}`;
      if (elDate) elDate.textContent = '--';
      if (elIcon) elIcon.textContent = '🌤️';
      if (elHigh) elHigh.textContent = '--°C';
      if (elLow) elLow.textContent = '--°C';
      if (elDesc) elDesc.textContent = '--';
      if (elHum) elHum.textContent = 'Humidity: --%';
      if (elWind) elWind.textContent = 'Wind: -- km/h';
    }

    const [weatherData, forecastData] = await Promise.all([
      getWeatherData(city),
      getForecastData(city)
    ]);

    updateWeatherUI(weatherData);
    updateForecastUI(forecastData);
  } catch (error) {
    alert('Error fetching weather data. Please check the city name and try again.');
    console.error('Weather fetch error:', error);
  }
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') handleSearch();
});

document.addEventListener('DOMContentLoaded', function () {
  cityName.textContent = 'Enter a city name to get weather information';
});

// ---------- Demo forecast + Celsius/Fahrenheit console outputs ----------
let demoForecastData = null;

// simulated location provider used for demo and favorites
function getUserLocationSim() {
  return { latitude: 40.7128, longitude: -74.0060 };
}

function generateWeatherForecast(city, latitude, longitude, days = 3) {
  const conditions = ["Sunny", "Cloudy", "Rainy", "Snowy"];
  const baseDate = new Date();
  const forecast = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);

    forecast.push({
      date: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,
      temperature_c: Number((Math.random() * 45 - 10).toFixed(1)),
      humidity: Number((Math.random() * 100).toFixed(1)),
      wind_kmh: Number((Math.random() * 20).toFixed(1)),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      latitude,
      longitude
    });
  }

  return forecast;
}

function cToF(c) {
  return (c * 9/5) + 32;
}

function printForecast(list, unit) {
  if (!Array.isArray(list)) {
    console.warn('No forecast to print.');
    return;
  }

  console.clear();
  console.log(unit === "F"
    ? "=== 3-Day Forecast (Fahrenheit) ==="
    : "=== 3-Day Forecast (Celsius) ===");

  list.forEach(day => {
    const c = day.temperature_c;
    const f = cToF(c).toFixed(1);

    console.log("----------------");
    console.log("Date:", day.date);
    console.log("Condition:", day.condition);
    console.log("Temp:", unit === "F" ? `${f}°F` : `${c}°C`);
    console.log("Humidity:", day.humidity + "%");
    console.log("Location:", `(${day.latitude}, ${day.longitude})`);
  });

  console.log("=====================\n");
}

// generate demo forecast on load and print both outputs
(function runDemo() {
  try {
    const loc = getUserLocationSim();
    demoForecastData = generateWeatherForecast("Indore", loc.latitude, loc.longitude, 3);

    // Output #1: Celsius, then Fahrenheit
    printForecast(demoForecastData, "C");
    printForecast(demoForecastData, "F");
  } catch (err) {
    console.error("Demo error:", err.message);
  }
})();

// wire console buttons (these exist in your HTML)
const showCBtn = document.getElementById("show-celsius-btn");
const showFBtn = document.getElementById("show-fahrenheit-btn");
if (showCBtn) showCBtn.addEventListener("click", () => printForecast(demoForecastData, "C"));
if (showFBtn) showFBtn.addEventListener("click", () => printForecast(demoForecastData, "F"));

// ---------- Favorites feature (Lab 14) ----------
// will create a favorites UI block if not present in HTML.
// favorites persist to localStorage and integrate with existing API functions.

let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];

// create favorites UI if missing
function ensureFavoritesUI() {
  if (document.getElementById('favorites-section')) return; // already created

  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;

  const favSection = document.createElement('div');
  favSection.id = 'favorites-section';
  favSection.className = 'favorites-section';
  favSection.innerHTML = `
    <h3>Favorite Cities</h3>
    <div class="fav-controls">
      <button id="add-favorite-btn">Add Current City to Favorites</button>
    </div>
    <ul id="favorites-list" class="favorites-list"></ul>
  `;
  // insert after the search bar
  searchBar.parentNode.insertBefore(favSection, searchBar.nextSibling);
}

// render favorites list into the UI
function renderFavorites() {
  ensureFavoritesUI();
  const list = document.getElementById('favorites-list');
  if (!list) return;
  list.innerHTML = '';

  favoriteCities.forEach(fav => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.justifyContent = 'space-between';
    li.style.alignItems = 'center';
    li.style.gap = '8px';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = fav.name;

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.gap = '6px';

    const showBtn = document.createElement('button');
    showBtn.textContent = 'Show';
    showBtn.addEventListener('click', () => {
      // fetch and update UI using existing functions
      getWeatherData(fav.name)
        .then(weather => {
          updateWeatherUI(weather);
          return getForecastData(fav.name);
        })
        .then(forecastData => updateForecastUI(forecastData))
        .catch(err => console.error('Error fetching favorite weather:', err));
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.background = '#d9534f';
    removeBtn.addEventListener('click', () => {
      favoriteCities = favoriteCities.filter(c => c.name.toLowerCase() !== fav.name.toLowerCase());
      localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
      renderFavorites();
    });

    controls.appendChild(showBtn);
    controls.appendChild(removeBtn);

    li.appendChild(nameSpan);
    li.appendChild(controls);
    list.appendChild(li);
  });
}

// add current displayed city to favorites
function addCurrentCityToFavorites() {
  // prefer displayed city; fallback to input
  const currentCity = cityName && cityName.textContent && cityName.textContent !== 'City Name'
    ? cityName.textContent
    : (cityInput.value.trim() || null);

  if (!currentCity) {
    alert('No city to add. Search a city first.');
    return;
  }

  const exists = favoriteCities.some(f => f.name.toLowerCase() === currentCity.toLowerCase());
  if (exists) {
    alert(`${currentCity} is already in favorites.`);
    return;
  }

  // optional: try to fetch coordinates via API (best effort)
  getWeatherData(currentCity)
    .then(data => {
      const lat = data.coord && data.coord.lat ? data.coord.lat : null;
      const lon = data.coord && data.coord.lon ? data.coord.lon : null;
      favoriteCities.push({ name: data.name, latitude: lat, longitude: lon });
      localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
      renderFavorites();
      alert(`${data.name} added to favorites.`);
    })
    .catch(err => {
      // if API fails, still add by name only
      favoriteCities.push({ name: currentCity, latitude: null, longitude: null });
      localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
      renderFavorites();
      alert(`${currentCity} added to favorites (without coordinates).`);
    });
}

// get weather for favorite by name (console + UI)
function getWeatherForFavoriteCity(cityNameStr) {
  const fav = favoriteCities.find(f => f.name.toLowerCase() === cityNameStr.toLowerCase());
  if (!fav) {
    console.log(`${cityNameStr} not found in favorites.`);
    return;
  }
  // prefer using API by name to get fresh data
  getWeatherData(fav.name)
    .then(weather => {
      updateWeatherUI(weather);
      return getForecastData(fav.name);
    })
    .then(forecastData => updateForecastUI(forecastData))
    .catch(err => console.error('Error fetching favorite weather:', err));
}

// wire favorites controls after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // ensure UI exists and render saved favorites
  ensureFavoritesUI();
  renderFavorites();

  const addFavBtn = document.getElementById('add-favorite-btn');
  if (addFavBtn) addFavBtn.addEventListener('click', addCurrentCityToFavorites);

  // also expose two console commands for quick testing:
  // - addFavoriteByName('City Name')
  // - showFavoriteByName('City Name')
  window.addFavoriteByName = function(name) {
    if (!name) return console.warn('Provide a city name.');
    getWeatherData(name)
      .then(data => {
        const lat = data.coord?.lat ?? null;
        const lon = data.coord?.lon ?? null;
        favoriteCities.push({ name: data.name, latitude: lat, longitude: lon });
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
        renderFavorites();
        console.log(`${data.name} added to favorites.`);
      })
      .catch(err => {
        favoriteCities.push({ name, latitude: null, longitude: null });
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
        renderFavorites();
        console.log(`${name} added to favorites (name only).`);
      });
  };

  window.showFavoriteByName = function(name) {
    if (!name) return console.warn('Provide a city name.');
    getWeatherForFavoriteCity(name);
  };
});
