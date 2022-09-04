# Sendglobal
The application allows users to send money to each other even if they use different currencies

## Set up
- Run npm install to install dependencies
- Run json-server --watch db.json to start the json server
- Use npx json-server --watch db.json if you get the error 'json-server: command not found'

## Usage
Open index.html on a browser
Log in using an email and password. The db.json contains sample user records with the following credentials:
- Email: john@gmail.com Password: password
- Email: alice@gmail.com Password: password

Open index.html in another tab and log in using a different email
You can test transferring funds between the accounts. All you need is specify the recepient's email and the amount

You can see a list of transactions for each user when logged in to his/her account
