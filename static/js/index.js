
/** Main Js for the webpage is at the bottom of this file. */
const weatherURL = "https://api.open-meteo.com/v1/forecast?latitude=42.331429&longitude=-83.045753&current=weather_code";

const weatherCodeMap = new Map([
    [0, "clear sky"],
    [1, "mainly clear"],
    [2, "partly cloudy"],
    [3, "overcast"],
    [45, "fog"],
    [48, "rime fog"],
    [51, "light drizzle"],
    [53, "moderate drizzle"],
    [55, "dense drizzle"],
    [56, "light freezing drizzle"],
    [57, "dense freezing drizzle"],
    [61, "slight rain"],
    [63, "moderate rain"],
    [65, "heavy rain"],
    [66, "light freezing rain"],
    [67, "heavy freezing rain"],
    [71, "slight snow"],
    [73, "moderate snow"],
    [75, "heavy snow"],
    [77, "snow grains"],
    [80, "slight rain showers"],
    [81, "moderate rain showers"],
    [82, "heavy rain showers"],
    [85, "light snow showers"],
    [86, "heavy snow showers"],
    [95, "thunderstorms"],
    [96, "thunderstorms with hail"],
]);

/******************** 
 * Helper Functions *
 * ******************/
async function fetchWeather() {
    try {
        const response = await fetch(weatherURL);
        const data = await response.json();
        return weatherCodeMap.get(data["current"]["weather_code"]);
    } catch (error) {
        console.log("Error fetching data: ", error);
    }//end try/catch   
}//end fetchWeather

function getDayPeriod(time24hr) {
    if (time24hr < 12) {
        return "morning";
    } else if (time24hr < 18){
        return "afternoon";
    } else {
        return "evening";
    }//end if-elif-else
}//end getDayPeriod

function updateTimeOfDay(spanTags) {
    let now = new Date();
    let date = now.toLocaleDateString("en-US", {timeZone: "America/New_York"});
    let time = now.toLocaleTimeString("en-US", {timeZone: "America/New_York", hour12: true});
    let hours24 = parseInt(now.toLocaleTimeString("en-US", {timeZone:"America/New_York", hour12:false}).slice(0, 2));

    let dayPeriod = getDayPeriod(hours24);

    spanTags[0].innerHTML = dayPeriod;
    spanTags[2].innerHTML = time;
    spanTags[3].innerHTML = date;
}//end update welcome

function updateNameTag(name, tag) {
    if (!name) name ="";
     tag.innerHTML = name;
}//endupdateNametag

function updateLastvisit(lastVisit, tag) {

    let hasVisited = (lastVisit != undefined);
    var lastVisitString = "";

    let now = new Date();
    let date = now.toLocaleDateString("en-US", {timeZone: "America/New_York"});
    let time = now.toLocaleTimeString("en-US", {timeZone: "America/New_York", hour12: true});
    let currentDateTime = JSON.stringify({"date": date, "time": time});

    if (hasVisited) {
        lastVisit = JSON.parse(lastVisit);
        lastVisitString = `It Looks like your last visit was on ${lastVisit.date} at ${lastVisit.time}, Welcome Back!`; 
    } else {
        lastVisitString = "It looks like it's your first visit, Welcome!";
    }//end if-else

    tag.innerHTML = lastVisitString;
    visitorInformation.setItem("lastVisit", currentDateTime);
}//end updateLastisitTag

//form listener
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();

    let formData = new FormData(form);
    let name = formData.get("name").trim();
    if (typeof name === "string" && name != "") {
        welcomeTags[1].innerHTML = name;
        visitorInformation.setItem("name", name);
    }//end if
});

/********************* 
 *      Main JS      *
 * ******************/
const visitorInformation = localStorage;

const welcomeTags = document.querySelectorAll("span.welcome"); //[dayPeriod, name, time, date, weather, lastVisit]

//update weather
fetchWeather().then(weather => {welcomeTags[4].innerHTML = weather});

updateNameTag(visitorInformation.getItem("name"), welcomeTags[1]);

updateLastvisit(visitorInformation.getItem("lastVisit"), welcomeTags[5]);

//update welcome and store the session start time and date.
updateTimeOfDay(welcomeTags);

const timeUpdater = setInterval(updateTimeOfDay, 1000, welcomeTags);