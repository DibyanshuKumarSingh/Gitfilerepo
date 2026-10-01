/* =====================================================
   WEATHER APP
   Open-Meteo + Browser Geolocation
===================================================== */


/* =====================================================
   GLOBAL DATA
===================================================== */

let latitude = null;
let longitude = null;

let locationTimezone = null;

let sunriseTime = null;
let sunsetTime = null;


/* =====================================================
   WEATHER CODES
===================================================== */

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


/* =====================================================
   HTML ELEMENTS
===================================================== */

const temperature =
  document.getElementById("temperature");

const humidity =
  document.getElementById("humidity");

const wind =
  document.getElementById("wind");

const feelsLike =
  document.getElementById("feelsLike");

const rainChance =
  document.getElementById("rainChance");

const weatherIcon =
  document.getElementById("weatherIcon");

const weatherDescription =
  document.getElementById("weatherDescription");

const locationElement =
  document.getElementById("location");

const sunriseElement =
  document.getElementById("sunrise");

const sunsetElement =
  document.getElementById("sunset");

const currentTime =
  document.getElementById("currentTime");

const currentDate =
  document.getElementById("currentDate");

const sun =
  document.getElementById("sun");

const sunMarker =
  document.getElementById("sunMarker");

const sunProgress =
  document.getElementById("sunProgress");

const sky =
  document.getElementById("sky");


/* =====================================================
   GET PRECISE LOCATION
===================================================== */

function getUserLocation() {

  if (!navigator.geolocation) {

    console.error(
      "Geolocation is not supported."
    );

    return;

  }


  navigator.geolocation.getCurrentPosition(

    async (position) => {

      latitude =
        position.coords.latitude;

      longitude =
        position.coords.longitude;


      console.log(
        "Latitude:",
        latitude
      );

      console.log(
        "Longitude:",
        longitude
      );


      await loadWeather();

    },


    (error) => {

      console.error(
        "Location Error:",
        error.message
      );


      /*
        Fallback:
        Ranchi, Jharkhand
      */

      latitude = 23.3441;

      longitude = 85.3096;


      loadWeather();

    },


    {
      enableHighAccuracy: true,

      timeout: 15000,

      maximumAge: 300000
    }

  );

}


/* =====================================================
   LOAD WEATHER
===================================================== */

async function loadWeather() {

  if (
    latitude === null ||
    longitude === null
  ) {

    console.log(
      "Waiting for location..."
    );

    return;

  }


  const API_URL =

    `https://api.open-meteo.com/v1/forecast` +

    `?latitude=${latitude}` +

    `&longitude=${longitude}` +

    `&current=` +

    `temperature_2m,` +

    `relative_humidity_2m,` +

    `apparent_temperature,` +

    `wind_speed_10m,` +

    `weather_code,` +

    `precipitation` +

    `&hourly=` +

    `temperature_2m,` +

    `relative_humidity_2m,` +

    `wind_speed_10m,` +

    `precipitation_probability` +

    `&daily=` +

    `sunrise,` +

    `sunset` +

    `&timezone=auto` +

    `&forecast_days=2`;


  try {

    const response =
      await fetch(API_URL);


    if (!response.ok) {

      throw new Error(
        "Open-Meteo API request failed"
      );

    }


    const data =
      await response.json();


    console.log(
      "Weather Data:",
      data
    );


    /* =================================================
       TIMEZONE
    ================================================= */

    locationTimezone =
      data.timezone;


    console.log(
      "Timezone:",
      locationTimezone
    );


    /* =================================================
       CURRENT WEATHER
    ================================================= */

    const current =
      data.current;


    /* Temperature */

    if (temperature) {

      temperature.textContent =
        Math.round(
          current.temperature_2m
        );

    }


    /* Humidity */

    if (humidity) {

      humidity.textContent =
        `${current.relative_humidity_2m}%`;

    }


    /* Wind */

    if (wind) {

      wind.textContent =
        `${Math.round(
          current.wind_speed_10m
        )} km/h`;

    }


    /* Feels Like */

    if (feelsLike) {

      feelsLike.textContent =
        `${Math.round(
          current.apparent_temperature
        )}°C`;

    }


    /* =================================================
       WEATHER CONDITION
    ================================================= */

    const info =
      weatherInfo[
        current.weather_code
      ] ||
      ["🌤️", "Unknown"];


    if (weatherIcon) {

      weatherIcon.textContent =
        info[0];

    }


    if (weatherDescription) {

      weatherDescription.textContent =
        info[1];

    }


    /* =================================================
       LOCATION
    ================================================= */

    if (locationElement) {

      locationElement.textContent =
        formatTimezone(
          data.timezone
        );

    }


    /* =================================================
       SUNRISE / SUNSET
    ================================================= */

    sunriseTime =
      new Date(
        data.daily.sunrise[0]
      );


    sunsetTime =
      new Date(
        data.daily.sunset[0]
      );


    if (sunriseElement) {

      sunriseElement.textContent =
        formatLocationTime(
          data.daily.sunrise[0]
        );

    }


    if (sunsetElement) {

      sunsetElement.textContent =
        formatLocationTime(
          data.daily.sunset[0]
        );

    }


    /* =================================================
       RAIN PROBABILITY
    ================================================= */

    if (
      data.hourly &&
      data.hourly.time
    ) {

      const currentTimeString =
        current.time.slice(
          0,
          13
        );


      const index =
        data.hourly.time.findIndex(
          time =>
            time.slice(0, 13) ===
            currentTimeString
        );


      if (
        index !== -1 &&
        rainChance
      ) {

        rainChance.textContent =
          `${data.hourly
            .precipitation_probability[
              index
            ] ?? 0}%`;

      }

    }


    /* =================================================
       UPDATE SKY
    ================================================= */

    updateSky();

    updateSunPosition();

  }

  catch (error) {

    console.error(
      "Weather Error:",
      error
    );

  }

}


/* =====================================================
   FORMAT TIME
   Using API LOCATION TIMEZONE
===================================================== */

function formatLocationTime(
  dateString
) {

  if (!locationTimezone) {

    return "--:--";

  }


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone:
        locationTimezone,

      hour: "2-digit",

      minute: "2-digit",

      hour12: true
    }
  ).format(
    new Date(
      dateString
    )
  );

}


/* =====================================================
   FORMAT TIMEZONE NAME
===================================================== */

function formatTimezone(
  timezone
) {

  if (!timezone) {

    return "Unknown location";

  }


  return timezone
    .replaceAll("_", " ")
    .replace(
      /\//g,
      " / "
    );

}


/* =====================================================
   REAL TIME CLOCK
===================================================== */

function updateClock() {

  if (!locationTimezone) {

    if (currentTime) {

      currentTime.textContent =
        "--:--:--";

    }

    if (currentDate) {

      currentDate.textContent =
        "Getting local time...";

    }

    return;

  }


  const now =
    new Date();


  /* =================================================
     TIME
  ================================================= */

  if (currentTime) {

    currentTime.textContent =
      new Intl.DateTimeFormat(
        "en-IN",
        {

          timeZone:
            locationTimezone,

          hour: "2-digit",

          minute: "2-digit",

          second: "2-digit",

          hour12: true

        }
      ).format(now);

  }


  /* =================================================
     DATE
  ================================================= */

  if (currentDate) {

    currentDate.textContent =
      new Intl.DateTimeFormat(
        "en-IN",
        {

          timeZone:
            locationTimezone,

          weekday: "long",

          day: "numeric",

          month: "long",

          year: "numeric"

        }
      ).format(now);

  }


  /* =================================================
     SUN
  ================================================= */

  updateSunPosition();

}


/* =====================================================
   SUN POSITION
===================================================== */

function updateSunPosition() {

  if (
    !sun ||
    !sunriseTime ||
    !sunsetTime
  ) {

    return;

  }


  const now =
    new Date();


  const sunrise =
    sunriseTime.getTime();


  const sunset =
    sunsetTime.getTime();


  const current =
    now.getTime();


  /* =================================================
     BEFORE SUNRISE
  ================================================= */

  if (
    current < sunrise
  ) {

    sun.style.opacity =
      "0";

    if (sunMarker) {

      sunMarker.style.left =
        "0%";

    }

    if (sunProgress) {

      sunProgress.style.width =
        "0%";

    }

    return;

  }


  /* =================================================
     AFTER SUNSET
  ================================================= */

  if (
    current > sunset
  ) {

    sun.style.opacity =
      "0";

    if (sunMarker) {

      sunMarker.style.left =
        "100%";

    }

    if (sunProgress) {

      sunProgress.style.width =
        "100%";

    }

    return;

  }


  /* =================================================
     DAY
  ================================================= */

  sun.style.opacity =
    "1";


  const progress =
    (
      current - sunrise
    ) /
    (
      sunset - sunrise
    );


  const percentage =
    Math.max(
      0,
      Math.min(
        1,
        progress
      )
    );


  /* =================================================
     HORIZONTAL POSITION
  ================================================= */

  const screenWidth =
    window.innerWidth;


  const sunSize =
    sun.offsetWidth;


  const left =
    percentage *
    (
      screenWidth -
      sunSize
    );


  /* =================================================
     VERTICAL ARC
  ================================================= */

  const arc =
    Math.sin(
      percentage *
      Math.PI
    );


  const horizonHeight =
    window.innerHeight *
    0.23;


  const highestPoint =
    window.innerHeight *
    0.08;


  const lowestPoint =
    window.innerHeight -
    horizonHeight -
    sunSize / 2;


  const verticalRange =
    lowestPoint -
    highestPoint;


  const top =
    lowestPoint -
    (
      arc *
      verticalRange
    );


  sun.style.left =
    `${left}px`;


  sun.style.top =
    `${top}px`;


  /* =================================================
     PROGRESS
  ================================================= */

  const percent =
    percentage *
    100;


  if (sunMarker) {

    sunMarker.style.left =
      `${percent}%`;

  }


  if (sunProgress) {

    sunProgress.style.width =
      `${percent}%`;

  }

}


/* =====================================================
   SKY DAY / NIGHT
===================================================== */

function updateSky() {

  if (
    !sky ||
    !sunriseTime ||
    !sunsetTime
  ) {

    return;

  }


  const now =
    new Date();


  const current =
    now.getTime();


  const sunrise =
    sunriseTime.getTime();


  const sunset =
    sunsetTime.getTime();


  /* =================================================
     NIGHT
  ================================================= */

  if (
    current < sunrise ||
    current > sunset
  ) {

    sky.style.background =
      `
      linear-gradient(
        180deg,
        #020617,
        #0f172a,
        #1e293b,
        #312e81
      )
      `;

    return;

  }


  /* =================================================
     DAY PROGRESS
  ================================================= */

  const progress =
    (
      current - sunrise
    ) /
    (
      sunset - sunrise
    );


  /* =================================================
     MORNING
  ================================================= */

  if (
    progress < 0.25
  ) {

    sky.style.background =
      `
      linear-gradient(
        180deg,
        #38bdf8,
        #7dd3fc,
        #bae6fd,
        #fed7aa
      )
      `;

  }


  /* =================================================
     DAY
  ================================================= */

  else if (
    progress < 0.70
  ) {

    sky.style.background =
      `
      linear-gradient(
        180deg,
        #0ea5e9,
        #38bdf8,
        #bae6fd,
        #fef3c7
      )
      `;

  }


  /* =================================================
     SUNSET
  ================================================= */

  else {

    sky.style.background =
      `
      linear-gradient(
        180deg,
        #fb923c,
        #f97316,
        #c2410c,
        #312e81
      )
      `;

  }

}


/* =====================================================
   START APP
===================================================== */

getUserLocation();


/* =====================================================
   CLOCK
   Every 1 second
===================================================== */

setInterval(
  updateClock,
  1000
);


/* =====================================================
   WEATHER
   Every 10 minutes
===================================================== */

setInterval(
  () => {

    if (
      latitude !== null &&
      longitude !== null
    ) {

      loadWeather();

    }

  },
  10 * 60 * 1000
);


/* =====================================================
   WINDOW RESIZE
===================================================== */

window.addEventListener(
  "resize",
  () => {

    updateSunPosition();

  }
);