
const apiKey = '45799881bfd27e41a5e85bf53e20bc81';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

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
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

function updateWeatherUI(data) {
  cityName.textContent = data.name;
  temperature.textContent = `Temperature: ${Math.round(data.main.temp)}°C`;
  weatherDescription.textContent = `Description: ${data.weather[0].description}`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} km/h`;
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
    
    const weatherData = await getWeatherData(city);
    updateWeatherUI(weatherData);
  } catch (error) {
    alert('Error fetching weather data. Please check the city name and try again.');
    console.error('Weather fetch error:', error);
  }
}

// Event listeners
searchBtn.addEventListener('click', handleSearch);

// Allow searching by pressing Enter key
cityInput.addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    handleSearch();
  }
});

// Initialize with default message
document.addEventListener('DOMContentLoaded', function() {
  cityName.textContent = 'Enter a city name to get weather information';
});
