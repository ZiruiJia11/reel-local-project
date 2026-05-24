import json  # For encoding/decoding JSON data
from browser import window, ajax  # Brython's interface to the browser and AJAX calls

# List to hold users fetched from the server for login/authentication
usersData = []

# Helper: returns the localStorage key for a user's data
def storage_key(username):
    return f"ReelLocalData_{username}"

# Load per-user data from localStorage (for persistence)
def loadUserStorage(username):
    key = storage_key(username)
    raw = window.localStorage.getItem(key)  # Get the string value
    if raw:
        try:
            return json.loads(raw)  # Parse and return the data as Python dict
        except Exception:
            return None  # If JSON is malformed, return None
    return None  # No data found

# Save current user's schedule, meetups, and availability to localStorage
def saveUserStorage(username):
    key = storage_key(username)
    data = {
        "movieSchedule": app.movieSchedule,
        "meetups": app.meetups,
        "availability": app.availability
    }
    window.localStorage.setItem(key, json.dumps(data))  # Store as JSON string

# Fetch the current film schedule from a remote server
def load_films():
    def cb(req):  # Callback to process AJAX response
        if req.status == 200:
            try:
                app.movies = json.loads(req.text)  # Load movie data into Vue
            except Exception as e:
                print("Error parsing films JSON:", e)
        else:
            print(f"Error loading films (status {req.status})")
    r = ajax.ajax()
    r.bind('complete', cb)  # Run cb when the request is done
    r.open('GET', 'https://api.npoint.io/43077bba2eaff60fc287')  # Film list endpoint
    r.send()

# Fetch the user list for login/authentication from a remote server
def load_users():
    def cb(req):  # Callback for AJAX
        global usersData
        if req.status == 200:
            try:
                usersData = json.loads(req.text)  # Parse and store users
            except Exception as e:
                print("Error parsing users JSON:", e)
        else:
            print(f"Error loading users (status {req.status})")
    r = ajax.ajax()
    r.bind('complete', cb)
    r.open('GET', 'https://api.npoint.io/331539dc8941cb5b310c')  # User list endpoint
    r.send()

# Try to log in with the entered username and password
def login(ev):
    app.loginError = ""
    if not usersData:
        app.loginError = "User data still loading, please try again shortly."
        return
    # Find a user with matching credentials
    user = next((u for u in usersData if u["loginName"] == app.username and u["password"] == app.password), None)
    if user:
        app.isLoggedIn = True
        # Fill otherUsers (exclude current user and hide passwords)
        app.otherUsers = [{k: v for k, v in u.items() if k != "password"}
                           for u in usersData if u["loginName"] != user["loginName"]]
        # Set up the user's schedule, meetups, and availability
        initialSchedule = []
        for idx, att in enumerate(user.get("attendances", [])):
            # Try to pair attendance with a selected film title
            title = user.get("selectedFilms", [])[idx] if idx < len(user.get("selectedFilms", [])) else ""
            initialSchedule.append({"title": title, "time": f"{att['date']} at {att['time']}"})
        initialAvailability = [f"{av['day']} @ {av['startTime']}" for av in user.get("availability", [])]
        initialMeetups = []
        # Load previous data if it exists, otherwise use fresh
        stored = loadUserStorage(user["loginName"])
        if stored:
            app.movieSchedule = stored.get("movieSchedule", initialSchedule)
            app.availability = stored.get("availability", initialAvailability)
            app.meetups = stored.get("meetups", initialMeetups)
        else:
            app.movieSchedule = initialSchedule
            app.availability = initialAvailability
            app.meetups = initialMeetups
    else:
        app.loginError = "Invalid username or password"  # Bad login

# Logout: Reset all user-specific app state
def logout(ev):
    app.isLoggedIn = False
    app.username = ""
    app.password = ""
    app.loginError = ""
    app.movieSchedule = []
    app.meetups = []
    app.availability = []

# RSVP logic: Add a movie RSVP to current user's schedule
def submitRSVP(ev):
    if app.rsvpMovie and app.rsvpTime:
        app.movieSchedule.append({"title": app.rsvpMovie, "time": app.rsvpTime})
        saveUserStorage(app.username)  # Save to storage
        app.rsvpMovie = ""  # Reset form
        app.rsvpTime = ""
        app.rsvpCount = 1

# Remove a movie RSVP from the schedule
def cancelMovie(i):
    del app.movieSchedule[i]
    saveUserStorage(app.username)

# Meetups: Add a meetup event
def submitMeetup(ev):
    if app.meetupName and app.meetupDay and app.meetupTime:
        mt = {
            "title": app.meetupName,
            "time": f"{app.meetupDay} at {app.meetupTime}",
            "invited": list(app.selectedMembers)  # Save the invited members!
        }
        app.meetups.append(mt)
        saveUserStorage(app.username)
        # Reset form fields
        app.meetupName = ""
        app.meetupDay = "Monday"
        app.meetupTime = ""
        app.selectedMembers = []


# Remove a meetup
def cancelMeetup(i):
    del app.meetups[i]
    saveUserStorage(app.username)

# Add a new availability slot for the current user
def saveAvailability(ev):
    if app.availableDay and app.availableStart:
        slot = f"{app.availableDay} @ {app.availableStart}"
        app.availability.append(slot)
        saveUserStorage(app.username)
        app.availableStart = ""  # Reset form

# Remove an availability slot
def cancelAvailability(i):
    del app.availability[i]
    saveUserStorage(app.username)

# Show movie details when a movie is clicked
def selectMovie(m):
    app.selectedMovie = m
    app.showDetails = True

# Close movie details panel
def closeMovieDetails(ev=None):
    app.showDetails = False
    app.selectedMovie = None

# --- BOOTSTRAP VUE APP ---

# Create the Vue app instance and define all state and handlers
app = window.Vue.new({
    "el": "#app",  # Mount to #app div
    "data": {
        "isLoggedIn": False,        # Is user logged in
        "username": "",             # Input username
        "password": "",             # Input password
        "loginError": "",           # Display login error
        "movies": [],               # All movies from server
        "otherUsers": [],           # Other users' public info
        "movieSchedule": [],        # Current user's RSVP list
        "meetups": [],              # Meetups created by user
        "availability": [],         # User's available times
        "availableDay": "Monday",   # Default day for availability form
        "availableStart": "",       # Selected time for availability form
        "rsvpMovie": "",            # Selected movie for RSVP
        "rsvpTime": "",             # Selected time for RSVP
        "rsvpCount": 1,             # How many attending (input)
        "meetupName": "",           # Meetup form: name
        "meetupDay": "Monday",      # Meetup form: day
        "meetupTime": "",           # Meetup form: time
        "selectedMembers": [],      # Invited members for meetup
        "selectedMovie": None,      # Movie selected for details popup
        "timeOptions": [            # Available times in 24h
            "00:00","01:00","02:00","03:00","04:00","05:00",
            "06:00","07:00","08:00","09:00","10:00","11:00",
            "12:00","13:00","14:00","15:00","16:00","17:00",
            "18:00","19:00","20:00","21:00","22:00","23:00"
        ],
        "showDetails": False        # Whether movie details dialog is shown
    },
    "methods": {
        "login": login,                         # Link form methods to functions
        "logout": logout,
        "submitRSVP": submitRSVP,
        "cancelMovie": cancelMovie,
        "submitMeetup": submitMeetup,
        "cancelMeetup": cancelMeetup,
        "saveAvailability": saveAvailability,
        "cancelAvailability": cancelAvailability,
        "selectMovie": selectMovie,
        "closeMovieDetails": closeMovieDetails
    }
})

# On load, fetch movies and users from the server
load_films()
load_users()
