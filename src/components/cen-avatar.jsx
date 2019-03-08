/* global fetch, React */

// import PropTypes from 'prop-types';
import React, { Component } from 'react';
//import THREE, { Scene, CanvasRenderer, Vector3, PerspectiveCamera } from 'threejs-full-es6'
//import THREE, { Scene, WebGL2Renderer, Vector3, PerspectiveCamera, Clock } from 'three';
const reactStringReplace = require('react-string-replace');

//Config Items: 
var etgAvatar = {
    //SEAS3d files. 
    headLink:'images/herHead.seas',
    bodyLink:'images/herBody.seas'
};




//===============================================
//  3D SIDE: THREE.JS & SEA3D
//===============================================

var camera, scene, renderer, center, clock, cam, mouse;
var eyeLeft, eyeRight;
var headMeshs = [];
var morphsTables = [];
var fullLoaded = false;
var headBone;
var headBoneRef;
var eyes, eyesTarget;
var body, suit, bodyNeck;

var bestMaterial = [];
var lowMaterial = [];

var lights = [];


function init3D(threeCanvas){
    
    clock = new THREE.Clock();
    
    cam = { horizontal:110, vertical:85, distance:15 };
    mouse = { ox:0, oy:0, h:0, v:0, mx:0, my:0, dx:0, dy:0, down:false, over:false, moving:false };
    
    renderer = new THREE.WebGLRenderer({ canvas:threeCanvas, devicePixelRatio:1, precision: "mediump", antialias:true,alpha: true  });
//    renderer.setSize( threeCanvas.width, threeCanvas.height, true );
    renderer.autoClear = false;
    renderer.setClearColor( 0xffffff, 0);
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 50, threeCanvas.width/threeCanvas.height, 0.5, 10000 );
    
    var d = 20;
    var hemiLight = new THREE.HemisphereLight( 0xfffffe, 0x4488ff, 1 );
    hemiLight.position.set( 0, 5, 0 ); 
    var light = new THREE.DirectionalLight( 0xfffffe, 0.75 );
    light.position.set( d/3, d, d*1.6);
    light.target = new THREE.Object3D(0,5,0);
    light.shadowMapWidth = 1024;
    light.shadowMapHeight = 1024;
    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;
    light.shadowCameraFar = d*2;
    light.shadowCameraNear = d;
    light.shadowDarkness = 0.0;
    light.shadowBias =  -0.002;
    light.castShadow = true;
    // var lightPoint = new THREE.PointLight ( 0x4488ff, 0.5 );
    // lightPoint.position.set( -d/3, -d/2, d*1.3);
    // var lightPoint2 = new THREE.PointLight ( 0xFFCC44, 0.5 );
    // lightPoint2.position.set( d/2, -d, d*1.3);

//    lights = [hemiLight,lightPoint,lightPoint2,light ];
    lights = [light,hemiLight ];

    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.shadowMapEnabled = true;
    //renderer.shadowMapCullFace = THREE.CullFaceBack;
    
    var i = lights.length;
    while(i--){ 
        scene.add( lights[i] );
    }
        
    window.addEventListener( 'resize', resize, false );        
    loop();
    loadSea3d();
}

function loop() {
    requestAnimationFrame( loop, renderer.domElement );
    updateAnimation();
    renderer.render( scene, camera );
}

function resize() {
    console.log("resize?");
    if(this._avatar ){
        console.log("resize");
        camera.aspect = this._avatar.width/this._avatar.height;
        camera.updateProjectionMatrix();
        renderer.setSize(this._avatar.width,this._avatar.height, true);    
    }
}

function loadSea3d(){
    var size = 1;
    var loader = new THREE.SEA3D( true );
    loader.onComplete = function( e ) {
        var m, mat, oldmat;
        var i = loader.meshes.length;
       
        while(i--){
            m = loader.meshes[i];
            oldmat = m.material;
            bestMaterial[i] = oldmat;
            lowMaterial[i] = new THREE.MeshBasicMaterial({map:oldmat.map,transparent:oldmat.transparent, opacity:oldmat.opacity, skinning:oldmat.skinning, morphTargets:oldmat.morphTargets, side:oldmat.side }); 
                        
            if(m.name === 'eyeL_lo' || m.name === 'cils' || m.name === 'hair' || m.name === 'teethUpper' || m.name === 'teethLower' ) m.material.transparent = true;
            if(m.name === 'necklace' ) {m.visible = true; m.material.color.setHex(0x2e3032);}
            if(m.name === 'bodyLow2' ) m.visible = false;
            headMeshs[i] = m;
            //console.log(m.name, i)
        }
        
        // add the head other mesh are linked to him
        m = headMeshs[0];
        m.setWeight("neck", 1);
        m.setWeight("earOut", 0.6);
        m.scale.set(size,size,-size);
        m.stop();
        //m.position.set(0,0,0);
        scene.add(m);
        
        // eye contener fixed to head bone
        eyes = new THREE.Object3D();
        eyesTarget = new THREE.Object3D();
        headBone = m.skeleton.bones[1];
        eyes.matrix = headBone.skinMatrix;
        eyes.matrixAutoUpdate = false;
        m.add( eyes );
        headBone.rotation.y = -15*ToRad;
        // get the rotation referency
        headBoneRef = headBone.rotation.clone();
        
        // add eyes geometry
        var eyeGeo = new THREE.SphereGeometry(0.64,30,28);
        //                                                     edge        white         outer color, inner color, pupil                                                             
        var eyeMap = gradTexture([[0.5,0.15,0.12,0.07, 0.02], ['#ff6060','#ffffff','#6e96d1','#6e96df', '#000000']]);
        var eyeMat;
        eyeMat= new THREE.MeshPhongMaterial({ map:eyeMap, specular:0xFFFFFF, shininess:220 });
        
        eyeGeo.applyMatrix(new THREE.Matrix4().makeRotationX(-90*ToRad));
        eyeLeft  = new THREE.Mesh( eyeGeo, eyeMat);
        eyeRight = new THREE.Mesh( eyeGeo, eyeMat);
        eyeLeft.scale.set(1,1,-1);
        eyeRight.scale.set(1,1,-1);
        eyeLeft.position.set(3.82, -1.162, 2.92);
        eyeRight.position.set(3.82, 1.162, 2.92);
        eyesTarget.position.set(3.82, 0, 10);
        eyes.add( eyeLeft );
        eyes.add( eyeRight );
        eyes.add( eyesTarget );
        
        // camera position init
        center = new THREE.Vector3();
        center.y = 40+((100-cam.distance)/3.5);
        //15 115 140 / 0 65 0 
        center.x = 0;
        center.z = 0;
        
        moveCamera();
        
        // find all morphs target 
        var mName;  
        for (var j=0; j < m.geometry.morphTargets.length; j++){
            mName = m.geometry.morphTargets[j].name;
            console.log("morphsTables "+mName);    
            morphsTables[mName] = {
                teethLower:Avatar.testMorph( headMeshs[2], mName),
                sock:Avatar.testMorph( headMeshs[1], mName),
                eye:Avatar.testMorph( headMeshs[6], mName),
                tongue:Avatar.testMorph( headMeshs[7], mName),
                cils:Avatar.testMorph( headMeshs[5], mName),
            }
        }
        
        //fullLoaded = true;
        loadSea3dBody();
    }
    
    // THREE.SEA3D.BUFFER is not compatible with morph
    loader.parser = THREE.SEA3D.DEFAULT;
    loader.load( etgAvatar.headLink );
}

function loadSea3dBody(){
    var size = 1;
    var loader = new THREE.SEA3D( true );
    loader.onComplete = function( e ) {
        var m, mat, oldmat;
        var i = loader.meshes.length;
       
        while(i--){
            m = loader.meshes[i];
            oldmat = m.material;
            bestMaterial[i+8] = oldmat;
            lowMaterial[i+8] = new THREE.MeshBasicMaterial({map:oldmat.map,transparent:oldmat.transparent, opacity:oldmat.opacity, skinning:oldmat.skinning, morphTargets:oldmat.morphTargets, side:oldmat.side }); 
            
            if(m.name === 'body' )body = m;
            if(m.name === 'suit' )suit = m;
        }
        
        body.scale.set(size,size,-size);
        suit.scale.set(size,size,-size);
        
        bodyNeck = new THREE.Object3D();
        var bone = body.skeleton.bones[18];
        bodyNeck.matrix = bone.skinMatrix;
        bodyNeck.matrixAutoUpdate = false;
        body.add( bodyNeck );
        
        suit.skeleton = body.skeleton;
        //body.play("walk");
        
        scene.add(body);
        scene.add(suit);
        
        fullLoaded = true;
    }
    loader.load( etgAvatar.bodyLink );
    
    headBone.rotation.set( -0.0157, -0.087, 0);
    eyesTarget.position.set( 3.83,0.27,10);
    eyeLeft.lookAt( {x: 3.83, y: -1.73, z: 10});
    eyeRight.lookAt(  {x: 3.83, y: 2.27, z: 10} );  
}




//===============================================
//  ANIMATION
//===============================================

var count = [0,0,0];    // tick counter for eye, phnemes, and expressions.  
var phonemeNumberQueue = [];  // Queue of phomenes to mouth
var inSequence = false;
var finalSequence = false;
var currentWord = "";
var prevWord = "";
var changeExpression = false;
var currentExpression = 0;
var newExpression = 0;
var morphExpressions = ['expression', 'anger','sad', 'disgust', 'fear', 'surprise', 'smileClose', 'smileOpen'];
var bInIdle = false;
var idleExpression = 'smileClose';//smileClose


function updateAnimation(){
    if(fullLoaded){
        var delta = clock.getDelta();
        
        // update head bone to body bone
        headMeshs[0].position.setFromMatrixPosition(bodyNeck.matrixWorld);
        headMeshs[0].skeleton.bones[0].rotation.setFromRotationMatrix( body.skeleton.bones[18].skinMatrix);
        
        //Blinking cycle. close 1-10, open 10-20, 21-250, leave open
        count[0]++;
        if(count[0]<=10){
            Avatar.blinkEyes(count[0]);
        }
        else if(count[0]<=20){
            Avatar.blinkEyes(20-count[0]);
        }
        else if(count[0] >= 250){
            count[0]=0;
        }
        
        // go from old phoneme to new one every 4 steps.
        if(inSequence){
            bInIdle=false;
            count[1]++;
            if(count[1]<=4){
                Avatar.mouthWord(count[1]);   
            }
            else { //advance to next phoneme 
                count[1]=0;
                if(finalSequence)inSequence=false; 
                prevWord = currentWord;
                currentWord = phonemeNumberQueue.shift();
                if(phonemeNumberQueue.length===0){
                    finalSequence = true;
                }
                console.log("inSequence: "+currentWord+" "+finalSequence);
            }
        }
        else {
            if(!bInIdle){
                console.log("changing to idle expression");
                // Avatar.morphTarget();
                Avatar.fullMorph('smileClose', 0.5);
                Avatar.fullMorph('b.m.p', 0.9);
                // Avatar.switchExpression(idleExpression);
                bInIdle = true;
            }
        }
        
        if(changeExpression){
            count[2]++;
            if(count[2]<=50)switchExpression(count[2]);
            else {
                count[2]=0;
                changeExpression = false;
                currentExpression = newExpression;
            }
        }
    }
}


//===============================================
//  MATH
//===============================================

var ToRad = Math.PI / 180;
function Orbit(origine, horizontal, vertical, distance) {
    var p = new THREE.Vector3();
    var phi = vertical*ToRad;
    var theta = horizontal*ToRad;
    p.x = (distance * Math.sin(phi) * Math.cos(theta)) + origine.x;
    p.z = (distance * Math.sin(phi) * Math.sin(theta)) + origine.z;
    p.y = (distance * Math.cos(phi)) + origine.y;
    return p;
}

//===============================================
//  MOUSE & NAVIGATION
//===============================================

function moveCamera() {
    console.log("moveCamera ",center,cam);
    camera.position.copy(Orbit(center, cam.horizontal, cam.vertical, cam.distance));
    camera.lookAt(center);
}


//===============================================
//  AUTO TEXTURE used on Eyes. 
//===============================================

function gradTexture(color) {
    var c = document.createElement("canvas");
    var ct = c.getContext("2d");
    c.width = 16; c.height = 256;
    var gradient = ct.createLinearGradient(0,0,0,256);
    var i = color[0].length;
    while(i--){ 
        gradient.addColorStop(color[0][i],color[1][i]); 
    }
    ct.fillStyle = gradient;
    ct.fillRect(0,0,16,256);
    var texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    return texture;
}



//===============================================
// PHONEME & SPEECH
//===============================================

var Avatar = {

    Base:function (_h){
        this.xml = null;
        this.msg = null;
        this.threeCanvas = _h;

        Avatar.initSynthesis();
        Avatar.init();

        this.timer = null;
    },
    testclick: function(){
        Avatar.say({
            text:"Acrobat",
            phonemes:[[ 'AE2', 'K','R','AH0','B','AE1', 'T', 'IH0','K']]
        });       
    },
    init:function(){
        var _this = this;   //Singleton?
        
        if (window.XDomainRequest) this.xml = new XDomainRequest();
        else if (window.XMLHttpRequest) this.xml = new XMLHttpRequest();
        else this.xml = new ActiveXObject("Microsoft.XMLHTTP");
                
        this.threeCanvas.addEventListener( 'mousedown', function(){
            Avatar.testclick();
            }, false );
        // pre-cache voices. (needed)
        var voices = window.speechSynthesis.getVoices();

    },
    initSynthesis:function(){
        this.fallbackSpeechSynthesis = window.speechSynthesisPolyfill;
        this.fallbackSpeechSynthesisUtterance = window.SpeechSynthesisUtterance;//Polyfill;
        this.msg = new this.fallbackSpeechSynthesisUtterance();
    },
    morphTarget:function(phonemeArray){
        if(phonemeArray.length>0){
            phonemeNumberQueue = []; //debAcrobat
            
            for (var i = 0; i < phonemeArray.length; i++) {
                var item = phonemeArray[i];
                if(Array.isArray(item)){
                    for (var j = 0; j < item.length; j++) {
                        Avatar.convert(item[j]);                                        
                    }
                }
                else{
                    Avatar.convert(item);                    
                }
            }
        }
    },
    canSpeak:function(msg){
        return window.speechSynthesis;
    },
    preprocess(txt){
        // var m = reactStringReplace(txt, /\scen\s/ig, () => ' sen ');
        // console.log(txt, m);
        var s = txt.toString(); 
        var m = s.replace(/\scen([\s.,])/ig,' sen$1');
        m = m.replace(/^cen([\s.,])/ig,'sen$1');
        m = m.replace(/\scen$/ig,' sen');
        console.log(txt, m);
 
        return m;        
    },
    say:function(msg){
        if(this.msg!==null){
            if(window.speechSynthesis){
                var voices = window.speechSynthesis.getVoices();
                var m = this.preprocess(msg.text);
                this.msg = new window.SpeechSynthesisUtterance();
//                this.msg.onstart = function(event) { 
//                }
                this.msg.voice = voices.filter(function(voice) { return voice.name === 'Google UK English Female'; })[0];
                this.msg.rate = 0.8;
                this.msg.volume = 1
                this.msg.lang = 'en-GB';
                this.msg.text=m;

                speechSynthesis.speak(this.msg);
                console.log("morphTarget: "+msg.phonemes);
                if(msg.phonemes){
                   Avatar.morphTarget(msg.phonemes);   //this was outside, but when speech delayed, looked silly.
                }
                setTimeout( function ( e ) {
                        Avatar.saySequence()
                    }, 100);
                //todo - set timer on voice vs phonemes and adjust    
            }
            else {
                //TODO play wav 
            }
            inSequence=true;
        }
    },
    //https://www.simplish.org/learn-basic-english/phonetics/ and https://en.wikipedia.org/wiki/ARPABET
    // convert ARPABET string into values pushed on phonemeNumberQueue global
    convert: function (n) {
        if(n==0)phonemeNumberQueue.push(n);
        else {
            var ph = n.split(' ');
            var num = 1;
            for (var i = 0; i < ph.length; i++) {
                switch (ph[i]) {
                    case 'HH' :
                        num = 3;
                        break;
                    case 'AH0':
                        num = 1;
                        break;
                    case 'AH1':
                        num = 1;
                        break;
                    case 'AY1':
                        num = 5;
                        break;
                    case 'AY2':
                        num = 5;
                        break;
                    case 'L'  :
                        num = 15;
                        break;
                    case 'W'  :
                        num = 14;
                        break;
                    case 'ER1':
                        num = 11;
                        break;
                    case 'ER0':
                        num = 11;
                        break;
                    case 'D'  :
                        num = 12;
                        break;
                    case 'M'  :
                        num = 8;
                        break;
                    case 'EY1':
                        num = 7;
                        break;
                    case 'EH1':
                        num = 7;
                        break;
                    case 'IH1':
                        num = 5;
                        break;
                    case 'IH0':
                        num = 5;
                        break;
                    case 'IY1':
                        num = 5;
                        break;
                    case 'Z'  :
                        num = 12;
                        break;
                    case 'F'  :
                        num = 4;
                        break;
                    case 'K'  :
                        num = 6;
                        break;
                    case 'B'  :
                        num = 8;
                        break;
                    case 'R'  :
                        num = 11;
                        break;
                    case 'Y'  :
                        num = 15;
                        break;
                    case 'TH' :
                        num = 13;
                        break;
                    case 'S'  :
                        num = 12;
                        break;
                    case 'T'  :
                        num = 13;
                        break;
                    case 'G'  :
                        num = 6;
                        break;
                    case 'OW1':
                        num = 10;
                        break;
                    case 'OY1':
                        num = 10;
                        break;
                    case 'UW1':
                        num = 14;
                        break;
                    case 'V'  :
                        num = 4;
                        break;
                    case 'JH' :
                        num = 3;
                        break;
                    case 'P'  :
                        num = 8;
                        break;
                }
                phonemeNumberQueue.push(num);
            }
        }
    },

    testMorph: function (m, name){
        var result = false;
        for (var j=0; j < m.geometry.morphTargets.length; j++){
                if(m.geometry.morphTargets[j].name === name) result = true;
        }
        return result;
    },
    saySequence: function (){ 
        inSequence = true;
        finalSequence = false;
        //phonemeNumberQueue = phonemeNumberQueue[0]; //huh? 
        prevWord="";
    },
    mouthWord:function (N){
        var n = N*0.2;
        if(currentWord!=="")Avatar.fullMorph(Avatar.phonemeNumber(currentWord), n);
        if(prevWord!=="")Avatar.fullMorph(Avatar.phonemeNumber(prevWord), 1-n);
    },
    fullMorph: function ( name , value) {
        if (!morphsTables[name])
            return;
        console.log("fullMorph "+name);
        headMeshs[0].setWeight(name, value);
        if (morphsTables[name].teethLower)
            headMeshs[2].setWeight(name, value);
        if (morphsTables[name].sock)
            headMeshs[1].setWeight(name, value);
        if (morphsTables[name].eye)
            headMeshs[6].setWeight(name, value);
        if (morphsTables[name].tongue)
            headMeshs[7].setWeight(name, value);
        if (morphsTables[name].cils)
            headMeshs[5].setWeight(name, value);

    },

    //===============================================
    //  PHONEME TO MORPH
    //===============================================

    // phonemeNumber to morph name, e.g., when F is spoken, 4 is assigned, comes out as 'f.v'
    // perhape better as a dictionary. 
    phonemeNumber: function (Value) {
        var t;
        switch ( Value ) {
            case 0 : t = '';       break;
            case 1 : t = 'aah';    break;
            case 2 : t = 'bigaah'; break;
            case 3 : t = 'ch.j.sh';break;
            case 4 : t = 'f.v';    break;
            case 5 : t = 'i';      break;
            case 6 : t = 'k';      break;
            case 7 : t = 'ee';     break;
            case 8 : t = 'b.m.p';  break;
            case 9 : t = 'n';      break;
            case 10: t = 'oh';     break;
            case 11: t = 'r';      break;
            case 12: t = 'd.s.t';  break;
            case 13: t = 'th';     break;
            case 14: t = 'w';      break;
            case 15: t = 'eh';     break;
            case 16: t = 'ooh.q';  break;
            default: t = 'b.m.p';
            }
            return t;
    },
    blinkEyes: function (N){
        var n = N*0.1;
        headMeshs[0].setWeight("blinkLeft", n);
        headMeshs[0].setWeight("blinkRight", n);
        headMeshs[5].setWeight("blinkLeft", n);
        headMeshs[5].setWeight("blinkRight", n);
    },

    switchExpression: function (N){
        var n = N*0.02;
        if(newExpression!==0)Avatar.fullMorph(morphExpressions[newExpression], n);
        Avatar.fullMorph(morphExpressions[currentExpression], 1-n);
    },

    expression: function (){
        changeExpression = true;
        newExpression++;
        if(newExpression === morphExpressions.length) newExpression =0;
    }
};



class CenAvatar extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {};
    
    }
    
    componentWillUnmount() {
        delete this.world;
    }
    say(m) {
        Avatar.say({
            text:m.text,
            phonemes:m.phonemes
        });               
    }
    
    componentDidMount() {
        const {
          container,
          } = this.refs;
        var ph =  Avatar.Base(this._avatar);
        init3D(this._avatar);
    }
    render() {
        return (
            <canvas ref={(ref) => this._avatar = ref} className="cenCanvas" >
            </canvas>
        );
      }
}


export default CenAvatar;

/*


//Config Items: 
var etgAvatar = {
    //SEAS3d files. 
    headLink:'img/herHead.seas',
    bodyLink:'img/herBody.seas',
    headDivId:'threeCanvas'
};

var threeCanvas = document.getElementById(etgAvatar.headDivId);

window.onload = init;

function init(){
    var ph =  Avatar.Base();
    init3D();
}






*/
