document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('checkCommits').addEventListener('click', fetchCommits);
});

function fetchCommits() {
    const username = document.getElementById("username").value;
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
                resultDiv.textContent = "No push events found.";
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            resultDiv.textContent = "Failed to fetch data from GitHub API";
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
