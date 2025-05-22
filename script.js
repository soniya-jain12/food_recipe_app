let ingredients = [];
let allRecipes = [];

// Add ingredient functionality
function addIngredient() {
  const input = document.getElementById("ingredientInput");
  const ingredient = input.value.trim().toLowerCase();

  if (ingredient && !ingredients.includes(ingredient)) {
    ingredients.push(ingredient);
    updateIngredientTags();
    input.value = "";
    updateSearchButton();
  }
}

// Update ingredient tags display
function updateIngredientTags() {
  const container = document.getElementById("ingredientTags");
  container.innerHTML = "";

  ingredients.forEach((ingredient, index) => {
    const tag = document.createElement("span");
    tag.className = "ingredient-tag";
    tag.innerHTML = `
                    ${ingredient}
                    <button class="remove-ingredient" onclick="removeIngredient(${index})">×</button>
                `;
    container.appendChild(tag);
  });
}

// Remove ingredient
function removeIngredient(index) {
  ingredients.splice(index, 1);
  updateIngredientTags();
  updateSearchButton();
}

// Update search button state
function updateSearchButton() {
  const searchBtn = document.getElementById("searchBtn");
  searchBtn.disabled = ingredients.length === 0;
}

// Allow Enter key to add ingredient
document
  .getElementById("ingredientInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addIngredient();
    }
  });

// Search recipes
async function searchRecipes() {
  if (ingredients.length === 0) return;

  const resultsSection = document.getElementById("results");
  const resultsContainer = document.getElementById("recipeResults");

  // Show loading
  resultsSection.style.display = "block";
  resultsContainer.innerHTML = `
                <div class="col-12">
                    <div class="loading">
                        <div class="spinner"></div>
                        <h4>Searching for delicious recipes...</h4>
                        <p>Finding the perfect matches for your ingredients</p>
                    </div>
                </div>
            `;

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: "smooth" });

  try {
    allRecipes = [];

    // Search for recipes using each ingredient
    for (const ingredient of ingredients) {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
      );
      const data = await response.json();

      if (data.meals) {
        allRecipes.push(...data.meals);
      }
    }

    // Remove duplicates and filter recipes that contain multiple ingredients
    const uniqueRecipes = [];
    const seenIds = new Set();

    for (const recipe of allRecipes) {
      if (!seenIds.has(recipe.idMeal)) {
        seenIds.add(recipe.idMeal);
        uniqueRecipes.push(recipe);
      }
    }

    displayRecipes(uniqueRecipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    resultsContainer.innerHTML = `
                    <div class="col-12">
                        <div class="no-results">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h4>Oops! Something went wrong</h4>
                            <p>Please try again in a moment</p>
                        </div>
                    </div>
                `;
  }
}

// Display recipes
function displayRecipes(recipes) {
  const container = document.getElementById("recipeResults");

  if (!recipes || recipes.length === 0) {
    container.innerHTML = `
                    <div class="col-12">
                        <div class="no-results">
                            <i class="fas fa-search"></i>
                            <h4>No recipes found</h4>
                            <p>Try different ingredients or check your spelling</p>
                        </div>
                    </div>
                `;
    return;
  }

  // Limit to first 12 recipes for better performance
  const limitedRecipes = recipes.slice(0, 12);

  container.innerHTML = limitedRecipes
    .map(
      (recipe) => `
                <div class="col-md-6 col-lg-4">
                    <div class="recipe-card" onclick="showRecipeDetails('${
                      recipe.idMeal
                    }')">
                        <img src="${recipe.strMealThumb}" alt="${
        recipe.strMeal
      }" class="recipe-image">
                        <div class="recipe-content">
                            <div class="recipe-category">${
                              recipe.strCategory || "Main Course"
                            }</div>
                            <h3 class="recipe-title">${recipe.strMeal}</h3>
                            <p class="text-muted">
                                <i class="fas fa-clock me-1"></i>Click to view full recipe
                            </p>
                        </div>
                    </div>
                </div>
            `
    )
    .join("");
}

// Show recipe details in modal
async function showRecipeDetails(mealId) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    const data = await response.json();
    const recipe = data.meals[0];

    document.getElementById("modalRecipeTitle").textContent = recipe.strMeal;

    // Get ingredients list
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = recipe[`strIngredient${i}`];
      const measure = recipe[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push(
          `${measure ? measure.trim() + " " : ""}${ingredient.trim()}`
        );
      }
    }

    document.getElementById("modalRecipeBody").innerHTML = `
                    <img src="${recipe.strMealThumb}" alt="${
      recipe.strMeal
    }" class="recipe-modal-image">
                    
                    <div class="row">
                        <div class="col-md-6">
                            <h5><i class="fas fa-list-ul me-2"></i>Ingredients</h5>
                            <div class="ingredients-list">
                                ${ingredients
                                  .map(
                                    (ing) =>
                                      `<div class="mb-1"><i class="fas fa-check text-success me-2"></i>${ing}</div>`
                                  )
                                  .join("")}
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h5><i class="fas fa-info-circle me-2"></i>Details</h5>
                            <p><strong>Category:</strong> ${
                              recipe.strCategory
                            }</p>
                            <p><strong>Cuisine:</strong> ${recipe.strArea}</p>
                            ${
                              recipe.strYoutube
                                ? `<a href="${recipe.strYoutube}" target="_blank" class="btn btn-danger btn-sm"><i class="fab fa-youtube me-1"></i>Watch Video</a>`
                                : ""
                            }
                        </div>
                    </div>
                    
                    <h5 class="mt-4"><i class="fas fa-utensils me-2"></i>Instructions</h5>
                    <div class="instructions">
                        ${recipe.strInstructions.replace(/\n/g, "<br><br>")}
                    </div>
                `;

    new bootstrap.Modal(document.getElementById("recipeModal")).show();
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    alert("Sorry, could not load recipe details. Please try again.");
  }
}

// Smooth scrolling
function scrollToSearch() {
  document.getElementById("search").scrollIntoView({ behavior: "smooth" });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// Add some popular ingredient suggestions
const popularIngredients = [
  "chicken",
  "beef",
  "rice",
  "pasta",
  "tomato",
  "onion",
  "garlic",
  "cheese",
];

// Add suggestion functionality
function addSuggestion(ingredient) {
  if (!ingredients.includes(ingredient)) {
    ingredients.push(ingredient);
    updateIngredientTags();
    updateSearchButton();
  }
}

// Initialize the app
document.addEventListener("DOMContentLoaded", function () {
  console.log("Recipe Finder App Loaded Successfully!");
});
