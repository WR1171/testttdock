/* global fetch, React */

import _ from 'lodash';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button } from 'react-bootstrap';
import io from 'socket.io-client/dist/socket.io';
import CenAvatar from '../components/cen-avatar.jsx';


//import CEN from '../components/cenBase.jsx';
//import { ChatList } from '../components/cenChatList.jsx';


class CenBaseComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
}

class ChatSection extends CenBaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            speaking: false,
            isTyping:false,
            recognitionEnable:  Recognition.isSupported(),     //props.recognitionEnable &&   
            username: ""
        };

        this.onRecognitionChange = this.onRecognitionChange.bind(this);
        this.onRecognitionEnd = this.onRecognitionEnd.bind(this);
        this.onRecognitionStop = this.onRecognitionStop.bind(this);
        this.submitUserMessage = this.submitUserMessage.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAudio = this.handleAudio.bind(this);          
        this.submitUsername = this.submitUsername.bind(this);          
    }
    componentDidMount() {
        console.log("MainSection:componentDidMount");
        const { recognitionEnable } = this.state;
        const { recognitionLang } = this.props;
        if (recognitionEnable) {
            this.recognition = new Recognition(
                this.onRecognitionChange,
                this.onRecognitionEnd,
                this.onRecognitionStop,
                recognitionLang
            );
        }
        this.setState({addMsg:this._chatList});
    }

    onRecognitionChange(value) {
        this.setState({ inputValue: value });
    }
    
    onRecognitionEnd() {
        this.setState({ speaking: false });
        const { inputValue, speaking, recognitionEnable } = this.state;
        console.log("MainSection - onRecognitionEnd " + inputValue);
        if ((_.isEmpty(inputValue) || speaking) && recognitionEnable) {
            this.recognition.speak();
            if (!speaking) {
                this.setState({ speaking: true });
            }
            return;
        }
        this.submitUserMessage();
    }
    
    onRecognitionStop() {
        this.setState({ speaking: false });
    }
    
    handleChange(event) {
        this.setState({
            inputValue: event.target.value,
            isTyping:true
        });
    }

    handleAudio(event) {
        const { inputValue, speaking, recognitionEnable } = this.state;
        console.log("MainSection - handleAudio " + event.target.value);
        event.preventDefault();
        this.recognition.speak();
        if (!speaking) {
            this.setState({ 
                speaking: true,
                isTyping:false
            });
        }
    }
    handleSubmit(event) {
        event.preventDefault();
        if (this.state.username == "") {
            this.submitUsername();        
        }
        else {
            this.submitUserMessage();        
        }
    }
    submitUsername() {
        const { inputValue } = this.state;
        console.log("MainSection - submitUsername " + inputValue);
        this.setState({
            username:inputValue,
            inputValue:"",
            speaking: false,
            isTyping:false
        });
        if(inputValue.length>0){
            this._chatList.addMsg("man",inputValue,Date.now());
            this._chatAPI.sendMsg("Hello, My Name is "+inputValue,inputValue);
        }
    }
    submitUserMessage() {
        const { inputValue, speaking, recognitionEnable } = this.state;
        console.log("MainSection - submitUserMessage " + inputValue);
        if(inputValue.length>0){
            this._chatList.addMsg("man",inputValue,Date.now());
            this._chatAPI.sendMsg(inputValue,this.state.username);
        }
        this.setState({
            inputValue:"",
            speaking: false,
            isTyping:false
        });
    }
    render() {
        var showMic = !this.state.isTyping && this.state.recognitionEnable;
        var showLiveMic = this.state.speaking;
        var buttonClass= "cenChatFooterButton " +  (showLiveMic?"purpleButton":"darkButton");
        var sayfn = this._avatar?this._avatar.say:undefined;

        return (
            <div className="cenAvatarChat container-fluid"  ref={(ref) => this._chatHeader = ref}>
              <div className="row cenChatRow">
                <div className="col-12 col-sm-3 cenAvatar"> 
                    <div className="cenCanvas">
                        <CenAvatar ref={(ref) => this._avatar = ref} 
                             />
                    </div>
                </div>
                <div className="cenChatBox col-12 col-sm-9" >
                    <ChatAPI ref={(ref) => this._chatAPI = ref} addMsg={this.state.addMsg} say={sayfn} />                        
                    <div className="cenChat">
                        <div className="cenChatHeader">
                            <h2 className="cenChatH2">CEN.AI {this.state.username?" is conversing with "+this.state.username:""}</h2>
                        </div>
                        <div className="cenChatBody">
                        <ChatList ref={(ref) => this._chatList = ref} _top={this._chatHeader}/>
                        </div>
                        <div className="cenChatFooter">
                            <form onSubmit={this.handleSubmit}>
                                <input
                                    type="textarea"
                                    className="cen-input cenChatFooterText"
                                    placeholder="Type the message ..."
                                    value={this.state.inputValue}
                                    onChange={this.handleChange}/>
                            </form>
                            {showMic?
                            <button className={buttonClass} onClick={this.handleAudio}>
                                <svg
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 400 400">
                                    <g>
                                        <path
                                            d="M290.991,240.991c0,26.392-21.602,47.999-48.002,47.999h-11.529c-26.4,0-48.002-21.607-48.002-47.999V104.002   c0-26.4,21.602-48.004,48.002-48.004h11.529c26.4,0,48.002,21.604,48.002,48.004V240.991z"></path>
                                        <path
                                            d="M342.381,209.85h-8.961c-4.932,0-8.961,4.034-8.961,8.961v8.008c0,50.26-37.109,91.001-87.361,91.001   c-50.26,0-87.109-40.741-87.109-91.001v-8.008c0-4.927-4.029-8.961-8.961-8.961h-8.961c-4.924,0-8.961,4.034-8.961,8.961v8.008   c0,58.862,40.229,107.625,96.07,116.362v36.966h-34.412c-4.932,0-8.961,4.039-8.961,8.971v17.922c0,4.923,4.029,8.961,8.961,8.961   h104.688c4.926,0,8.961-4.038,8.961-8.961v-17.922c0-4.932-4.035-8.971-8.961-8.971h-34.43v-36.966   c55.889-8.729,96.32-57.5,96.32-116.362v-8.008C351.342,213.884,347.303,209.85,342.381,209.85z"></path>
                                    </g>
                                </svg>
                            </button>
                            :
                            <button className={buttonClass} onClick={this.handleSubmit}>
                                <svg version = "1.1" xmlns = "http://www.w3.org/2000/svg" 
                                    width="20"
                                    height="20"
                                    viewBox = "0 0 500 500" > 
                                    <path id="svg_9" d="m0.99786,47.58967l0,0c0,-25.73046 27.80498,-46.58912 62.10416,-46.58912l28.22918,0l0,0l135.50002,0l254.06246,0c16.47109,0 32.26751,4.90847 43.91433,13.64563c11.64674,8.73716 18.18987,20.58729 18.18987,32.94348l0,116.47281l0,0l0,69.88366l0,0c0,25.73047 -27.80496,46.58912 -62.10418,46.58912l-254.06246,0l-177.01405,118.4653l41.51403,-118.4653l-28.22918,0c-34.29918,0 -62.10416,-20.85864 -62.10416,-46.58912l0,0l0,-69.88366l0,0l-0.00002,-116.47281z" fillOpacity="null" strokeOpacity="null" strokeWidth="null" stroke="null" fill="null"/>
                                </svg>
                            </button>
                            }
                        </div>
                    </div>
                </div>
              </div>
            </div>
        );
    }
}

// https://zeit.co/blog/async-and-await
function sleep(time){
    return new Promise((resolve) => setTimeout(resolve, time));
}      

class ChatAPI extends CenBaseComponent {
    constructor(props){
        super(props);
    }
    componentDidMount(){
        var that=this;
        that.socket =  io();
        // var socket = io.connect('http://localhost:8888', { path: '/some/path/socket.io' });
        this.socket.on('login', function (data) {
            console.log("login "+JSON.stringify(data));
            if(!that.state.sid){
                that.setState({sid:data});
                var resp = {}; //TODO - constants.js
                resp.text = "Centi (ALPHA) at your service! All entries you make will be used for training purposes. Please do not provide any personal information.";
                resp.phonemes = [['S','EH','N','.','D','AA','T','.','AE','T','.','Y','AO','R','.','S','ER','V','AH','S','.']];

                sleep(2000).then(() => {
                    that.props.addMsg.addMsg("bot",resp.text,Date.now());
                    if(that.props.say){
                        that.props.say(resp);
                    }
                    sleep(2000).then(() => {
                        resp.text = "What should I call you?";
                        resp.phonemes = [["W AH1 T",".","SH UH1 D",".","AY1",".","K AO1 L",".","Y UW1","."]];
                        that.props.addMsg.addMsg("bot",resp.text,Date.now());
                        if(that.props.say){
                            that.props.say(resp);
                        }
                    });                    
                })
                
            }
        });
        this.socket.on('connect', function(data) {
            console.log(" ChatAPI - connected/"+JSON.stringify(data));
        });          
        this.socket.on('message', function(data) {
            console.log(" ChatAPI.197 - message/"+JSON.stringify(data));
            that.props.addMsg.addMsg("bot",data.text,Date.now());
            if(that.props.say){
                that.props.say(data);
            }
        });          
    }
    sendMsg(msg,username){
        var payload = { 
            "text":msg,
            ts:Date.now(),
            sid:this.state.sid,
            username:username,
            channelType:"web"
        };
        console.log(" ChatAPI.259 - message/"+JSON.stringify(payload));
        this.socket.emit('message', payload);
    }
    render(){
        return null;
    }
}

class ChatList extends CenBaseComponent {
    constructor(props){
        super(props);
        this.addMsg = this.addMsg.bind(this);
        this.state.msglist = [ ];
    }
    addMsg(who,what,when){
        var joined = this.state.msglist.concat({name:who, time:when, text:what});
        this.setState({ msglist: joined });
        this._chatDivBot.scrollIntoView();
        this.props._top.scrollIntoView();
    }
    render() {
        return (
            <div>
                {this.state.msglist.map(
                    (m,i) => 
                    m.name=="bot"
                    ? <BotSez key={i} text={m.text} time={m.time}/>
                    : <ManSez key={i} text={m.text} time={m.time}/>
                )}
                <div ref={(ref) => this._chatDivBot = ref}></div>
            </div>
        );
    }
}

class BotSez extends CenBaseComponent {
    render() {
        return (
            <div className="chatbotBotRow">
                <div className="chatbotBotAvatarBox">
                    <img
                        className="chatbotBotAvatarImg"
                        src="images/cendy.png"
                        alt="avatar"/>
                </div>
                <div className="chatbotBotText">{this.props.text}</div>
            </div>
        );
    }
}

class ManSez extends CenBaseComponent {
    render() {
        return (
            <div className="cenbotManRow">
                <div className="cenbotManImgBox">
                    <img
                        className="cenbotManImg"
                        src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgLTIwOC41IDIxIDEwMCAxMDAiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9Ii0yMDguNSAyMSAxMDAgMTAwIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnNrZXRjaD0iaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoL25zIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PGc+PGNpcmNsZSBjeD0iLTE1OC41IiBjeT0iNzEiIGZpbGw9IiNGNUVFRTUiIGlkPSJNYXNrIiByPSI1MCIvPjxnPjxkZWZzPjxjaXJjbGUgY3g9Ii0xNTguNSIgY3k9IjcxIiBpZD0iTWFza18yXyIgcj0iNTAiLz48L2RlZnM+PGNsaXBQYXRoIGlkPSJNYXNrXzRfIj48dXNlIG92ZXJmbG93PSJ2aXNpYmxlIiB4bGluazpocmVmPSIjTWFza18yXyIvPjwvY2xpcFBhdGg+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI01hc2tfNF8pIiBkPSJNLTEwOC41LDEyMXYtMTRjMCwwLTIxLjItNC45LTI4LTYuN2MtMi41LTAuNy03LTMuMy03LTEyICAgICBjMC0xLjcsMC02LjMsMC02LjNoLTE1aC0xNWMwLDAsMCw0LjYsMCw2LjNjMCw4LjctNC41LDExLjMtNywxMmMtNi44LDEuOS0yOC4xLDcuMy0yOC4xLDYuN3YxNGg1MC4xSC0xMDguNXoiIGZpbGw9IiNFNkMxOUMiIGlkPSJNYXNrXzNfIi8+PGcgY2xpcC1wYXRoPSJ1cmwoI01hc2tfNF8pIj48ZGVmcz48cGF0aCBkPSJNLTEwOC41LDEyMXYtMTRjMCwwLTIxLjItNC45LTI4LTYuN2MtMi41LTAuNy03LTMuMy03LTEyYzAtMS43LDAtNi4zLDAtNi4zaC0xNWgtMTVjMCwwLDAsNC42LDAsNi4zICAgICAgIGMwLDguNy00LjUsMTEuMy03LDEyYy02LjgsMS45LTI4LjEsNy4zLTI4LjEsNi43djE0aDUwLjFILTEwOC41eiIgaWQ9Ik1hc2tfMV8iLz48L2RlZnM+PGNsaXBQYXRoIGlkPSJNYXNrXzVfIj48dXNlIG92ZXJmbG93PSJ2aXNpYmxlIiB4bGluazpocmVmPSIjTWFza18xXyIvPjwvY2xpcFBhdGg+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI01hc2tfNV8pIiBkPSJNLTE1OC41LDEwMC4xYzEyLjcsMCwyMy0xOC42LDIzLTM0LjQgICAgICBjMC0xNi4yLTEwLjMtMjQuNy0yMy0yNC43cy0yMyw4LjUtMjMsMjQuN0MtMTgxLjUsODEuNS0xNzEuMiwxMDAuMS0xNTguNSwxMDAuMXoiIGZpbGw9IiNENEIwOEMiIGlkPSJoZWFkLXNoYWRvdyIvPjwvZz48L2c+PHBhdGggZD0iTS0xNTguNSw5NmMxMi43LDAsMjMtMTYuMywyMy0zMWMwLTE1LjEtMTAuMy0yMy0yMy0yM3MtMjMsNy45LTIzLDIzICAgIEMtMTgxLjUsNzkuNy0xNzEuMiw5Ni0xNTguNSw5NnoiIGZpbGw9IiNGMkNFQTUiIGlkPSJoZWFkIi8+PC9nPjwvc3ZnPg=="
                        alt="avatar"/>
                </div>
                <div className="chatbotManText">{this.props.text}</div>
            </div>
        );
    }
}



// https://github.com/LucasBassetti/react-simple-chatbot/blob/master/lib/recognition.js
class Recognition {
    static isSupported() {
      return 'webkitSpeechRecognition' in window;
    }
  
    /**
     * Creates an instance of Recognition.
     * @param {function} [onChange] callback on change
     * @param {function} [onEnd]  callback on and
     * @param {function} [onStop]  callback on stop
     * @param {string} [lang='en'] recognition lang
     * @memberof Recognition
     * @constructor
     */
    constructor(onChange = noop, onEnd = noop, onStop = noop, lang = 'en') {
    //   if (!instance) {
        let instance = this;
    //   }
      this.state = {
        inputValue: '',
        lang,
        onChange,
        onEnd,
        onStop,
      };
  
      this.onResult = this.onResult.bind(this);
      this.onEnd = this.onEnd.bind(this);
      console.log("Recognition:constructor");
  
      this.setup();
  
      return instance;
    }
  
    /**
     * Handler for recognition change event
     * @param {string} interimTranscript
     * @memberof Recognition
     * @private
     */
    onChange(interimTranscript) {
        console.log("Recog:onChange "+interimTranscript);
      const { onChange } = this.state;
      this.setState({
        inputValue: interimTranscript,
      });
      onChange(interimTranscript);
    }
  
    /**
     * Handler for recognition change event when its final
     * @param {string} finalTranscript
     * @memberof Recognition
     * @private
     */
    onFinal(finalTranscript) {
        console.log("Recog:onFinal "+finalTranscript);
      this.setState({
        inputValue: finalTranscript,
      });
      this.recognition.stop();
    }
  
    /**
     * Handler for recognition end event
     * @memberof Recognition
     * @private
     */
    onEnd() {
      const { onStop, onEnd, force } = this.state;
      this.setState({ speaking: false });
      if (force) {
        onStop();
      } else {
        onEnd();
      }
    }
  
    /**
     * Handler for recognition result event
     * @memberof Recognition
     * @private
     */
    onResult(event) {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          this.onFinal(finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
          this.onChange(interimTranscript);
        }
      }
    }
  
    /**
     * method for updating the instance state
     * @param {object} nextState
     * @memberof Recognition
     * @private
     */
    setState(nextState) {
      this.state = Object.assign({}, this.state, nextState);
    }
  
    /**
     * setup the browser recognition
     * @returns {Recognition}
     * @memberof Recognition
     * @public
     */
    setup() {
      if (!Recognition.isSupported()) {
        return this;
      }
      this.recognition = new window.webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.state.lang;
      this.recognition.onresult = this.onResult;
      this.recognition.onend = this.onEnd;
      return this;
    }
  
    /**
     * change the recognition lang and resetup
     * @param {string} lang the new lang
     * @returns {Recognition}
     * @memberof Recognition
     * @public
     */
    setLang(lang) {
      this.setState({ lang });
      this.setup();
      return this;
    }
  
    /**
     * toggle the recognition
     * @returns {Recognition}
     * @memberof Recognition
     * @public
     */
    speak() {
      if (!Recognition.isSupported()) {
        return this;
      }
      const { speaking } = this.state;
      if (!speaking) {
        this.recognition.start();
        this.setState({
          speaking: true,
          inputValue: '',
        });
      } else {
        this.setState({
          force: true,
        });
        this.recognition.stop();
      }
      return this;
    }
}


export default ChatSection;
