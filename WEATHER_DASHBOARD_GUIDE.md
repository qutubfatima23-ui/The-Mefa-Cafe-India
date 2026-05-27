# Weather Dashboard Guide

A comprehensive weather dashboard that fetches real-time weather data from OpenWeatherMap API and displays it beautifully for your Mefa Cafe India application.

## Features

✨ **Key Features:**
- 🌤️ Real-time weather data for any city worldwide
- 📍 Geolocation support to fetch weather for user's location
- 📅 5-day weather forecast with hourly data
- 💨 Detailed weather metrics (humidity, wind speed, pressure, visibility, etc.)
- 🎨 Beautiful, responsive UI with gradient design
- 📱 Mobile-friendly interface
- ⚡ Fast API endpoints with error handling
- 🔄 Automatic weather refresh for current location

## Getting Started

### 1. Get OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API Key

### 2. Setup Environment Variables

Update your `.env` file:

```bash
WEATHER_API_KEY=your_api_key_from_openweathermap
PORT=3000
NODE_ENV=development
```

### 3. Install Dependencies

```bash
npm install axios cors dotenv express
```

### 4. Run the Server

```bash
npm start
```

### 5. Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000/weather
```

## API Endpoints

### Get Current Weather

**Endpoint:** `GET /api/weather/current/:city`

**Example:**
```bash
curl http://localhost:3000/api/weather/current/New Delhi
```

**Response:**
```json
{
  "city": "New Delhi",
  "country": "IN",
  "temperature": 28.5,
  "feelsLike": 32.1,
  "humidity": 65,
  "pressure": 1013,
  "description": "scattered clouds",
  "icon": "03d",
  "windSpeed": 5.2,
  "cloudiness": 40,
  "visibility": 10000,
  "sunrise": "2026-05-24T05:30:00Z",
  "sunset": "2026-05-24T19:15:00Z",
  "timezone": 19800
}
```

### Get 5-Day Forecast

**Endpoint:** `GET /api/weather/forecast/:city`

**Example:**
```bash
curl http://localhost:3000/api/weather/forecast/London
```

### Get Weather by Coordinates

**Endpoint:** `GET /api/weather/coords?lat=latitude&lon=longitude`

**Example:**
```bash
curl "http://localhost:3000/api/weather/coords?lat=28.6139&lon=77.2090"
```

### Get Multiple Cities Weather

**Endpoint:** `POST /api/weather/multiple`

**Request Body:**
```json
{
  "cities": ["New Delhi", "Mumbai", "London", "Tokyo"]
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/weather/multiple \
  -H "Content-Type: application/json" \
  -d '{"cities": ["New Delhi", "Mumbai", "London"]}'
```

## Frontend Usage

### JavaScript API

```javascript
// Search for weather by city name
async function searchCity(cityName) {
  const response = await fetch(`/api/weather/current/${cityName}`);
  const data = await response.json();
  console.log(data);
}

// Get weather using geolocation
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    const response = await fetch(
      `/api/weather/coords?lat=${latitude}&lon=${longitude}`
    );
    const data = await response.json();
    console.log(data);
  });
}

// Fetch multiple cities at once
async function getMultipleCities(cities) {
  const response = await fetch('/api/weather/multiple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cities })
  });
  const data = await response.json();
  console.log(data);
}
```

## Customization

### Change Temperature Unit

The dashboard currently uses Celsius (metric). To change to Fahrenheit:

**Backend (routes/weather.js):**
```javascript
units: 'imperial'  // Change from 'metric' to 'imperial'
```

**Frontend (public/weather-dashboard.html):**
```javascript
document.getElementById('temperature').textContent = `${Math.round(data.temperature)}°F`;
```

### Add More Weather Icons

Expand the `getWeatherIcon()` function in the HTML file:

```javascript
function getWeatherIcon(iconCode) {
  const iconMap = {
    '01d': '☀️', '01n': '🌙',
    // Add more icon mappings here
  };
  return iconMap[iconCode] || '🌤️';
}
```

### Integrate with Cafe Operations

**Example: Show weather-appropriate menu items**

```javascript
// If temperature > 30°C, highlight cold beverages
if (weatherData.temperature > 30) {
  highlightMenu('cold-drinks', 'hot-items');
}

// If rain expected, suggest delivery options
if (weatherData.description.includes('rain')) {
  promoteDeliveryService();
}
```

## Error Handling

The dashboard includes comprehensive error handling:

- **City not found:** Shows user-friendly error message
- **Invalid API key:** Displays configuration error
- **Network issues:** Retries and shows offline message
- **Geolocation denied:** Allows manual city input

## Performance Optimization

### Caching Strategy

```javascript
const weatherCache = new Map();

async function getCachedWeather(city) {
  const now = Date.now();
  const cached = weatherCache.get(city);
  
  // Return cached data if less than 10 minutes old
  if (cached && now - cached.timestamp < 600000) {
    return cached.data;
  }
  
  const data = await fetch(`/api/weather/current/${city}`);
  weatherCache.set(city, { data, timestamp: now });
  return data;
}
```

### Reduce API Calls

- Use forecast endpoint once for 5-day data
- Cache results for repeated searches
- Batch multiple cities into single request

## Security

### Best Practices

1. **Protect API Key:**
   ```bash
   # Never commit .env file
   echo ".env" >> .gitignore
   ```

2. **Rate Limiting:**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   
   app.use('/api/weather/', limiter);
   ```

3. **Input Validation:**
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   router.post('/multiple', [
     body('cities').isArray().notEmpty()
   ], (req, res) => {
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }
     // Process request
   });
   ```

## Integration with Mefa Cafe Menu

Add weather-based recommendations:

```html
<div id="weather-recommendations">
  <h3>Weather-Based Suggestions</h3>
  <div id="recommendations-list"></div>
</div>
```

```javascript
function updateRecommendations(weatherData) {
  const recommendations = document.getElementById('recommendations-list');
  
  if (weatherData.temperature > 30) {
    recommendations.innerHTML = `
      <p>☀️ Hot weather outside! Try our cold beverages and ice creams</p>
    `;
  } else if (weatherData.description.includes('rain')) {
    recommendations.innerHTML = `
      <p>🌧️ Rainy weather? Get hot beverages and comfort food delivered!</p>
    `;
  }
}
```

## Troubleshooting

### Issue: "Invalid API key"
**Solution:** Verify your WEATHER_API_KEY in .env file

### Issue: "City not found"
**Solution:** Check city name spelling and format

### Issue: Geolocation not working
**Solution:** 
- Enable HTTPS (required by browsers)
- Check browser permissions
- Allow location access when prompted

### Issue: Slow API responses
**Solution:**
- Implement caching
- Use rate limiting
- Consider upgrading API plan

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

## File Structure

```
├── routes/
│   └── weather.js              # Weather API routes
├── public/
│   └── weather-dashboard.html  # Frontend dashboard
├── server.js                   # Main server file
├── .env.example               # Environment variables template
└── WEATHER_DASHBOARD_GUIDE.md # This file
```

## OpenWeatherMap API Limits

**Free Tier:**
- 1,000 calls/day
- 5-day forecast available
- Updates every 10 minutes
- 60 calls/minute limit

**Upgrade for higher limits:**
- 50,000 calls/day
- 16-day forecast
- Real-time updates
- Dedicated support

## Future Enhancements

- [ ] Add hourly forecast view
- [ ] Implement air quality index (AQI)
- [ ] Weather alerts and warnings
- [ ] Historical weather data
- [ ] Multiple location tracking
- [ ] Weather comparison tool
- [ ] Advanced charts and analytics
- [ ] Mobile app version

## Support and Resources

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [OpenWeatherMap FAQ](https://openweathermap.org/faq)
- [Weather Icons Guide](https://openweathermap.org/weather-conditions)

## License

This dashboard is part of the Mefa Cafe India project.

---

**Last Updated:** May 24, 2026
**Version:** 1.0.0
