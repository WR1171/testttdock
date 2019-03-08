/**
 * cenAsks.js - routines to ask cenAgents.
 * includes AIHI component. "ask Both" 
 */

var requestp = require('request-promise');


module.exports = function(config) {
    this.config = config;

    /**
     * Ask the cen y and then give human a chance to edit/respond. 
     * @param {*} question 
     * @param {*} who 
     * @param {*} session 
     * @param {*} timePermitted 
     * @returns promise (answer)
     */
    this.askBoth = function(propertiesObject, timePermitted) {

        // var propertiesObject = { 
        //     question:   resp, 
        //     sessionid:  msg.chat.id+'.'+msg.from.username,
        //     chatid:     msg.chat.id,
        //     username:   msg.from.username
        // };
        // onText: propertiesObject {"question":"ok","sessionid":"431243018.Edguy3","chatid":431243018,"username":"Edguy3"}
        console.log("askBoth:29:"+JSON.stringify(propertiesObject));

        var who = propertiesObject.username;
        var session = propertiesObject.sessionid;
        var question = propertiesObject.question;
        var chatid = propertiesObject.chatid;
        var asyncMsg = propertiesObject.asyncMsg;
        var channelType = propertiesObject.channelType;
        var chatName = propertiesObject.chatName;

        var answer = this.config.defaultBotResponse;

        console.log("askBoth:",question, who, session, timePermitted);

        //ASK CEN Y
        var options = {
            method: 'GET',
            uri: this.config.urlProgramY,
            qs: {
                question:question,
                sessionid:session
            },
            json: true // Automatically stringifies the body to JSON        
        };
        console.log("askBoth:options= ",options);

        // Make request to program y
        return requestp(options)
        .then(function(body) {
            //prase sucessful return from program y
            console.log("urlProgramYa OK: " + body);
            console.log("urlProgramYb OK: " + JSON.stringify(body));
            //extract and propagate answer
            answer= body[0].response.answer;
            return(answer);
        })
        .catch(function (err) {
            console.log("urlProgramYc ERR: " + err);
            console.log("urlProgramYd ERR: " + JSON.stringify(err));
            //pass default answer to HI phase 
            return(answer);
        })
        // now pass to human intercept... (including above failure case)
        .then(function(answer){
            console.log("urlProgramYf OK: " + JSON.stringify(answer));
            var options2 = {
                method: 'POST',
                uri: this.config.urlAihi,
                body: {
                    answer:   answer,
                    question: question,
                    user:     who,
                    session:  session,
                    chatid:   chatid,
                    score:    50,
                    asyncMsg: asyncMsg,
                    channelType: channelType,
                    chatName: chatName
                },
                json: true // Automatically stringifies the body to JSON        
            };
            console.log("askBoth:options2= ",options2);
            return requestp(options2);          
        })
        // human intercept worked
        .then(function(answer){
            console.log("urlProgramYg OK: " + answer);
            console.log("urlProgramYh OK: " + JSON.stringify(answer));
            return answer;
        })
        // human intercept failed, determine if double or single failure.. 
        .catch(function (err) {
            console.trace("urlProgramYi ERR: " + err);
            console.log("urlProgramYj ERR: " + JSON.stringify(err));
            console.log("urlProgramY+ ERR: " + err.options.body.answer);
            console.log("urlProgramY+ ERR: " + answer);

            // double failures, return err
            if(answer==this.config.defaultBotResponse){
                throw new Error(err);
            }
            return(answer);
        })
        ;
    };


    return this;    //constructor
}



function askAgent($answer,$question,$who,$session,$score){
    
    console.log('on cendy ask:' + JSON.stringify(msg));            

    // give agent a chance to review.
    var fields = {
        answer:   answer,
        question: question,
        user:     who,
        session:  session,
        score:    50

    };


    var propertiesObject = { 
        question:   resp, 
        sessionid:  msg.chat.id+'.'+msg.from.username,
        chatid:     msg.chat.id,
        username:   msg.from.username
    };
    console.log('on cendy ask:' + JSON.stringify(propertiesObject));            

    var url = "http://localhost:8989/api/v1.0/ask";     //TODO CONSTANTS. AIHI.

    console.log('cendy: %s %s', resp, msg.chat.id );

    request({url:url, qs:propertiesObject}, function(err, response, body) {
        if(err) { 
            console.log(err); return; 
        }
        else {
            var bod = JSON.parse(body);
            var answer = '@'+msg.from.username+': '+bod[0].response.answer;

            console.log('on cendy answer:' + answer);            
            bot.sendMessage(msg.chat.id, answer);
        }
    });   

}


