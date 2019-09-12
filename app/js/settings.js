'use strict';

const nconf = require('nconf');
nconf.file({file: 'config.json'});
var cloudConfig = null;
const regionsPerLine = 2;

// Read config file and display
var provider = nconf.get('provider');
var region = nconf.get('region');
var language = nconf.get('language');
// console.log('provider: ' + nconf.get('provider'));
// console.log('region: ' + nconf.get('region'));
// console.log('language: ' + nconf.get('language'));

// set provider
document.getElementById('cloud-provider-radio-' + provider).setAttribute('checked', 'true');

// list all available regions first
var regionRadioDiv = document.getElementById('region-radio-div');
regionRadioDiv.innerHTML = '';      // Clear everything, if any.

if (provider === 'aws')
    cloudConfig = require('./js/aws-config');
else if (provider === 'ibm')
    cloudConfig = require('./js/ibm-config');

var _html = '';
for (var i = 1; i <= cloudConfig.region_available.length; i++) {
    // If this is the first in the line
    if (i % regionsPerLine == 1) {
        _html += '<div class="row">';
    }
    // for each item
    _html += '<div class="col-sm-6">' + 
                '<div class="custom-control custom-radio custom-control-inline">' + 
                    '<input class="custom-control-input" type="radio" name="region" id="' + cloudConfig.region_available[i-1].region + '" value="' + cloudConfig.region_available[i-1].region + '">' +
                    '<label class="custom-control-label" for="' + cloudConfig.region_available[i-1].region + '">' + cloudConfig.region_available[i-1].region_name_cn + '</label>' + 
                '</div>' +
             '</div>';
    // If this is the last in the line
    if (i % regionsPerLine == 0) {
        _html += '</div>';
    }
}
regionRadioDiv.innerHTML = _html;

// set region
document.getElementById(region).setAttribute('checked', 'true');

// list all available languages
var languageSelect = document.getElementById('language-select');
languageSelect.innerHTML = '';

_html = '';
for (var i = 1; i <= cloudConfig.language_available.length; i++) {
    _html += '<option value="' + cloudConfig.language_available[i-1].name + '">' + cloudConfig.language_available[i-1].name_cn + '</option>'
}
languageSelect.innerHTML = _html;
// Because there is only one language available now, so we do not need to set it.