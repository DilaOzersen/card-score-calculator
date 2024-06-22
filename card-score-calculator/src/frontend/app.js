document.addEventListener("DOMContentLoaded", () => {
    // function to help navigate through the different views
    function navigate(viewId) {
        // hide all views
        document.querySelectorAll(".view").forEach((view) => {
            view.style.display = "none";
        });

        // show the specific view requested
        document.getElementById(viewId).style.display = "block";
    }

    // event listeners that help you navigate when a button is clicked
    document.getElementById("home").addEventListener("click", () => navigate("homeView"));
    document.getElementById("gacha").addEventListener("click", () => navigate("gachaView"));
    document.getElementById("inventory").addEventListener("click", () => navigate("inventoryView"));
    document.getElementById("teams").addEventListener("click", () => navigate("teamsView"));

    // image event listeners
    document.getElementById("gachaImg").addEventListener("click", () => navigate("gachaView"));
    document.getElementById("inventoryImg").addEventListener("click", () => navigate("inventoryView"));
    document.getElementById("teamsImg").addEventListener("click", () => navigate("teamsView"));

    // login/register variables
    const loginInformation = document.getElementById("loginInformation");
    const registerInformation = document.getElementById("registerInformation");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    // function to help gather all registered users
    function allUsers() {
        const users = localStorage.getItem("users");
        if (users) {
            return JSON.parse(users)
        } else {
            return {};
        }
    }

    // function that saves a newly registered user to the current list of users
    function saveUserInformation(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // function to hide/show the menu if a user isn't/is logged in
    function showMenu(user) {
        const menu = document.getElementById("menu");
        if (user) {
            menu.style.display = "block";
        } else {
            menu.style.display = "none";
        }
    }

    // event listener for when you type in a username and password for the first time
    registerInformation.addEventListener("submit", (x) => {
        x.preventDefault();
        const username = document.getElementById('registeredUsername').value;
        const password = document.getElementById('registeredPassword').value;

        const users = allUsers();

        if (users[username]) {
            alert("This username already exists.");
        } else { 
            if (password === "") {
                alert("You haven't typed in a password.");
            } else {
                users[username] = { password };
                saveUserInformation(users);
                alert("You are now registered!");
                navigate("loginView");
            }
        }
    });

    // event listener for when the user logs in
    loginInformation.addEventListener("submit", (x) => {
        x.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        const users = allUsers();

        if (users[username] && users[username].password === password) {
            alert("Successful login, welcome!");
            navigate("homeView");

             // shows the menu after the user log in successfully
            showMenu(true);
        } else {
            alert("The username or password you have entered is incorrect.");
        }
    });

    // switches to registerView when the user click the showRegister element
    showRegister.addEventListener("click", (x) => {
        x.preventDefault();
        navigate("registerView");
    });

    // switches to loginView when the user click the showLogin element
    showLogin.addEventListener("click", (x) => {
        x.preventDefault();
        navigate("loginView");
    });

   // initialize with the login view and hide menu initially
    showMenu(false);
    navigate("loginView");

    // fetch card data and display in the inventory view and team views
    // EVERYTHING BELOW HERE IS TEMPORARY, JUST SETTING THE LAYOUT!
    fetch("cards.json")
        .then(response => response.json())
        .then(data => {
            const cardsRow = document.getElementById("cardsRow");
            data.cards.forEach(card => {
                const img = document.createElement("img");
                img.src = card.icon;
                img.alt = card.name;
                cardsRow.appendChild(img);
            });

            const teamOne_CardsRow = document.getElementById("teamOne_CardsRow");
            const teamOne_CardsPreview = document.getElementById("teamOne_CardsPreview");

            teamOne_CardsRow.innerHTML = '';
            teamOne_CardsPreview.innerHTML = '';

            // create card items with dropdown and set button for Team 1 - in progress!
            data.cards.slice(0, 5).forEach(card => {
                const cardItem = document.createElement("div");
                cardItem.classList.add("card-item");

                const img = document.createElement("img");
                img.src = card.icon;
                img.alt = card.name;
                cardItem.appendChild(img);

                const dropdown = document.createElement("select");
                dropdown.classList.add("card-dropdown");
                for (let i = 1; i <= 5; i++) {
                    const option = document.createElement("option");
                    option.value = i;
                    option.textContent = i;
                    dropdown.appendChild(option);
                }
                cardItem.appendChild(dropdown);

                const setButton = document.createElement("button");
                setButton.textContent = "Set";
                setButton.classList.add("set-button");
                cardItem.appendChild(setButton);

                teamOne_CardsRow.appendChild(cardItem);
                teamOne_CardsPreview.appendChild(cardItem.cloneNode(true));
            });

            // team navigation and editing - (THIS CODE IS TEMPORARY UNTIL THE BACKEND IS IMPLEMENTED)
            document.querySelectorAll(".team-button").forEach(button => {
                button.addEventListener("click", (x) => {
                    const teamId = x.target.getAttribute("data-team");
                    navigate(teamId);
                });
            });

            document.querySelectorAll(".team-button").forEach(button => {
                button.addEventListener("dblclick", (x) => {
                    const teamEdit = x.getElementById("teamEdit");
                    teamEdit.classList.remove("active");
                    const teamId = event.target.getAttribute("data-team");
                    const teamCardsRow = document.getElementById("teamCardsRow");
                    teamCardsRow.innerHTML = '';

                    let teamCards = [];
                    if (teamId === "team1View") {
                        teamCards = data.cards.slice(0, 5);
                    }

                    teamCards.forEach(card => {
                        const img = document.createElement("img");
                        img.src = card.icon;
                        img.alt = card.name;
                        teamCardsRow.appendChild(img);
                    });

                    teamEdit.classList.add("active");
                });
            });
        })
        .catch(error => console.error("Error loading cards:", error));
});