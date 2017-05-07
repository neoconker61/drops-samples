/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

// Define our dependencies
var express        = require('express');
var session        = require('express-session');
var passport       = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request        = require('request');
var MongoClient    = require('mongodb').MongoClient;
var assert         = require('assert');

// Define our constants, you will change these with your own
const TWITCH_CLIENT_ID = '<YOUR CLIENT ID HERE>';
const TWITCH_SECRET    = '<YOUR CLIENT SECRET HERE>';
const SESSION_SECRET   = '<SOME SECRET HERE>';
const CALLBACK_URL     = '<YOUR REDIRECT URL HERE>';  // You can run locally with - http://localhost:3000/auth/twitch/callback
const MONGODB_URL        = 'mongodb://mongo:27017/dropsdb';

// Initialize Express and middlewares
var app = express();
var bodyParser = require('body-parser');
app.use(session({secret: SESSION_SECRET, resave: false, saveUninitialized: false}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/assets", express.static(__dirname + '/assets'));

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/kraken/user',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'OAuth ' + accessToken
    }
  };

  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      done(null, JSON.parse(body));
    } else {
      done(JSON.parse(body));
    }
  });
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://api.twitch.tv/kraken/oauth2/authorize',
    tokenURL: 'https://api.twitch.tv/kraken/oauth2/token',
    clientID: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_SECRET,
    callbackURL: CALLBACK_URL,
    state: true
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    done(null, profile);
  }
));

/*
Revoke user OAuth token
*/
app.get('/revoke', function(req, res) { 
 console.log("revoke:" + JSON.stringify(req.session.passport.user, null, 2));
 if(req.session && req.session.passport && req.session.passport.user){
  console.log("revoking"); 
  request.post({
   url:'https://api.twitch.tv/kraken/oauth2/revoke',
   json: true,  
   body:{ 
    'client_id':TWITCH_CLIENT_ID,
    'client_secret':TWITCH_SECRET,
    'token':req.session.passport.user.accessToken 
  }
}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
     req.session.destroy(function (err) {
        res.redirect('/'); 
      });
  }
});
} 
});


/*
Used by front-end to check if a user is logged in
*/
app.get('/loggedin', function(req, res) { 

  if(req.session && req.session.passport && req.session.passport.user){
    res.send(req.session.passport.user.display_name); 
  }
  else{
    res.send('0');
  }
  
});

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: ['viewing_activity_read', 'user_read']}));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/'}));

// If user has an authenticated session, register them for drops, otherwise display link to authenticate
app.get('/', function (req, res) {
   res.sendFile(__dirname + '/drops-demo.html');    
});

//Return unique broadcasters
app.get('/broadcasters', function (req, res) {
  MongoClient.connect(MONGODB_URL, function(err, db) {
    db.collection("vhs").distinct("broadcaster",(function(err, docs){
      console.log(docs);
      res.status(200).send(JSON.stringify(docs));

      assert.equal(null, err);
      db.close();
    }));

  });
});

//Return unique broadcasters by game
app.get('/broadcasters/:game', function (req, res) {
  MongoClient.connect(MONGODB_URL, function(err, db) {
    db.collection("vhs").distinct("broadcaster",{"game":req.params.game}, (function(err, docs){
      console.log(docs);
      res.status(200).send(JSON.stringify(docs));

      assert.equal(null, err);
      db.close();
    }));

  });
});

/*
In this app, this is the end-point registered for VHS with Twitch on the developer portal. 
Viewer Heartbeat Service will post viewing activity data to <yourend-point>/vhs
*/
app.post('/vhs', (req, res) => {
    if(req.body){
      saveVHSData(req.body);
    }
  
    res.status(200).send();
});

function saveVHSData(data){
  MongoClient.connect(MONGODB_URL, function(err, db) {
    db.collection("vhs").save(data);
    db.close();
  });
}

app.listen(3000, function () {
  console.log('Twitch auth sample listening on port 3000!')
});

