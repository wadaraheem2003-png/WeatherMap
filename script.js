"use strict";

console.log("JavaScript is working");
console.log("Leaflet status:", typeof L);
// 1. OpenWeatherMap API key
const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your actual OpenWeatherMap API key

// 2. Get HTML elements
const weatherForm = document.getElementById("weatherForm");
const locationInput = document.getElementById("locationInput");
const searchButton = document.getElementById("searchButton");
const loading = document.getElementById("loading");
const message = document.getElementById("message");
const weatherResult = document.getElementById("weatherResult");
const shareWeatherButton = document.getElementById("shareWeatherButton");
const forecastSection = document.getElementById("forecastSection");
const forecastList = document.getElementById("forecastList");
// Favorite cities elements
const favoritesList = document.getElementById("favoritesList");
const addFavoriteButton = document.getElementById("addFavoriteButton");

// Load saved favorite cities
let favorites = [];

try {
    favorites = JSON.parse(
        localStorage.getItem("weatherMapFavorites") || "[]"
    );

    if (!Array.isArray(favorites)) {
        favorites = [];
    }
} catch (error) {
    favorites = [];
}

let currentCity = "";


// 3. Create the interactive map
const map = L.map("map").setView([15.5007, 32.5599], 6);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }
).addTo(map);

map.whenReady(() => {
    setTimeout(() => {
        map.invalidateSize(true);
    }, 500);
});

// 4. Create a marker that will show the searched location
let weatherMarker = null;

// 5. Show or hide the loading indicator
function setLoading(isLoading) {
    loading.classList.toggle("hidden", !isLoading);
    searchButton.disabled = isLoading;
    searchButton.textContent = isLoading ? "Loading..." : "Get Weather";
}

// 6. Display an error message
function showError(text) {
    message.textContent = text;
    message.classList.remove("hidden");
}

// 7. Handle the search form
weatherForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const location = locationInput.value.trim();

    if (!location) {
        showError("Please enter a city or location.");
        return;
    }

    if (API_KEY === "YOUR_OPENWEATHERMAP_API_KEY") {
        showError("Please add your OpenWeatherMap API key in script.js.");
        return;
    }

    message.classList.add("hidden");
    weatherResult.classList.add("hidden");
    shareWeatherButton.hidden = true;
    shareWeatherButton.hidden = false;
    setLoading(true);

    try {
        // 8. Find the latitude and longitude of the city
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`;

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Could not find the location. Please try again.");
        }

        const locations = await geoResponse.json();

        if (locations.length === 0) {
            throw new Error("Location not found. Check the city name.");
        }

        const place = locations[0];
        const latitude = place.lat;
        const longitude = place.lon;

        // 9. Get the current weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const weather = await weatherResponse.json();
        // Get 5-day weather forecast
const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

const forecastResponse = await fetch(forecastUrl);

if (forecastResponse.ok) {
    const forecastData = await forecastResponse.json();

    // Group forecasts by date
    const dailyForecasts = {};

    forecastData.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];

        if (!dailyForecasts[date]) {
            dailyForecasts[date] = item;
        }
    });

    // Display up to five forecast days
    forecastList.innerHTML = "";

    Object.values(dailyForecasts)
        .slice(0, 5)
        .forEach((item) => {
            const card = document.createElement("article");
            card.className = "forecast-card";

            const date = new Date(item.dt_txt)
                .toLocaleDateString("en", {
                    weekday: "short",
                    month: "short",
                    day: "numeric"
                });

            card.innerHTML = `
                <h3>${date}</h3>
                <p>${item.main.temp.toFixed(1)} °C</p>
                <p>${item.weather[0].description}</p>
            `;

            forecastList.appendChild(card);
        });

    forecastSection.classList.remove("hidden");
}

        // 10. Display the weather information
        const cityName = [place.name, place.country]
            .filter(Boolean)
            .join(", ");
        currentCity = cityName;
        addFavoriteButton.disabled = false;

        weatherResult.innerHTML = `
            <h2>${cityName}</h2>
            <p><strong>Temperature:</strong> ${weather.main.temp} °C</p>
            <p><strong>Conditions:</strong> ${weather.weather[0].description}</p>
            <p><strong>Humidity:</strong> ${weather.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${weather.wind.speed} m/s</p>
        `;

        weatherResult.classList.remove("hidden");

        // 11. Move the map to the searched location
        map.setView([latitude, longitude], 10);

        // Remove the previous marker
        if (weatherMarker) {
            map.removeLayer(weatherMarker);
        }

        // Add a marker for the new location
        weatherMarker = L.marker([latitude, longitude]).addTo(map);

        // Show weather details in the map popup
        weatherMarker.bindPopup(`
            <strong>${cityName}</strong><br>
            Temperature: ${weather.main.temp} °C<br>
            ${weather.weather[0].description}
        `).openPopup();

    } catch (error) {
        showError(error.message || "Something went wrong. Please try again.");
    } finally {
        setLoading(false);
    }
});
// Display favorite cities
function renderFavorites() {
    favoritesList.innerHTML = "";

    favorites.forEach((city) => {
        const cityButton = document.createElement("button");
        cityButton.type = "button";
        cityButton.textContent = city;
        cityButton.className = "favorite-city";

        cityButton.addEventListener("click", () => {
            locationInput.value = city;
            weatherForm.requestSubmit();
        });

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-favorite";
        removeButton.setAttribute("aria-label", `Remove ${city} from favorites`);

        removeButton.addEventListener("click", () => {
            favorites = favorites.filter((item) => item !== city);

            localStorage.setItem(
                "weatherMapFavorites",
                JSON.stringify(favorites)
            );

            renderFavorites();
        });

        const cityContainer = document.createElement("div");
        cityContainer.className = "favorite-item";
        cityContainer.append(cityButton, removeButton);

        favoritesList.appendChild(cityContainer);
    });
}

// Add the current city to favorites
addFavoriteButton.addEventListener("click", () => {
    if (!currentCity || favorites.includes(currentCity)) {
        return;
    }

    favorites.push(currentCity);

    localStorage.setItem(
        "weatherMapFavorites",
        JSON.stringify(favorites)
    );

    renderFavorites();
});

// Show saved favorites when the page opens
renderFavorites();
shareWeatherButton.addEventListener("click", async () => {
    const cityName = weatherResult.querySelector("h2")?.textContent;
    const weatherText = weatherResult.innerText;

    const shareMessage = `Weather Update for ${cityName}:\n\n${weatherText}`;

    try {
        if (navigator.share) {
            await navigator.share({
                title: "Weather Update",
                text: shareMessage
            });
        } else if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareMessage);
            alert("Weather information copied! You can now share it.");
        } else {
            window.prompt("Copy this weather update:", shareMessage);
        }
    } catch (error) {
        if (error.name !== "AbortError") {
            alert("Unable to share. Please try again.");
        }
    }
});
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const chatSendButton = document.getElementById("chatSendButton");

chatForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    const userMessage = document.createElement("p");
    userMessage.className = "user-message";
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);

    chatInput.value = "";
    chatSendButton.disabled = true;

    const botMessage = document.createElement("p");
    botMessage.className = "bot-message";
    botMessage.textContent = "Thinking...";
    chatMessages.appendChild(botMessage);

    try {
        const response = await fetch("chat.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Request failed");
        }

        botMessage.textContent = data.reply;
    } catch (error) {
        botMessage.textContent =
            "Could not connect to the chatbot. Please try again.";
        console.error("Chat error:", error);
    } finally {
        chatSendButton.disabled = false;
        chatInput.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});