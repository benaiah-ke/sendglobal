// This will keep track of the currently logged in user
var loggedInUser = null;

// Api key for currency converter API
const MY_API_KEY = "oHTkg5TwxSW3zWXgc8ISzq1SlEliHUrK";

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
    sendMoneyScreen.classList.add('hidden');

    // User info
    document.querySelector('#user_name').innerText = loggedInUser.name;

    // Currency for sending Money
    document.querySelector('#send_currency').innerText = loggedInUser.currency;

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

    const transactionList = document.querySelector(".transactions tbody");
    transactionList.innerHTML = '';

    loggedInUser.transactions.forEach((transaction) => {
        // Update balance
        balance += parseFloat(transaction.creditAmount);
        balance -= parseFloat(transaction.debitAmount);

        // Add to list of transactions
        transactionList.innerHTML += `
            <tr>
            <td>${transaction.type}</td>
            <td>${parseFloat(transaction.creditAmount).toFixed(2)}</td>
            <td>${parseFloat(transaction.debitAmount).toFixed(2)}</td>
            </tr>
        `;
    });

    document.querySelector('#balance').innerText = loggedInUser.currency + ' ' + balance.toFixed(2);
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

        // Ensure user is not sending to himself
        if(emailField.value == loggedInUser.email){
            alert("You cannot send money to yourself!");
            return;
        }

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

                    convertCurrencyAndSend(receivingUser, amount);

                    // Clear fields
                    emailField.value = '';
                    amountField.value = '';
                }
            });
    })
}

function convertCurrencyAndSend(receivingUser, amount){
    var receive_transaction = {
        user_id: receivingUser.id,
        type: "Money Received",
        debitAmount: 0,
        creditAmount: amount
    };

    var send_transaction = {
        user_id: loggedInUser.id,
        type: "Money Transfer",
        debitAmount: amount,
        creditAmount: 0
    };
    

    // Check if the currencies match
    if(receivingUser.currency == loggedInUser.currency){
        // No need to do conversion for receiver
        saveTransaction(receive_transaction);
        
        // Save the sender's transaction
        saveTransaction(send_transaction)
            .then((res) => {
                updateMainScreen();
            });

    }else{
        // Conversion needed for receiving end

        var currencyApiOptions = {
            method: 'GET',
            redirect: 'follow',
            headers: {
                "apikey": MY_API_KEY
            }
        };

        fetch(`https://api.apilayer.com/exchangerates_data/convert?to=${receivingUser.currency}&from=${loggedInUser.currency}&amount=${amount}`, currencyApiOptions)
            .then(response => response.json())
            .then((conversion) => {
                console.log(conversion);

                // Update and save the receiver transaction
                var creditAmount = conversion.result;

                receive_transaction.creditAmount = creditAmount;

                if(window.confirm(receivingUser.name + " will receive " + receivingUser.currency + " " + creditAmount)){
                    // Save the transactions
                    saveTransaction(receive_transaction);

                    saveTransaction(send_transaction)
                        .then((res) => {
                            updateMainScreen();
                        });
                }

            })
            .catch((error) => {
                console.log("Error: ", error);
                alert("Error. Cannot convert currencies");
            });
    }
}

async function saveTransaction(transaction){

    // Create the sender's transaction
    const data = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(transaction),
    };

    return fetch("http://localhost:3000/transactions", data)
        .then(response => response.json())
        .then(function (object) {
            console.log(object);
        });
}


function toMain() {
    // Hide the login screen and show main screen
    mainScreen.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    sendMoneyScreen.classList.add('hidden');
}
