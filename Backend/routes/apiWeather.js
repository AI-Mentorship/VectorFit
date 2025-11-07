// services/weatherService.js

// Import axios - this is the tool we use to make HTTP requests (fetch data from other servers)
const axios = require('axios');

// Create a function that gets weather data based on user's location
// "async" means this function will wait for responses before continuing
const getWeatherData = async (latitude, longitude) => {
  
  // "try" block - we attempt to fetch data here. If it fails, we jump to "catch" block
  try {
    
    // Use axios to make a GET request to the weather API
    // "await" means: pause here and wait for the response before moving on
    const response = await axios.get('YOUR_API_ENDPOINT_HERE', {
      
      // "params" are the extra info we send with our request
      // These get added to the URL like: ?lat=32.5&lon=-96.8
      params: {
        lat: latitude,        // User's latitude (north/south position)
        lon: longitude,       // User's longitude (east/west position)
        // Add other params as needed (like API key, units, etc.)
      }
    });

    // If we successfully got data, return it with success: true
    return {
      success: true,           // Flag to tell us everything worked
      data: response.data      // The actual weather data from the API
    };
    
  // "catch" block - this runs if anything goes wrong in the "try" block
  } catch (error) {
    
    // Log the error to the console so we can see what went wrong
    console.error('Weather API Error:', error.message);
    
    // Return an error response instead of crashing
    return {
      success: false,          // Flag to tell us something went wrong
      error: error.message     // Description of what went wrong
    };
  }
};

// Export the function so other files can use it
// Other files will do: const { getWeatherData } = require('./weatherService');
module.exports = { getWeatherData }; 