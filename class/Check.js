const {google} = require('googleapis');
var base64 = require('js-base64').Base64;
const cheerio = require('cheerio');
var open = require('open');
var Mailparser = require('mailparser').MailParser;

class Check{

    constructor(auth){
        this.me = 'mitchell.test.smith@gmail.com';
        this.gmail = google.gmail({version: 'v1', auth});
        this.auth = auth;
    }

    //Returns the mails in the user's inbox.
    checkInbox(){
        this.gmail.users.messages.list({
            userId: this.me
        }, (err, res) => {
            if(!err){
                console.log(res.data);
            }
            else{
                console.log(err);
            }
        })
    }
    //THis function checks for mails sent by medium.
    //We attatch a query parameter to the request body.
    //Only checks for emails from my main email, and that are unread
    checkForMediumMails(callback){
        var query = "from:mitchell.rian.smith@gmail.com is:unread";
        var emailBody;
        this.gmail.users.messages.list({
            userId: this.me,
            q: query 
        }, (err, res) => {
            if(!err && res.data.messages != undefined ){

                var mails = res.data.messages;

                for(var i = 0; i < mails.length ; i++){
                    this.getMail(mails[i].id, callback);
                }
                
            }
            else{
                 callback(-1);
            }
        });        
    }

    // Mark emails as read
    // Function currently moves email to trash, and does not mark the email as read.
    // The checkMail function will not pick up email in the trash, but would have been nice to move to specific folder or mark email as read
    markEmailAsRead (msgId){
        this.gmail.users.messages.trash({
            'userId': this.me,
            'id': msgId
            }, (err, res) => {
                console.log("moved email to trash");

        })
    }

    //getMail function retrieves the mail body and parses it for useful content.
    getMail(msgId, callback){
        
        //This api call will fetch the mailbody.
        this.gmail.users.messages.get({
            'userId': this.me,
            'id': msgId
        }, (err, res) => {

           if(!err){
                var body = res.data.payload.parts[0].body.data; //returns encrypted body
                var htmlBody = base64.decode(body.replace(/-/g, '+').replace(/_/g, '/')); //decrypts the body

                var lines = htmlBody.split('\n');
                var returnLines = [];
                
                //TODO Work on the logic for this loop and when it drops.
                // If I could check for empty values in here, and not loop it all again after, it would be nicer
                for(var i = 0; i < lines.length ; i++){

                    // check if the rest of the email is an old message
                    // ASSUMPTION - In the most recent email, the user does not have '>' as the first character in the line
                    if(lines[i][0] == '>'){ 
                        returnLines = lines.splice(0, i - 1 );
                        break;
                    } 
                    //This check is to stop the loop because it is a new email.
                    //If this is not checked, the loop will never find a > to stop the loop and return the email
                    else if (lines.length <= i + 1){
                        returnLines = lines;
                        break;
                    } 
                    //Removed \r (and other values) from a string
                    else {
                        lines[i] = lines[i].replace(/(\r\n|\n|\r)/gm,"");                        
                    }
                }
                //Deveoloper note.
                //  If I checked for empty value at the start of the above for loop, it would miss values in the middle
                //  If I checked at the end of the above loop, it would miss values at the end of the array.
                // I might have the above notes backwards, but I tried it at the  start and the finish, and both spots would miss one or the other

                for(var i = 0; i < returnLines.length; i++){
                    //remove empty values in array, decrease i to check next value in the loop
                    if(returnLines[i] == "" ){ 
                        returnLines.splice(i, 1);
                        i--;
                    }
                }
                //The return array still has the "On DATE Name<email> wrote" line.
                //TODO work on a way to remove that line
                
                return callback({ "id" : msgId, "body" : returnLines});
            }
        });
    }

}
module.exports = Check;