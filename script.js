const API_URL = "https://www.themealdb.com/api/json/v1/1";

const areaSelect = document.getElementById("area-select");
const searchInput = document.getElementById("search-input");
const favoritesButton = document.getElementById("favorites-button");
const sectionTitle = document.getElementById("section-title");
const message = document.getElementById("message");
const mealGrid = document.getElementById("meal-grid");

let meals = [];
let showFavorites = false;
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let requestId = 0;

function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateFavoritesButton();
}

function updateFavoritesButton() {
  favoritesButton.textContent = showFavorites
    ? "⬅ All Meals"
    : `❤️ Favorites (${favorites.length})`;
}

function isFavorite(mealId) {
  return favorites.some((meal) => meal.idMeal === mealId);
}

async function fetchMeals() {
  const currentRequest = ++requestId;
  const area = areaSelect.value;

  showFavorites = false;
  updateFavoritesButton();
  sectionTitle.textContent = `${area} Meals`;
  mealGrid.innerHTML = "";
  showMessage("Loading...");

  try {
    const response = await fetch(
      `${API_URL}/filter.php?a=${encodeURIComponent(area)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();

    if (currentRequest !== requestId) return;

    meals = (data.meals || []).map((meal) => ({
      ...meal,
      area
    }));

    renderMeals();
  } catch (error) {
    if (currentRequest !== requestId) return;
    showMessage(`Error: ${error.message}`, "error");
  }
}

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
  message.hidden = !text;
}

function toggleFavorite(meal) {
  if (isFavorite(meal.idMeal)) {
    favorites = favorites.filter(
      (favorite) => favorite.idMeal !== meal.idMeal
    );
  } else {
    favorites.push(meal);
  }

  saveFavorites();
  renderMeals();
}

function createMealCard(meal) {
  const card = document.createElement("article");
  card.className = "card";

  const image = document.createElement("img");
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;
  image.loading = "lazy";

  const title = document.createElement("h3");
  title.textContent = meal.strMeal;

  const cuisine = document.createElement("p");
  cuisine.textContent = `${meal.area || areaSelect.value} cuisine`;

  const button = document.createElement("button");
  const saved = isFavorite(meal.idMeal);
  button.textContent = saved ? "❤️ Saved" : "🤍 Save";
  button.type = "button";
  button.addEventListener("click", () => toggleFavorite(meal));

  card.append(image, title, cuisine, button);
  return card;
}

function renderMeals() {
  const currentList = showFavorites ? favorites : meals;
  const searchText = searchInput.value.trim().toLowerCase();

  const filteredMeals = currentList.filter((meal) =>
    meal.strMeal.toLowerCase().includes(searchText)
  );

  mealGrid.innerHTML = "";

  if (filteredMeals.length === 0) {
    showMessage(showFavorites ? "No favorites yet." : "No meals found.");
    return;
  }

  showMessage("");

  filteredMeals.forEach((meal) => {
    mealGrid.appendChild(createMealCard(meal));
  });
}

areaSelect.addEventListener("change", fetchMeals);

searchInput.addEventListener("input", renderMeals);

favoritesButton.addEventListener("click", () => {
  showFavorites = !showFavorites;
  sectionTitle.textContent = showFavorites
    ? "My Favorites"
    : `${areaSelect.value} Meals`;

  updateFavoritesButton();
  renderMeals();
});

updateFavoritesButton();
fetchMeals();
