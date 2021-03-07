const PORT = 8080;
var CREDENTIALAS; //Variable used to store GoogleAPI credentials
var express = require('express');
var app = express();

// Add or remove comments on authorize function calls to send or get emails
app.get('/', (req, res) => {
	//Send email function
	authorize(JSON.parse(CREDENTIALAS), sendEmail);

	//Get/Parse email function
	// authorize(JSON.parse(CREDENTIALAS), getEmail);
  	 res.send('Hello World!');
});

app.listen(PORT, () => {
  	console.log('gmailParser app listening on port ' + PORT);

});


////////////
//Google API email Stuff - Start
	//import { readFile, writeFile } from 'fs';
	var fs = require('fs');
	var readFile = fs.readFile;
	var writeFile = fs.writeFile;
	const {createInterface} =  require('readline');
	const {google} =  require('googleapis');


	// If modifying these scopes, delete token.json.
	const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.modify',
	'https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/gmail.send'];
	// The file token.json stores the user's access and refresh tokens, and is
	// created automatically when the authorization flow completes for the first
	// time.
	const TOKEN_PATH = 'token.json';

	//Send an email to mitchell.rian.smith@gmail.com from mitchell.test.smith@gmail.com
	function sendEmail(auth){
		var Mail = require('./class/createMail.js');
		var htmlBody = makeHTMLBody();
		var obj = new Mail(auth, "mitchell.rian.smith@gmail.com", 'Test Subject3', htmlBody, 'mail', '');
			
		//'mail' is the task, if not passed it will save the message as draft.
		obj.makeBody();
		//This will send the mail to the recipent.
	}
	//Use this function to build the HTML body for the email
	function makeHTMLBody(){
		return '<h1>Test Body</h1><table><tr><td>1</td></tr><tr><td>2</td></tr></table>';
	}
	// Load client secrets from a local file.
	readFile('credentials.json', (err, content) => {
	    if(err){
	        return console.log('Error loading client secret file:', err);
	    }

	    // Authorize the client with credentials, then call the Gmail API.
	    CREDENTIALAS = content;
	});

	/**
	 * Create an OAuth2 client with the given credentials, and then execute the
	 * given callback function.
	 * @param {Object} credentials The authorization client credentials.
	 * @param {function} callback The callback to call with the authorized client.
	 */
	function authorize(credentials, callback) {
		const {client_secret, client_id, redirect_uris} = credentials.installed;
		
		const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
		
	     // Check if we have previously stored a token.
	     readFile(TOKEN_PATH, (err, token) => {
	        if(err){
	            return getNewToken(oAuth2Client, callback);
	        }
	        oAuth2Client.setCredentials(JSON.parse(token));
	        callback(oAuth2Client);
	    });
	}

	/**
	 * Get and store new token after prompting for user authorization, and then
	 * execute the given callback with the authorized OAuth2 client.
	 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
	 * @param {getEventsCallback} callback The callback for the authorized client.
	 */

	function getNewToken(oAuth2Client, callback) {
	    const authUrl = oAuth2Client.generateAuthUrl({
	        access_type: 'offline',
	        scope: SCOPES,
	    });
	    console.log('Authorize this app by visiting this url:', authUrl);
	    const rl = createInterface({
	        input: process.stdin,
	        output: process.stdout,
	    });
	    rl.question('Enter the code from that page here: ', (code) => {
	        rl.close();
	        oAuth2Client.getToken(code, (err, token) => {
	        if (err) return console.error('Error retrieving access token', err);
	        oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			console.log(token);
			console.log(token.class)

			//TODO : This writeFile is not working.
			// Temp Fix : Console logged the created token, and put it into the token.json file to make the app work
	        writeFile(TOKEN_PATH, token, (err) => {
	            if (err) return console.error(err);
	            console.log('Token stored to', TOKEN_PATH);
	        });
			callback(oAuth2Client);
	        });
	    });
	}



	//Get unread emails sent to mitchell.test.smith@gmail.com from mitchell.rian.smith@gmail.com
	function getEmail(auth){
    	var Check = require('./class/Check.js');
    	var inbox = new Check(auth);

    	inbox.checkForMediumMails(function (email){
    		if(email != -1){
    			//From here we can use the information from body to parse the array for values, and add a record to a database.
    			console.log(email);

    			//Assuming the email was parsed and added to the database, mark the email as read
    			markEmailAsRead(auth, email.id);
	    	} else {
	    		//Should probably have a better way of showing what the error is
	    		console.log("error when parsing emails or no email to parse");
	    	}
    	});

    }

    //Mark Email as read for given auth and message ID
    function markEmailAsRead(auth, msgId){

    	var Check = require('./class/Check.js');
    	var inbox = new Check(auth);

    	inbox.markEmailAsRead(msgId);

    }

//Google API email Stuff - End
////////////////