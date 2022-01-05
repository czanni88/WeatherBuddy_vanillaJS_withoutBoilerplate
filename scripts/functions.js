const weatherDailyDetails = document.querySelector(".weatherDailyDetails");
const weatherHeadline = document.querySelector(".weatherHeadline");
const searchFormContainer = document.querySelector(".searchFormContainer");
const weatherContainer = document.querySelector(".forecastContainer");
const itemsListContainer = document.querySelector(".itemsListContainer");
const form = document.querySelector(".searchForm");
const itemsList = document.querySelector(".itemsList");
const mainHeader = document.querySelector(".mainHeader");

let NodeListOfItems;
let arrOfItems;

const itemsSuggestions = {
  rain: ["Umbrella", "Rubber Boot"],
  clouds: ["Jacket", "Scarf"],
  clear: ["Short", "Sunscreen"],
};

export async function handleSearch(e) {
  e.preventDefault();

  let cityName = e.target.elements.locationSearch.value;
  const lengthOfStay = e.target.elements.period.value;

  // FETCH
  try {
    // FIRST FETCH - Extracting parameters: In order to be able to Fetch using "City Name", we need to first extract "Latitude" and "Longitude" from the first Fetch. The SECOND FETCH is the one that we want but it wont accept "City Name" as valid parameter.

    const response1 = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=5be60d4872c3eae278822b9856894ca8`
    );
    const cityLatLon = await response1.json();
    if (response1.status === 404 || cityLatLon.length === 0) {
      throw new Error("City not found");
    }
    console.log(cityLatLon);
    const lat = cityLatLon[0].lat;
    const lon = cityLatLon[0].lon;
    const cityFullName = cityLatLon[0].name;
    const cityCountry = cityLatLon[0].country;
    const cityState = cityLatLon[0].state;

    // SECOND FETCH

    const response2 = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=5be60d4872c3eae278822b9856894ca8`
    );
    const weatherData = await response2.json();
    console.log(weatherData);
    let arrayOfDailyData_LengthOfStay = weatherData.daily.filter(
      (e, index) => index < lengthOfStay
    );

    // Local Storage

    try {
      localStorage.setItem(
        "data",
        JSON.stringify({
          cityState,
          cityCountry,
          cityFullName,
          lengthOfStay,
          arrayOfDailyData_LengthOfStay,
        })
      );
    } catch (err) {
      alert("Cannot write to storage");
    }

    // Rendering functions

    weatherContainer.style.display = "flex";
    itemsListContainer.style.display = "flex";

    weatherDailyDataRendering(arrayOfDailyData_LengthOfStay);
    weatherHeadlineRendering(
      lengthOfStay,
      cityFullName,
      cityState,
      cityCountry
    );
  } catch (err) {
    alert(err);
  }

  form.reset();
}

export const weatherHeadlineRendering = (
  lengthOfStay,
  cityFullName,
  cityState,
  cityCountry
) => {
  searchFormContainer.style.display = "none"; // Having the "display none" here instead of inside the handleSearch function, avoids having a blank page while the fetching is not completed.
  mainHeader.style.display = "none";

  weatherHeadline.innerHTML = `<div><h2>The weather in <br> ${cityFullName} (${cityState} - ${cityCountry} )<br> for
  the next ${lengthOfStay} ${lengthOfStay < 2 ? "Day" : "Days"}</h2></div>`;
  weatherHeadline.insertAdjacentHTML(
    "beforeend",
    `<div class="newSearchButtonContainer"><button class="button newSearch" type="button">New Search</button></div>`
  );
  const newSearchButton = document.querySelector(".newSearch");
  newSearchButton.addEventListener("click", handleNewSearch);
};

export const weatherDailyDataRendering = (arrayOfDailyData_LengthOfStay) => {
  let dayCount = 0;

  weatherDailyDetails.innerHTML = "";
  arrayOfDailyData_LengthOfStay.forEach((day) => {
    const { max, min } = day.temp;
    const { main, description, icon } = day.weather[0];
    const { wind_speed, humidity } = day;
    dayCount += 1;
    // console.log(day.weather[0]);
    weatherDailyDetails.insertAdjacentHTML(
      "beforeend",
      `<div class="infoByDay">
               <div class="descriptionWithImage"><img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather icon"> <p> <span class="alert"> Day ${dayCount}</span> <br> ${
        main === "Rain"
          ? `with ${description}.`
          : main === "Clouds"
          ? `with ${description} but without rain.`
          : `with ${description}.`
      }</p></div>
        
        <p class="temp"><span class="bold">Temperature:</span> <br>from ${min}°C to ${max}°C and humidity of ${humidity}%.</p>
       
        <p class="wind"><span class="bold">Wind speed:</span> ${wind_speed}m/s. <br> That means a ${
        wind_speed < 3 ? "weak" : wind_speed < 6 ? "mild" : "strong"
      } wind.</p>
        </div>`
    );
  });
};

export const handleSuggestions = () => {
  const savedData = JSON.parse(localStorage.getItem("data"));
  const savedItemsLocalStorage = JSON.parse(localStorage.getItem("items"));
  let savedItems = [];
  if (savedItemsLocalStorage) {
    savedItems = savedItemsLocalStorage.map((item) => item.trim());
  }
  // without map(item.trim()) the if() in the typesOfSky.map doesnt work. The items from localStorage have a different format (* TO BE LEARNED - I guess it has something to do with HTMLCollection, which is something that I dont really understand yet)!!!!
  const { arrayOfDailyData_LengthOfStay } = savedData;
  const compiledWeatherData = arrayOfDailyData_LengthOfStay.reduce(
    (acc, obj) => {
      const { main } = obj.weather[0];
      return {
        arrayOfMain: [...acc.arrayOfMain, main],
      };
    },
    {
      arrayOfMain: [],
    }
  );

  const { arrayOfMain } = compiledWeatherData;

  const typesOfSky = arrayOfMain.filter(
    (sky, index) => arrayOfMain.indexOf(sky) === index
  );
  console.log(typesOfSky);
  typesOfSky.map((sky) => {
    if (sky === "Rain") {
      itemsSuggestions.rain.map((item) => {
        if (!savedItems.includes(item)) {
          return itemsList.insertAdjacentHTML(
            "beforeend",
            `<li> ${item} <button class="deleteButton">x</button></li>`
          );
        }
      });
    } else if (sky === "Clouds") {
      itemsSuggestions.clouds.map((item) => {
        if (!savedItems.includes(item)) {
          return itemsList.insertAdjacentHTML(
            "beforeend",
            `<li> ${item} <button class="deleteButton">x</button></li>`
          );
        }
      });
    } else if (sky === "Clear") {
      itemsSuggestions.clear.map((item) => {
        if (!savedItems.includes(item)) {
          return itemsList.insertAdjacentHTML(
            "beforeend",
            `<li> ${item} <button class="deleteButton">x</button></li>`
          );
        }
      });
    }
    document.querySelectorAll(".deleteButton").forEach((item) => {
      item.addEventListener("click", removeItem);
    });
  });

  NodeListOfItems = document.getElementsByTagName("li");
  arrOfItems = Array.from(NodeListOfItems);
  saveToLocalStorage();
  console.log(arrOfItems);
};

export const addItem = (e) => {
  e.preventDefault();
  let itemValue = e.target.elements.addItems.value;

  if (!itemValue) {
    alert("Please insert an Item in the input field");
  } else {
    itemsList.insertAdjacentHTML(
      "afterbegin",
      `<li> ${itemValue} <button class="deleteButton">x</button></li>`
    );
    document.querySelectorAll(".deleteButton").forEach((item) => {
      item.addEventListener("click", removeItem);
    });
    NodeListOfItems = document.getElementsByTagName("li");
    arrOfItems = Array.from(NodeListOfItems);
    saveToLocalStorage();
    e.target.elements.addItems.value = "";
  }
  console.log(arrOfItems);
};

const removeItem = (e) => {
  const item = e.target.parentElement;
  item.remove();
  arrOfItems.splice(arrOfItems.indexOf(item), 1);
  saveToLocalStorage();
};

export const clearList = () => {
  arrOfItems.forEach((item) => {
    item.remove();
  });
  localStorage.removeItem("items");
};

export const handleNewSearch = (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.reload();
};

const saveToLocalStorage = () => {
  let arrOfValues = [];
  arrOfItems.map((item) => {
    arrOfValues.push(item.firstChild.data);
  });
  try {
    localStorage.setItem("items", JSON.stringify(arrOfValues));
  } catch (err) {
    alert("Cannot write to storage");
  }
};

export const handleLocalStorage = (savedData, savedItems) => {
  const {
    cityState,
    cityCountry,
    cityFullName,
    lengthOfStay,
    arrayOfDailyData_LengthOfStay,
  } = savedData;
  weatherDailyDataRendering(arrayOfDailyData_LengthOfStay);
  weatherHeadlineRendering(lengthOfStay, cityFullName, cityState, cityCountry);
  weatherContainer.style.display = "flex";
  itemsListContainer.style.display = "flex";
  if (savedItems) {
    savedItems.map((item) => {
      return itemsList.insertAdjacentHTML(
        "beforeend",
        `<li> ${item} <button class="deleteButton">x</button></li>`
      );
    });
  }

  document.querySelectorAll(".deleteButton").forEach((item) => {
    item.addEventListener("click", removeItem);
  });
  NodeListOfItems = document.getElementsByTagName("li");
  arrOfItems = Array.from(NodeListOfItems);
};
