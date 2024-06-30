let currentUser = null;
let allCards = [];
let teams = {
    team1: new Array(5).fill(null),
    team2: new Array(5).fill(null),
    team3: new Array(5).fill(null)
};

document.addEventListener("DOMContentLoaded", () => {
    function navigate(viewId) {
        document.querySelectorAll(".view").forEach((view) => {
            view.style.display = "none";
        });
        document.getElementById(viewId).style.display = "block";
        if (viewId === "teamsView") {
            displayTeams();
        }
        if (viewId.includes("team") && viewId.includes("View")) {
            const teamNumber = viewId.charAt(4);
            populateTeamDropdowns(`team${teamNumber}`);
        }
    }

    document.getElementById("home").addEventListener("click", () => navigate("homeView"));
    document.getElementById("gacha").addEventListener("click", () => navigate("gachaView"));
    document.getElementById("inventory").addEventListener("click", () => navigate("inventoryView"));
    document.getElementById("teams").addEventListener("click", () => navigate("teamsView"));

    document.getElementById("gachaImg").addEventListener("click", () => navigate("gachaView"));
    document.getElementById("inventoryImg").addEventListener("click", () => navigate("inventoryView"));
    document.getElementById("teamsImg").addEventListener("click", () => navigate("teamsView"));

    document.getElementById("team1Button").addEventListener("click", () => navigate("team1View"));
    document.getElementById("team2Button").addEventListener("click", () => navigate("team2View"));
    document.getElementById("team3Button").addEventListener("click", () => navigate("team3View"));

    const loginInformation = document.getElementById("loginInformation");
    const registerInformation = document.getElementById("registerInformation");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    function showMenu(user) {
        const menu = document.getElementById("menu");
        if (user) {
            menu.style.display = "block";
        } else {
            menu.style.display = "none";
        }
    }

    function displayUserInventory() {
        if (currentUser) {
            fetch(`/api/user/${currentUser}`)
                .then(response => response.json())
                .then(user => {
                    const inventory = user.inventory || [];
                    const cardsRow = document.getElementById("cardsRow");
                    cardsRow.innerHTML = '';
                    inventory.forEach(card => {
                        const cardDiv = document.createElement("div");
                        cardDiv.classList.add("card-item");

                        const img = document.createElement("img");
                        img.src = card.icon;
                        img.alt = card.name;

                        cardDiv.appendChild(img);
                        cardsRow.appendChild(cardDiv);
                    });
                })
                .catch(error => console.error('Error fetching user data:', error));
        }
    }

    registerInformation.addEventListener("submit", (x) => {
        x.preventDefault();
        const username = document.getElementById('registeredUsername').value;
        const password = document.getElementById('registeredPassword').value;

        fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.ok) {
                alert("You are now registered!");
                navigate("loginView");
            } else {
                response.text().then(text => alert(text));
            }
        })
        .catch(error => console.error('Error registering user:', error));
    });

    loginInformation.addEventListener("submit", (x) => {
        x.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.ok) {
                currentUser = username;
                alert("Successful login, welcome!");
                navigate("homeView");
                showMenu(true);
                displayUserInventory();
            } else {
                response.text().then(text => alert(text));
            }
        })
        .catch(error => console.error('Error logging in:', error));
    });

    showRegister.addEventListener("click", (x) => {
        x.preventDefault();
        navigate("registerView");
    });

    showLogin.addEventListener("click", (x) => {
        x.preventDefault();
        navigate("loginView");
    });

    showMenu(false);
    navigate("loginView");

    fetch('/api/cards')
        .then(response => response.json())
        .then(data => {
            allCards = data.cards;
            console.log(allCards);
        })
        .catch(error => console.error('Error fetching cards data:', error));

    document.getElementById("gachaButton").addEventListener('click', function () {
        if (currentUser) {
            fetch(`/api/user/${currentUser}`)
                .then(response => response.json())
                .then(user => {
                    if (user.inventory.length === allCards.length) {
                        document.getElementById('cardDisplay').innerHTML = '';
                        alert("You've pulled all available cards.");
                        return;
                    }

                    let newCards = [];
                    for (let i = 0; i < 2; i++) {
                        let newCard;
                        let attempts = 0;
                        do {
                            const randomIndex = Math.floor(Math.random() * allCards.length);
                            newCard = allCards[randomIndex];
                            attempts++;
                            if (attempts > allCards.length) {
                                alert("Unable to find a new card. Try again.");
                                return;
                            }
                        } while (user.inventory.some(c => c.id === newCard.id));

                        if (newCard) {
                            user.inventory.push(newCard);
                            newCards.push(newCard);
                        } else {
                            console.error('Failed to get a new card.');
                        }
                    }
                    fetch(`/api/user/${currentUser}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(user)
                    })
                    .then(response => response.json())
                    .then(() => {
                        gachaDisplay(newCards);
                        displayUserInventory();
                    })
                    .catch(error => console.error('Error updating user data:', error));
                })
                .catch(error => console.error('Error fetching user data:', error));
        } else {
            alert("Please log in to use the gacha system.");
        }
    });

    function gachaDisplay(cards) {
        const cardDisplay = document.getElementById('cardDisplay');
        cardDisplay.innerHTML = '';

        cards.forEach(card => {
            const cardIcon = document.createElement('img');
            cardIcon.src = card.icon;
            cardIcon.alt = card.name;
            cardIcon.title = card.name;
            cardIcon.classList.add('card-icon');
            cardDisplay.appendChild(cardIcon);
        });
    }
});