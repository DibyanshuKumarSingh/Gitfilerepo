
const latitude = 52.52;
const longitude = 13.41;


const API_URL =
  `https://api.open-meteo.com/v1/forecast` +

  `?latitude=${latitude}` +
  `&longitude=${longitude}` +

  `&current=` +
  `temperature_2m,` +
  `relative_humidity_2m,` +
  `apparent_temperature,` +
  `wind_speed_10m,` +
  `weather_code` +

  `&hourly=precipitation_probability` +

  `&daily=sunrise,sunset` +

  `&timezone=auto` +

  `&forecast_days=1`;


const weatherInfo = {

  0: ["☀️", "Clear sky"],
  1: ["🌤️", "Mainly clear"],
  2: ["⛅", "Partly cloudy"],
  3: ["☁️", "Overcast"],

  45: ["🌫️", "Fog"],
  48: ["🌫️", "Rime fog"],

  51: ["🌦️", "Light drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌧️", "Heavy drizzle"],

  61: ["🌧️", "Light rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy rain"],

  71: ["🌨️", "Light snow"],
  73: ["❄️", "Snow"],
  75: ["❄️", "Heavy snow"],

  80: ["🌦️", "Rain showers"],
  81: ["🌦️", "Rain showers"],
  82: ["⛈️", "Heavy showers"],

  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm + hail"],
  99: ["⛈️", "Heavy thunderstorm"]

};


async function loadWeather() {

  try {

    const response =
      await fetch(API_URL);

    const data =
      await response.json();


    const current =
      data.current;


    /* Temperature */

    document.getElementById(
      "temperature"
    ).textContent =
      Math.round(
        current.temperature_2m
      );


    /* Feels Like */

    document.getElementById(
      "feels"
    ).textContent =
      `${Math.round(
        current.apparent_temperature
      )}°C`;


    /* Humidity */

    document.getElementById(
      "humidity"
    ).textContent =
      `${current.relative_humidity_2m}%`;


    /* Wind */

    document.getElementById(
      "wind"
    ).textContent =
      `${Math.round(
        current.wind_speed_10m
      )} km/h`;


    /* Weather */

    const info =
      weatherInfo[
        current.weather_code
      ] ||
      ["🌤️", "Unknown"];


    document.getElementById(
      "weatherIcon"
    ).textContent =
      info[0];


    document.getElementById(
      "description"
    ).textContent =
      info[1];


    /* Location */

    document.getElementById(
      "location"
    ).textContent =
      data.timezone
        .replaceAll("_", " ");


    /* Sunrise */

    document.getElementById(
      "sunrise"
    ).textContent =
      formatTime(
        data.daily.sunrise[0]
      );


    /* Sunset */

    document.getElementById(
      "sunset"
    ).textContent =
      formatTime(
        data.daily.sunset[0]
      );


    /* Rain */

    const hour =
      new Date(current.time)
        .getHours();


    const index =
      data.hourly.time.findIndex(
        time =>
          new Date(time)
            .getHours() === hour
      );


    if (index >= 0) {

      document.getElementById(
        "rain"
      ).textContent =
        `${data.hourly
          .precipitation_probability[index]
          ?? 0}%`;

    }

  }

  catch (error) {

    console.error(
      "Weather error:",
      error
    );

  }

}


function formatTime(value) {

  return new Date(value)
    .toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

}


/* ================= CLOCK ================= */

function updateClock() {

  const now =
    new Date();


  document.getElementById(
    "time"
  ).textContent =
    now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }
    );


  document.getElementById(
    "date"
  ).textContent =
    now.toLocaleDateString(
      [],
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

}


loadWeather();

updateClock();


setInterval(
  updateClock,
  1000
);


setInterval(
  loadWeather,
  10 * 60 * 1000
);

