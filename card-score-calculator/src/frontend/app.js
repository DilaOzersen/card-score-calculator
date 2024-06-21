document.addEventListener("DOMContentLoaded", () => {
    function navigate(viewId) {
        // Hide all views
        document.querySelectorAll(".view").forEach((view) => {
            view.style.display = "none";
        });

        // Show the requested view
        document.getElementById(viewId).style.display = "block";
    }

    document.getElementById("home").addEventListener("click", () => navigate("homeView"));
    document.getElementById("gacha").addEventListener("click", () => navigate("gachaView"));
    document.getElementById("inventory").addEventListener("click", () => navigate("inventoryView"));
    document.getElementById("teams").addEventListener("click", () => navigate("teamsView"));

    document.getElementById("gachaImg").addEventListener("click", () => navigate("gachaView"));
    document.getElementById("inventoryImg").addEventListener("click", () => navigate("inventoryView"));
    document.getElementById("teamsImg").addEventListener("click", () => navigate("teamsView"));
    
    // Initialize with the login view (temp home view)
    navigate("homeView");

    // Fetch card data and display in the inventory view. this will eventually be fetched from your inventory when the backend is implemented!
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            const cardsRow = document.getElementById('cardsRow');
            data.cards.forEach(card => {
                const img = document.createElement('img');
                img.src = card.icon;
                img.alt = card.name;
                cardsRow.appendChild(img);
            });

            // Set up team display
            const team1CardsRow = document.getElementById('team1CardsRow');
            const team1CardsPreview = document.getElementById('team1CardsPreview');
            for (let i = 0; i < 5; i++) {
                const img = document.createElement('img');
                img.src = data.cards[i].icon;
                img.alt = data.cards[i].name;
                team1CardsRow.appendChild(img);
                team1CardsPreview.appendChild(img.cloneNode(true)); // Clone the image for preview
            }

            const team2CardsRow = document.getElementById('team2CardsRow');
            const team2CardsPreview = document.getElementById('team2CardsPreview');
            const team3CardsRow = document.getElementById('team3CardsRow');
            const team3CardsPreview = document.getElementById('team3CardsPreview');

            // Set up team navigation
            document.querySelectorAll('.team-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const teamId = event.target.getAttribute('data-team');
                    navigate(teamId);
                });
            });

            // Team editing logic (simplified example)
            document.querySelectorAll('.team-button').forEach(button => {
                button.addEventListener('dblclick', (event) => {
                    const teamEdit = document.getElementById('teamEdit');
                    teamEdit.classList.remove('active');
                    const teamId = event.target.getAttribute('data-team');
                    const teamCardsRow = document.getElementById('teamCardsRow');
                    teamCardsRow.innerHTML = '';
                    
                    let teamCards = [];
                    if (teamId === 'team1View') {
                        teamCards = data.cards.slice(0, 5);
                    } else if (teamId === 'team2View') {
                        teamCards = data.cards.slice(5, 10);
                    } else if (teamId === 'team3View') {
                        teamCards = data.cards.slice(10, 15);
                    }

                    teamCards.forEach(card => {
                        const img = document.createElement('img');
                        img.src = card.icon;
                        img.alt = card.name;
                        teamCardsRow.appendChild(img);
                    });

                    teamEdit.classList.add('active');
                });
            });
        })
        .catch(error => console.error('Error loading cards:', error));
});