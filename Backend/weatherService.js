// services/weatherService.js
import axios from 'axios';

// Your WeatherAPI key
const WEATHER_API_KEY = '2e76f5290bb24b5395b45736250711';

// Create a function that gets weather data based on user's location
export const getWeatherData = async (latitude, longitude) => {
  try {
    // Use axios to make a GET request to WeatherAPI
    const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: {
        key: WEATHER_API_KEY,
        q: `${latitude},${longitude}`,
        aqi: 'no'
      }
    });

    // Extract and format the important weather data
    const weatherData = {
      location: response.data.location.name,
      region: response.data.location.region,
      country: response.data.location.country,
      temp_f: response.data.current.temp_f,
      temp_c: response.data.current.temp_c,
      condition: response.data.current.condition.text,
      humidity: response.data.current.humidity,
      feels_like_f: response.data.current.feelslike_f,
      feels_like_c: response.data.current.feelslike_c,
      wind_mph: response.data.current.wind_mph,
      uv: response.data.current.uv
    };

    return {
      success: true,
      data: weatherData
    };
    
  } catch (error) {
    console.error('Weather API Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};