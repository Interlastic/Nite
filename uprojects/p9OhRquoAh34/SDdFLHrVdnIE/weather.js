const weatherData = {
    city: 'San Francisco',
    current: { temp: 72, desc: 'Partly Cloudy', high: 78, low: 65, icon: 'partly-cloudy' },
    hourly: [
        { time: 'Now', temp: 72, icon: 'partly-cloudy' },
        { time: '1PM', temp: 74, icon: 'sunny' },
        { time: '2PM', temp: 76, icon: 'sunny' },
        { time: '3PM', temp: 78, icon: 'sunny' },
        { time: '4PM', temp: 77, icon: 'partly-cloudy' },
        { time: '5PM', temp: 75, icon: 'partly-cloudy' },
        { time: '6PM', temp: 73, icon: 'cloudy' },
        { time: '7PM', temp: 70, icon: 'cloudy' }
    ],
    daily: [
        { day: 'Today', high: 78, low: 65, icon: 'partly-cloudy' },
        { day: 'Tomorrow', high: 75, low: 62, icon: 'sunny' },
        { day: 'Wednesday', high: 71, low: 58, icon: 'cloudy' },
        { day: 'Thursday', high: 68, low: 55, icon: 'rainy' },
        { day: 'Friday', high: 70, low: 57, icon: 'partly-cloudy' },
        { day: 'Saturday', high: 73, low: 60, icon: 'sunny' },
        { day: 'Sunday', high: 75, low: 62, icon: 'sunny' }
    ]
};

const weatherIcons = {
    'sunny': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    'partly-cloudy': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="currentColor"/><path d="M4 22h14c2.21 0 4-1.79 4-4 0-2.05-1.53-3.76-3.56-3.97C17.5 11.13 15.22 9 12.5 9c-2.25 0-4.19 1.39-5.03 3.39C4.79 12.77 2.5 15.13 2.5 18c0 2.21 1.79 4 4 4z" fill="rgba(255,255,255,0.7)"/></svg>',
    'cloudy': '<svg viewBox="0 0 24 24"><path d="M4 22h14c2.21 0 4-1.79 4-4 0-2.05-1.53-3.76-3.56-3.97C17.5 11.13 15.22 9 12.5 9c-2.25 0-4.19 1.39-5.03 3.39C4.79 12.77 2.5 15.13 2.5 18c0 2.21 1.79 4 4 4z" fill="currentColor"/></svg>',
    'rainy': '<svg viewBox="0 0 24 24"><path d="M4 18h14c2.21 0 4-1.79 4-4 0-2.05-1.53-3.76-3.56-3.97C17.5 7.13 15.22 5 12.5 5c-2.25 0-4.19 1.39-5.03 3.39C4.79 8.77 2.5 11.13 2.5 14c0 2.21 1.79 4 4 4z" fill="currentColor"/><path d="M8 20l-2 4m4-4l-2 4m4-4l-2 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

document.addEventListener('DOMContentLoaded', () => {
    loadWeather();
});

function loadWeather() {
    // Set current weather
    document.getElementById('weather-city').textContent = weatherData.city;
    document.getElementById('current-temp').textContent = weatherData.current.temp + '°';
    document.getElementById('current-desc').textContent = weatherData.current.desc;
    document.getElementById('temp-high').textContent = 'H:' + weatherData.current.high + '°';
    document.getElementById('temp-low').textContent = 'L:' + weatherData.current.low + '°';
    
    // Set hourly forecast
    const hourlyContainer = document.getElementById('hourly-forecast');
    hourlyContainer.innerHTML = '<div class="forecast-label">HOURLY FORECAST</div>';
    weatherData.hourly.forEach(hour => {
        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.innerHTML = `
            <span class="hourly-time">${hour.time}</span>
            <div class="hourly-icon">${weatherIcons[hour.icon]}</div>
            <span class="hourly-temp">${hour.temp}°</span>
        `;
        hourlyContainer.appendChild(item);
    });
    
    // Set daily forecast
    const dailyContainer = document.getElementById('daily-forecast');
    dailyContainer.innerHTML = '<div class="forecast-label">10-DAY FORECAST</div>';
    weatherData.daily.forEach(day => {
        const item = document.createElement('div');
        item.className = 'daily-item';
        item.innerHTML = `
            <span class="daily-day">${day.day}</span>
            <div class="daily-icon">${weatherIcons[day.icon]}</div>
            <div class="daily-temps">
                <span class="daily-high">${day.high}°</span>
                <span class="daily-low">${day.low}°</span>
            </div>
        `;
        dailyContainer.appendChild(item);
    });
}

function closeApp() {
    window.location.href = 'index.html';
}