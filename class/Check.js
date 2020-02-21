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
    checkForMediumMails(){
        var query = "from:mitchell.rian.smith@gmail.com is:unread";
        var emailBody;
        this.gmail.users.messages.list({
            userId: this.me,
            q: query 
        }, (err, res) => {
            if(!err){

                //mail array stores the mails.
                var mails = res.data.messages;

                //We call the getMail function passing the id of first mail as parameter.
                //console.log("Console.log mails = " + JSON.stringify(mails));
                if(mails !=  undefined){
                    //TODO : Put loop here to check all emails
                    emailBody = this.getMail(mails[0].id);
                }
                return emailBody;
            }
            else{
                return -1;
            }
        });        
    }

    //getMail function retrieves the mail body and parses it for useful content.
    //In our case it will parse for all the links in the mail.
    getMail(msgId){
        
        //This api call will fetch the mailbody.
        this.gmail.users.messages.get({
            'userId': this.me,
            'id': msgId
        }, (err, res) => {
            //console.log('err = ' + err);
            //console.log('res = ' + JSON.stringify(res));
           if(!err){
                var body = res.data.payload.parts[0].body.data; //returns encrypted body
                var htmlBody = base64.decode(body.replace(/-/g, '+').replace(/_/g, '/')); //decrypts the body


                var lines = htmlBody.split('\n');
                var returnLines;
         
                lines.forEach( line => console.log("for each loop line - " + line));
                
                for(var i = 0; i < lines.length ; i++){
                    console.log(i);
                    if(lines[i][0] == '>'){
                        //console.log("begin old email");
                        returnLines = lines.splice(0, i);
                        break;
                    } else {
                        //console.log(lines[i]);
                    }

                }
                console.log(returnLines)
            
                return lines;
            }
        });
    }

    openAllLinks(arr){
        arr.forEach(e => {
            open(e); 
        });
    }
}
module.exports = Check;