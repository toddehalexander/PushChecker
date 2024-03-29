function fetchCommits() {
    const usernameInput = document.getElementById("username");
    const username = sanitizeInput(usernameInput.value); // Sanitize username input

    // Check if input contains illegal characters
    if (username !== usernameInput.value) {
        alert("Username contains illegal characters. Please use only alphanumeric characters, hyphens, and underscores.");
        // Clear the input field
        usernameInput.value = "";
        // Return without making the request
        return;
    }

    const url = `https://api.github.com/users/${username}/events/public`;
    const loadingDiv = document.getElementById("loading");
    const resultDiv = document.getElementById("result");

    // Clear previous results
    resultDiv.innerHTML = '';
    loadingDiv.style.display = "block";

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            loadingDiv.style.display = "none";
            const pushEvents = data.filter(event => event.type === 'PushEvent');
            
            if (pushEvents.length > 0) {
                const pushedToday = pushEvents.some(event => isToday(event.created_at));
                const lastPushDate = getLastPushDate(pushEvents);
                
                resultDiv.innerHTML = pushedToday ? `You have pushed to GitHub today. ✅<br>Last push date: ${lastPushDate}` : `You haven't pushed to GitHub today. ❌<br>Last push date: ${lastPushDate}`;
            } else {
                resultDiv.textContent = "User does exist, but has no public push events.";
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            resultDiv.textContent = "Failed to fetch data from GitHub API. Please check your internet connection or try again later.";
            loadingDiv.style.display = "none";
        });
}
