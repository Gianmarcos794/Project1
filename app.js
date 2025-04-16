let currentUser = localStorage.getItem("currentUser"); // Load the logged-in user from localStorage
let users = JSON.parse(localStorage.getItem("users")) || {}; // Load users from localStorage

// Function to initialize the app on page load
function initializeApp() {
  const welcomeMessage = document.getElementById("welcomeMessage");

  if (!currentUser) {
    window.location.href = "login.html"; // Redirect to log-in page if no user is logged in
  } else {
    welcomeMessage.textContent = `Welcome back, ${currentUser}!`;
  }
}

// Function to initialize the profile page
function initializeProfile() {
  const profileInfo = document.getElementById("profileInfo");
  const likedRecipesDiv = document.getElementById("likedRecipes");

  if (!currentUser) {
    profileInfo.textContent = "Please log in to view your profile.";
    likedRecipesDiv.innerHTML = "";
    return;
  }

  profileInfo.textContent = `Logged in as: ${currentUser}`;
  const userProfile = users[currentUser];

  if (userProfile.likedRecipes.length === 0) {
    likedRecipesDiv.innerHTML = "<p>No liked recipes yet.</p>";
  } else {
    likedRecipesDiv.innerHTML = "";
    userProfile.likedRecipes.forEach(meal => {
      const mealDiv = document.createElement("div");
      mealDiv.classList.add("liked-meal");

      mealDiv.innerHTML = `
        <h3>${meal.strMeal}</h3>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 100px;">
      `;
      likedRecipesDiv.appendChild(mealDiv);
    });
  }
}

// Function to sign up
function signUp() {
  const username = prompt("Enter a username to sign up:");
  const password = prompt("Enter a password:");
  if (!password) {
    alert("Password cannot be empty.");
    return;
  }
  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }
  if (!username) {
    alert("Username cannot be empty.");
    return;
  }

  if (users[username]) {
    alert("This username is already taken. Please choose another one.");
    return;
  }

  users[username] = { likedRecipes: [] }; // Create a new profile
  currentUser = username; // Automatically log in the user after sign-up
  localStorage.setItem("currentUser", currentUser); // Save the logged-in user to localStorage
  localStorage.setItem("users", JSON.stringify(users)); // Save users to localStorage
  alert(`Sign-up successful! Welcome, ${username}!`);
  updateProfile();
}

// Function to log in
function login() {
  const username = prompt("Enter your username to log in:");
  const password = prompt("Enter your password:");
  if (!password) {
    alert("Password cannot be empty.");
    return;
  } 
  if (!users[username] || users[username].password!== password) {
    alert("Invalid username or password. Please try again.");
    return;
  }

  if (!username) {
    alert("Username cannot be empty.");
    return;
  }

  if (!users[username]) {
    alert("This username does not exist. Please sign up first.");
    return;
  }

  currentUser = username;
  localStorage.setItem("currentUser", currentUser); // Save the logged-in user to localStorage
  alert(`Login successful! Welcome, ${username}!`);
  updateProfile();
}

// Function to log out
function logout() {
  localStorage.removeItem("currentUser"); // Remove the logged-in user from localStorage
  alert("You have been logged out.");
  window.location.href = "login.html"; // Redirect to the log-in page
}

// Function to update the profile section
function updateProfile() {
  const profileInfo = document.getElementById("profileInfo");
  const likedRecipesDiv = document.getElementById("likedRecipes");

  if (!currentUser) {
    profileInfo.textContent = "Please sign up or log in to see your liked recipes.";
    likedRecipesDiv.innerHTML = "";
    return;
  }

  profileInfo.textContent = `Logged in as: ${currentUser}`;
  const userProfile = users[currentUser];

  if (userProfile.likedRecipes.length === 0) {
    likedRecipesDiv.innerHTML = "<p>No liked recipes yet.</p>";
  } else {
    likedRecipesDiv.innerHTML = "";
    userProfile.likedRecipes.forEach(meal => {
      const mealDiv = document.createElement("div");
      mealDiv.classList.add("liked-meal");

      mealDiv.innerHTML = `
        <h3>${meal.strMeal}</h3>
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" style="width: 100px;">
      `;
      likedRecipesDiv.appendChild(mealDiv);
    });
  }
}

// Function to like a recipe
function likeRecipe(meal) {
  if (!currentUser) {
    alert("You need to log in to like recipes.");
    return;
  }

  const userProfile = users[currentUser];
  const alreadyLiked = userProfile.likedRecipes.find(r => r.idMeal === meal.idMeal);

  if (alreadyLiked) {
    alert("You already liked this recipe.");
  } else {
    userProfile.likedRecipes.push(meal);
    localStorage.setItem("users", JSON.stringify(users)); // Save users to localStorage
    alert(`You liked the recipe: ${meal.strMeal}`);
    updateProfile(); // Update the profile section
  }

  console.log(`Liked recipes for ${currentUser}:`, userProfile.likedRecipes);
}

function searchMeal() {
  const query = document.getElementById("mealInput").value;
  if (!query) {
    alert("Please enter a meal name.");
    return;
  }

  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = "";

      if (!data.meals) {
        resultsDiv.innerHTML = "<p>No meals found.</p>";
        return;
      }

      data.meals.forEach(meal => {
        const mealDiv = document.createElement("div");
        mealDiv.classList.add("meal");

        // Gather ingredients and measurements
        let ingredientsList = "<ul>";
        for (let i = 1; i <= 20; i++) {
          const ingredient = meal[`strIngredient${i}`];
          const measure = meal[`strMeasure${i}`];
          if (ingredient && ingredient.trim()) {
            ingredientsList += `<li>${measure} ${ingredient}</li>`;
          }
        }
        ingredientsList += "</ul>";

        mealDiv.innerHTML = `
          <h2>${meal.strMeal}</h2>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <p><strong>Category:</strong> ${meal.strCategory}</p>
          <p><strong>Area:</strong> ${meal.strArea}</p>
          <p><strong>Ingredients:</strong> ${ingredientsList}</p>
          <p><strong>Instructions:</strong><br>${meal.strInstructions}</p>
        `;
        resultsDiv.appendChild(mealDiv);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById("results").innerHTML = "<p>Error fetching meals.</p>";
    });
}

// Updated getRandomMeal function to include a "Like" button
function getRandomMeal() {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  // Fetch multiple random meals (e.g., 5 random meals)
  const randomMealPromises = Array.from({ length: 5 }, () =>
    fetch("https://www.themealdb.com/api/json/v1/1/random.php").then(res => res.json())
  );

  Promise.all(randomMealPromises)
    .then(mealsArray => {
      mealsArray.forEach(data => {
        const meal = data.meals[0];
        const mealDiv = document.createElement("div");
        mealDiv.classList.add("meal");

        // Create the meal name and image
        const mealName = document.createElement("h2");
        mealName.textContent = meal.strMeal;

        const mealImage = document.createElement("img");
        mealImage.src = meal.strMealThumb;
        mealImage.alt = meal.strMeal;
        mealImage.style.cursor = "pointer";

        // Add click event to show full details
        mealImage.addEventListener("click", () => {
          const ingredientsList = getIngredientsList(meal);

          mealDiv.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p><strong>Area:</strong> ${meal.strArea}</p>
            <p><strong>Ingredients:</strong> ${ingredientsList}</p>
            <p><strong>Instructions:</strong><br>${meal.strInstructions}</p>
          `;
        });

        // Create a "Like" button
        const likeButton = document.createElement("button");
        likeButton.textContent = "Like";
        likeButton.addEventListener("click", () => likeRecipe(meal));

        // Append the name, image, and like button to the mealDiv
        mealDiv.appendChild(mealName);
        mealDiv.appendChild(mealImage);
        mealDiv.appendChild(likeButton);

        // Append the mealDiv to the resultsDiv
        resultsDiv.appendChild(mealDiv);
      });
    })
    .catch(err => {
      console.error(err);
      resultsDiv.innerHTML = "<p>Failed to load random recipes.</p>";
    });
}

// Helper function to generate the ingredients list
function getIngredientsList(meal) {
  let ingredientsList = "<ul>";
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredientsList += `<li>${measure} ${ingredient}</li>`;
    }
  }
  ingredientsList += "</ul>";
  return ingredientsList;
}

// Function to handle the circular button click
function handleProfileButtonClick() {
  if (!currentUser) {
    alert("You need to log in to view your profile.");
    window.location.href = "login.html";
  } else {
    document.getElementById("profile").scrollIntoView({ behavior: "smooth" });
  }
}

