
// server.js
const express = require('express');  
const app = express();  
const server = require('http').createServer(app);  
const io = require('socket.io')(server);
const request = require('request');
const constants     = require(process.env.CENCONFIG?process.env.CENCONFIG:"./constants");    
console.log("constants file "+constants.file);
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


const askCen = require('./cenAsks')(constants);

var CMUDict = require('cmudict').CMUDict;
var cmudict = new CMUDict();

/**
 * set of words that need to be replaced for phonemePhrases
 */
const wreplace = {
  "bot": "bott",
  "bots": "botts"
};

var clients = {};

function phonemePhrase(txt){
  answer = [];
  if (txt) {
    var txt2 = txt.replace(/[^A-Za-z0-9]/g, " ");
    var words = txt2.toLowerCase().split(" ");
    console.log("phonemePhrase: "+txt2);
    answer = [];
    for (var i = 0; i < words.length-1 ; i++) {
      var w = words[i];
      if(wreplace[w]){
        w2 = wreplace[w];
        w = w2;
      }
      var p1 = cmudict.get(w);
      if(p1){
        answer.push(p1);
      }
      answer.push('.');
    }  
  }
  return answer;
}

const cookieParser = require('cookie-parser');
const session = require('express-session')
app.use(cookieParser());
app.use(session({
    secret: 'x4JUBeaLl32ET9gEw0nXrO3Ty2LD8uecIPuLYbPFZNrK3aBU', // just a long random string
    resave: false,
    saveUninitialized: true
}));

app.use(express.static('public'));



var port = process.env.PORT ||constants.listenPort;
server.listen(port, function() {
  console.log("Listening on " + port);
});


// On localhost:3000/chat/send2sess
// curl -d '{"clientId":"value1", "chatId":"value2","message":"testing 1 2 "}' -H "Content-Type: application/json" -X POST http://localhost:3000/chat/send2sess

app.post('/chat/send2sess', function (req, res) {         
  console.log("send2sess ");
  console.log(req.body);
  var now = (new Date(Date.now())).toUTCString();

  let chatId = req.body.chatId;
  let message = req.body.message;
  console.log("send2sess "+chatId+"/"+message)

  if ( chatId in clients ){
    var resp = {};
    resp.phonemes = phonemePhrase(message);
    resp.text = message; 
    console.log(now+"/server.js:85 << "+JSON.stringify(resp));
    clients[chatId].send(resp);
    res.send({status:"OK"});
  }
  else {
    console.log('Client not present...'+chatId);
    res.send({status:"Client not present..."+chatId});
  }
});


io.on('connection', function(client) {  
    console.log('Client connected...'+client.id);
    clients[client.id]=client;    //record in array
    client.emit('login',client.id);
    client.on('message', function(data) {
        console.log("server.js:103:connection/"+JSON.stringify(data));
        var sid = data.sid;
        var msg = data.text;
        var ts = data.ts;
        var now = (new Date(Date.now())).toUTCString();

        var username = data.username?data.username:"John Doe";

        var propertiesObject = { 
            question:   msg, 
            sessionid:  "curlAPI:"+sid.substring(0,8),
            chatid:     client.id,
            username:   username,
            asyncMsg:   constants.urlAsync2Web,  // add connection.. 
            channelType: "web",
            chatName:   username
        };
        console.log('onText: propertiesObject :122 ' + JSON.stringify(propertiesObject));   
        
        if(constants.urlProgramY == "LOOPBACK"){
          var resp = {};
          var answer = msg;
          resp.phonemes = phonemePhrase(answer);
          resp.text = answer; 
          console.log(now+"/server.js:129 << "+JSON.stringify(resp));
          client.send(resp);
        }
        else {
          askCen.askBoth(propertiesObject,20)
          .then(function(answer) {
            var resp = {};
            resp.phonemes = phonemePhrase(answer);
            resp.text = answer; 
            console.log(now+"/server.js:129 << "+JSON.stringify(resp));
            client.send(resp);
          })
          .catch(function (err) {
            console.log(now+"/server.js:100/request returns error "+constants.aihiUrl); 
            return console.log(err); 
          })
          ;  
        }
    });
    client.on('disconnecting', function() {
      delete clients[client.id];
    })

});
