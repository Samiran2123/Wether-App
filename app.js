const apiKey = '45799881bfd27e41a5e85bf53e20bc81';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');

async function getWeatherData(city) {
  try {
    const response = await fetch(`${apiUrl}?q=${city}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

async function getForecastData(city) {
  try {
    const response = await fetch(`${forecastApiUrl}?q=${city}&appid=${apiKey}&units=metric`);
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
  cityName.textContent = data.name;
  temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
  weatherDescription.textContent = `Description: ${data.weather[0].description}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;
}

function updateForecastUI(forecastData) {
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
    const weatherDescription = dayData.weather.find(w => w.main === mostCommonWeather).description;

    document.getElementById(`day-${dayNum}-name`).textContent = 
      new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById(`day-${dayNum}-date`).textContent = 
      new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    document.getElementById(`day-${dayNum}-icon`).textContent = getWeatherIcon(mostCommonWeather);
    document.getElementById(`day-${dayNum}-high`).textContent = `${Math.round(maxTemp)}°C`;
    document.getElementById(`day-${dayNum}-low`).textContent = `${Math.round(minTemp)}°C`;
    document.getElementById(`day-${dayNum}-description`).textContent = weatherDescription;
    document.getElementById(`day-${dayNum}-humidity`).textContent = `Humidity: ${Math.round(avgHumidity)}%`;
    document.getElementById(`day-${dayNum}-wind`).textContent = `Wind: ${Math.round(avgWind)} km/h`;
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
      document.getElementById(`day-${i}-name`).textContent = `Day ${i}`;
      document.getElementById(`day-${i}-date`).textContent = '--';
      document.getElementById(`day-${i}-icon`).textContent = '🌤️';
      document.getElementById(`day-${i}-high`).textContent = '--°C';
      document.getElementById(`day-${i}-low`).textContent = '--°C';
      document.getElementById(`day-${i}-description`).textContent = '--';
      document.getElementById(`day-${i}-humidity`).textContent = 'Humidity: --%';
      document.getElementById(`day-${i}-wind`).textContent = 'Wind: -- km/h';
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
cityInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') handleSearch();
});

document.addEventListener('DOMContentLoaded', function() {
  cityName.textContent = 'Enter a city name to get weather information';
});







function buildThreeDayForecast(cityName) {
  const types = ['Sunny', 'Overcast', 'Rain', 'Snow'];
  const descriptions = {
    'Sunny': ['clear skies','bright and sunny','warm sunshine'],
    'Overcast': ['cloudy','mostly cloudy','gray skies'],
    'Rain': ['light rain','showers','periods of rain'],
    'Snow': ['light snow','snow flurries','snowy']
  };

  const forecast = [];
  const dt = new Date();

  for (let i = 0; i < 3; i++) {
    const copy = new Date(dt);
    copy.setDate(dt.getDate() + i);

    const rawHigh = Math.random() * 45 - 5; // -5..40
    const rawLow = rawHigh - (Math.random() * 8 + 1); // ensure low <= high
    const humidity = (Math.random() * 100).toFixed(1);
    const wind = (Math.random() * 25).toFixed(1);

    const kind = types[Math.floor(Math.random() * types.length)];
    const descList = descriptions[kind];
    const desc = descList[Math.floor(Math.random() * descList.length)];

    forecast.push({
      city: cityName,
      date: copy.toISOString().slice(0, 10), // YYYY-MM-DD
      high: `${Number(rawHigh.toFixed(1))}°C`,
      low: `${Number(rawLow.toFixed(1))}°C`,
      condition: kind,
      description: desc,
      humidity: `${humidity}%`,
      wind_kmh: `${wind}`
    });
  }

  return forecast;
}
function fetchMockLocation() {
  return {
    lat: 40.7128,
    lon: -74.0060  
  };
}

const mockLoc = fetchMockLocation();
function createForecast(city, lat, lon) {
  if (!city || typeof city !== "string") {
    throw new Error("City name is missing or invalid.");
  }
  const states = ["Sunny", "Cloudy", "Rainy", "Snowy"];
  const data = [];
  let d = new Date();
  for (let i = 0; i < 3; i++) {
    const entry = {
      date: `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`,
      temperature: (Math.random() * 40 - 5).toFixed(1),
      condition: states[Math.floor(Math.random() * states.length)],
      humidity: (Math.random() * 100).toFixed(1),
      windSpeed: (Math.random() * 20).toFixed(1),
      lat,
      lon,
    };
    data.push(entry);
    d.setDate(d.getDate() + 1);
  }
  return data;}
function iconForWeather(condition) {
  const key = condition.toLowerCase();
  if (key === "sunny") return "☀️";
  if (key === "cloudy") return "☁️";
  if (key === "rainy") return "🌧️";
  if (key === "snowy") return "❄️";
  return "🌤️"; 
}
forecast.forEach(day => {
  const icon = iconForWeather(day.condition);
  console.log("-------------------------------");
  console.log(`Date: ${day.date}`);
  console.log(`Condition: ${day.condition}  ${icon}`);
  console.log(`Temperature: ${day.temperature}°C`);
  console.log(`Humidity: ${day.humidity}%`);
  console.log(`Location: (${day.lat}, ${day.lon})`);
});
