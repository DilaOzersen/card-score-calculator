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

        // clear login fields when navigating to loginView
        if (viewId === "loginView") {
            clearLoginFields();
        }

        // clear register fields when navigating to registerView
        if (viewId === "registerView") {
            clearRegisterFields();
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

    // login/register variables
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

    // clears login/register fields when called
    function clearLoginFields() {
        document.getElementById("loginUsername").value = '';
        document.getElementById("loginPassword").value = '';
    }

    function clearRegisterFields() {
        document.getElementById('registeredUsername').value = '';
        document.getElementById('registeredPassword').value = '';
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
                populateTeamDropdowns('team1');
                populateTeamDropdowns('team2');
                populateTeamDropdowns('team3');
                displayUserInventory();
                loadUserTeams();
                populateTeamCardPreviews('team1');
                populateTeamCardPreviews('team2');
                populateTeamCardPreviews('team3');
            } else {
                response.text().then(text => {
                    alert(text)
                    clearLoginFields();
            });
            }
        })
        .catch(error => {
            console.error('Error logging in:', error)
            clearLoginFields();
        });
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
                        } while (user.inventory.some(c => c.id === newCard.id));

                        if (newCard) {
                            user.inventory.push(newCard);
                            newCards.push(newCard);
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

// populates the dropdowns and fields found on the team view pages
function populateTeamDropdowns(teamName) {
    const dropdownIds = [
        `${teamName}Card1Dropdown`, `${teamName}Card2Dropdown`, `${teamName}Card3Dropdown`, 
        `${teamName}Card4Dropdown`, `${teamName}Card5Dropdown`
    ];

    if (currentUser) {
        fetch(`/api/user/${currentUser}`)
            .then(response => response.json())
            .then(user => {
                const teamCards = user.teams[teamName] || new Array(5).fill(null);

                dropdownIds.forEach((dropdownId, index) => {
                    const dropdown = document.getElementById(dropdownId);
                    if (!dropdown) {
                        console.error(`Dropdown element with ID ${dropdownId} not found.`);
                        return;
                    }
                    
                    dropdown.innerHTML = '<option value="">Select a card</option>';
        
                    // populate options with card names
                    user.inventory.forEach(card => {
                        const option = document.createElement('option');
                        option.value = card.name;
                        option.textContent = card.name;
                        dropdown.appendChild(option);
                    });

                    if (teamCards[index]) {
                        dropdown.value = teamCards[index].name;
                    }

                    // event listener for when user changes any dropdown
                    dropdown.addEventListener('change', (event) => {
                        const selectedCardName = event.target.value;
                        
                        // if "Select a card" is chosen, keep the previous card
                        if (selectedCardName === "") {
                            event.target.value = teamCards[index] ? teamCards[index].name : "";
                            return;
                        }

                        const selectedCard = user.inventory.find(card => card.name === selectedCardName);
                        
                        if (selectedCard) {
                            // checks for duplicates
                            const isDuplicate = teamCards.some((card, cardIndex) => 
                                card && card.name === selectedCard.name && cardIndex !== index
                            );

                            if (isDuplicate) {
                                alert("This card is already in the team. Please select a different card.");
                                event.target.value = teamCards[index] ? teamCards[index].name : "";
                            } else {
                                teamCards[index] = selectedCard;
                                user.teams[teamName] = teamCards;
                                
                                // update user data, including teams
                                fetch(`/api/user/${currentUser}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(user)
                                })
                                .then(response => response.json())
                                .then(() => {
                                    // after updating, refresh the display
                                    populateTeamCardPreviews(teamName);
                                    displayCardIcon(dropdownId, `${teamName}Card${index + 1}Icon`, teamName);
                                    calculateAndDisplayTeamStats(teamName, teamCards);
                                })
                                .catch(error => console.error('Error updating user teams:', error));
                            }
                        }
                    });
                });

                // after setting up all dropdowns, display the icons
                dropdownIds.forEach((dropdownId, index) => {
                    displayCardIcon(dropdownId, `${teamName}Card${index + 1}Icon`, teamName);
                });

                // refresh the team previews
                calculateAndDisplayTeamStats(teamName, teamCards);
                populateTeamCardPreviews(teamName);
            })
            .catch(error => console.error('Error fetching user data:', error));
    } else {
        alert("Please log in to use the team system.");
    }
}

// displays card icons for the cards selected from the dropdown
function displayCardIcon(dropdownId, iconId, teamName) {
    const dropdown = document.getElementById(dropdownId);
    const selectedCardName = dropdown.value;

    if (currentUser) {
        fetch(`/api/user/${currentUser}`)
            .then(response => response.json())
            .then(user => {
                const teamCards = user.teams[teamName] || new Array(5).fill(null);
                
                // Calculate index based on the position in the dropdownIds array
                const dropdownIds = [
                    `${teamName}Card1Dropdown`, `${teamName}Card2Dropdown`, `${teamName}Card3Dropdown`, 
                    `${teamName}Card4Dropdown`, `${teamName}Card5Dropdown`
                ];
                const index = dropdownIds.indexOf(dropdownId);

                const selectedCard = user.inventory.find(card => card.name === selectedCardName);
                const icon = document.getElementById(iconId);

                if (!icon) {
                    console.error(`Icon element with id ${iconId} not found.`);
                    return;
                }

                if (selectedCard) {
                    icon.src = selectedCard.icon;
                    icon.alt = selectedCard.name;
                    icon.style.display = 'inline-block';
                    
                    // update the team data
                    teamCards[index] = selectedCard;
                    user.teams[teamName] = teamCards;

                    // API call to update user data on the server
                    fetch(`/api/user/${currentUser}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(user)
                    })
                    .then(response => response.json())
                    .catch(error => console.error('Error updating user teams:', error));
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

// loads the user teams
function loadUserTeams() {
    if (currentUser) {
        fetch(`/api/user/${currentUser}`)
            .then(response => response.json())
            .then(user => {
                teams = user.teams;
                populateTeamDropdowns('team1');
                populateTeamDropdowns('team2');
                populateTeamDropdowns('team3');
            })
            .catch(error => console.error('Error fetching user data:', error));
    }
}

// displays all the teams on the teamView page
function populateTeamCardPreviews(teamName) {
    const teamCardsPreview = document.getElementById(`${teamName}_CardsPreview`);
    if (currentUser) {
        fetch(`/api/user/${currentUser}`)
            .then(response => response.json())
            .then(user => {
                teamCardsPreview.innerHTML = '';
                const teamCards = user.teams[teamName] || new Array(5).fill(null);
                teamCards.forEach(card => {
                    if (card) {
                        const img = document.createElement('img');
                        img.src = card.icon;
                        img.alt = card.name;
                        img.className = 'card-preview';
                        teamCardsPreview.appendChild(img);
                    } else {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'card-placeholder';
                        teamCardsPreview.appendChild(placeholder);
                    }
                });
            })
            .catch(error => console.error('Error fetching user data:', error));
    }
}

// calculates all stats on the team pages
function calculateAndDisplayTeamStats(teamName, teamCards) {
    let totalAppeal = 0;
    let totalStamina = 0;
    let totalTechnique = 0;

    teamCards.forEach(card => {
        if (card) {
            totalAppeal += card['appeal 1'] || 0;
            totalStamina += card['stamina 1'] || 0;
            totalTechnique += card['technique 1'] || 0;
        }
    });

    const totalScore = totalAppeal + totalStamina + totalTechnique;

    document.getElementById(`totalAppeal${teamName}`).textContent = totalAppeal;
    document.getElementById(`totalStamina${teamName}`).textContent = totalStamina;
    document.getElementById(`totalTechnique${teamName}`).textContent = totalTechnique;
    document.getElementById(`totalScore${teamName}`).textContent = totalScore;

    if (teamCards[0]) {
        document.getElementById(`leaderSkill${teamName}`).textContent = teamCards[2].leaderSkill || 'None';
    } else {
        document.getElementById(`leaderSkill${teamName}`).textContent = 'None';
    }
}