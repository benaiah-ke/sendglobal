// This will keep track of the currently logged in user
var loggedInUser = null;

// UI Screens
const loginScreen = document.querySelector('.login');
const mainScreen = document.querySelector('.main');
const sendMoneyScreen = document.querySelector('.send_money');

// When app starts, we enable a user to log in
login();

// Listeners
document.querySelector('#logout_btn').addEventListener('click', logout);
document.querySelector('#send_money_btn').addEventListener('click', sendMoney);

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
    fetch("http://localhost:3000/transactions?user_id=" + loggedInUser.id)
            .then(response => response.json())
            .then(transactions => {
                loggedInUser.transactions = transactions;

                // Show the transactions and balance
                updateTransactionUi();
            });
}

function updateTransactionUi(){
    var balance = 0;

    const transactionList = document.querySelector(".transactions");
    loggedInUser.transactions.forEach((transaction) => {
        // Update balance
        balance += transaction.creditAmount;
        balance -= transaction.debitAmount;

        // Add to list of transactions
        transactionList.innerHTML = '';
        transactionList.innerHTML += `
            <li>
            ${transaction.type}-
            ${transaction.creditAmount}-
            ${transaction.debitAmount}-
            </li>
        `;
    });

    document.querySelector('#balance').innerText = loggedInUser.currency + ' ' + balance;
}


function sendMoney(){
    // Hide the main screen and show send money screen
    mainScreen.classList.add('hidden');
    sendMoneyScreen.classList.remove('hidden');

    document.querySelector('.send_money_form').addEventListener('submit', (event) => {
        event.preventDefault();

        // Input fields
        var emailField = document.querySelector('.send_money_form .email');
        var amountField = document.querySelector('.send_money_form .amount');

        // Ensure user has enough balance
        var amount = amountField.value;
        if(amount > loggedInUser.balance){
            alert("Amount exceeds your balance!");
            return;
        }

        // Check if the recepient exists
        fetch("http://localhost:3000/users?email=" + emailField.value)
            .then(response => response.json())
            .then(users => {
                // We only expect a single user if the user exists
                // 0 if invalid credentials
                if(users.length == 0){
                    alert("The recepient does not exist");
                }else{
                    var receivingUser = users[0];

                    sendToUser(receivingUser, amount);

                    // Clear fields
                    emailField.value = '';
                    amountField.value = '';
                }
            });
    })
}

function sendToUser(receivingUser, amount){
    var time = "2022-09-01 10:43"

    // Create the two transactions
    var send_transaction = {
        user_id: loggedInUser.id,
        type: "Money Transfer",
        debitAmount: amount,
        creditAmount: 0,
        time: time
    };

    var receive_transaction = {
        user_id: receivingUser.id,
        type: "Money Received",
        debitAmount: 0,
        creditAmount: amount,
        time: time
    };
}

function getConvertedAmount(amount, currencyFrom, currencyTo) {

}
