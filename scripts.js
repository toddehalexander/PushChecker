document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('checkPushes').addEventListener('click', fetchPushes);
    document.getElementById('username').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            fetchPushes();
        }
    });
});

function fetchPushes() {
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
            const avatarUrl = data[0]?.actor?.avatar_url; // Get avatar URL

            // Calculate streak
            const streak = calculateStreak(pushEvents, username);

            // Set the img and result content separately
            const imgContent = `<img src="${avatarUrl}" alt="Profile Picture" width="100" height="100">`;
            let resultContent = pushedToday ? `You have pushed to <a href="https://github.com/${username}" target="_blank">GitHub</a> today. ✅<br>` : `You haven't pushed to <a href="https://github.com/${username}" target="_blank">GitHub</a> today. ❌<br>`;
            resultContent += `Last push date: ${lastPushDate}<br>`;
            if (streak > 0) {
                resultContent += `Streak: ${streak} days 🔥`;
            }

            // Set the content in the resultDiv
            resultDiv.innerHTML = `${imgContent}<br>${resultContent}`;
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

function calculateStreak(pushEvents, username) {
    let streak = 0;
    let maxStreak = 0;
    let countedDates = new Set();

    // Load previous streak data from local storage
    let storedStreak = JSON.parse(localStorage.getItem(`streak_${username}`)) || { streak: 0, dates: [] };

    // Add previously counted dates to the set
    storedStreak.dates.forEach(date => countedDates.add(date));

    // Sort push events by date in ascending order
    pushEvents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // Get the earliest and latest push event dates
    const earliestDate = new Date(pushEvents[0].created_at);
    const latestDate = new Date(pushEvents[pushEvents.length - 1].created_at);

    // Iterate over the date range and check for consecutive push events
    for (let currentDate = earliestDate; currentDate <= latestDate; currentDate.setDate(currentDate.getDate() + 1)) {
        const formattedDate = currentDate.toDateString();
        if (!countedDates.has(formattedDate)) {
            countedDates.add(formattedDate);
            const hasPushEvent = pushEvents.some(event => new Date(event.created_at).toDateString() === formattedDate);
            if (hasPushEvent) {
                streak++;
                maxStreak = Math.max(maxStreak, streak);
            } else {
                streak = 0;
            }
        }
    }

    // Save updated streak data to local storage
    localStorage.setItem(`streak_${username}`, JSON.stringify({ streak: maxStreak, dates: Array.from(countedDates) }));

    return maxStreak;
}

function isConsecutiveDay(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
    return diffDays === 1;
}

function sanitizeInput(input) {
    // Sanitize input to prevent potential XSS attacks
    return input.replace(/[^a-zA-Z0-9-_]/g, ''); // Allow only alphanumeric characters, hyphens, and underscores
}