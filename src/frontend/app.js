let currentUser = null;
let allCards = [];
let teams = {
    team1: new Array(5).fill(null),
    team2: new Array(5).fill(null),
    team3: new Array(5).fill(null)
};

document.addEventListener("DOMContentLoaded", () => {
    // function to help navigate through the different views
    function navigate(viewId) {
        // hide all views
        document.querySelectorAll(".view").forEach((view) => {
            view.style.display = "none";
        });
        document.getElementById(viewId).style.display = "block";

        // show the specific view requested
        if (viewId === "team1View" || viewId === "team2View" || viewId === "team3View") {
            const teamNumber = viewId.charAt(4);
            populateTeamDropdowns(`team${teamNumber}`);
        }
    }
    
    // event listeners that help you navigate when a button is clicked
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

    //login/register variables
    const loginInformation = document.getElementById("loginInformation");
    const registerInformation = document.getElementById("registerInformation");
    const showRegister = document.getElementById("showRegister");
    const showLogin = document.getElementById("showLogin");

    // function to help gather all registered users
    function showMenu(user) {
        const menu = document.getElementById("menu");
        if (user) {
            menu.style.display = "block";
        } else {
            menu.style.display = "none";
        }
    }

    // function to display the user's inventory
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

    // POST call to the API that registers the user to the system
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

    // POST call to the API that logs the user in
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

    showMenu(false);
    navigate("loginView");

    // fetch card data and display in the inventory view, uses a PUT call to the API
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

    // displays cards that the user pulls in the gacha
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

// populates the dropdowns found on the team view pages
// ALL CODE BELOW IS A WORK IN PROGRESS.
function populateTeamDropdowns(teamName) {
    const teamCards = teams[teamName];
    const dropdownIds = [
        `${teamName}Card1Dropdown`, `${teamName}Card2Dropdown`, `${teamName}Card3Dropdown`, 
        `${teamName}Card4Dropdown`, `${teamName}Card5Dropdown`
    ];

    if (currentUser) {
        fetch(`/api/user/${currentUser}`)
            .then(response => response.json())
            .then(user => {
                dropdownIds.forEach((dropdownId, index) => {
                    const dropdown = document.getElementById(dropdownId);
                    if (!dropdown) {
                        console.error(`Dropdown element with ID ${dropdownId} not found.`);
                        return;
                    }
                    
                    dropdown.innerHTML = '<option value="">Select a card</option>';
        
                    // Populate options with user's card names
                    const availableCards = user.inventory.filter(card => !teamCards.includes(card.name));
                    availableCards.forEach(card => {
                        const option = document.createElement('option');
                        option.value = card.name;
                        option.textContent = card.name;
                        dropdown.appendChild(option);
                    });

                    // Add event listener to update team data on selection change
                    dropdown.addEventListener('change', (event) => {
                        const selectedCardName = event.target.value;

                        // Ensure teamCards is defined before accessing includes method
                        if (teamCards && teamCards.includes(selectedCardName)) {
                            alert(`The card "${selectedCardName}" is already in ${teamName}.`);
                            dropdown.value = ''; // Reset dropdown to default
                            console.log("duplicate cleared");
                        } else {
                            // Update teamCards only if it's defined
                            if (teamCards) {
                                teamCards[index] = selectedCardName;
                                console.log(`Team ${teamName} updated:`, teams);
                            }

                            const iconId = `${teamName}Card${index + 1}Icon`;
                            displayCardIcon(dropdownId, iconId, teamName);
                        }
                    });
    
                });
            })
            .catch(error => console.error('Error fetching user data:', error));
    } else {
        alert("Please log in to use the team system.");
    }
}

function displayCardIcon(dropdownId, iconId, originalTeam) {
    const dropdown = document.getElementById(dropdownId);
    const selectedCardName = dropdown.value;

    if (!selectedCardName) {
        // If no card is selected, hide the icon
        const icon = document.getElementById(iconId);
        if (icon) {
            icon.src = '';
            icon.alt = 'Card Icon';
            icon.style.display = 'none';
        }
        return;
    }

    if (currentUser) {
        fetch(`/api/user/${currentUser}`)
            .then(response => response.json())
            .then(user => {
                const teamName = dropdownId.replace("Dropdown", "");
                console.log(teamName);
                console.log(originalTeam)
                const teamCards = teams[originalTeam] || [];

                const selectedCard = user.inventory.find(card => card.name === selectedCardName);
                const icon = document.getElementById(iconId);

                if (!icon) {
                    console.error(`Icon element with id ${iconId} not found.`);
                    return;
                }

                if ((teamCards.includes(selectedCardName))) {
                    icon.src = '';
                    icon.alt = 'Card Icon';
                    icon.style.display = 'none';
                    console.log("duplicate here");
                } 
                
                if (selectedCard) {
                    icon.src = selectedCard.icon;
                    icon.alt = selectedCard.name;
                    icon.style.display = 'inline-block';
                    console.log("duplicate not here");
                } else {
                    icon.src = '';
                    icon.alt = 'Card Icon';
                    icon.style.display = 'none';
                }
            })
            .catch(error => console.error('Error fetching user data:', error));
    } else {
        alert("Please log in to use the team system.");
    }
}