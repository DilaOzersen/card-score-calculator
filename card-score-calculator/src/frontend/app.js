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
});