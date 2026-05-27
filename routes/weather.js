const express = require('express');
const axios = require('axios');
const router = express.Router();

// Get API key from environment variables
const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Error handler middleware
const handleWeatherError = (error, res) => {
    console.error('Weather API Error:', error.message);
    
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ 
            message: 'City not found. Please check the spelling and try again.',
            error: 'CITY_NOT_FOUND'
        });
    }
    
    if (error.response && error.response.status === 401) {
        return res.status(401).json({ 
            message: 'Invalid API key. Please check your configuration.',
            error: 'INVALID_API_KEY'
        });
    }
    
    res.status(500).json({ 
        message: 'Error fetching weather data. Please try again later.',
        error: 'API_ERROR'
    });
};

/**
 * Get current weather for a specific city
 * GET /api/weather/current/:city
 */
router.get('/current/:city', async (req, res) => {
    try {
        const { city } = req.params;
        
        if (!city || city.trim() === '') {
            return res.status(400).json({ message: 'City name is required' });
        }

        if (!API_KEY) {
            return res.status(500).json({ 
                message: 'Weather API is not configured. Please set WEATHER_API_KEY in environment variables.',
                error: 'NO_API_KEY'
            });
        }

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: city.trim(),
                appid: API_KEY,
                units: 'metric'
            }
        });

        const data = response.data;
        
        const weatherData = {
            city: data.name,
            country: data.sys.country,
            latitude: data.coord.lat,
            longitude: data.coord.lon,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            tempMin: data.main.temp_min,
            tempMax: data.main.temp_max,
            pressure: data.main.pressure,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            windDegree: data.wind.deg,
            cloudiness: data.clouds.all,
            visibility: data.visibility,
            description: data.weather[0].main.toLowerCase(),
            icon: data.weather[0].icon,
            sunrise: new Date(data.sys.sunrise * 1000),
            sunset: new Date(data.sys.sunset * 1000),
            timezone: data.timezone,
            timestamp: new Date(data.dt * 1000)
        };

        res.json(weatherData);
    } catch (error) {
        handleWeatherError(error, res);
    }
});

/**
 * Get 5-day weather forecast for a specific city
 * GET /api/weather/forecast/:city
 */
router.get('/forecast/:city', async (req, res) => {
    try {
        const { city } = req.params;
        
        if (!city || city.trim() === '') {
            return res.status(400).json({ message: 'City name is required' });
        }

        if (!API_KEY) {
            return res.status(500).json({ 
                message: 'Weather API is not configured.',
                error: 'NO_API_KEY'
            });
        }

        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                q: city.trim(),
                appid: API_KEY,
                units: 'metric',
                cnt: 40 // 5 days * 8 forecasts per day (3-hour intervals)
            }
        });

        const data = response.data;
        
        // Process forecast data - get one forecast per day (first entry of each day)
        const forecastsByDay = {};
        
        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toDateString();
            
            // Only store the first forecast of each day
            if (!forecastsByDay[dayKey]) {
                forecastsByDay[dayKey] = {
                    date: dayKey,
                    timestamp: forecast.dt,
                    temp: forecast.main.temp,
                    feelsLike: forecast.main.feels_like,
                    tempMin: forecast.main.temp_min,
                    tempMax: forecast.main.temp_max,
                    pressure: forecast.main.pressure,
                    humidity: forecast.main.humidity,
                    windSpeed: forecast.wind.speed,
                    cloudiness: forecast.clouds.all,
                    description: forecast.weather[0].main.toLowerCase(),
                    icon: forecast.weather[0].icon,
                    visibility: forecast.visibility,
                    rainy: forecast.rain ? forecast.rain['3h'] : 0
                };
            }
        });

        const forecast = Object.values(forecastsByDay).slice(0, 5);

        res.json({
            city: data.city.name,
            country: data.city.country,
            forecast: forecast
        });
    } catch (error) {
        handleWeatherError(error, res);
    }
});

/**
 * Get weather by geographic coordinates
 * GET /api/weather/coords?lat=latitude&lon=longitude
 */
router.get('/coords', async (req, res) => {
    try {
        const { lat, lon } = req.query;
        
        if (!lat || !lon) {
            return res.status(400).json({ 
                message: 'Latitude and longitude parameters are required' 
            });
        }

        if (!API_KEY) {
            return res.status(500).json({ 
                message: 'Weather API is not configured.',
                error: 'NO_API_KEY'
            });
        }

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                appid: API_KEY,
                units: 'metric'
            }
        });

        const data = response.data;
        
        const weatherData = {
            city: data.name,
            country: data.sys.country,
            latitude: data.coord.lat,
            longitude: data.coord.lon,
            temperature: data.main.temp,
            feelsLike: data.main.feels_like,
            tempMin: data.main.temp_min,
            tempMax: data.main.temp_max,
            pressure: data.main.pressure,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            windDegree: data.wind.deg,
            cloudiness: data.clouds.all,
            visibility: data.visibility,
            description: data.weather[0].main.toLowerCase(),
            icon: data.weather[0].icon,
            sunrise: new Date(data.sys.sunrise * 1000),
            sunset: new Date(data.sys.sunset * 1000),
            timezone: data.timezone,
            timestamp: new Date(data.dt * 1000)
        };

        res.json(weatherData);
    } catch (error) {
        handleWeatherError(error, res);
    }
});

/**
 * Get weather for multiple cities
 * POST /api/weather/multiple
 * Body: { cities: ['city1', 'city2', ...] }
 */
router.post('/multiple', async (req, res) => {
    try {
        const { cities } = req.body;
        
        if (!cities || !Array.isArray(cities) || cities.length === 0) {
            return res.status(400).json({ 
                message: 'Request body must contain an array of city names' 
            });
        }

        if (!API_KEY) {
            return res.status(500).json({ 
                message: 'Weather API is not configured.',
                error: 'NO_API_KEY'
            });
        }

        // Fetch weather for all cities in parallel
        const weatherPromises = cities.map(city =>
            axios.get(`${BASE_URL}/weather`, {
                params: {
                    q: city.trim(),
                    appid: API_KEY,
                    units: 'metric'
                }
            }).then(response => {
                const data = response.data;
                return {
                    city: data.name,
                    country: data.sys.country,
                    latitude: data.coord.lat,
                    longitude: data.coord.lon,
                    temperature: data.main.temp,
                    feelsLike: data.main.feels_like,
                    humidity: data.main.humidity,
                    description: data.weather[0].main.toLowerCase(),
                    icon: data.weather[0].icon,
                    windSpeed: data.wind.speed
                };
            }).catch(error => {
                return {
                    city: city,
                    error: 'City not found'
                };
            })
        );

        const results = await Promise.all(weatherPromises);
        
        res.json({
            count: results.length,
            data: results
        });
    } catch (error) {
        handleWeatherError(error, res);
    }
});

module.exports = router;
