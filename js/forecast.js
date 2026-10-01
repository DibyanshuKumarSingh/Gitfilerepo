
const latitude = 52.52;
const longitude = 13.41;


const API_URL =
  `https://api.open-meteo.com/v1/forecast` +

  `?latitude=${latitude}` +
  `&longitude=${longitude}` +

  `&hourly=` +
  `temperature_2m,` +
  `weather_code,` +
  `precipitation_probability,` +
  `wind_speed_10m` +

  `&daily=` +
  `weather_code,` +
  `temperature_2m_max,` +
  `temperature_2m_min,` +
  `precipitation_probability_max,` +
  `wind_speed_10m_max` +

  `&timezone=auto` +

  `&forecast_days=7`;


const weatherIcons = {

  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",

  45: "🌫️",
  48: "🌫️",

  51: "🌦️",
  53: "🌦️",
  55: "🌧️",

  61: "🌧️",
  63: "🌧️",
  65: "🌧️",

  71: "🌨️",
  73: "❄️",
  75: "❄️",

  80: "🌦️",
  81: "🌦️",
  82: "⛈️",

  95: "⛈️",
  96: "⛈️",
  99: "⛈️"

};


async function loadForecast() {

  try {

    const response =
      await fetch(API_URL);

    const data =
      await response.json();


    document.getElementById(
      "location"
    ).textContent =
      data.timezone
        .replaceAll("_", " ");


    createHourly(
      data.hourly
    );


    createDaily(
      data.daily
    );

  }

  catch (error) {

    console.error(
      "Forecast Error:",
      error
    );

  }

}


/* ================= HOURLY ================= */

function createHourly(hourly) {

  const container =
    document.getElementById(
      "hourly"
    );


  container.innerHTML = "";


  const now =
    new Date();


  let startIndex =
    hourly.time.findIndex(
      time =>
        new Date(time) >= now
    );


  if (startIndex < 0) {
    startIndex = 0;
  }


  const endIndex =
    Math.min(
      startIndex + 24,
      hourly.time.length
    );


  for (
    let i = startIndex;
    i < endIndex;
    i++
  ) {

    const date =
      new Date(
        hourly.time[i]
      );


    const card =
      document.createElement(
        "div"
      );


    card.className =
      "hour-card";


    card.innerHTML = `

      <div class="hour">
        ${date.toLocaleTimeString(
          [],
          {
            hour: "numeric"
          }
        )}
      </div>

      <div class="icon">
        ${
          weatherIcons[
            hourly.weather_code[i]
          ] || "🌤️"
        }
      </div>

      <strong>
        ${Math.round(
          hourly.temperature_2m[i]
        )}°
      </strong>

      <small>
        💧 ${
          hourly.precipitation_probability[i]
          ?? 0
        }%
      </small>

    `;


    container.appendChild(
      card
    );

  }

}


/* ================= DAILY ================= */

function createDaily(daily) {

  const container =
    document.getElementById(
      "daily"
    );


  container.innerHTML = "";


  for (
    let i = 0;
    i < daily.time.length;
    i++
  ) {

    const date =
      new Date(
        daily.time[i] +
        "T12:00:00"
      );


    const card =
      document.createElement(
        "div"
      );


    card.className =
      "day-card";


    card.innerHTML = `

      <div class="day">

        ${
          i === 0
            ? "Today"
            : date.toLocaleDateString(
                [],
                {
                  weekday:
                    "long"
                }
              )
        }

        <small>
          ${date.toLocaleDateString(
            [],
            {
              day: "numeric",
              month: "short"
            }
          )}
        </small>

      </div>


      <div class="day-icon">

        ${
          weatherIcons[
            daily.weather_code[i]
          ] || "🌤️"
        }

      </div>


      <div class="day-temp">

        ${Math.round(
          daily.temperature_2m_max[i]
        )}° /

        ${Math.round(
          daily.temperature_2m_min[i]
        )}°

      </div>


      <div class="day-rain">

        🌧️
        ${
          daily
            .precipitation_probability_max[i]
          ?? 0
        }%

      </div>


      <div class="day-wind">

        💨
        ${Math.round(
          daily.wind_speed_10m_max[i]
        )}
        km/h

      </div>

    `;


    container.appendChild(
      card
    );

  }

}


loadForecast();


/*
  Refresh forecast every 10 minutes.
*/

setInterval(
  loadForecast,
  10 * 60 * 1000
);

