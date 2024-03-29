document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('checkCommits').addEventListener('click', fetchCommits);
    document.getElementById('username').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            fetchCommits();
        }
    });
});

function fetchCommits() {
    const username = sanitizeInput(document.getElementById("username").value); // Sanitize username input
    const url = `https://api.github.com/users/${username}/events/public`;
    const loadingDiv = document.getElementById("loading");
    const resultDiv = document.getElementById("result");

    // Clear previous results
    resultDiv.innerHTML = '';
    loadingDiv.style.display = "block";

    fetch(url)
        .then(response => response.json())
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
            resultDiv.textContent = "Failed to fetch data from GitHub API, invalid username or rate limit exceeded.";
            loadingDiv.style.display = "none";
        });
}

function isToday(dateString) {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
}

function getLastPushDate(pushEvents) {
    let lastPushDate = null;
    pushEvents.forEach(event => {
        const eventDate = new Date(event.created_at);
        if (!lastPushDate || eventDate > lastPushDate) {
            lastPushDate = eventDate;
        }
    });
    return lastPushDate ? lastPushDate.toDateString() : "Unknown";
}

function sanitizeInput(input) {
    // Sanitize input to prevent potential XSS attacks
    return input.replace(/[^a-zA-Z0-9-_]/g, ''); // Allow only alphanumeric characters, hyphens, and underscores
}
