// This will keep track of the currently logged in user
var loggedInUser = null;

// UI Screens
const loginScreen = document.querySelector('.login');
const mainScreen = document.querySelector('.main');

// When app starts, we enable a user to log in
login();

function login() {
    // Hide the main screen and show the login screen
    mainScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    // Wait for user to submit credentials
    document.querySelector('.login_form').addEventListener('submit', (event) => {
        event.preventDefault();

        // Input fields
        var emailField = document.querySelector('#email');
        var passwordField = document.querySelector('#password');

        // Get the user based on given email and password
        fetch("http://localhost:3000/users?email=" + emailField.value + "&password=" + passwordField.value)
            .then(response => response.json())
            .then(users => {
                // We only expect a single user if credentials are correct
                // 0 if invalid credentials
                if(users.length == 0){
                    alert("Invalid credentials");
                }else{
                    loggedInUser = users[0];

                    // Clear fields
                    emailField.value = '';
                    passwordField.value = '';

                    // Update the ui based on the new user
                    updateMainScreen();
                }
            });
    });
}


function logout(){
    // Clear the current user
    loggedInUser = null;

    // Allow user to log in again
    login();
}


function updateMainScreen() {
    // Ensure there is a logged in user
    if(loggedInUser == null){
        return;
    }

    // Hide the login screen and show main screen
    mainScreen.classList.remove('hidden');
    loginScreen.classList.add('hidden');

    // Get the user's transactions
    loggedInUser.transactions = [];

    getLatestTransactions();
}

// Get the logged in user's transactions
function getLatestTransactions(){
    
}
