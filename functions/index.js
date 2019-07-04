const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');

var serviceAccount = require("../serviceAccountKey.json");
var firebase_config = {
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: "https://shared-farm-dev.firebaseio.com",
};

const firebaseApp = firebase.initializeApp(firebase_config);

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

function getProfile() {
	const ref = firebaseApp.database().ref('users/1TfwGTO3mKdbCeoHcIWAGOJWyQk1');
	return ref.once('value').then(snap => snap.val());
}

app.get('/profile', (request, response) => {
	//response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	//response.send('- ' + error);
	
	getProfile()
		.then(profile => {
			response.render('profile', { profile });
		}).catch(error => {
            response.render('404');
        });
});

exports.app = functions.https.onRequest(app);