import requests
from datetime import datetime, timezone

# Get GitHub username from user
username = input("Enter your GitHub username: ")

def get_user_commits(username):
    # GitHub API endpoint to fetch user's public events
    url = f"https://api.github.com/users/{username}/events/public"

    # Make a GET request to fetch user's events
    response = requests.get(url)
    
    # Check if the request was successful
    if response.status_code == 200:
        events = response.json()
        # Filter events to find only push events
        push_events = [event for event in events if event['type'] == 'PushEvent']
        return push_events
    else:
        print("Failed to fetch data from GitHub API")
        return None

def have_pushed_today(push_events):
    if not push_events:
        return False
    # Get today's date in local time
    today = datetime.now().date()
    # Convert today's date to UTC for comparison
    today_utc = datetime.now(timezone.utc).date()
    # Check if any push event occurred today in local time
    for event in push_events:
        event_date = datetime.strptime(event['created_at'], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).astimezone(tz=None).date()
        if event_date == today:
            return True
    return False

def print_last_push_date(push_events):
    if not push_events:
        print("No push events found.")
        return

    last_push_date = None
    for event in push_events:
        event_date = datetime.strptime(event['created_at'], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).astimezone(tz=None).date()
        if last_push_date is None or event_date > last_push_date:
            last_push_date = event_date

    today = datetime.now().date()
    if last_push_date == today:
        print(f"You pushed today: {last_push_date}")
    else:
        print(f"Last push date: {last_push_date}")

# Fetch user's push events
user_commits = get_user_commits(username)

if user_commits is not None:
    if have_pushed_today(user_commits):
        print("You have pushed to GitHub today. 🎉")
    else:
        print("You haven't pushed to GitHub today. 😢")
    print_last_push_date(user_commits)