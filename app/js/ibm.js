'use strict';

const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');

const speechToText = new SpeechToTextV1({
    iam_apikey: 'FWQqN5zxrcrLEObuWxxgljKjnZpR_rXg8-clYEy4eqQM',
    url: 'https://gateway-tok.watsonplatform.net/speech-to-text/api'
});