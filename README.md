# WeatherMap SPA

## Project Overview

WeatherMap is a Single Page Application (SPA) that lets users search for cities, view current weather, explore an interactive map, save favorite cities, share weather details, and view a five-day forecast.

## Links

- *Repository:* https://github.com/wadaraheem2003-png/WeatherMap
- *Live Demo:* https://wadaraheem2003-png.github.io/weathermap/

> Note: The live demo is hosted on GitHub Pages, which serves static files only. PHP features (such as the AI assistant) require a local PHP server such as XAMPP.

## Features

- Search for cities and view current weather.
- Interactive map using Leaflet and OpenStreetMap.
- Display temperature, weather conditions, humidity, and wind speed.
- Save favorite cities using localStorage.
- Share weather information.
- View a five-day weather forecast.
- Optional AI weather assistant (PHP backend).
- Loading and error states.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Fetch API
- Leaflet
- OpenStreetMap
- OpenWeatherMap API
- PHP (optional AI assistant backend)

## Project Structure


WeatherMap/
├── index.html
├── style.css
├── script.js
├── chat.php
├── config.php          (not included in the repository)


## How to Run

1. Install and start XAMPP.
2. Place the project folder inside C:\xampp\htdocs.
3. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api).
4. Create a file named config.php in the project folder (or copy config.example.php) and add your key:
   php
   <?php
   define('OPENWEATHER_API_KEY', 'YOUR_KEY_HERE');
   
5. Start Apache from the XAMPP Control Panel.
6. Open http://localhost/WeatherMap/ in your browser.

## Security Note

API secrets are stored on the server in config.php, which is excluded from the repository via .gitignore. Never commit API keys to a public repository.

## Author

Student Project – Advanced Web Technologies