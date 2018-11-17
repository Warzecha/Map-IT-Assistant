'use strict';


const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const app = dialogflow({debug: true});

app.intent('POI', (conv, {}) => {


    conv.close('Places near you');
});


exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app)