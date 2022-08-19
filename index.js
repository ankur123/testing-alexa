/* eslint-disable no-mixed-operators */
/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const AWS = require("aws-sdk");
const ddbAdapter = require('ask-sdk-dynamodb-persistence-adapter');
const Util = require('./util-local');
const util_df = require('util')

//const promisify = require('es6-promisify');

// const recipesTable = '530184f6-28e4-4b84-9bca-64afe68107f3';
// const docClient = new AWS.DynamoDB.DocumentClient();

// // convert callback style functions to promises
// const dbScan = util_df.promisify(docClient.scan, docClient);
// const dbGet = util_df.promisify(docClient.get, docClient);
// const dbPut = util_df.promisify(docClient.put, docClient);
// const dbDelete = util_df.promisify(docClient.delete, docClient);

const STREAMS = [
  {
    'token': 'Stuff you should know',
    'url': 'https://chtbl.com/track/5899E/podtrac.com/pts/redirect.mp3/traffic.omny.fm/d/clips/e73c998e-6e60-432f-8610-ae210140c5b1/a91018a4-ea4f-4130-bf55-ae270180c327/96c866dd-0ae2-4f77-b287-aede00fa7dba/audio.mp3?utm_source=Podcast&in_playlist=44710ecc-10bb-48d1-93c7-ae270180c33e',
    'metadata': {
      'title': 'Stuff you should know',
      'subtitle': 'Music for Scribders',
      'art': {
        'sources': [
          {
            'contentDescription': 'Stuff you should know',
            'url': 'https://i.iheart.com/v3/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcGxheWxpc3QvZTczYzk5OGUtNmU2MC00MzJmLTg2MTAtYWUyMTAxNDBjNWIxL2E5MTAxOGE0LWVhNGYtNDEzMC1iZjU1LWFlMjcwMTgwYzMyNy80NDcxMGVjYy0xMGJiLTQ4ZDEtOTNjNy1hZTI3MDE4MGMzM2UvaW1hZ2UuanBnP3Q9MTY0MzA2NjQ3MSZzaXplPUxhcmdl?ops=fit(960%2C960)',
            'widthPixels': 512,
            'heightPixels': 512,
          },
        ],
      },
      'backgroundImage': {
        'sources': [
          {
            'contentDescription': 'Stuff you should know',
            'url': 'https://i.iheart.com/v3/url/aHR0cHM6Ly93d3cub21ueWNvbnRlbnQuY29tL2QvcGxheWxpc3QvZTczYzk5OGUtNmU2MC00MzJmLTg2MTAtYWUyMTAxNDBjNWIxL2E5MTAxOGE0LWVhNGYtNDEzMC1iZjU1LWFlMjcwMTgwYzMyNy80NDcxMGVjYy0xMGJiLTQ4ZDEtOTNjNy1hZTI3MDE4MGMzM2UvaW1hZ2UuanBnP3Q9MTY0MzA2NjQ3MSZzaXplPUxhcmdl?ops=fit(960%2C960)',
            'widthPixels': 1200,
            'heightPixels': 800,
          },
        ],
      },
    },
  },
  {
    'token': 'the big red dog',
    'url': 'Media/clifford_the_big_red_dog.mp3',
    'metadata': {
      'title': 'the big red dog',
      'subtitle': 'Music for Scribders',
      'art': {
        'sources': [
          {
            'contentDescription': 'the big red dog',
            'url': 'https://www.amazon.com/Clifford-Big-Red-Dog-8x8/dp/0545215781',
            'widthPixels': 512,
            'heightPixels': 512,
          },
        ],
      },
      'backgroundImage': {
        'sources': [
          {
            'contentDescription': 'the big red dog',
            'url': 'https://www.amazon.com/Clifford-Big-Red-Dog-8x8/dp/0545215781',
            'widthPixels': 1200,
            'heightPixels': 800,
          },
        ],
      },
    },
  }
];

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, you can say "play bookname" to start listening to book. which book you would like to listen?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const PlayStreamIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
        handlerInput.requestEnvelope.request.intent.name === 'PlayStreamIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOnIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent'
      );
  },
  handle(handlerInput) {
    
    
    const name = Alexa.getSlotValue(handlerInput.requestEnvelope, 'name');
    const genre = Alexa.getSlotValue(handlerInput.requestEnvelope, 'genre');
     
    if(name === STREAMS[1].token){
        
               // Clifford-Big-Red-Dog
        const stream = STREAMS[1]; 
        const audioUrl = Util.getS3PreSignedUrl(stream.url).replace(/&/g,'&amp;');
        handlerInput.responseBuilder
        .speak(`<audio src="${audioUrl}"/>`);
        return handlerInput.responseBuilder
          .getResponse();
        
 
    } else {
       // sysk
        const stream = STREAMS[0];
            
        handlerInput.responseBuilder
         .addAudioPlayerPlayDirective('REPLACE_ALL', stream.url, stream.token, 0, null, stream.metadata);
    
        return handlerInput.responseBuilder
          .getResponse();
    }


  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill plays books and podcasts from Scribd. Say play bookname to listen';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AboutIntent';
  },
  handle(handlerInput) {
    const speechText = 'This skill plays books and podcasts from Scribd. Say play bookname to listen';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.LoopOffIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ShuffleOffIntent'
      );
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStoppedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'PlaybackController.PauseCommandIssued'
      || handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStopped';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ALL')
      .addAudioPlayerStopDirective();

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const PlaybackStartedIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'AudioPlayer.PlaybackStarted';
  },
  handle(handlerInput) {
    handlerInput.responseBuilder
      .addAudioPlayerClearQueueDirective('CLEAR_ENQUEUED');

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .getResponse();
  },
};

const ExceptionEncounteredRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return true;
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(handlerInput.requestEnvelope.request.type);
    return handlerInput.responseBuilder
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
      LaunchRequestHandler,
    PlayStreamIntentHandler,
    PlaybackStartedIntentHandler,
    CancelAndStopIntentHandler,
    PlaybackStoppedIntentHandler,
    AboutIntentHandler,
    HelpIntentHandler,
    ExceptionEncounteredRequestHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(
        new ddbAdapter.DynamoDbPersistenceAdapter({
            tableName: process.env.DYNAMODB_PERSISTENCE_TABLE_NAME,
            createTable: false,
            dynamoDBClient: new AWS.DynamoDB({apiVersion: 'latest', region: process.env.DYNAMODB_PERSISTENCE_REGION})
        })
   ).lambda();
